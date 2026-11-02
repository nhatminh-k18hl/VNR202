import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  Shield, 
  Check, 
  X,
  Volume2, 
  VolumeX, 
  Clock,
  Package,
  HelpCircle,
  AlertTriangle,
  Zap,
  Radio,
  Users,
  Trophy,
  Sparkles
} from 'lucide-react';
import { AnswerKey, BoostItem, PlayerState, Question, TeamId, TeamState } from '../types/game';
import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { fetchAndParseQuestions } from '../utils/markdownParser';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';
import { getPlayerRankingDetails, PlayerPersonalRanking } from '../utils/statsCalculator';

/**
 * Thuật toán xáo trộn Fisher-Yates để random thứ tự câu hỏi cho từng người chơi
 * Chống nhìn màn hình của nhau như Blooket / Wayground
 */
function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Tạo một vòng chơi mới gồm đầy đủ tất cả câu hỏi, được xáo trộn ngẫu nhiên.
 * Đảm bảo:
 * 1. Phải đi hết 1 vòng (toàn bộ N câu) thì mới lặp lại vòng tiếp theo.
 * 2. Tránh 2 câu giống hệt nhau đứng cạnh nhau (khi nối vòng mới, câu đầu tiên của vòng mới
 *    không được trùng với câu cuối cùng của vòng trước đó).
 */
function generateNextRound(allQuestions: Question[], previousLastId?: string | number): Question[] {
  if (allQuestions.length === 0) return [];
  const shuffled = shuffleArray(allQuestions);
  if (shuffled.length > 1 && previousLastId !== undefined && shuffled[0].id === previousLastId) {
    const swapIdx = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
    const temp = shuffled[0];
    shuffled[0] = shuffled[swapIdx];
    shuffled[swapIdx] = temp;
  }
  return shuffled;
}

export const PlayPage: React.FC = () => {
  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Định danh thiết bị cố định chống trùng lặp / phân thân user
  const [deviceId] = useState<string>(() => {
    let dId = localStorage.getItem('than_toc_device_id');
    if (!dId) {
      dId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem('than_toc_device_id', dId);
    }
    return dId;
  });

  // Trạng thái người chơi & Sảnh chờ
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('team_1');
  const [playerName, setPlayerName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Đếm ngược xuất kích đồng bộ từ Host (3... 2... 1...)
  const [countdownVal, setCountdownVal] = useState<number | null>(gameState.roomState.countdownRemaining ?? null);

  // Ngân hàng câu hỏi gốc & Hàng đợi câu hỏi xáo trộn riêng cho client này
  const [rawQuestions, setRawQuestions] = useState<Question[]>([]);
  const [playerDeck, setPlayerDeck] = useState<Question[]>([]);
  const [deckIndex, setDeckIndex] = useState<number>(0);

  // Trạng thái trả lời câu hỏi hiện tại
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(18);
  const [explanationCountdown, setExplanationCountdown] = useState<number | null>(null);

  // Thống kê cá nhân trong trận
  const [stats, setStats] = useState({ totalAnswered: 0, correctCount: 0 });

  // Toast thông báo
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Hiệu ứng rung màn hình / Shell-shock
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const questionTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  // 1. Khởi tạo WebRTC P2P Client để đồng bộ không độ trễ với Host
  useEffect(() => {
    gameSyncService.initClient();
  }, []);

  // 2. Khôi phục danh tính đã lưu từ localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('than_toc_player_id');
    const savedName = localStorage.getItem('than_toc_player_name');
    const savedTeam = localStorage.getItem('than_toc_player_team') as TeamId;
    const savedStudentCode = localStorage.getItem('than_toc_student_code') || '';

    if (savedId && savedName && savedTeam) {
      setPlayerId(savedId);
      setPlayerName(savedName);
      setSelectedTeamId(savedTeam);
      setStudentCode(savedStudentCode);
      if (gameState.roomState.isLobbyOpen || gameState.roomState.phase === 'BATTLE') {
        gameSyncService.registerPlayer({ 
          id: savedId, 
          deviceId,
          name: savedName, 
          studentCode: savedStudentCode || undefined,
          teamId: savedTeam 
        });
        setIsJoined(true);
      }
    }
  }, [deviceId, gameState.roomState.isLobbyOpen, gameState.roomState.phase]);

  // Nhịp tim kết nối (Heartbeat PING)
  useEffect(() => {
    if (!isJoined || !playerId) return;
    const pingInterval = setInterval(() => {
      gameSyncService.sendClientAction({ type: 'PING', playerId });
    }, 4000);
    return () => clearInterval(pingInterval);
  }, [isJoined, playerId]);

  // 3. Lắng nghe cập nhật chiến trường từ gameSyncService
  useEffect(() => {
    const unsubscribeState = gameSyncService.subscribe((newState) => {
      setGameState(newState);
      if (newState.customQuestions && newState.customQuestions.length > 0) {
        setRawQuestions(newState.customQuestions);
      }
    });

    const unsubscribeCountdown = gameSyncService.subscribeCountdown((sec) => {
      setCountdownVal(sec > 0 ? sec : null);
      if (sec > 0) {
        soundService.playCountdownTick(false);
        if ('vibrate' in navigator) {
          navigator.vibrate(80);
        }
      } else if (sec === 0) {
        soundService.playCountdownTick(true);
        soundService.playBattleStart();
        if ('vibrate' in navigator) {
          navigator.vibrate([150, 80, 200]);
        }
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeCountdown();
    };
  }, []);

  // 4. Tải câu hỏi mặc định từ questions.md nếu chưa có
  useEffect(() => {
    if (rawQuestions.length === 0) {
      fetchAndParseQuestions('./questions.md')
        .then((qs) => {
          if (qs.length > 0) {
            setRawQuestions(qs);
          }
        })
        .catch((err) => console.warn('Không thể nạp questions.md trong PlayPage:', err));
    }
  }, [rawQuestions.length]);

  // 5. Khởi tạo vòng câu hỏi đầu tiên cho người chơi (đầy đủ các câu, không lặp lại)
  useEffect(() => {
    if (rawQuestions.length > 0 && playerDeck.length === 0) {
      const initialDeck = generateNextRound(rawQuestions);
      setPlayerDeck(initialDeck);
      setDeckIndex(0);
    }
  }, [rawQuestions, playerDeck.length]);

  // =========================================================================
  // 6. LOGIC BẮT BUỘC JOIN GAME KHI HOST PHÁT LỆNH (BLOOKET / WAYGROUND STYLE)
  // Khi Host bấm "Bắt đầu", tất cả ai đã vào màn hình chờ đều phải join game ngay!
  // Tuyệt đối không để ai rớt ở ngoài hoặc thoát ra sửa thông tin khi trận diễn ra.
  // =========================================================================
  useEffect(() => {
    const isBattleStarted = gameState.roomState.phase === 'BATTLE';
    const isFinished = gameState.roomState.phase === 'FINISHED';
    const isCountingDown = countdownVal !== null && countdownVal > 0;

    if (isBattleStarted || isCountingDown || isFinished) {
      // Nếu đã có thông tin cá nhân (trong state hoặc localStorage), ép vào trận lập tức
      const savedId = playerId || localStorage.getItem('than_toc_player_id');
      const savedName = playerName || localStorage.getItem('than_toc_player_name');
      const savedTeam = selectedTeamId || (localStorage.getItem('than_toc_player_team') as TeamId) || 'team_1';
      const savedCode = studentCode || localStorage.getItem('than_toc_student_code') || '';

      if (savedName) {
        const activeId = savedId || ('pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
        if (!playerId) setPlayerId(activeId);
        if (!playerName) setPlayerName(savedName);
        if (!isJoined) {
          gameSyncService.registerPlayer({
            id: activeId,
            deviceId,
            name: savedName,
            studentCode: savedCode || undefined,
            teamId: savedTeam,
          });
          setIsJoined(true);
        }
      }
    }
  }, [gameState.roomState.phase, countdownVal, playerId, playerName, selectedTeamId, studentCode, isJoined]);

  // 7. Khóa trang / Cảnh báo khi người chơi định reload hoặc rời trận đấu
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState.roomState.phase === 'BATTLE' && isJoined) {
        e.preventDefault();
        e.returnValue = 'Trận đánh đang diễn ra ác liệt! Bạn có chắc muốn rời bỏ vị trí tác chiến?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState.roomState.phase, isJoined]);

  const currentPlayer: PlayerState | undefined = gameState.players.find((p) => p.id === playerId);
  const currentTeam: TeamState | undefined = gameState.teams.find((t) => t.id === (currentPlayer?.teamId || selectedTeamId));

  // Kiểm tra xe của đội mình có đang bị địch ngắm bắn pháo không
  const isTeamUnderAttack = gameState.currentEnemyAttack?.targetTeamId === currentTeam?.id && gameState.currentEnemyAttack?.status === 'WARNING';

  // Câu hỏi hiện tại lấy từ deck đã xáo trộn
  const currentQ: Question | undefined = playerDeck[deckIndex];

  // Xáo trộn ngẫu nhiên thứ tự 4 đáp án cho từng câu hỏi để chống spam phím/nút (tránh spam full C)
  // Giữ cố định thứ tự trong suốt thời gian hiển thị câu hỏi đó
  const currentOptions = useMemo(() => {
    if (!currentQ) return [];
    const keys: AnswerKey[] = ['A', 'B', 'C', 'D'];
    const opts = keys.map((key) => ({
      key,
      text: currentQ.options[key] || '',
    }));
    return shuffleArray(opts);
  }, [currentQ?.id, deckIndex]);

  // 8. Đếm ngược 18s cho mỗi câu hỏi khi phòng ở phase BATTLE
  useEffect(() => {
    if (!isJoined || hasAnswered || gameState.roomState.phase !== 'BATTLE' || !currentQ) {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    setQuestionTimeRemaining(18);

    questionTimerRef.current = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [deckIndex, isJoined, hasAnswered, gameState.roomState.phase, !!currentQ]);

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Người chơi đăng ký vào sảnh chờ
  const handleJoinLobby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setValidationError('Vui lòng điền Họ và tên để tham gia vào đội ngũ!');
      return;
    }

    setValidationError(null);
    const newId = playerId || ('pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4));
    setPlayerId(newId);

    localStorage.setItem('than_toc_player_id', newId);
    localStorage.setItem('than_toc_player_name', playerName.trim());
    localStorage.setItem('than_toc_player_team', selectedTeamId);
    if (studentCode.trim()) {
      localStorage.setItem('than_toc_student_code', studentCode.trim());
    }

    gameSyncService.registerPlayer({
      id: newId,
      deviceId,
      name: playerName.trim(),
      studentCode: studentCode.trim() || undefined,
      teamId: selectedTeamId,
    });

    // Nếu vào trận khi trận đấu đã bắt đầu, chuẩn bị vòng câu hỏi đầu tiên lập tức
    if (playerDeck.length === 0 && rawQuestions.length > 0) {
      const initialDeck = generateNextRound(rawQuestions);
      setPlayerDeck(initialDeck);
      setDeckIndex(0);
    }

    setIsJoined(true);
    soundService.playPlayerJoin();
  };

  // Hết thời gian 18s cho 1 câu
  const handleTimeOut = () => {
    if (hasAnswered || !currentQ || !playerId) return;
    setHasAnswered(true);
    setSelectedAnswer(null);

    soundService.playWrong();
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    gameSyncService.answerQuestion(playerId, currentQ.id || deckIndex, 'A', false);
    setStats((prev) => ({ ...prev, totalAnswered: prev.totalAnswered + 1 }));
    startExplanationTimer();
  };

  // Người chơi chọn 1 đáp án (A, B, C, D)
  const handleSelectOption = useCallback((key: AnswerKey) => {
    if (hasAnswered || !currentQ || !playerId) return;

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    setSelectedAnswer(key);
    setHasAnswered(true);

    const isCorrect = currentQ.correctAnswer === key;

    if (isCorrect) {
      soundService.playCorrect();
      if ('vibrate' in navigator) navigator.vibrate(60);
      setStats((prev) => ({ 
        totalAnswered: prev.totalAnswered + 1, 
        correctCount: prev.correctCount + 1 
      }));
    } else {
      soundService.playWrong();
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setStats((prev) => ({ 
        ...prev, 
        totalAnswered: prev.totalAnswered + 1 
      }));
    }

    gameSyncService.answerQuestion(playerId, currentQ.id, key, isCorrect);
    startExplanationTimer();
  }, [hasAnswered, currentQ, playerId]);

  // Chuyển câu nhanh 1s sau khi chọn đáp án (chỉ kiểm tra đúng/sai, không hiện giải thích dài dòng)
  const startExplanationTimer = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    const durationMs = 1000;
    setExplanationCountdown(1);

    const startTime = Date.now();
    countdownTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        handleNextQuestion();
      }
    }, 100);
  };

  // =========================================================================
  // XỬ LÝ CHUYỂN CÂU HỎI TIẾP THEO (ĐẢM BẢO CHƠI LIÊN TỤC KHÔNG BAO GIỜ HẾT CÂU)
  // Đi hết 1 vòng trọn vẹn mới sang vòng tiếp theo, tránh 2 câu giống hệt đứng cạnh nhau
  // =========================================================================
  const handleNextQuestion = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setExplanationCountdown(null);

    const nextIndex = deckIndex + 1;

    // Nếu chuẩn bị vượt quá số câu hiện có (đã đi hết 1 vòng), tạo thêm 1 vòng mới hoàn chỉnh
    // Đảm bảo câu đầu tiên của vòng mới không trùng với câu cuối của vòng trước
    if (nextIndex >= playerDeck.length) {
      if (rawQuestions.length > 0) {
        const lastQ = playerDeck[playerDeck.length - 1];
        const nextRound = generateNextRound(rawQuestions, lastQ?.id);
        setPlayerDeck((prev) => [...prev, ...nextRound]);
      }
    }

    setDeckIndex(nextIndex);
  }, [deckIndex, playerDeck, rawQuestions]);

  // Sử dụng vật phẩm từ túi đồ
  const handleUseItem = (item: BoostItem) => {
    if (!playerId) return;
    const success = gameSyncService.useItem(playerId, item.id, currentQ);
    if (success) {
      soundService.playCorrect();
      showToast(`Đã dùng [${item.name}] thành công!`, 'success');
    }
  };

  // Nhặt hộp tiếp tế thả dù bằng 1 chạm
  const handleClaimDraftBox = (draftId: string) => {
    if (!playerId) return;
    const res = gameSyncService.claimDraftItem(draftId, playerId);
    if (res.success) {
      soundService.playCorrect();
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warn');
    }
  };

  // Xác định cờ phase
  const isWaitingPhase = gameState.roomState.phase === 'WAITING';
  const isBattlePhase = gameState.roomState.phase === 'BATTLE';
  const isPausedPhase = gameState.roomState.phase === 'PAUSED';
  const isEndedPhase = gameState.roomState.phase === 'FINISHED';
  const isCountingDown = countdownVal !== null && countdownVal > 0;

  // Tính phần trăm thời gian 18s còn lại
  const timeBarPercent = Math.max(0, Math.min(100, (questionTimeRemaining / 18) * 100));

  return (
    <div className={`min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6 transition-all ${
      isShaking ? 'shake-active' : ''
    }`}>
      {/* Toast thông báo */}
      {feedbackToast && (
        <div className={`fixed top-16 sm:top-20 right-3 sm:right-4 z-50 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-bold border transition-all ${
          feedbackToast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-amber-600 text-white border-amber-500'
        }`}>
          {feedbackToast.message}
        </div>
      )}

      {/* =========================================================================
          OVERLAY ĐẾM NGƯỢC XUẤT KÍCH (3... 2... 1...) - PHONG CÁCH BLOOKET / WAYGROUND
          Khi Host bấm "Bắt đầu", toàn bộ người chơi ở màn hình chờ đều nhìn thấy
          đồng hồ đếm ngược hào hùng, âm thanh kèn lệnh và tự động vào trận!
          ========================================================================= */}
      {isCountingDown && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center select-none animate-fadeIn">
          <div className="max-w-md w-full space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/40 border border-red-500 text-red-200 text-xs sm:text-sm font-bold tracking-wider uppercase animate-pulse">
              <Radio className="w-4 h-4 animate-spin" /> Lệnh Xuất Kích Từ Chỉ Huy Sở
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-3xl font-black uppercase tracking-wider text-amber-400">
                TOÀN QUÂN XUẤT KÍCH!
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                Tiến công theo kế hoạch 5 cánh quân mùa xuân 1975
              </p>
            </div>

            {/* Số đếm ngược to nổi bật 3, 2, 1 */}
            <div className="relative flex items-center justify-center py-6">
              <div 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-amber-400/80 flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-ping absolute"
                style={{ animationDuration: '1s' }}
              />
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-2xl border-4 border-amber-300">
                <span className="text-6xl sm:text-7xl font-black font-mono text-white drop-shadow-lg">
                  {countdownVal}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-xs text-amber-200 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTeam?.color || '#2563EB' }} />
              <span>{currentTeam?.name} • Xe #{currentTeam?.tankNumber} đã sẵn sàng trong chiến hào!</span>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY TẠM DỪNG TRẬN ĐẤU */}
      {isPausedPhase && isJoined && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center select-none animate-in fade-in duration-200">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border-2 border-amber-400 shadow-2xl space-y-4 text-stone-900 dark:text-white">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl">
              ⏸️
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                HIỆU LỆNH TẠM DỪNG
              </span>
              <h3 className="text-xl font-black uppercase">
                Trận Đấu Đang Tạm Dừng
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Hãy chú ý lên màn hình lớp học. Ban Quản Trò sẽ phát lệnh tiếp tục trong giây lát!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOP COMBAT HUD: TỐI ƯU CẢ MOBILE LẪN PC
          Mobile: Sticky topbar nhỏ gọn, hiển thị đầy đủ Đội, Xe, Thời gian, Điểm, Streak
          PC: Header trang trọng, breadcrumbs và đồng hồ đếm ngược 5 phút
          ========================================================================= */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c120e]/95 backdrop-blur-md pb-2 pt-1 border-b border-stone-200 dark:border-[#223025] transition-colors">
        <div className="flex items-center justify-between gap-2">
          {/* Nút thoát chỉ hiển thị khi ở sảnh chờ CHƯA bắt đầu */}
          {isWaitingPhase && !isCountingDown ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Về Trang Chủ</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] sm:text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>{isBattlePhase ? 'ĐANG TÁC CHIẾN' : isEndedPhase ? 'TỔNG KẾT TRẬN' : 'CHUẨN BỊ'}</span>
            </div>
          )}

          {/* Huy hiệu cánh quân của người chơi (nếu đã tham gia) */}
          {isJoined && currentTeam && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-[#151e18] border border-stone-200 dark:border-[#223025] text-xs">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: currentTeam.color }} 
              />
              <span className="font-black text-stone-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                {currentTeam.name}
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-500">
                #{currentTeam.tankNumber}
              </span>
            </div>
          )}

          {/* Cụm Đồng hồ trận đấu & Nút Âm thanh */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs sm:text-sm font-mono font-black px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {Math.floor(gameState.roomState.timeRemainingSeconds / 60)}:
                {String(gameState.roomState.timeRemainingSeconds % 60).padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={() => setIsMuted(soundService.toggleMute())}
              className="p-1.5 rounded-xl border border-stone-200 dark:border-[#223025] bg-stone-100 dark:bg-[#151e18] text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Thanh chỉ số chiến đấu: Tách bạch rõ Ràng Điểm Cá Nhân (MVP) và Điểm Đội (Vô địch) */}
        {isBattlePhase && isJoined && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-stone-900 dark:text-white">
                <span className="text-[11px] text-stone-400 font-normal">Chiến sĩ:</span> {currentPlayer?.name || playerName}
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1" title="Điểm cá nhân xét giải MVP của cánh quân">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bạn: <strong>{currentPlayer?.score || 0}đ</strong></span>
                <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">(Tranh MVP)</span>
              </span>
              <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-red-500" />
                {currentPlayer?.currentStreak || 0}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold border border-red-300 dark:border-red-900" title="Điểm tích lũy toàn đội quyết định Cúp vô địch">
                🚩 Điểm Đội: <strong>{currentTeam?.totalScore || 0}đ</strong>
              </span>
              <span className="text-stone-500">
                Tiến độ: <strong className="text-stone-900 dark:text-white">{currentTeam?.progress}%</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MÀN HÌNH 1: FORM NHẬP TÊN & CHỌN CÁNH QUÂN (KHI CHƯA JOIN)
          Nếu mở link khi trận đã bắt đầu, hiển thị thông báo "XUẤT KÍCH CHI VIỆN NGAY"
          ========================================================================= */}
      {!isJoined ? (
        !gameState.roomState.isLobbyOpen && !isBattlePhase ? (
          <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border-2 border-amber-400/80 dark:border-amber-700/80 shadow-2xl space-y-5 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-500 border border-amber-400 flex items-center justify-center text-3xl shadow-inner">
              ⭐
            </div>
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 tracking-wider">
                CHỜ LỆNH CHỈ HUY SỞ
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-stone-900 dark:text-white">
                SẢNH TUYỂN QUÂN ĐANG TẠM KHÓA
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                Vui lòng quan sát máy chiếu trên lớp. Khi Ban Quản Trò (Nhóm 6) phát lệnh <strong>"Mở Tuyển Quân"</strong>, bạn sẽ có thể đăng ký tên và chọn chiến hào của riêng mình ngay lập tức!
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-100 dark:bg-[#0c120e] text-xs text-stone-500 font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Đang kết nối thời gian thực với phòng tác chiến...</span>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-xl space-y-5">
            <div className="text-center space-y-1.5">
              {isBattlePhase && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 border border-red-400 text-red-700 dark:text-red-300 text-xs font-black animate-pulse">
                  <Zap className="w-3.5 h-3.5 text-red-600" /> TRẬN ĐÁNH ĐANG DIỄN RA! VÀO CHI VIỆN NGAY!
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-black uppercase text-stone-900 dark:text-white">
                Ghi Danh Xuất Kích
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Điền họ tên và chọn 1 trong 6 chiến hào để đồng loạt xuất kích
              </p>
            </div>

            <form onSubmit={handleJoinLobby} className="space-y-4">
              {validationError && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-500 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Input Họ Tên: text-base chống zoom trên iOS Safari */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Họ và Tên của bạn:</span>
                  <span className="text-red-500 font-bold">* Bắt buộc</span>
                </label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-base font-semibold focus:outline-none focus:border-red-500 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Input MSSV (Tùy chọn) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Mã Số Sinh Viên (MSSV):</span>
                  <span className="text-stone-400 text-[11px]">(Không bắt buộc)</span>
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="Nhập mã số sinh viên (nếu có)..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-base font-semibold focus:outline-none focus:border-red-500 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Danh sách 6 cánh quân chọn nhanh */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span>Chọn Chiến Hào / Chiếc Xe Tăng Của Riêng Bạn:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">Chọn 1 trong 6 đội</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {INITIAL_TEAMS_CONFIG.map((team) => (
                    <button
                      type="button"
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between active:scale-[0.98] cursor-pointer ${
                        selectedTeamId === team.id
                          ? 'border-red-600 dark:border-amber-400 bg-red-50/80 dark:bg-[#1a261c] shadow-sm ring-2 ring-red-600/40 dark:ring-amber-400/40'
                          : 'border-stone-200 dark:border-[#233426] bg-stone-50 dark:bg-[#0e1610] hover:border-stone-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-stone-900 dark:text-white">{team.name}</span>
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: team.color }} 
                          />
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          Xe #{team.tankNumber} • {team.corpsName}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[50px] py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{isBattlePhase ? 'VÀO TRẬN CHI VIỆN NGAY!' : 'VÀO SẢNH CHỜ XUẤT KÍCH'}</span>
              </button>
            </form>
          </div>
        )
      ) : isWaitingPhase ? (
        /* =========================================================================
            MÀN HÌNH SẢNH CHỜ: HIỂN THỊ ĐỒNG ĐỘI & CHỜ LỆNH TỪ QUẢN TRÒ
            Theo yêu cầu: Khi Quản trò bấm bắt đầu, tất cả người trong sảnh chờ
            phải tự động vào trận, khóa không cho thoát ra ngoài sửa thông tin!
            ========================================================================= */
        <div className="max-w-xl mx-auto p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Đang ở sảnh chờ... Chờ Quản Trò phát lệnh bắt đầu</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase text-stone-900 dark:text-white flex items-center justify-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{ backgroundColor: currentTeam?.color || '#2563EB' }}
              />
              {currentTeam?.name} • Xe #{currentTeam?.tankNumber}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {currentTeam?.corpsName} ({currentTeam?.axisName})
            </p>
          </div>

          {/* Danh sách thành viên trong nhóm đã join sảnh */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-100 dark:border-[#1e2a21]">
              <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                Đồng đội trong cánh quân ({gameState.players.filter((p) => p.teamId === currentTeam?.id).length}):
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Tự động vào chơi đồng loạt
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {gameState.players
                .filter((p) => p.teamId === currentTeam?.id)
                .map((member, idx) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-[#0e1610] border border-stone-200 dark:border-[#202e23] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-800 font-mono font-bold text-[11px] flex items-center justify-center text-stone-600 dark:text-stone-300">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">
                          {member.name} {member.id === playerId && <strong className="text-red-600 dark:text-amber-400 font-bold">(Bạn)</strong>}
                        </span>
                        {member.studentCode && (
                          <span className="text-[11px] text-stone-400 block font-mono">MSSV: {member.studentCode}</span>
                        )}
                      </div>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                      Sẵn sàng
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-[#1a231b] border border-amber-200 dark:border-amber-900/60 text-xs text-stone-600 dark:text-stone-300 space-y-1.5">
            <strong className="text-stone-900 dark:text-white block font-bold">💡 Chỉ Dẫn Tác Chiến:</strong>
            <p>• Sử dụng chuột (PC) hoặc chạm cảm ứng (Mobile) hoàn toàn để điều khiển.</p>
            <p>• Câu hỏi được xáo trộn ngẫu nhiên riêng cho từng chiến sĩ, chạy liên tục suốt 5 phút.</p>
            <p>• Bấm trực tiếp vào đáp án đúng để đẩy xe tăng cánh quân của bạn tiến lên.</p>
            <p>• Khi Hộp quà tiếp tế rơi xuống, bấm trực tiếp vào hộp quà để nhận đồ bảo vệ xe.</p>
          </div>

          {/* Nút đổi thông tin CHỈ khả dụng khi ở sảnh chờ VÀ Quản trò chưa bấm đếm ngược bắt đầu */}
          {!isCountingDown && (
            <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-[#1e2a21]">
              <button
                type="button"
                onClick={() => setIsJoined(false)}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer active:scale-95 transition-all"
              >
                ← Đổi Nhóm / Sửa Thông Tin
              </button>

              <span className="text-xs font-mono text-stone-400">
                Phòng: #VNR1975
              </span>
            </div>
          )}
        </div>
      ) : isEndedPhase ? (
        /* =========================================================================
            MÀN HÌNH 3: TỔNG KẾT TRẬN ĐÁNH & CHIẾN THẮNG LỊCH SỬ 1975
            Hiển thị rõ:
            - Hạng của Cánh quân (Top #1 / 6 Đội)
            - Vị trí trong Đội (Xét MVP)
            - Hạng tổng thể toàn trường (Overall Rank)
            ========================================================================= */
        (() => {
          const rankDetails = playerId
            ? getPlayerRankingDetails(playerId, gameState.players, gameState.teams)
            : null;

          return (
            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border-2 border-amber-400 dark:border-amber-600 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-4xl shadow-inner border-2 border-amber-400">
                <Trophy className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-amber-400">
                  ★ ĐẠI THẮNG MÙA XUÂN 1975 ★
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-stone-900 dark:text-white">
                  CHIẾN DỊCH HOÀN TẤT!
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                  Cờ chiến thắng đã phất trên nóc Dinh Độc Lập lúc 11h30 ngày 30/4/1975!
                </p>
              </div>

              {/* CARD THỐNG KÊ XẾP HẠNG CHI TIẾT (TEAM RANK & MVP VỊ TRÍ) */}
              {rankDetails && (
                <div className="space-y-3 text-left">
                  {/* Hạng của Đội */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-950/40 dark:to-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                        Xếp Hạng Cánh Quân Của Bạn:
                      </span>
                      <span className="text-xs font-mono font-bold text-red-600 dark:text-amber-400">
                        {rankDetails.teamScore} Điểm Đội
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-stone-900 dark:text-white">
                        {rankDetails.teamName} • Xe #{rankDetails.tankNumber}
                      </h3>
                      <span className="text-lg font-black text-red-600 dark:text-amber-400">
                        HẠNG #{rankDetails.teamRank} <span className="text-xs text-stone-500">/ {rankDetails.totalTeams}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 italic">
                      {rankDetails.teamRank === 1 
                        ? '🎉 CHÚC MỪNG CÁNH QUÂN CỦA BẠN ĐÃ ĐOẠT CÚP VÔ ĐỊCH TOÀN THẮNG 1975!' 
                        : `Cánh quân đã kiên cường xung kích tiến vào giải phóng Sài Gòn (Tiến độ ${rankDetails.teamProgress}%).`}
                    </p>
                  </div>

                  {/* Vị trí trong Đội & Xét MVP */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0c120e] border border-stone-200 dark:border-[#223025] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-500 uppercase">
                        Vị Trí Của Bạn Trong Đội:
                      </span>
                      {rankDetails.isTeamMvp && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-black uppercase animate-pulse">
                          ⭐ MVP CÁNH QUÂN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900 dark:text-white">
                        {rankDetails.isTeamMvp 
                          ? '🌟 XUẤT SẮC! BẠN LÀ MVP CỦA ĐỘI' 
                          : `Chiến sĩ xếp thứ #${rankDetails.playerTeamRank} trong kíp lái`}
                      </span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400">
                        #{rankDetails.playerTeamRank} <span className="text-xs text-stone-500">/ {rankDetails.teamMembersCount} chiến sĩ</span>
                      </span>
                    </div>

                    <div className="pt-2 border-t border-stone-200 dark:border-[#1e2a21] flex items-center justify-between text-xs">
                      <span className="text-stone-500">Hạng tổng thể toàn bộ chiến sĩ:</span>
                      <strong className="font-mono text-stone-900 dark:text-white">
                        Hạng #{rankDetails.overallRank} / {rankDetails.totalPlayers}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Bảng chỉ số cá nhân */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0c120e] border border-stone-200 dark:border-[#223025] grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[11px] text-stone-400 block">Điểm cá nhân</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{currentPlayer?.score || 0}đ</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Đúng / Tổng</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {stats.correctCount} / {stats.totalAnswered}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Streak kỷ lục</span>
                  <span className="text-lg font-black text-red-600 dark:text-red-400">
                    {currentPlayer?.maxStreak || currentPlayer?.currentStreak || 0} 🔥
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to="/"
                  className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white dark:bg-stone-800 text-xs font-black uppercase tracking-wider"
                >
                  Xem Sa Bàn Toàn Cảnh
                </Link>
              </div>
            </div>
          );
        })()
      ) : (
        /* =========================================================================
            MÀN HÌNH 2: TÁC CHIẾN THỜI GIAN THỰC (BATTLEFIELD)
            - Tối ưu 100% cho cả Mobile (chạm nhạy, chữ to, phím 1 cột) lẫn PC (phím tắt)
            - Câu hỏi chạy liên tục suốt 5 phút, không bao giờ hết câu hỏi
            ========================================================================= */
        <div className="space-y-4 sm:space-y-5">
          {/* CẢNH BÁO ĐỊCH TẬP KÍCH VÀO XE ĐỘI BẠN (CÓ NÚT BẬT KHIÊN 1 CHẠM TRÊN MOBILE) */}
          {isTeamUnderAttack && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white border-2 border-amber-300 shadow-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce" />
                  CẢNH BÁO: ĐỊCH ĐANG BẮN PHÁO VÀO XE ĐỘI BẠN!
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-black/40 border border-white/30">
                  Khẩn cấp
                </span>
              </div>
              <p className="text-xs text-red-100">
                Bật <strong>[Lá chắn Trại Davis]</strong> ngay để xe không bị thụt lùi và kíp lái không bị choáng!
              </p>
              {/* Nút dùng khiên nhanh nếu trong túi đồ đang có sẵn */}
              {currentPlayer?.inventory.some((i) => i.type === 'DAVIS_SHIELD') && (
                <button
                  onClick={() => {
                    const shield = currentPlayer.inventory.find((i) => i.type === 'DAVIS_SHIELD');
                    if (shield) handleUseItem(shield);
                  }}
                  className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-black text-xs uppercase tracking-wider shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 fill-stone-900" /> BẬT LÁ CHẮN CỨU XE NGAY!
                </button>
              )}
            </div>
          )}

          {/* HỘP TIẾP TẾ THẢ DÙ (AIRDROP) - BẤM TRỰC TIẾP VÀO HỘP ĐỂ NHẬN (KHÔNG CÓ NÚT NHẶT NGAY) */}
          {gameState.supplyDraftPool.length > 0 && (
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-[#1a231b] border-2 border-dashed border-amber-400 dark:border-amber-600 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-stone-900 dark:text-white flex items-center gap-1.5 uppercase">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
                  Hộp Quà Tiếp Tế
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Mỗi người tối đa 1 món
                </span>
              </div>

              {/* Hộp quà tiếp tế: Click trực tiếp vào hộp quà để nhận */}
              <div className="grid grid-cols-1 gap-2">
                {gameState.supplyDraftPool.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleClaimDraftBox(draft.id)}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111813] border border-amber-300 dark:border-amber-800 hover:border-amber-500 text-left flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer shadow-sm group"
                    title="Bấm vào hộp quà để nhận"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {draft.item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs sm:text-sm text-stone-900 dark:text-white block truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {draft.item.name}
                        </span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800">
                          Chạm để nhận
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {draft.item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              KHU VỰC CÂU HỎI TRẮC NGHIỆM (QUIZ CARD)
              - Dùng chuột / chạm 100%, không dùng phím
              - Bỏ ký tự A, B, C, D, chỉ hiển thị nội dung đáp án
              - Thời gian nghỉ 1.5 - 2s (tự động đếm nhanh 1s khi trận còn < 10s)
              ========================================================================= */}
          <div className={`p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-lg space-y-4 transition-all ${
            currentPlayer?.isShellShocked ? 'shell-shocked' : ''
          }`}>
            {/* Header câu hỏi: Bỏ đánh số câu, chỉ hiện nhãn tác chiến + Thanh đếm ngược 18s */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-black uppercase text-stone-500 dark:text-stone-400 text-xs tracking-wider">
                    Câu Hỏi Tác Chiến
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-mono font-black text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{questionTimeRemaining}s</span>
                </div>
              </div>

              {/* Progress bar thời gian 18s của câu hỏi */}
              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    questionTimeRemaining > 7 
                      ? 'bg-emerald-500' 
                      : questionTimeRemaining > 3 
                      ? 'bg-amber-500' 
                      : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${timeBarPercent}%` }}
                />
              </div>
            </div>

            {currentQ ? (
              <div className="space-y-4">
                {/* Nội dung câu hỏi */}
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-stone-900 dark:text-white leading-relaxed select-none">
                  {currentQ.text}
                </h3>

                {/* 4 Nút Lựa Chọn Đáp Án (Đã xáo trộn ngẫu nhiên thứ tự đáp án, chỉ hiển thị nội dung) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm">
                  {currentOptions.map((opt) => {
                    const isEliminated = currentPlayer?.eliminatedOptions?.includes(opt.key);
                    const isCorrect = currentQ.correctAnswer === opt.key;
                    const isSelected = selectedAnswer === opt.key;

                    return (
                      <button
                        key={opt.key}
                        disabled={hasAnswered || isEliminated}
                        onClick={() => handleSelectOption(opt.key)}
                        className={`min-h-[54px] sm:min-h-[58px] p-3.5 sm:p-4 rounded-2xl border text-left font-semibold transition-all relative flex items-center justify-between group cursor-pointer active:scale-[0.98] select-none ${
                          isEliminated
                            ? 'opacity-30 line-through bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                            : hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/50'
                              : isSelected
                              ? 'bg-red-50 dark:bg-red-950/90 border-red-500 text-red-900 dark:text-red-100 ring-2 ring-red-500/50'
                              : 'bg-stone-50 dark:bg-[#0e1610] border-stone-200 dark:border-[#202e23] opacity-50'
                            : 'bg-stone-50 dark:bg-[#0e1610] border-stone-200 dark:border-[#223025] hover:border-amber-500 dark:hover:border-amber-400 text-stone-800 dark:text-stone-100 shadow-sm'
                        }`}
                      >
                        <span className="leading-snug text-xs sm:text-sm font-medium">
                          {opt.text}
                        </span>

                        {hasAnswered && (
                          <span className="ml-2 flex-shrink-0">
                            {isCorrect && <Check className="w-5 h-5 text-emerald-600" />}
                            {isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Thông báo kết quả nhanh sau khi bấm đáp án (không hiển thị giải thích dài dòng) */}
                {hasAnswered && (
                  <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between font-bold animate-fadeIn ${
                    selectedAnswer === currentQ.correctAnswer
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/70 border-red-400 text-red-800 dark:text-red-200'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {selectedAnswer === currentQ.correctAnswer ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Chính xác! (+Điểm)</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-600" />
                          <span>Chưa chính xác!</span>
                        </>
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                      Chuyển câu tiếp...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-stone-500">
                  Đang nạp bộ câu hỏi thần tốc...
                </p>
              </div>
            )}
          </div>

          {/* =========================================================================
              TÚI ĐỒ VẬT PHẨM (INVENTORY) - DẠNG STRIP NHỎ GỌN TRÊN MOBILE
              ========================================================================= */}
          <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" /> Túi Đồ Tác Chiến ({currentPlayer?.inventory.length || 0}/1)
              </span>
              <span className="text-[11px] text-stone-400">
                {currentPlayer?.inventory && currentPlayer.inventory.length > 0 ? 'Chạm để dùng ngay' : 'Tối đa 1 món'}
              </span>
            </div>

            {currentPlayer && currentPlayer.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentPlayer.inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item)}
                    className="p-2.5 sm:p-3 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] hover:border-amber-500 text-left flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer shadow-sm group"
                  >
                    <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-black text-xs text-stone-900 dark:text-white block truncate">
                        {item.name}
                      </span>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-2 italic">
                Túi đồ trống. Trả lời đúng liên tiếp hoặc chạm Hộp quà tiếp tế để nhận vật phẩm (tối đa 1 món)!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
