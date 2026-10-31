import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  Shield, 
  User, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Check, 
  X,
  Target,
  Award,
  Compass,
  Clock,
  Zap,
  ShoppingBag,
  Users
} from 'lucide-react';
import { BoostItem, CrewRole, PlayerState, Question, TacticsMarketItem, TeamId, TeamState } from '../types/game';
import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { fetchAndParseQuestions } from '../utils/markdownParser';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';

export const PlayPage: React.FC = () => {
  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Trạng thái tham gia
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('team_1');
  const [playerName, setPlayerName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<CrewRole>('GUNNER');
  const [studentCode, setStudentCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Bộ câu hỏi & Nhịp độ 20 giây mỗi câu
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(20);
  const [explanationCountdown, setExplanationCountdown] = useState<number | null>(null);

  const questionTimerRef = useRef<any>(null);
  const explanationTimerRef = useRef<any>(null);

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

  // Kiểm tra đợt địch phản kích nhắm vào đội nhà
  const activeAttack = gameState.roomState.activeEnemyAttack;
  const isTeamUnderAttack = activeAttack && !activeAttack.isResolved && activeAttack.targetTeamId === currentTeam?.id;

  // Đếm ngược 20s cho mỗi câu hỏi
  useEffect(() => {
    if (!isJoined || hasAnswered || questions.length === 0 || gameState.roomState.phase !== 'BATTLE') {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    setQuestionTimeLeft(20);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((prev) => {
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
  }, [currentQIndex, isJoined, hasAnswered, questions.length, gameState.roomState.phase]);

  const handleTimeOut = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    soundService.playWrong();

    if (playerId) {
      gameSyncService.submitAnswer(playerId, false);
    }

    setExplanationCountdown(3);
    explanationTimerRef.current = setInterval(() => {
      setExplanationCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(explanationTimerRef.current);
          handleNextQuestion();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setJoinError('Đồng chí vui lòng điền Họ và tên trước khi nhận lệnh xuất kích!');
      return;
    }

    setJoinError(null);
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

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (hasAnswered || !questions[currentQIndex] || !playerId) return;

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    setSelectedAnswer(key);
    setHasAnswered(true);

    const currentQ = questions[currentQIndex];
    const isCorrect = currentQ.correctAnswer === key;

    gameSyncService.submitAnswer(playerId, isCorrect);

    setExplanationCountdown(4);
    if (explanationTimerRef.current) clearInterval(explanationTimerRef.current);
    explanationTimerRef.current = setInterval(() => {
      setExplanationCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(explanationTimerRef.current);
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

  // Kíp lái đỡ đòn phản kích của địch
  const handleDefendBossStrike = () => {
    if (!playerId || !currentTeam) return;
    gameSyncService.defendEnemyAttack(playerId, currentTeam.id);
  };

  // Kíp lái dùng vật phẩm đang giữ
  const handleUseTeamItem = () => {
    if (!playerId || !currentTeam) return;
    gameSyncService.useTeamHeldItem(playerId, currentTeam.id);
  };

  // Tranh mua/nhặt vật phẩm từ Chợ Quân Nhu Tactics
  const handleClaimMarketItem = (item: TacticsMarketItem) => {
    if (!playerId || !currentTeam) return;
    const res = gameSyncService.claimMarketItem(playerId, currentTeam.id, item.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ===================================================
          MÀN HÌNH GIA NHẬP (BẮT BUỘC ĐIỀN TÊN)
          =================================================== */}
      {!isJoined ? (
        <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-[#141f16] border-2 border-[#2b422e] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Gia Nhập Kíp Lái Xe Tăng
            </h1>
            <p className="text-xs text-slate-400">
              Điền Họ tên và chọn Cánh quân để nhận vị trí tác chiến trên sa bàn
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="space-y-4">
            {/* Nhập Họ và Tên (BẮT BUỘC) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Họ và Tên Chiến Sĩ:</span>
                <span className="text-[10px] text-red-400 font-black uppercase">* Bắt buộc</span>
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (joinError) setJoinError(null);
                }}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-xl bg-[#0c140d] border border-[#2b422e] text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
              />
              {joinError && (
                <p className="text-xs text-red-400 font-bold flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {joinError}
                </p>
              )}
            </div>

            {/* Chọn Cánh quân (6 Đội) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Chọn Cánh Quân Của Nhóm Bạn:</label>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_TEAMS_CONFIG.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTeamId === team.id
                        ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                        : 'bg-[#0d160e] border-[#233526] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-black text-xs">{team.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{team.corpsName}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Vị Trí Trong Kíp Lái */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Vị Trí Trong Kíp Lái:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as CrewRole)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c140d] border border-[#2b422e] text-amber-300 text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="GUNNER">🎯 Pháo Thủ Số 1 (Nhắm bắn đáp án chính xác)</option>
                <option value="COMMANDER">🎖️ Trưởng Xe (Chỉ huy & Kích hoạt khiên chắn)</option>
                <option value="DRIVER">⚡ Lái Xe Tăng (Đạp ga tăng tốc thần tốc)</option>
                <option value="LOADER">📦 Tiếp Đạn & Quân Nhu (Tranh nhặt đồ bảo vệ đội)</option>
                <option value="RADIO">📡 Báo Vụ (Theo dõi rada cảnh báo địch phản kích)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950/60 transition-all"
            >
              Vào Chiến Hào Xuất Kích →
            </button>
          </form>
        </div>
      ) : (
        /* ===================================================
            MÀN HÌNH TÁC CHIẾN CHÍNH (BATTLE TABLET)
            =================================================== */
        <div className="space-y-5">
          {/* THANH ĐIỀU HÀNH KÍP LÁI TRÊN CÙNG */}
          <div className="p-4 rounded-2xl bg-[#141f16] border border-[#233526] flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shadow"
                style={{ backgroundColor: currentTeam?.color }}
              >
                {currentTeam?.tankNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">{currentTeam?.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0d160e] text-slate-300 border border-[#233526]">
                    {currentTeam?.corpsName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="text-amber-300 font-bold">🎖️ {currentPlayer?.name}</span>
                  <span>•</span>
                  <span>Điểm: <strong className="text-white">{currentPlayer?.score || 0}đ</strong></span>
                  <span>•</span>
                  <span className="text-orange-400 font-black flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-orange-400" /> {currentPlayer?.currentStreak || 0}🔥
                  </span>
                </div>
              </div>
            </div>

            {/* Đồng hồ 5 phút toàn trận */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#0d160e] border border-[#233526] flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Thời gian trận:</span>
                <span className="font-mono font-black text-amber-300 text-sm">
                  {formatSeconds(gameState.roomState.remainingSeconds)}
                </span>
              </div>

              <button
                onClick={() => soundService.toggleMute() && setIsMuted(soundService.getMuted())}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* BÁO ĐỘNG ĐỎ: ĐỊCH ĐANG PHẢN KÍCH (ĐẾM NGƯỢC 1 GIÂY) */}
          {isTeamUnderAttack && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-950 border-2 border-red-500 shadow-2xl text-center space-y-3 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-red-300 font-black text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-ping" />
                <span>BÁO ĐỘNG ĐỎ: ĐỊCH NÃ PHÁO PHẢN KÍCH!</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  "{activeAttack?.historicalEventName}"
                </h3>
                <p className="text-xs text-red-200">{activeAttack?.historicalDetail}</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono font-black text-amber-300">
                <span>ĐẾM NGƯỢC TRÚNG ĐẠN:</span>
                <span className="text-xl text-red-400 px-3 py-1 rounded-lg bg-black/60 border border-red-500">
                  {((activeAttack?.remainingMs || 0) / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Nút bấm nhanh bằng chuột để kích hoạt khiên đỡ đòn trong 1 giây */}
              <div className="pt-2 flex justify-center">
                {currentTeam?.heldItem?.type === 'DAVIS_SHIELD' || currentTeam?.heldItem?.type === 'PLEIKU_DECEPTION' ? (
                  <button
                    onClick={handleDefendBossStrike}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(52,211,153,0.8)] animate-bounce flex items-center gap-2"
                  >
                    <Shield className="w-5 h-5" /> KÍCH HOẠT LÁ CHẮN NGAY LẬP TỨC!
                  </button>
                ) : (
                  <div className="text-xs text-amber-200 bg-black/50 px-4 py-2 rounded-xl border border-red-500/50">
                    ⚠️ Kíp xe chưa có Lá chắn bảo vệ! Hãy tranh thủ nhặt Lá chắn từ Chợ Quân Nhu!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VẬT PHẨM ĐỘI ĐANG GIỮ & NÚT SỬ DỤNG NHANH */}
          {currentTeam?.heldItem && !isTeamUnderAttack && (
            <div className="p-3.5 rounded-2xl bg-[#141f16] border border-amber-500/60 flex items-center justify-between gap-3 shadow">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentTeam.heldItem.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-xs">{currentTeam.heldItem.name}</span>
                    <span className="text-[9px] uppercase font-black text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                      Kíp xe đang giữ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{currentTeam.heldItem.description}</p>
                </div>
              </div>

              <button
                onClick={handleUseTeamItem}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow transition-all shrink-0"
              >
                Sử Dụng Ngay
              </button>
            </div>
          )}

          {/* KHU VỰC CÂU HỎI TRẮC NGHIỆM (NHỊP ĐỘ 20S) */}
          {gameState.roomState.phase === 'WAITING' ? (
            <div className="p-8 rounded-3xl bg-[#0d160e] border border-[#233526] text-center space-y-3 shadow">
              <span className="text-4xl">⏳</span>
              <h2 className="text-xl font-black text-white">Chờ Lệnh Xuất Kích Từ Chỉ Huy Sở</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Chỉ Huy Sở đang tập hợp các cánh quân. Trận đánh 5 phút sẽ bắt đầu ngay khi có hiệu lệnh từ phòng điều hành!
              </p>
            </div>
          ) : questions.length > 0 && questions[currentQIndex] ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#141f16] border-2 border-[#2b422e] shadow-2xl space-y-5">
              {/* Thanh tiến độ thời gian 20 giây */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-amber-300">
                    CÂU {currentQIndex + 1}/{questions.length}
                  </span>
                  <span className={`font-mono font-black ${questionTimeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-slate-300'}`}>
                    ⏱️ Còn {questionTimeLeft}s
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0c140d] overflow-hidden border border-[#233526]">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      questionTimeLeft <= 5 ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${(questionTimeLeft / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <h2 className="text-base sm:text-lg font-black text-white leading-relaxed">
                {questions[currentQIndex].text}
              </h2>

              {/* 4 Nút Lựa Chọn A, B, C, D Thao Tác Chuột Nhanh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const currentQ = questions[currentQIndex];
                  const isSelected = selectedAnswer === key;
                  const isCorrect = currentQ.correctAnswer === key;

                  let btnStyle = 'bg-[#0d160e] border-[#233526] text-slate-200 hover:border-amber-400 hover:bg-[#1a281c]';

                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-950 border-red-500 text-red-200';
                    } else {
                      btnStyle = 'opacity-40 bg-[#0d160e] border-[#233526] text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={hasAnswered}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${btnStyle}`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-xs shrink-0 text-amber-300">
                        {key}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold leading-relaxed mt-0.5">
                        {currentQ.options[key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Giải thích lịch sử sau khi trả lời */}
              {hasAnswered && (
                <div className="p-4 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                      📖 Bối Cảnh Lịch Sử Thật:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Chuyển câu sau: <strong className="text-white">{explanationCountdown}s</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {questions[currentQIndex].explanation}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* CHỢ QUÂN NHU DÃ CHIẾN (TACTICS DRAFT MARKET) */}
          <div className="p-5 rounded-3xl bg-[#0d160e] border border-[#233526] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1e2e21] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-white text-xs uppercase tracking-wide">
                  Chợ Quân Nhu Dã Chiến (Tactics Draft)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {currentTeam?.heldItem ? '⚠️ Kíp xe đã có 1 món' : '⚡ Nhanh tay nhặt đồ bảo vệ kíp xe!'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {gameState.roomState.tacticsMarket.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const isHeldByOurTeam = currentTeam?.heldItem !== null;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
                      isOutOfStock
                        ? 'bg-[#0a100b] border-[#182419] opacity-50'
                        : 'bg-[#141f16] border-[#233526] hover:border-amber-400/80 shadow'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            Đã Bị Giành
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Còn Hàng
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-white text-xs mt-1.5">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{item.description}</p>
                    </div>

                    <button
                      onClick={() => handleClaimMarketItem(item)}
                      disabled={isOutOfStock || isHeldByOurTeam}
                      className={`w-full py-2 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all ${
                        isOutOfStock || isHeldByOurTeam
                          ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-400 hover:bg-amber-300 text-black shadow'
                      }`}
                    >
                      {isOutOfStock
                        ? `Bị ${item.claimedByTeamName || 'đối thủ'} cướp`
                        : isHeldByOurTeam
                        ? 'Kíp xe đã đủ đồ'
                        : 'Tranh Nhặt Ngay'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
