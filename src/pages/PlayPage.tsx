import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { AnswerKey, BoostItem, PlayerState, Question, TeamId, TeamState } from '../types/game';
import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { fetchAndParseQuestions } from '../utils/markdownParser';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';

export const PlayPage: React.FC = () => {
  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Trạng thái tham gia (chỉ cần Họ tên + Chọn nhóm)
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('team_1');
  const [playerName, setPlayerName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Bộ câu hỏi & Thời gian 18s cho mỗi câu
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerKey | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState<number>(18);
  const [explanationCountdown, setExplanationCountdown] = useState<number | null>(null);

  // Toast thông báo
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  const questionTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  // Đọc danh tính đã lưu
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

  // Lắng nghe cập nhật chiến trường
  useEffect(() => {
    const unsubscribe = gameSyncService.subscribe((newState) => {
      setGameState(newState);
      if (newState.customQuestions && newState.customQuestions.length > 0) {
        setQuestions(newState.customQuestions);
      }
    });
    return () => unsubscribe();
  }, []);

  // Tải câu hỏi mặc định
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

  // Kiểm tra xe của đội mình có đang bị ngắm bắn không
  const isTeamUnderAttack = gameState.currentEnemyAttack?.targetTeamId === currentTeam?.id && gameState.currentEnemyAttack?.status === 'WARNING';

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

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setValidationError('Vui lòng điền Họ và tên để tham gia vào đội!');
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
      showToast(`Đã dùng [${item.name}]!`);
    }
  };

  // Click trực tiếp vào hộp tiếp tế để nhận đồ (không cần chữ "Nhặt ngay")
  const handleClaimDraftBox = (draftId: string) => {
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
      {/* Toast thông báo */}
      {feedbackToast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border transition-all ${
          feedbackToast.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-amber-600 text-white border-amber-500'
        }`}>
          {feedbackToast.message}
        </div>
      )}

      {/* HEADER PHÒNG CHƠI */}
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
          MÀN HÌNH 1: ĐIỀN TÊN & CHỌN NHÓM
          =================================================== */}
      {!isJoined ? (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-lg space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-black uppercase text-stone-900 dark:text-white">
              Vào Phòng Thi Đấu
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Điền họ tên và chọn nhóm của bạn để bắt đầu
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
                Họ và Tên của bạn: <span className="text-red-500">* (Bắt buộc)</span>
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
                Mã Số Sinh Viên (MSSV):
              </label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="VD: HE123456 (Không bắt buộc)"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-500 dark:focus:border-amber-400"
              />
            </div>

            {/* Chọn Nhóm (6 Đội) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Chọn Nhóm Của Bạn:
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
                        <span className="text-[10px] font-mono font-bold text-stone-500">Xe #{team.tankNumber}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                        {team.corpsName}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              Vào Phòng Chờ
            </button>
          </form>
        </div>
      ) : gameState.roomState.phase === 'WAITING' ? (
        /* ===================================================
           MÀN HÌNH SẢNH CHỜ: HIỂN THỊ CÁC THÀNH VIÊN ĐÃ JOIN
           =================================================== */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
              <span>⏳ Đang ở sảnh chờ... Chờ Quản Trò phát lệnh bắt đầu</span>
            </div>

            <h2 className="text-2xl font-black uppercase text-stone-900 dark:text-white flex items-center justify-center gap-2">
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

          {/* Danh sách thành viên trong nhóm đã join */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-100 dark:border-[#1e2a21]">
              <span className="font-bold text-stone-700 dark:text-stone-300">
                Thành viên trong nhóm ({gameState.players.filter((p) => p.teamId === currentTeam?.id).length}):
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Tự động vào chơi khi bắt đầu
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
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Sẵn sàng
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-[#1a231b] border border-amber-200 dark:border-amber-900/60 text-xs text-stone-600 dark:text-stone-300 space-y-1">
            <strong className="text-stone-900 dark:text-white block font-bold">💡 Lưu ý khi thi đấu:</strong>
            <p>1. Dùng chuột click vào đáp án đúng để đưa xe tăng của nhóm tiến lên.</p>
            <p>2. Khi có hộp tiếp tế rơi xuống, click nhanh vào hộp để lấy khiên bảo vệ xe.</p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setIsJoined(false)}
              className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
            >
              ← Đổi Nhóm / Chỉnh Sửa Thông Tin
            </button>

            <span className="text-xs font-mono text-stone-400">
              Mã phòng: #VNR202
            </span>
          </div>
        </div>
      ) : (
        /* ===================================================
           MÀN HÌNH 2: TÁC CHIẾN THỜI GIAN THỰC
           =================================================== */
        <div className="space-y-6">
          {/* CẢNH BÁO ĐỊCH ĐANG BẮN VÀO XE ĐỘI BẠN (CHỈ CÓ TIẾNG BÁO, KHÔNG ĐẾM 3,2,1) */}
          {isTeamUnderAttack && (
            <div className="p-4 rounded-2xl bg-red-600 text-white border-2 border-amber-300 shadow-xl space-y-1.5 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm uppercase flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-300 animate-bounce" />
                  CẢNH BÁO: ĐỊCH ĐANG BẮN PHÁO VÀO XE ĐỘI BẠN!
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 border border-white/30">
                  Đang tới
                </span>
              </div>
              <p className="text-xs text-red-100">
                Hãy click vào <strong>[Lá chắn Trại Davis]</strong> trong túi đồ bên dưới ngay để không bị trúng đạn!
              </p>
            </div>
          )}

          {/* THANH THÔNG TIN ĐỘI & THÀNH VIÊN */}
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
                  {currentTeam?.hasShield && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500">
                      🛡️ Khiên Bật
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
                <span className="text-stone-400 block text-[11px]">Thành viên</span>
                <span className="font-black text-stone-900 dark:text-white">{currentPlayer?.name}</span>
              </div>
              <div className="h-7 w-[1px] bg-stone-200 dark:bg-stone-800" />
              <div className="text-center sm:text-right">
                <span className="text-stone-400 block text-[11px]">Điểm</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-base">{currentPlayer?.score || 0}đ</span>
              </div>
              <div className="h-7 w-[1px] bg-stone-200 dark:bg-stone-800" />
              <div className="text-center sm:text-right">
                <span className="text-stone-400 block text-[11px]">Streak</span>
                <span className="font-black text-red-600 dark:text-red-400 text-base flex items-center gap-0.5">
                  <Flame className="w-4 h-4 fill-red-500" />
                  {currentPlayer?.currentStreak || 0}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================
              HỘP TIẾP TẾ THẢ DÙ (CLICK VÀO HỘP ĐỂ NHẬN ĐỒ)
              =================================================== */}
          {gameState.supplyDraftPool.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#1c241d] border border-amber-300 dark:border-amber-800/80 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-stone-900 dark:text-white flex items-center gap-1.5 uppercase">
                  <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-bounce" />
                  Hộp Tiếp Tế Vừa Rơi (Click vào hộp để nhận quà!)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Mỗi đội chỉ giữ tối đa 1 món cùng loại
                </span>
              </div>

              {/* Danh sách hộp quà: Click trực tiếp vào hộp để nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gameState.supplyDraftPool.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleClaimDraftBox(draft.id)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#131b15] border-2 border-dashed border-amber-400 hover:border-amber-600 hover:scale-[1.02] text-left flex items-center gap-3 transition-all group shadow-sm cursor-pointer"
                    title="Click vào hộp để nhận món đồ này cho đội"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {draft.item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-xs text-stone-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                        {draft.item.name}
                      </span>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{draft.item.description}</p>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                        👉 Click để nhận
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================
              KHU VỰC CÂU HỎI TRẮC NGHIỆM (CHỈ DÙNG CHUỘT)
              =================================================== */}
          <div className={`p-6 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-md space-y-5 transition-all ${
            currentPlayer?.isShellShocked ? 'shell-shocked' : ''
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#1e2a21]">
              <span className="text-xs font-black uppercase text-stone-500">
                Câu Hỏi #{currentQIndex + 1} / {questions.length || 1}
              </span>

              {/* Đếm ngược 18s */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-mono font-black text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{questionTimeRemaining}s</span>
              </div>
            </div>

            {currentQ ? (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-relaxed">
                  {currentQ.text}
                </h3>

                {/* 4 Nút Lựa Chọn Đáp Án (Thao tác chuột thuần túy) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {(['A', 'B', 'C', 'D'] as AnswerKey[]).map((key) => {
                    const isEliminated = currentPlayer?.eliminatedOptions?.includes(key);
                    const isCorrect = currentQ.correctAnswer === key;
                    const isSelected = selectedAnswer === key;

                    return (
                      <button
                        key={key}
                        disabled={hasAnswered || isEliminated}
                        onClick={() => handleSelectOption(key)}
                        className={`p-4 rounded-2xl border text-left font-semibold transition-all relative flex items-center justify-between group cursor-pointer ${
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
                            {key}
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

                {/* Giải thích sau khi trả lời */}
                {hasAnswered && (
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-500">
                      <span className="font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Giải thích bối cảnh lịch sử:
                      </span>
                      {explanationCountdown !== null && (
                        <span className="font-mono font-bold text-red-600 dark:text-amber-400">
                          Câu tiếp sau {explanationCountdown}s...
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
                Chưa có câu hỏi. Quản trò sẽ nạp bộ câu hỏi sớm nhất!
              </p>
            )}
          </div>

          {/* ===================================================
              TÚI ĐỒ VẬT PHẨM TRONG TAY BẠN
              =================================================== */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" /> Túi Đồ Của Bạn ({currentPlayer?.inventory.length || 0})
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Click vào món đồ để sử dụng
              </span>
            </div>

            {currentPlayer && currentPlayer.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentPlayer.inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item)}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] hover:border-amber-500 text-left flex flex-col justify-between group transition-all shadow-sm cursor-pointer"
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
                      Click để dùng ngay →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-3 italic">
                Túi đồ đang trống. Hãy trả lời đúng liên tiếp hoặc click nhặt Hộp tiếp tế thả dù!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
