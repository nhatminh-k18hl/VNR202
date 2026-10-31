import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  Shield, 
  Zap, 
  User, 
  CheckCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Fuel, 
  Trophy, 
  Check, 
  X,
  Target
} from 'lucide-react';
import { BoostItem, ItemType, PlayerState, Question, TeamId, TeamState } from '../types/game';
import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { fetchAndParseQuestions } from '../utils/markdownParser';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';
import { TankSvg } from '../assets/svg/TankSvg';

export const PlayPage: React.FC = () => {
  // Đồng bộ toàn cục
  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Trạng thái tham gia
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('team_1');
  const [playerName, setPlayerName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');

  // Bộ câu hỏi
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [explanationCountdown, setExplanationCountdown] = useState<number | null>(null);

  // Chọn đội đối thủ cho Chặn đường số 7
  const [targetSelectModalItem, setTargetSelectModalItem] = useState<BoostItem | null>(null);

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

  // Kiểm tra hiệu ứng đang tác động lên đội nhà
  const isDeceptionActive = currentTeam?.activeEffects.some((e) => e.type === 'PLEIKU_DECEPTION');
  const isRouteBlockActive = currentTeam?.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');
  const hasShield = currentTeam?.activeEffects.some((e) => e.type === 'DAVIS_SHIELD');

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

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

    setSelectedAnswer(key);
    setHasAnswered(true);

    const currentQ = questions[currentQIndex];
    const isCorrect = currentQ.correctAnswer === key;

    gameSyncService.submitAnswer(playerId, isCorrect);

    // Bắt đầu đếm ngược 2.5s để tự động chuyển câu hỏi
    setExplanationCountdown(3);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

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
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setSelectedAnswer(null);
    setHasAnswered(false);
    setExplanationCountdown(null);
    setCurrentQIndex((prev) => (prev + 1) % (questions.length || 1));
  };

  const handleUseItem = (item: BoostItem) => {
    if (item.type === 'ROUTE_7_BLOCK') {
      // Mở modal chọn đội đối thủ cần chặn đường
      setTargetSelectModalItem(item);
      return;
    }

    if (playerId) {
      gameSyncService.activateItem(playerId, item.id);
    }
  };

  const handleConfirmRouteBlock = (targetTeamId: TeamId) => {
    if (targetSelectModalItem && playerId) {
      gameSyncService.activateItem(playerId, targetSelectModalItem.id, targetTeamId);
      setTargetSelectModalItem(null);
    }
  };

  const toggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-military-border/80 pb-3">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-military-card border border-military-border text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-military-card border border-military-border text-vietnam-yellow">
            Mặt Trận Sài Gòn 1975
          </span>
        </div>
      </div>

      {!isJoined ? (
        /* ===================================================
           MÀN HÌNH GIA NHẬP (NO-LOGIN)
           =================================================== */
        <div className="bg-military-surface/90 border border-military-border rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2 border-b border-military-border pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-vietnam-yellow bg-vietnam-red/20 px-3 py-1 rounded-full border border-vietnam-red/40">
              Chiến Dịch Hồ Chí Minh 1975
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Ghi Danh Xuất Kích - Chọn Cánh Quân Của Bạn
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Chọn đúng Nhóm học tập của bạn trong lớp và nhập họ tên để cùng toàn đội đẩy xe tăng tiến về Dinh Độc Lập!
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="space-y-6">
            {/* Lựa chọn 6 Cánh quân theo đúng đề bài */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-200">
                1. Chọn Cánh Quân / Nhóm Thi Đua Của Bạn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {INITIAL_TEAMS_CONFIG.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      type="button"
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-military-card border-vietnam-yellow ring-2 ring-vietnam-yellow/50 shadow-xl'
                          : 'bg-military-dark/80 border-military-border hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white text-base">{team.name}</span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-vietnam-yellow" />}
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-1">{team.corpsName}</p>
                      <span 
                        className="inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${team.color}25`, color: team.color }}
                      >
                        {team.axisName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhập Tên và MSSV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Họ và Tên Chiến Sĩ: <span className="text-vietnam-red">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Toàn"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-military-dark border border-military-border rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vietnam-yellow focus:ring-1 focus:ring-vietnam-yellow"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mã Số Sinh Viên (MSSV):
                </label>
                <input
                  type="text"
                  placeholder="VD: SE186934 (Tùy chọn)"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full bg-military-dark border border-military-border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-vietnam-yellow focus:ring-1 focus:ring-vietnam-yellow"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-vietnam-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-extrabold text-base tracking-wide uppercase shadow-lg shadow-red-900/40 hover:shadow-red-800/60 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-vietnam-yellow" />
              Sẵn Sàng Xuất Kích Cùng {INITIAL_TEAMS_CONFIG.find((t) => t.id === selectedTeamId)?.name}
            </button>
          </form>
        </div>
      ) : (
        /* ===================================================
           MÀN HÌNH TÁC CHIẾN (CHIẾN SĨ THI ĐẤU)
           =================================================== */
        <div className="space-y-6">
          {/* Cảnh báo khi đội nhà bị dính hiệu ứng Debuff từ đối phương */}
          {isDeceptionActive && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs flex items-center gap-2 animate-bounce shadow-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <strong>CẢNH BÁO TÁC CHIẾN:</strong> Đội bạn đang dính hiệu ứng <strong>Nghi binh Pleiku</strong>! Các phương án câu hỏi đang bị rung nhiễu!
              </div>
            </div>
          )}

          {isRouteBlockActive && (
            <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Đội bạn đang bị đối phương lập rào cản <strong>Chặn đường số 7</strong> (tốc độ tiến quân giảm 50%)!</span>
            </div>
          )}

          {/* Thanh Tiến Độ Xe Tăng Đội Nhà & Chỉ Số Cá Nhân */}
          <div className="bg-military-surface/90 border border-military-border rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm border shadow"
                  style={{ backgroundColor: `${currentTeam?.color}30`, borderColor: currentTeam?.color }}
                >
                  {currentTeam?.name.replace('Nhóm ', 'N')}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    {currentPlayer?.name}
                    <span className="text-xs font-normal text-slate-400">({currentTeam?.corpsName})</span>
                  </h3>
                  <span className="text-xs text-vietnam-yellow font-medium">
                    {currentTeam?.axisName}
                  </span>
                </div>
              </div>

              {/* Bảng chỉ số cá nhân */}
              <div className="flex items-center gap-3 text-center">
                <div className="px-3 py-1.5 rounded-xl bg-military-dark border border-military-border">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Điểm</span>
                  <span className="text-lg font-black text-vietnam-yellow">{currentPlayer?.score || 0}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-military-dark border border-military-border">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold flex items-center justify-center gap-0.5">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> Streak
                  </span>
                  <span className="text-lg font-black text-orange-400">{currentPlayer?.currentStreak || 0}</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-military-dark border border-military-border">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Kỷ lục</span>
                  <span className="text-lg font-black text-emerald-400">{currentPlayer?.maxStreak || 0}</span>
                </div>
              </div>
            </div>

            {/* Thanh tiến độ xe tăng đội nhà */}
            <div className="space-y-1.5 pt-2 border-t border-military-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  🚜 Tiến độ Cánh quân ({currentTeam?.name}):
                </span>
                <span className="font-black text-vietnam-yellow text-sm">
                  {currentTeam?.progress || 0}%
                </span>
              </div>

              <div className="relative w-full h-4 bg-military-dark rounded-full overflow-hidden border border-slate-700/80">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400"
                  style={{ width: `${currentTeam?.progress || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* MÀN HÌNH CÂU HỎI TRẮC NGHIỆM */}
          {currentQ ? (
            <div className="bg-military-surface/90 border border-military-border rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative">
              {/* Huy hiệu Mệnh lệnh thần tốc x2 nếu đang kích hoạt */}
              {currentPlayer?.isSpeedBoostActive && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-black animate-pulse">
                  <Zap className="w-4 h-4 text-yellow-400" /> Đang kích hoạt [Mệnh lệnh Thần tốc: x2 Điểm & Tiến độ]!
                </div>
              )}

              <div className="flex items-center justify-between border-b border-military-border pb-3 text-xs text-slate-400">
                <span className="font-extrabold uppercase px-2.5 py-1 rounded bg-vietnam-red/20 text-vietnam-yellow border border-vietnam-red/40">
                  Câu hỏi #{currentQ.id}
                </span>
                <span>Chủ đề 6: Đại thắng Mùa Xuân 1975</span>
              </div>

              <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
                {currentQ.text}
              </h2>

              {/* 4 Nút Lựa chọn A, B, C, D (Có hiệu ứng rung nếu dính Nghi binh Pleiku) */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${isDeceptionActive ? 'animate-[bounce_0.6s_infinite]' : ''}`}>
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = currentQ.correctAnswer === key;

                  let style = 'bg-military-dark/80 border-military-border text-slate-200 hover:border-vietnam-yellow/70 hover:bg-military-card';
                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected) {
                      style = 'bg-red-950/80 border-red-500 text-red-200 font-bold';
                    } else {
                      style = 'opacity-40 bg-military-dark/40 border-slate-800 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={hasAnswered}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${style}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                        hasAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                            ? 'bg-vietnam-red text-white'
                            : 'bg-slate-800 text-slate-300'
                      }`}>
                        {key}
                      </span>
                      <span className="text-sm leading-snug flex-1">{currentQ.options[key]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Hộp thoại Giải thích Lịch sử sau khi trả lời */}
              {hasAnswered && (
                <div className="space-y-4 pt-2">
                  <div className={`p-4 rounded-xl border text-sm space-y-2 ${
                    selectedAnswer === currentQ.correctAnswer
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                      : 'bg-red-950/60 border-red-700 text-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold flex items-center gap-2 text-base">
                        {selectedAnswer === currentQ.correctAnswer ? (
                          <>
                            <Check className="w-5 h-5 text-emerald-400" />
                            CHÍNH XÁC! (+{currentPlayer?.isSpeedBoostActive ? '200' : '100'} điểm & xe tăng tiến bước)
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 text-red-400" />
                            CHƯA CHÍNH XÁC! Chuỗi đúng trở về 0.
                          </>
                        )}
                      </span>

                      {explanationCountdown !== null && (
                        <span className="text-xs bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 font-semibold text-slate-300">
                          Tự chuyển sau {explanationCountdown}s...
                        </span>
                      )}
                    </div>

                    {currentQ.explanation && (
                      <p className="text-xs text-slate-300 border-t border-slate-700/80 pt-2 leading-relaxed">
                        <strong className="text-vietnam-yellow">💡 Ý nghĩa lịch sử:</strong> {currentQ.explanation}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
                  >
                    Chuyển Câu Tiếp Theo Ngay Lập Tức →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-military-surface/90 border border-military-border rounded-2xl">
              Đang chờ Chỉ Huy Sở phát lệnh câu hỏi...
            </div>
          )}

          {/* ===================================================
              KHO VẬT PHẨM CHIẾN THUẬT (BOOST ITEMS TRAY)
              =================================================== */}
          <div className="bg-military-surface/90 border border-military-border rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-military-border pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-vietnam-yellow flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-vietnam-gold" /> Kho Quân Tư Trang Chiến Thuật ({currentPlayer?.inventory.length || 0})
              </span>
              <span className="text-[11px] text-slate-400">
                (Đạt mỗi chuỗi Streak 3, 6, 9... để nhận thêm vật phẩm)
              </span>
            </div>

            {currentPlayer && currentPlayer.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {currentPlayer.inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item)}
                    className="text-left p-3 rounded-xl bg-military-dark border border-military-border hover:border-vietnam-yellow/80 hover:bg-military-card transition-all flex flex-col justify-between group shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-white group-hover:text-vietnam-yellow flex items-center gap-1.5">
                          {item.type === 'SPEED_ORDER' && '⚡'}
                          {item.type === 'TRUONG_SON_PIPE' && '⛽'}
                          {item.type === 'DAVIS_SHIELD' && '🛡️'}
                          {item.type === 'PLEIKU_DECEPTION' && '🎭'}
                          {item.type === 'ROUTE_7_BLOCK' && '🚧'}
                          {item.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                          Sẵn sàng
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                    </div>

                    <span className="text-[10px] text-vietnam-yellow font-bold mt-2 pt-1 border-t border-slate-800 block text-right">
                      Nhấn để kích hoạt ngay →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Túi đồ hiện đang trống. Hãy trả lời đúng liên tiếp 3 câu (Streak 3) để được Chỉ Huy Sở cấp phát vật phẩm!
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHỌN ĐỘI ĐỐI THỦ KHI DÙNG CHẶN ĐƯỜNG SỐ 7 */}
      {targetSelectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-military-surface border border-military-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-military-border pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                Chọn Đội Đối Thủ Để Chặn Đường Số 7
              </h3>
              <button
                onClick={() => setTargetSelectModalItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Chọn cánh quân bạn muốn giăng rào cản làm chậm 50% tốc độ tiến quân trong 8 giây:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {gameState.teams
                .filter((t) => t.id !== currentPlayer?.teamId)
                .map((target) => (
                  <button
                    key={target.id}
                    onClick={() => handleConfirmRouteBlock(target.id)}
                    className="p-3 rounded-xl bg-military-dark border border-military-border hover:border-red-500 text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <span className="font-extrabold text-white text-sm">{target.name}</span>
                      <p className="text-xs text-slate-400">{target.corpsName}</p>
                    </div>
                    <span className="text-xs font-bold text-vietnam-yellow">
                      {target.progress}%
                    </span>
                  </button>
                ))}
            </div>

            <button
              onClick={() => setTargetSelectModalItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
