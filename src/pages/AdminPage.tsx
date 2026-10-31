import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  Bot, 
  Trophy, 
  QrCode, 
  FileText, 
  Download, 
  CheckCircle2, 
  Flame, 
  Lock, 
  LogOut, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Award,
  Radio,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { ADMIN_CONFIG, HISTORICAL_MILESTONES, verifyAdminCredentials } from '../config/adminAuth';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';
import { calculateGameSummaryStats, exportPlayersToCSV } from '../utils/statsCalculator';
import { parseQuestionsMarkdown } from '../utils/markdownParser';
import { GameSummaryStats, TeamState } from '../types/game';
import { TankSvg } from '../assets/svg/TankSvg';
import { PalaceGateSvg } from '../assets/svg/PalaceGateSvg';

export const AdminPage: React.FC = () => {
  // Xác thực đăng nhập Admin
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('than_toc_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState<string>('admin_nhom6');
  const [passwordInput, setPasswordInput] = useState<string>('30041975');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Trạng thái đồng bộ toàn phòng
  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Modal điều khiển
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Quản lý câu hỏi & Firebase URL
  const [rawMarkdownInput, setRawMarkdownInput] = useState<string>('');
  const [firebaseUrlInput, setFirebaseUrlInput] = useState<string>(gameSyncService.getCloudDbUrl());
  const [notice, setNotice] = useState<string | null>(null);

  // Thống kê cuối trận
  const [summaryStats, setSummaryStats] = useState<GameSummaryStats | null>(null);

  // Lắng nghe cập nhật từ gameSyncService
  useEffect(() => {
    const unsubscribe = gameSyncService.subscribe((newState) => {
      setGameState(newState);

      // Tự động kích hoạt bảng vinh danh và pháo hoa khi trận đấu kết thúc
      if (newState.roomState.phase === 'FINISHED' && !showStatsModal) {
        const stats = calculateGameSummaryStats(newState.players, newState.teams, newState.roomState.winnerTeamId || undefined);
        setSummaryStats(stats);
        setShowStatsModal(true);
        triggerFireworks();
      }
    });
    return () => unsubscribe();
  }, [showStatsModal]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(usernameInput, passwordInput)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('than_toc_admin_auth', 'true');
      setLoginError(null);
    } else {
      setLoginError('Tên đăng nhập hoặc Mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('than_toc_admin_auth');
  };

  const triggerFireworks = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#DA251D', '#FFFF00', '#0072CE', '#34D399'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // Ignored
    }
  };

  const handleStartBattle = () => {
    gameSyncService.setGamePhase('BATTLE');
    setNotice('🚀 ĐÃ PHÁT LỆNH TỔNG TIẾN CÔNG! 6 CÁNH QUÂN THẦN TỐC XUẤT KÍCH!');
  };

  const handlePauseBattle = () => {
    gameSyncService.setGamePhase('PAUSED');
    setNotice('⏸️ Đã tạm dừng bước tiến quân trên toàn mặt trận.');
  };

  const handleResetBattle = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới sa bàn để chuẩn bị ván đấu mới?')) {
      gameSyncService.resetGame();
      setShowStatsModal(false);
      setNotice('Đã làm mới sa bàn tác chiến thành công.');
    }
  };

  const handleToggleBots = () => {
    const nextState = !gameState.roomState.isBotActive;
    gameSyncService.setBotActive(nextState);
    setNotice(nextState ? '🤖 Đã điều động 18 chiến sĩ thực binh (Bot) chia đều 6 cánh quân!' : 'Đã tạm dừng diễn tập thực binh.');
  };

  const handleOpenStatsModal = () => {
    const stats = calculateGameSummaryStats(gameState.players, gameState.teams, gameState.roomState.winnerTeamId || undefined);
    setSummaryStats(stats);
    setShowStatsModal(true);
  };

  const handleSaveFirebaseUrl = () => {
    gameSyncService.setCloudDbUrl(firebaseUrlInput);
    setNotice('Đã lưu cấu hình kết nối Cloud Realtime!');
  };

  const handleUploadMarkdownFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseQuestionsMarkdown(content);
      if (parsed.length > 0) {
        gameSyncService.setCustomQuestions(parsed);
        setNotice(`Đã nạp thành công ${parsed.length} câu hỏi mới từ file "${file.name}"!`);
        setShowQuestionModal(false);
      } else {
        alert('File không chứa định dạng câu hỏi hợp lệ theo chuẩn "# Câu X"!');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPastedMarkdown = () => {
    const parsed = parseQuestionsMarkdown(rawMarkdownInput);
    if (parsed.length > 0) {
      gameSyncService.setCustomQuestions(parsed);
      setNotice(`Đã cập nhật ${parsed.length} câu hỏi mới vào chiến trường!`);
      setShowQuestionModal(false);
      setRawMarkdownInput('');
    } else {
      alert('Nội dung dán vào không tìm thấy câu hỏi hợp lệ theo cú pháp "# Câu X"!');
    }
  };

  const playUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/play`
    : 'https://nhatminh-k18hl.github.io/VNR202/#/play';

  const winningTeam = gameState.teams.find((t) => t.progress >= 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#233526] pb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" /> Về Trang Tổng Quan
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const muted = soundService.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-xl bg-[#141f16] border border-[#2b422e] text-slate-300 hover:text-white"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-red-950 border border-red-700 text-amber-300 flex items-center gap-2 shadow-lg">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            {ADMIN_CONFIG.roleName}
          </span>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng Xuất
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        /* ===================================================
           CỔNG ĐĂNG NHẬP CHỈ HUY SỞ
           =================================================== */
        <div className="max-w-md mx-auto bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-red-600/15 border-2 border-red-500/50 text-red-400 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <span className="military-stamp px-3 py-0.5 text-[10px]">
              KHU VỰC BẢO MẬT
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">
              Chỉ Huy Sở Tiền Phương
            </h1>
            <p className="text-xs text-slate-300">
              Khu vực dành riêng cho Ban Quản Trò (Nhóm 6 - VNR202) để điều hành sa bàn tác chiến.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs text-center font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                Tên đăng nhập Chỉ Huy:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-[#0d160e] border border-[#2b422e] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">
                Mật mã tác chiến:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-[#0d160e] border border-[#2b422e] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-950/60"
            >
              Mở Khóa Sở Chỉ Huy
            </button>
          </form>

          <div className="pt-3 border-t border-[#233526] text-xs text-slate-400 space-y-1 bg-[#0d160e] p-3.5 rounded-2xl">
            <p className="font-bold text-slate-300">Thông tin đăng nhập mặc định:</p>
            <p>• Tài khoản: <code className="text-amber-300 font-bold">admin_nhom6</code></p>
            <p>• Mật khẩu: <code className="text-amber-300 font-bold">30041975</code></p>
          </div>
        </div>
      ) : (
        /* ===================================================
           BỘ TỔNG TƯ LỆNH TIỀN PHƯƠNG (ADMIN DASHBOARD)
           =================================================== */
        <div className="space-y-6">
          {/* THANH ĐIỀU KHIỂN TÁC CHIẾN (COMMAND CONTROL BAR) */}
          <div className="bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Nút Bắt đầu / Tạm dừng */}
              {gameState.roomState.phase === 'BATTLE' ? (
                <button
                  onClick={handlePauseBattle}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                >
                  <Pause className="w-4 h-4" /> Tạm Dừng
                </button>
              ) : (
                <button
                  onClick={handleStartBattle}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-white" /> Phát Lệnh Tấn Công
                </button>
              )}

              {/* Nút Diễn tập Thực binh (18 Bot) */}
              <button
                onClick={handleToggleBots}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
                  gameState.roomState.isBotActive
                    ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-lg shadow-purple-950/60'
                    : 'bg-[#0d160e] border-[#233526] text-slate-300 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-purple-400" />
                {gameState.roomState.isBotActive ? 'Dừng 18 Bot Giả Lập' : 'Gọi 18 Bot Diễn Tập'}
              </button>

              {/* Nút Kết thúc & Vinh danh */}
              <button
                onClick={handleOpenStatsModal}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <Trophy className="w-4 h-4" /> Tổng Kết Chiến Công
              </button>

              {/* Nút Làm mới ván */}
              <button
                onClick={handleResetBattle}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Làm Mới Sa Bàn
              </button>
            </div>

            {/* Tiện ích Quản trò: Chiếu QR & Quản lý bộ đề */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0d160e] border border-[#233526] text-amber-300 hover:border-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Nạp Bộ Câu Hỏi (.md)
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950/60"
              >
                <QrCode className="w-4 h-4" /> Chiếu Mã QR Điểm Danh
              </button>
            </div>
          </div>

          {/* Banner Thông Báo Chỉ Huy */}
          {notice && (
            <div className="p-3.5 rounded-2xl bg-[#0d160e] border border-[#2b422e] text-xs text-amber-200 flex items-center justify-between shadow">
              <span className="flex items-center gap-2.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {notice}
              </span>
              <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>
          )}

          {/* ===================================================
              SA BÀN ĐƯỜNG ĐUA ĐỊA HÌNH 6 LÀN TIẾN QUÂN
              =================================================== */}
          <div className="bg-[#141f16]/95 border-2 border-[#2b422e] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#233526] pb-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <span className="text-red-500">★</span> Sa Bàn Tác Chiến Thần Tốc • 5 Cánh Quân Hợp Điểm
                </h2>
                <p className="text-xs text-slate-400">
                  Mô phỏng 5 cánh quân lịch sử cùng mũi đột kích nội đô tiến vào giải phóng Sài Gòn
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-black">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  Mặt trận: <strong className={gameState.roomState.phase === 'BATTLE' ? 'text-emerald-400' : 'text-amber-400'}>{gameState.roomState.phase}</strong>
                </span>
                <span className="text-slate-300">
                  Quân số: <strong className="text-amber-300">{gameState.players.length} Chiến Sĩ</strong>
                </span>
              </div>
            </div>

            {/* Các Cột Mốc Địa Hình Lịch Sử Trên Đường Đua (0% -> 100%) */}
            <div className="relative w-full h-8 flex items-center justify-between px-3 text-[11px] font-black text-slate-400 border-b border-[#233526]">
              {HISTORICAL_MILESTONES.map((m) => (
                <div key={m.percentage} className="flex flex-col items-center">
                  <span className="text-amber-300">{m.percentage}%</span>
                  <span className="text-[10px] text-slate-300 whitespace-nowrap">{m.title}</span>
                </div>
              ))}
            </div>

            {/* 6 LÀN TIẾN QUÂN CỦA 6 CÁNH QUÂN */}
            <div className="space-y-3.5 pt-2">
              {gameState.teams.map((team: TeamState) => {
                const isWinner = team.progress >= 100;
                const hasShield = team.activeEffects.some((e) => e.type === 'DAVIS_SHIELD');
                const isDeception = team.activeEffects.some((e) => e.type === 'PLEIKU_DECEPTION');
                const isSlowed = team.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');

                return (
                  <div
                    key={team.id}
                    className="relative bg-[#0d160e] border border-[#233526] rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden shadow-lg"
                  >
                    {/* Thông tin cánh quân bên trên làn đua */}
                    <div className="flex items-center justify-between text-xs z-10 mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-black px-2.5 py-0.5 rounded-md text-white text-[11px] shadow"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name}
                        </span>
                        <span className="font-extrabold text-slate-200 text-xs">{team.corpsName}</span>
                        <span className="text-[10px] text-amber-300 font-bold">({team.axisName})</span>
                      </div>

                      <div className="flex items-center gap-3.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          {hasShield && <span title="Lá chắn Trại Davis">🛡️</span>}
                          {isDeception && <span title="Nghi binh Pleiku">🎭</span>}
                          {isSlowed && <span title="Chặn đường số 7">🚧</span>}
                        </div>

                        <span className="text-slate-400 font-medium">Quân số: <strong className="text-white">{team.memberCount}</strong></span>
                        <span className="text-slate-400 font-medium">Điểm: <strong className="text-amber-300">{team.totalScore}</strong></span>
                        <span className="font-black text-amber-300 text-sm">{team.progress}%</span>
                      </div>
                    </div>

                    {/* MẶT ĐƯỜNG ĐUA SA BÀN */}
                    <div className="relative w-full h-16 bg-[#070b08] rounded-xl border border-[#1b2b1d] flex items-center overflow-hidden px-2 shadow-inner">
                      {/* Vạch kẻ đường chiến lược */}
                      <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-[#2b422e]" />
                      <div className="absolute left-[25%] top-0 bottom-0 w-px bg-[#1e2e21]" />
                      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[#1e2e21]" />
                      <div className="absolute left-[75%] top-0 bottom-0 w-px bg-[#1e2e21]" />

                      {/* XE TĂNG T-54 HÚC CỔNG DI CHUYỂN DỌC THEO TIẾN ĐỘ (%) */}
                      <div
                        className="absolute transition-all duration-700 ease-out z-20"
                        style={{
                          left: `calc(${Math.min(92, Math.max(0, team.progress))}% - 30px)`,
                        }}
                      >
                        <TankSvg
                          color={team.color}
                          tankNumber={team.tankNumber}
                          isMoving={gameState.roomState.phase === 'BATTLE'}
                          hasShield={hasShield}
                          hasSpeedBoost={false}
                          isSlowed={isSlowed}
                          isDebuffed={isDeception}
                          className="w-24 h-14"
                        />
                      </div>

                      {/* CỔNG DINH ĐỘC LẬP TẠI VẠCH ĐÍCH (100%) */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                        <PalaceGateSvg
                          isOpen={isWinner}
                          winningTeamName={team.name}
                          className="w-24 h-16"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BẢNG ĐIỆN TÍN CHIẾN TRƯỜNG THỜI GIAN THỰC */}
            <div className="pt-3 border-t border-[#233526]">
              <span className="text-xs font-black uppercase text-amber-300 block mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> Bản Tin Tác Chiến Thời Gian Thực (Live Battle Telegraph)
              </span>

              <div className="h-28 overflow-y-auto space-y-1.5 pr-2 bg-[#070b08] p-3 rounded-2xl border border-[#1e2e21] text-xs">
                {gameState.liveEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        [{new Date(ev.timestamp).toLocaleTimeString()}]
                      </span>
                      <span>{ev.message}</span>
                    </span>
                    <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {ev.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL CHIẾU MÃ QR CHO CẢ LỚP ĐIỂM DANH
          =================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-amber-400/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-[#233526] pb-3">
              <span className="military-stamp px-3 py-0.5 text-[10px]">
                LỆNH ĐỘNG VIÊN
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                Quét Mã QR Tham Gia Chiến Trường
              </h3>
              <p className="text-xs text-slate-300">
                Sinh viên dùng Camera điện thoại quét mã bên dưới để vào màn hình tác chiến:
              </p>
            </div>

            {/* Mã QR Cỡ Lớn */}
            <div className="bg-white p-6 rounded-3xl inline-block mx-auto shadow-2xl border-4 border-amber-400">
              <QRCodeSVG
                value={playUrl}
                size={230}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 block">Đường dẫn trực tiếp:</span>
              <a
                href={playUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-300 hover:underline font-bold inline-flex items-center gap-1.5"
              >
                {playUrl} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Cài đặt Cloud Realtime Database URL */}
            <div className="pt-3 border-t border-[#233526] text-left text-xs space-y-2">
              <label className="block font-bold text-slate-300">
                Đồng bộ Cloud Realtime (Firebase Database URL - Tùy chọn):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://your-firebase-project.firebaseio.com"
                  value={firebaseUrlInput}
                  onChange={(e) => setFirebaseUrlInput(e.target.value)}
                  className="flex-1 bg-[#0d160e] border border-[#2b422e] rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleSaveFirebaseUrl}
                  className="px-3 py-2 rounded-xl bg-[#1b2b1d] hover:bg-[#253a28] text-amber-300 font-bold text-xs border border-[#2b422e]"
                >
                  Lưu URL
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL QUẢN LÝ BỘ CÂU HỎI (.MD)
          =================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-[#2b422e] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#233526] pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2 uppercase">
                <FileText className="w-5 h-5 text-amber-400" />
                Cập Nhật Ngân Hàng Câu Hỏi Trắc Nghiệm (.md)
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-2">
              <span className="text-xs font-black uppercase text-amber-300 block">
                Cách 1: Tải file .md từ máy tính
              </span>
              <input
                type="file"
                accept=".md,.txt"
                onChange={handleUploadMarkdownFile}
                className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-amber-300 block">
                Cách 2: Dán trực tiếp nội dung Markdown
              </span>
              <textarea
                rows={8}
                value={rawMarkdownInput}
                onChange={(e) => setRawMarkdownInput(e.target.value)}
                placeholder={`# Câu 1: Hội nghị Ban Chấp hành Trung ương Đảng lần thứ 21 (7/1973)...\n- [ ] A. Đấu tranh hòa bình\n- [x] B. Con đường bạo lực cách mạng\n- [ ] C. Rút toàn bộ quân\n- [ ] D. Đơn phương ngừng bắn\n> Giải thích: Lời giải chi tiết...`}
                className="w-full bg-[#0d160e] border border-[#2b422e] rounded-2xl p-3.5 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleApplyPastedMarkdown}
                disabled={!rawMarkdownInput.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg"
              >
                Nạp Danh Sách Câu Hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          BẢNG VÀNG VINH DANH CHIẾN CÔNG ĐẠI THẮNG 1975
          =================================================== */}
      {showStatsModal && summaryStats && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-amber-400 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#233526] pb-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-7 h-7 text-amber-400" />
                <div>
                  <span className="military-stamp px-3 py-0.5 text-[9px]">
                    BẢNG VÀNG LẬP CÔNG
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
                    Đại Thắng Mùa Xuân 1975
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Đóng
              </button>
            </div>

            {/* 1. CÁNH QUÂN VÔ ĐỊCH & MVP TRẬN ĐẤU */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950 via-amber-950/60 to-[#121c14] border-2 border-amber-400 space-y-3.5 relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-300 bg-red-900/80 px-3 py-1 rounded-full border border-red-700">
                  🏆 Cánh Quân Cắm Cờ Dinh Độc Lập Đầu Tiên
                </span>
                <span className="text-xs font-black text-emerald-400">
                  Tiến độ: {summaryStats.winningTeam?.progress}%
                </span>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black text-white">
                {summaryStats.winningTeam?.name} - {summaryStats.winningTeam?.corpsName}
              </h4>
              <p className="text-xs text-amber-200">
                {summaryStats.winningTeam?.axisName} • Xe tăng {summaryStats.winningTeam?.tankNumber} • Tổng điểm: <strong>{summaryStats.winningTeam?.totalScore}đ</strong>
              </p>

              {summaryStats.winningTeamMvp && (
                <div className="p-4 rounded-2xl bg-[#0d160e]/90 border border-amber-400/50 flex items-center justify-between text-xs mt-3 shadow-lg">
                  <div>
                    <span className="font-black text-amber-300 block text-[11px] uppercase">
                      🎖️ MVP TRẬN ĐẤU (Chiến sĩ xuất sắc nhất đội Vô Địch):
                    </span>
                    <span className="text-base font-black text-white">{summaryStats.winningTeamMvp.name}</span>
                    <span className="text-slate-400 block text-[11px]">MSSV: {summaryStats.winningTeamMvp.studentCode || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-300">{summaryStats.winningTeamMvp.score} Điểm</span>
                    <span className="text-slate-400 block text-[11px]">Kỷ lục Streak: <strong>{summaryStats.winningTeamMvp.maxStreak}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. BẢNG XẾP HẠNG 6 ĐỘI (TEAM PODIUM) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                1. Bảng Xếp Hạng 6 Cánh Quân (Team Podium):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {summaryStats.teamRankings.map((team, idx) => (
                  <div
                    key={team.id}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between ${
                      idx === 0 
                        ? 'bg-amber-950/40 border-amber-400 shadow-md' 
                        : 'bg-[#0d160e] border-[#233526]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white">#{idx + 1} {team.name}</span>
                      <span className="text-amber-300 font-black">{team.progress}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-1">{team.corpsName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-1.5 border-t border-[#1e2e21]">
                      <span>Điểm: <strong className="text-white">{team.totalScore}</strong></span>
                      <span>Quân số: <strong className="text-white">{team.memberCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. CHIẾN SĨ GÁNH TEAM TỪNG ĐỘI (SVP - DÀNH CHO THẦY CÔ CỘNG ĐIỂM) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                2. Chiến Sĩ Kiên Cường Nhất Của Từng Đội Còn Lại (SVP - Trao Điểm Khuyến Khích):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {summaryStats.losingTeamsMvps.map((info) => (
                  <div key={info.teamId} className="p-3.5 rounded-2xl bg-[#0d160e] border border-[#233526] flex items-center justify-between shadow">
                    <div>
                      <span className="font-black text-white text-xs block">{info.teamName}</span>
                      <span className="text-[11px] text-slate-400">{info.corpsName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-300 text-xs block">
                        {info.mvp ? info.mvp.name : 'Chưa có dữ liệu'}
                      </span>
                      {info.mvp && (
                        <span className="text-[11px] text-slate-400">
                          {info.mvp.score}đ • Streak: {info.mvp.maxStreak}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. TOP 5 CHUỖI ĐÚNG & TOP 10 ĐIỂM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> Top 5 Chuỗi Đúng Liên Tiếp:
                </h4>
                <div className="space-y-1.5">
                  {summaryStats.topStreakPlayers.map((p, idx) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-[#0d160e] border border-[#233526] flex items-center justify-between">
                      <span><strong className="text-amber-300 mr-2">#{idx + 1}</strong> {p.name}</span>
                      <span className="font-black text-orange-400">{p.maxStreak} câu đúng</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" /> Top Điểm Cá Nhân Toàn Mặt Trận:
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {summaryStats.topScorePlayers.map((p, idx) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-[#0d160e] border border-[#233526] flex items-center justify-between">
                      <span><strong className="text-amber-300 mr-2">#{idx + 1}</strong> {p.name}</span>
                      <span className="font-black text-amber-300">{p.score}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nút Xuất Báo Cáo CSV & Đóng */}
            <div className="pt-4 border-t border-[#233526] flex items-center justify-between gap-3">
              <button
                onClick={() => exportPlayersToCSV(gameState.players, gameState.teams)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" /> Xuất Báo Cáo Điểm Danh & Kết Quả (.CSV)
              </button>

              <button
                onClick={() => setShowStatsModal(false)}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase"
              >
                Đóng Bảng Vinh Danh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
