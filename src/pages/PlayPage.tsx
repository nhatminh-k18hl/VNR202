import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  Shield, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Check, 
  X,
  Volume2, 
  VolumeX, 
  Clock,
  Sparkles,
  Package,
  Radio,
  Zap,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { AnswerKey, BoostItem, CrewRole, PlayerState, Question, TeamId, TeamState } from '../types/game';
import { CREW_ROLES, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { fetchAndParseQuestions } from '../utils/markdownParser';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';

export const PlayPage: React.FC = () => {
  // Đồng bộ toàn cục
  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Trạng thái tham gia
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('team_1');
  const [selectedRole, setSelectedRole] = useState<CrewRole>('GUNNER');
  const [playerName, setPlayerName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Bộ câu hỏi & Thời gian đếm ngược 18s cho mỗi câu
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(18);
  const [explanationCountdown, setExplanationCountdown] = useState<number | null>(null);

  // Thông báo phản hồi thao tác nhanh
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  const questionTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  // Đọc danh tính đã lưu trong phiên trước
  useEffect(() => {
    const savedId = localStorage.getItem('than_toc_player_id');
    const savedName = localStorage.getItem('than_toc_player_name');
    const savedTeam = localStorage.getItem('than_toc_player_team') as TeamId;

    if (savedId && savedName && savedTeam) {
      setPlayerId(savedId);
      setPlayerName(savedName);
      setSelectedTeamId(savedTeam);
      gameSyncService.registerPlayer({ id: savedId, name: savedName, teamId: savedTeam });
      setIsJoined(true);
    }
  }, []);

  // Lắng nghe cập nhật chiến trường từ gameSyncService
  useEffect(() => {
    const unsubscribe = gameSyncService.subscribe((newState) => {
      setGameState(newState);
      if (newState.customQuestions && newState.customQuestions.length > 0) {
        setQuestions(newState.customQuestions);
      }
    });
    return () => unsubscribe();
  }, []);

  // Tải câu hỏi mặc định nếu chưa có
  useEffect(() => {
    if (questions.length === 0) {
      fetchAndParseQuestions('./questions.md')
        .then((qs) => {
          if (qs.length > 0) setQuestions(qs);
        })
        .catch((err) => console.warn('Không thể nạp questions.md trong PlayPage:', err));
    }
  }, [questions.length]);

  const currentPlayer: PlayerState | undefined = gameState.players.find((p) => p.id === playerId);
  const currentTeam: TeamState | undefined = gameState.teams.find((t) => t.id === (currentPlayer?.teamId || selectedTeamId));

  // Kiểm tra xe của đội mình có đang bị địch ngắm bắn không
  const isTeamUnderAttack = gameState.currentEnemyAttack?.targetTeamId === currentTeam?.id && gameState.currentEnemyAttack?.status === 'WARNING';
  const enemyAttackCountdown = gameState.currentEnemyAttack?.countdownSeconds ?? 0;

  // Đếm ngược 18s cho mỗi câu hỏi khi phòng ở phase BATTLE
  useEffect(() => {
    if (!isJoined || hasAnswered || gameState.roomState.phase !== 'BATTLE') {
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
  }, [currentQIndex, isJoined, hasAnswered, gameState.roomState.phase]);

  // Hỗ trợ phím tắt bàn phím: 1, 2, 3, 4 hoặc A, B, C, D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isJoined || hasAnswered || !questions[currentQIndex]) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1' || e.key.toUpperCase() === 'A') handleSelectOption('A');
      if (e.key === '2' || e.key.toUpperCase() === 'B') handleSelectOption('B');
      if (e.key === '3' || e.key.toUpperCase() === 'C') handleSelectOption('C');
      if (e.key === '4' || e.key.toUpperCase() === 'D') handleSelectOption('D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isJoined, hasAnswered, currentQIndex, questions]);

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setValidationError('Vui lòng điền Họ và tên chiến sĩ để nhận lệnh xuất kích!');
      return;
    }

    setValidationError(null);
    const newId = 'pl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setPlayerId(newId);

    localStorage.setItem('than_toc_player_id', newId);
    localStorage.setItem('than_toc_player_name', playerName.trim());
    localStorage.setItem('than_toc_player_team', selectedTeamId);

    gameSyncService.registerPlayer({
      id: newId,
      name: playerName.trim(),
      studentCode: studentCode.trim() || undefined,
      teamId: selectedTeamId,
      role: selectedRole,
    });

    setIsJoined(true);
  };

  const handleTimeOut = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedAnswer(null);

    if (playerId) {
      gameSyncService.answerQuestion(playerId, questions[currentQIndex]?.id || currentQIndex, 'A', false);
    }

    startExplanationTimer();
  };

  const handleSelectOption = (key: AnswerKey) => {
    if (hasAnswered || !questions[currentQIndex] || !playerId) return;

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    setSelectedAnswer(key);
    setHasAnswered(true);

    const currentQ = questions[currentQIndex];
    const isCorrect = currentQ.correctAnswer === key;

    gameSyncService.answerQuestion(playerId, currentQ.id, key, isCorrect);

    startExplanationTimer();
  };

  const startExplanationTimer = () => {
    setExplanationCountdown(3);
    countdownTimerRef.current = setInterval(() => {
      setExplanationCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleNextQuestion();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setExplanationCountdown(null);

    if (questions.length > 0) {
      setCurrentQIndex((prev) => (prev + 1) % questions.length);
    }
  };

  const handleUseItem = (item: BoostItem) => {
    if (!playerId) return;
    const currentQ = questions[currentQIndex];
    const success = gameSyncService.useItem(playerId, item.id, currentQ);
    if (success) {
      showToast(`Đã kích hoạt [${item.name}]!`);
    }
  };

  const handleClaimDraftItem = (draftId: string) => {
    if (!playerId) return;
    const res = gameSyncService.claimDraftItem(draftId, playerId);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warn');
    }
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast thông báo thao tác */}
      {feedbackToast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border transition-all ${
          feedbackToast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-amber-600 text-white border-amber-500'
        }`}>
          {feedbackToast.message}
        </div>
      )}

      {/* HEADER PHÒNG TÁC CHIẾN */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-[#223025]">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
        </Link>

        <div className="flex items-center gap-3">
          {/* Thời gian trận đấu 5 phút */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-[#151e18] border border-stone-200 dark:border-[#223025]">
            <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span className="text-stone-800 dark:text-stone-200">
              {Math.floor(gameState.roomState.timeRemainingSeconds / 60)}:
              {String(gameState.roomState.timeRemainingSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setIsMuted(soundService.toggleMute())}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-[#223025] bg-stone-100 dark:bg-[#151e18] text-stone-700 dark:text-stone-300"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ===================================================
          MÀN HÌNH 1: GIA NHẬP KÍP XE (FORM ĐIỀN TÊN BẮT BUỘC)
          =================================================== */}
      {!isJoined ? (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-lg space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black uppercase text-stone-900 dark:text-white">
              Gia Nhập Kíp Xe Tăng
            </h2>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              Điền danh tính chiến sĩ và chọn cánh quân lịch sử để nhận phân công vị trí
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="space-y-4">
            {validationError && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-500 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                Họ và Tên Chiến Sĩ <span className="text-red-500">* (Bắt buộc)</span>
              </label>
              <input
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nhập đầy đủ Họ và tên (VD: Nguyễn Văn An)"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 dark:focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Mã Số Sinh Viên (MSSV)
              </label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="VD: HE186934 (Không bắt buộc)"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 dark:focus:border-amber-400"
              />
            </div>

            {/* Chọn Cánh Quân (6 Đội) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Chọn Cánh Quân / Nhóm Thi Đua:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {INITIAL_TEAMS_CONFIG.map((team) => (
                  <button
                    type="button"
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      selectedTeamId === team.id
                        ? 'border-red-600 dark:border-amber-400 bg-red-50/80 dark:bg-[#1a261c] shadow-sm ring-1 ring-red-600 dark:ring-amber-400'
                        : 'border-stone-200 dark:border-[#233426] bg-stone-50 dark:bg-[#0e1610] hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-stone-900 dark:text-white">{team.name}</span>
                        <span className="text-[10px] font-mono font-bold text-stone-500">#{team.tankNumber}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {team.corpsName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Vị Trí Trong Kíp Lái */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Vị Trí Kíp Lái Ưu Tiên:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center text-xs">
                {CREW_ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`p-2 rounded-xl border font-bold transition-all ${
                      selectedRole === r.role
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500'
                        : 'border-stone-200 dark:border-[#223025] bg-stone-50 dark:bg-[#0e1610] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span className="text-sm block">{r.badge}</span>
                    <span className="text-[11px]">{r.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-red-600/30 transition-all"
            >
              Vào Chiến Hào Nhận Lệnh
            </button>
          </form>
        </div>
      ) : (
        /* ===================================================
           MÀN HÌNH 2: TÁC CHIẾN THỜI GIAN THỰC
           =================================================== */
        <div className="space-y-6">
          {/* CẢNH BÁO ĐỊCH PHẢN KÍCH (ĐẾM NGƯỢC 3S TRƯỚC KHI TRÚNG ĐẠN) */}
          {isTeamUnderAttack && (
            <div className="p-4 rounded-2xl bg-red-600 text-white border-2 border-amber-300 shadow-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
                  [CẢNH BÁO TÁC CHIẾN] ĐỊCH ĐANG PHẢO KÍCH XE CỦA BẠN!
                </span>
                <span className="font-mono text-xl font-black bg-black/40 px-3 py-0.5 rounded-lg border border-white/40">
                  {enemyAttackCountdown}s
                </span>
              </div>
              <p className="text-xs text-red-100">
                Sự kiện: <strong>{gameState.currentEnemyAttack?.eventName}</strong>. Bật <strong>Lá chắn Trại Davis</strong> ngay để bảo toàn kíp lái!
              </p>
            </div>
          )}

          {/* THANH THÔNG TIN KÍP XE TĂNG & CHỈ SỐ CÁ NHÂN */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow"
                style={{ backgroundColor: currentTeam?.color || '#2563EB' }}
              >
                #{currentTeam?.tankNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-stone-900 dark:text-white">{currentTeam?.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {currentPlayer?.role ? CREW_ROLES.find(r => r.role === currentPlayer.role)?.title : 'Kíp lái'}
                  </span>
                  {currentTeam?.hasShield && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500">
                      🛡️ Khiên Thép Bật
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {currentTeam?.corpsName} • Tiến độ: <strong className="text-stone-900 dark:text-white">{currentTeam?.progress}%</strong>
                </p>
              </div>
            </div>

            {/* Chỉ số cá nhân: Điểm, Streak, Tên */}
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center sm:text-right">
                <span className="text-stone-500 dark:text-stone-400 block text-[11px]">Chiến sĩ</span>
                <span className="font-black text-stone-900 dark:text-white">{currentPlayer?.name}</span>
              </div>
              <div className="h-7 w-[1px] bg-stone-200 dark:bg-stone-800" />
              <div className="text-center sm:text-right">
                <span className="text-stone-500 dark:text-stone-400 block text-[11px]">Điểm</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-base">{currentPlayer?.score || 0}đ</span>
              </div>
              <div className="h-7 w-[1px] bg-stone-200 dark:bg-stone-800" />
              <div className="text-center sm:text-right">
                <span className="text-stone-500 dark:text-stone-400 block text-[11px]">Streak</span>
                <span className="font-black text-red-600 dark:text-red-400 text-base flex items-center gap-0.5">
                  <Flame className="w-4 h-4 fill-red-500" />
                  {currentPlayer?.currentStreak || 0}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              HÒM TIẾP VIỆN THẢ DÙ (SUPPLY DRAFT - GIÀNH ĐỒ)
              =================================================== */}
          {gameState.supplyDraftPool.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#1c241d] border border-amber-300 dark:border-amber-800/80 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-stone-900 dark:text-white flex items-center gap-1.5 uppercase">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
                  Hòm Tiếp Viện Thả Dù Đang Rơi (Nhanh Tay Trưng Dụng!)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Mỗi đội chỉ được giữ 1 món cùng loại
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gameState.supplyDraftPool.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleClaimDraftItem(draft.id)}
                    className="p-3 rounded-xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] hover:border-amber-500 text-left flex items-center justify-between transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{draft.item.icon}</span>
                      <div>
                        <span className="font-bold text-xs text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {draft.item.name}
                        </span>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">{draft.item.description}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap shadow-sm">
                      Nhặt Ngay
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================
              KHU VỰC CÂU HỎI TRẮC NGHIỆM & PHÍM TẮT
              =================================================== */}
          <div className={`p-6 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-md space-y-5 transition-all ${
            currentPlayer?.isShellShocked ? 'shell-shocked' : ''
          }`}>
            {/* Header câu hỏi: Số thứ tự & Đếm ngược 18s */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#1e2a21]">
              <span className="text-xs font-black uppercase text-stone-500">
                Câu Hỏi #{currentQIndex + 1} / {questions.length || 1}
              </span>

              {/* Đồng hồ đếm ngược câu hỏi 18s */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-mono font-black text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{questionTimeRemaining}s</span>
              </div>
            </div>

            {/* Nội dung câu hỏi */}
            {currentQ ? (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-relaxed">
                  {currentQ.text}
                </h3>

                {/* 4 Nút Lựa Chọn Đáp Án (Hỗ trợ phím tắt 1, 2, 3, 4 hoặc A, B, C, D) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {(['A', 'B', 'C', 'D'] as AnswerKey[]).map((key, idx) => {
                    const isEliminated = currentPlayer?.eliminatedOptions?.includes(key);
                    const isCorrect = currentQ.correctAnswer === key;
                    const isSelected = selectedAnswer === key;

                    return (
                      <button
                        key={key}
                        disabled={hasAnswered || isEliminated}
                        onClick={() => handleSelectOption(key)}
                        className={`p-4 rounded-2xl border text-left font-semibold transition-all relative flex items-center justify-between group ${
                          isEliminated
                            ? 'opacity-35 line-through bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                            : hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                              : isSelected
                              ? 'bg-red-50 dark:bg-red-950/80 border-red-500 text-red-900 dark:text-red-100'
                              : 'bg-stone-50 dark:bg-[#0e1610] border-stone-200 dark:border-[#202e23] opacity-60'
                            : 'bg-stone-50 dark:bg-[#0e1610] border-stone-200 dark:border-[#223025] hover:border-red-500 dark:hover:border-amber-400 hover:shadow-sm text-stone-800 dark:text-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-amber-300 font-mono font-black text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105">
                            {idx + 1}
                          </span>
                          <span>{currentQ.options[key]}</span>
                        </div>

                        {hasAnswered && (
                          <span className="ml-2">
                            {isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                            {isSelected && !isCorrect && <X className="w-4 h-4 text-red-600" />}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Giải thích lịch sử sau khi trả lời */}
                {hasAnswered && (
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Giải thích bối cảnh lịch sử:
                      </span>
                      {explanationCountdown !== null && (
                        <span className="font-mono font-bold text-red-600 dark:text-amber-400">
                          Câu tiếp theo sau {explanationCountdown}s...
                        </span>
                      )}
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 italic leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-stone-500 text-center py-6">
                Chưa có câu hỏi tác chiến. Chỉ Huy Sở sẽ cập nhật bộ đề sớm nhất!
              </p>
            )}
          </div>

          {/* ===================================================
              KHO VẬT PHẨM BẢO VỆ & HỖ TRỢ TRONG TÚI
              =================================================== */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" /> Kho Lệnh Bài Chiến Thuật Của Bạn ({currentPlayer?.inventory.length || 0})
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Đạt Streak 3, 5, 7... hoặc nhặt từ Hòm tiếp viện
              </span>
            </div>

            {currentPlayer && currentPlayer.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentPlayer.inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item)}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] hover:border-amber-500 text-left flex flex-col justify-between group transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.icon}</span>
                          {item.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Sẵn sàng
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>

                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-2 pt-1 border-t border-stone-200 dark:border-[#1e2a21] block text-right">
                      Nhấn để kích hoạt →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-3 italic">
                Túi đồ hiện đang trống. Hãy duy trì chuỗi Streak đúng hoặc nhặt đồ từ Hòm tiếp viện dã chiến!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
