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
  Compass
} from 'lucide-react';
import { BoostItem, PlayerState, Question, TeamId, TeamState } from '../types/game';
import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
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

  // Kiểm tra hiệu ứng đang tác động lên đội nhà
  const isDeceptionActive = currentTeam?.activeEffects.some((e) => e.type === 'PLEIKU_DECEPTION');
  const isRouteBlockActive = currentTeam?.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');

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

    // Đếm ngược 2.5s để tự động chuyển câu hỏi
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
      {/* Thanh Điều Hướng Đỉnh Trang */}
      <div className="flex items-center justify-between border-b border-[#233526] pb-3">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" /> Quay Lại Trang Chủ
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-[#141f16] border border-[#2b422e] text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <span className="text-[11px] font-black uppercase px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-amber-300 shadow">
            Mặt Trận Sài Gòn • Tháng 4/1975
          </span>
        </div>
      </div>

      {!isJoined ? (
        /* ===================================================
           MÀN HÌNH GIA NHẬP: LỆNH TỔNG ĐỘNG VIÊN XUẤT KÍCH
           =================================================== */
        <div className="bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3 border-b border-[#233526] pb-6">
            <span className="military-stamp px-3 py-1 text-xs">
              LỆNH ĐỘNG VIÊN XUẤT KÍCH
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              Ghi Danh Chiến Sĩ • Chọn Cánh Quân Giải Phóng
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Chọn đúng Nhóm thi đua của bạn trong lớp và nhập thông tin để cùng đồng đội giải phóng miền Nam!
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="space-y-6">
            {/* Lựa chọn 6 Cánh quân */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
                1. Chọn Cánh Quân Bạn Thuộc Về:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {INITIAL_TEAMS_CONFIG.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      type="button"
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#1b2b1d] border-amber-400 shadow-xl shadow-amber-950/50 scale-[1.02]'
                          : 'bg-[#0d160e] border-[#233526] hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white text-base">{team.name}</span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-amber-400" />}
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-1">{team.corpsName}</p>
                      <span 
                        className="inline-block text-[10px] font-black mt-2 px-2 py-0.5 rounded uppercase"
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
                <label className="block text-xs font-black uppercase tracking-wider text-slate-200">
                  Họ và Tên Chiến Sĩ: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Toàn"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-[#0d160e] border border-[#2b422e] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-200">
                  Mã Số Sinh Viên (MSSV):
                </label>
                <input
                  type="text"
                  placeholder="VD: SE186934 (Tùy chọn)"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full bg-[#0d160e] border border-[#2b422e] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2.5"
            >
              <span>★</span> Sẵn Sàng Xuất Kích Cùng {INITIAL_TEAMS_CONFIG.find((t) => t.id === selectedTeamId)?.name}
            </button>
          </form>
        </div>
      ) : (
        /* ===================================================
           MÀN HÌNH TÁC CHIẾN CHIẾN HÀO
           =================================================== */
        <div className="space-y-6">
          {/* Cảnh báo khi bị đối phương tấn công */}
          {isDeceptionActive && (
            <div className="p-4 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs flex items-center gap-3 shadow-xl animate-bounce">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <strong className="text-amber-300 font-black">CẢNH BÁO TÁC CHIẾN:</strong> Đội bạn đang dính kế sách <strong>Nghi binh Pleiku</strong>! Các phương án câu hỏi đang bị rung nhiễu!
              </div>
            </div>
          )}

          {isRouteBlockActive && (
            <div className="p-3.5 rounded-2xl bg-amber-950/90 border border-amber-500 text-amber-200 text-xs flex items-center gap-2.5 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>Đối phương đang lập rào cản <strong>Chặn đường số 7</strong>! Tốc độ tiến quân của đội bạn bị giảm 50%!</span>
            </div>
          )}

          {/* Bảng Chỉ Huy Cá Nhân & Tiến Độ Xe Tăng Đội Nhà */}
          <div className="bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base border-2 shadow-lg"
                  style={{ backgroundColor: `${currentTeam?.color}35`, borderColor: currentTeam?.color }}
                >
                  {currentTeam?.name.replace('Nhóm ', 'N')}
                </div>
                <div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    {currentPlayer?.name}
                    <span className="text-xs font-normal text-slate-400">({currentTeam?.corpsName})</span>
                  </h3>
                  <span className="text-xs text-amber-300 font-bold">
                    {currentTeam?.axisName} • Xe tăng {currentTeam?.tankNumber}
                  </span>
                </div>
              </div>

              {/* Huy hiệu điểm & chuỗi đúng */}
              <div className="flex items-center gap-3 text-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#0d160e] border border-[#233526]">
                  <span className="text-[10px] text-slate-400 uppercase block font-black">Điểm Số</span>
                  <span className="text-lg font-black text-amber-300">{currentPlayer?.score || 0}</span>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-[#0d160e] border border-[#233526]">
                  <span className="text-[10px] text-slate-400 uppercase block font-black flex items-center justify-center gap-1 text-orange-400">
                    <Flame className="w-3 h-3 fill-orange-400" /> Streak
                  </span>
                  <span className="text-lg font-black text-orange-400">{currentPlayer?.currentStreak || 0}</span>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-[#0d160e] border border-[#233526]">
                  <span className="text-[10px] text-slate-400 uppercase block font-black">Kỷ Lục</span>
                  <span className="text-lg font-black text-emerald-400">{currentPlayer?.maxStreak || 0}</span>
                </div>
              </div>
            </div>

            {/* Thanh tiến độ xe tăng */}
            <div className="space-y-1.5 pt-2 border-t border-[#233526]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  🚜 Tiến Độ Tiến Về Dinh Độc Lập ({currentTeam?.name}):
                </span>
                <span className="font-black text-amber-300 text-sm">
                  {currentTeam?.progress || 0}%
                </span>
              </div>

              <div className="relative w-full h-4 bg-[#090f0a] rounded-full overflow-hidden border border-[#233526]">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  style={{ width: `${currentTeam?.progress || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* ===================================================
              KHU VỰC CÂU HỎI TRẮC NGHIỆM
              =================================================== */}
          {currentQ ? (
            <div className="bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              {currentPlayer?.isSpeedBoostActive && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-black animate-pulse">
                  <span>⚡</span> Đang kích hoạt [Mệnh lệnh Thần tốc: x2 Điểm & Sức đẩy ở câu này]!
                </div>
              )}

              <div className="flex items-center justify-between border-b border-[#233526] pb-3 text-xs text-slate-400">
                <span className="font-black uppercase px-3 py-1 rounded-md bg-red-950/90 text-amber-300 border border-red-800">
                  Câu hỏi #{currentQ.id}
                </span>
                <span className="font-bold text-amber-200/80">Chủ đề 6 • Kháng chiến chống Mỹ 1973 - 1975</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ.text}
              </h2>

              {/* 4 Nút Lựa Chọn A, B, C, D (Hiệu ứng rung nếu dính Nghi binh) */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3.5 ${isDeceptionActive ? 'shake-active' : ''}`}>
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = currentQ.correctAnswer === key;

                  let style = 'bg-[#0d160e] border-[#233526] text-slate-200 hover:border-amber-400/80 hover:bg-[#1a281c]';
                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/60';
                    } else if (isSelected) {
                      style = 'bg-red-950/90 border-red-500 text-red-200 font-bold';
                    } else {
                      style = 'opacity-30 bg-[#0a100b] border-slate-900 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={hasAnswered}
                      className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${style}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                        hasAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-[#1b2b1d] text-amber-300 border border-[#2b422e]'
                      }`}>
                        {key}
                      </span>
                      <span className="text-sm leading-snug flex-1 font-medium">{currentQ.options[key]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Hộp Thoại Báo Cáo Chiến Trường & Giải Thích Lịch Sử */}
              {hasAnswered && (
                <div className="space-y-4 pt-2">
                  <div className={`p-4 rounded-2xl border-2 text-sm space-y-2.5 ${
                    selectedAnswer === currentQ.correctAnswer
                      ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200'
                      : 'bg-red-950/70 border-red-600 text-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-black flex items-center gap-2 text-base">
                        {selectedAnswer === currentQ.correctAnswer ? (
                          <>
                            <Check className="w-5 h-5 text-emerald-400" />
                            CHÍNH XÁC! (+{currentPlayer?.isSpeedBoostActive ? '200' : '100'} điểm & xe tăng tiến bước)
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 text-red-400" />
                            CHƯA CHÍNH XÁC! Chuỗi Streak trở về 0.
                          </>
                        )}
                      </span>

                      {explanationCountdown !== null && (
                        <span className="text-xs bg-black/60 px-2.5 py-1 rounded-full border border-slate-700 font-bold text-amber-300">
                          Tự chuyển sau {explanationCountdown}s...
                        </span>
                      )}
                    </div>

                    {currentQ.explanation && (
                      <p className="text-xs text-slate-300 border-t border-slate-700/60 pt-2 leading-relaxed">
                        <strong className="text-amber-300 font-bold">💡 Ý nghĩa lịch sử:</strong> {currentQ.explanation}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-xl bg-[#1b2b1d] hover:bg-[#253a28] text-amber-300 font-bold text-xs uppercase tracking-wider transition-colors border border-amber-400/40"
                  >
                    Chuyển Câu Tiếp Theo Ngay →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-300 bg-[#141f16] border border-[#2b422e] rounded-3xl">
              Đang chờ Chỉ Huy Sở phát lệnh câu hỏi tiếp theo...
            </div>
          )}

          {/* ===================================================
              KHO LỆNH BÀI CHIẾN THUẬT (TACTICAL BOOST ITEMS)
              =================================================== */}
          <div className="bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#233526] pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" /> Kho Lệnh Bài Chiến Thuật ({currentPlayer?.inventory.length || 0})
              </span>
              <span className="text-[11px] text-slate-400">
                (Đạt mỗi Streak 3, 6, 9... để nhận thêm Lệnh bài)
              </span>
            </div>

            {currentPlayer && currentPlayer.inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentPlayer.inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item)}
                    className="text-left p-3.5 rounded-2xl bg-[#0d160e] border border-[#233526] hover:border-amber-400 hover:bg-[#1a281c] transition-all flex flex-col justify-between group shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-white group-hover:text-amber-300 flex items-center gap-1.5">
                          {item.type === 'SPEED_ORDER' && '⚡'}
                          {item.type === 'TRUONG_SON_PIPE' && '⛽'}
                          {item.type === 'DAVIS_SHIELD' && '🛡️'}
                          {item.type === 'PLEIKU_DECEPTION' && '🎭'}
                          {item.type === 'ROUTE_7_BLOCK' && '🚧'}
                          {item.name}
                        </span>
                        <span className="text-[9px] uppercase font-black text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                          SẴN SÀNG
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{item.description}</p>
                    </div>

                    <span className="text-[10px] text-amber-400 font-bold mt-2 pt-1.5 border-t border-[#1e2e21] block text-right">
                      Nhấn để tung chiêu thức →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Túi đồ hiện đang trống. Hãy trả lời đúng liên tiếp 3 câu (Streak 3) để được Chỉ Huy Sở trao tặng Lệnh bài!
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHỌN ĐỘI ĐỐI THỦ ĐỂ CHẶN ĐƯỜNG SỐ 7 */}
      {targetSelectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-red-600 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#233526] pb-3">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Chọn Cánh Quân Để Chặn Đường Số 7
              </h3>
              <button
                onClick={() => setTargetSelectModalItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Chọn cánh quân đối thủ bạn muốn giăng rào cản làm chậm 50% tốc độ tiến quân trong 8 giây:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {gameState.teams
                .filter((t) => t.id !== currentPlayer?.teamId)
                .map((target) => (
                  <button
                    key={target.id}
                    onClick={() => handleConfirmRouteBlock(target.id)}
                    className="p-3.5 rounded-xl bg-[#0d160e] border border-[#233526] hover:border-red-500 text-left flex items-center justify-between transition-all"
                  >
                    <div>
                      <span className="font-black text-white text-sm">{target.name}</span>
                      <p className="text-xs text-slate-400">{target.corpsName}</p>
                    </div>
                    <span className="text-xs font-black text-amber-300">
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
