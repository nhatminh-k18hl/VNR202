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
  Users, 
  Lock, 
  LogOut, 
  Sparkles, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Award
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

  // Hiệu ứng pháo hoa khi cắm cờ toàn thắng
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

  // Các thao tác điều khiển nhịp độ trận đấu
  const handleStartBattle = () => {
    gameSyncService.setGamePhase('BATTLE');
    setNotice('Đã phát lệnh Tổng tiến công! Chiến trường đang diễn ra sôi nổi.');
  };

  const handlePauseBattle = () => {
    gameSyncService.setGamePhase('PAUSED');
    setNotice('Đã tạm dừng trận đấu.');
  };

  const handleResetBattle = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm mới toàn bộ tiến độ và điểm số để bắt đầu ván mới?')) {
      gameSyncService.resetGame();
      setShowStatsModal(false);
      setNotice('Đã làm mới chiến trường thành công.');
    }
  };

  const handleToggleBots = () => {
    const nextState = !gameState.roomState.isBotActive;
    gameSyncService.setBotActive(nextState);
    setNotice(nextState ? 'Đã bật 18 học viên giả lập chia đều cho 6 đội.' : 'Đã tắt học viên giả lập.');
  };

  const handleOpenStatsModal = () => {
    const stats = calculateGameSummaryStats(gameState.players, gameState.teams, gameState.roomState.winnerTeamId || undefined);
    setSummaryStats(stats);
    setShowStatsModal(true);
  };

  const handleSaveFirebaseUrl = () => {
    gameSyncService.setCloudDbUrl(firebaseUrlInput);
    setNotice('Đã lưu cấu hình Firebase Database URL thành công!');
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
        setNotice(`Đã nạp thành công ${parsed.length} câu hỏi từ file "${file.name}"!`);
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

  // Kiểm tra xem đã có đội nào về đích 100% chưa
  const winningTeam = gameState.teams.find((t) => t.progress >= 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-military-border pb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const muted = soundService.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-lg bg-military-card border border-military-border text-slate-300 hover:text-white"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-vietnam-red/20 text-red-300 border border-vietnam-red/40 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-vietnam-red" />
            {ADMIN_CONFIG.roleName}
          </span>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Thoát
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        /* ===================================================
           FORM ĐĂNG NHẬP ADMIN CHỈ HUY SỞ
           =================================================== */
        <div className="max-w-md mx-auto bg-military-surface border border-military-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-vietnam-red/20 border border-vietnam-red/40 text-red-400 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Chỉ Huy Sở - Đăng Nhập</h1>
            <p className="text-xs text-slate-300">
              Khu vực dành riêng cho Ban Tổ Chức (Nhóm 6 - VNR202) để quản trị sa bàn và điều phối nhịp độ.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Tên đăng nhập:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-military-dark border border-military-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vietnam-red focus:ring-1 focus:ring-vietnam-red"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mật khẩu:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-military-dark border border-military-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vietnam-red focus:ring-1 focus:ring-vietnam-red"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-vietnam-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg"
            >
              Mở Khóa Chỉ Huy Sở
            </button>
          </form>

          <div className="pt-3 border-t border-military-border/80 text-xs text-slate-400 space-y-1 bg-military-dark/50 p-3 rounded-xl">
            <p className="font-bold text-slate-300">Thông tin đăng nhập mặc định:</p>
            <p>• Tài khoản: <code className="text-vietnam-yellow">admin_nhom6</code></p>
            <p>• Mật khẩu: <code className="text-vietnam-yellow">30041975</code></p>
          </div>
        </div>
      ) : (
        /* ===================================================
           GIAO DIỆN QUẢN TRỊ TRUNG TÂM (CHỈ HUY SỞ MẶT TRẬN)
           =================================================== */
        <div className="space-y-6">
          {/* THANH CÔNG CỤ QUẢN TRÒ (CONTROL BAR) */}
          <div className="bg-military-surface border border-military-border rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Nút Bắt đầu / Tạm dừng */}
              {gameState.roomState.phase === 'BATTLE' ? (
                <button
                  onClick={handlePauseBattle}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Pause className="w-4 h-4" /> Tạm Dừng
                </button>
              ) : (
                <button
                  onClick={handleStartBattle}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Play className="w-4 h-4 fill-white" /> Bắt Đầu Chiến Dịch
                </button>
              )}

              {/* Nút Bật/Tắt Bot Giả Lập 18 Học Viên */}
              <button
                onClick={handleToggleBots}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  gameState.roomState.isBotActive
                    ? 'bg-purple-950/70 border-purple-500 text-purple-200'
                    : 'bg-military-card border-military-border text-slate-300 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-purple-400" />
                {gameState.roomState.isBotActive ? 'Tắt Bot Giả Lập' : 'Gọi 18 Bot Chạy Thử'}
              </button>

              {/* Nút Kết thúc & Xem Thống kê */}
              <button
                onClick={handleOpenStatsModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Trophy className="w-4 h-4" /> Kết Thúc & Xem Thống Kê
              </button>

              {/* Nút Làm mới ván đấu */}
              <button
                onClick={handleResetBattle}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Ván Mới
              </button>
            </div>

            {/* Các tiện ích: Mã QR & Đổi câu hỏi */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestionModal(true)}
                className="px-3 py-2 rounded-xl bg-military-card border border-military-border text-vietnam-yellow hover:border-vietnam-yellow text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Đổi Bộ Câu Hỏi (.md)
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-vietnam-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <QrCode className="w-4 h-4" /> Chiếu Mã QR
              </button>
            </div>
          </div>

          {/* Banner Thông Báo */}
          {notice && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {notice}
              </span>
              <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>
          )}

          {/* ===================================================
              SA BÀN ĐƯỜNG ĐUA 6 LÀN XE TĂNG (MAIN RACE TRACK)
              =================================================== */}
          <div className="bg-military-surface border border-military-border rounded-2xl p-5 space-y-4 shadow-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-military-border pb-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  <span className="text-vietnam-red">★</span> Sa Bàn Tiến Quân Thần Tốc - Mặt Trận Sài Gòn
                </h2>
                <p className="text-xs text-slate-400">
                  Mô phỏng 6 Cánh quân thi đua cắm cờ tại Dinh Độc Lập trưa ngày 30/4/1975
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                <span>Trạng thái: <strong className={gameState.roomState.phase === 'BATTLE' ? 'text-emerald-400' : 'text-amber-400'}>{gameState.roomState.phase}</strong></span>
                <span>Tổng chiến sĩ: <strong className="text-vietnam-yellow">{gameState.players.length}</strong></span>
              </div>
            </div>

            {/* Cột Mốc Lịch Sử Phía Trên Sa Bàn (0% -> 100%) */}
            <div className="relative w-full h-8 flex items-center justify-between px-3 text-[11px] font-extrabold text-slate-400 border-b border-slate-800">
              {HISTORICAL_MILESTONES.map((m) => (
                <div key={m.percentage} className="flex flex-col items-center">
                  <span className="text-vietnam-yellow">{m.percentage}%</span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{m.title}</span>
                </div>
              ))}
            </div>

            {/* 6 LÀN ĐƯỜNG ĐUA CHO 6 CÁNH QUÂN */}
            <div className="space-y-3.5 pt-2">
              {gameState.teams.map((team: TeamState) => {
                const isWinner = team.progress >= 100;
                const hasShield = team.activeEffects.some((e) => e.type === 'DAVIS_SHIELD');
                const isDeception = team.activeEffects.some((e) => e.type === 'PLEIKU_DECEPTION');
                const isSlowed = team.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');

                return (
                  <div
                    key={team.id}
                    className="relative bg-military-dark/90 border border-military-border rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow"
                  >
                    {/* Thông tin đội đua bên trái */}
                    <div className="flex items-center justify-between text-xs z-10 mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-black px-2 py-0.5 rounded text-white text-[11px]"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name}
                        </span>
                        <span className="font-bold text-slate-200 text-xs">{team.corpsName}</span>
                        <span className="text-[10px] text-slate-400">({team.axisName})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {/* Các icon hiệu ứng đang tác động */}
                        <div className="flex items-center gap-1">
                          {hasShield && <span title="Lá chắn Trại Davis">🛡️</span>}
                          {isDeception && <span title="Nghi binh Pleiku">🎭</span>}
                          {isSlowed && <span title="Chặn đường số 7">🚧</span>}
                        </div>

                        <span className="text-slate-400">Chiến sĩ: <strong className="text-white">{team.memberCount}</strong></span>
                        <span className="text-slate-400">Điểm: <strong className="text-vietnam-yellow">{team.totalScore}</strong></span>
                        <span className="font-black text-vietnam-yellow text-sm">{team.progress}%</span>
                      </div>
                    </div>

                    {/* LÀN ĐƯỜNG ĐUA NGANG */}
                    <div className="relative w-full h-16 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center overflow-hidden px-2">
                      {/* Vạch kẻ đường đứt đoạn */}
                      <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-slate-700/60" />

                      {/* Vạch kẻ các mốc 25%, 50%, 75% */}
                      <div className="absolute left-[25%] top-0 bottom-0 w-px bg-slate-800" />
                      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-slate-800" />
                      <div className="absolute left-[75%] top-0 bottom-0 w-px bg-slate-800" />

                      {/* CHIẾC XE TĂNG T-54/59 DI CHUYỂN DỌC THEO TIẾN ĐỘ (%) */}
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

            {/* ===================================================
                BẢNG NHẬT KÝ CHIẾN TRƯỜNG (LIVE BATTLE FEED)
                =================================================== */}
            <div className="pt-3 border-t border-military-border">
              <span className="text-xs font-black uppercase text-slate-400 block mb-2 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> Nhật Ký Tác Chiến Thời Gian Thực (Live Battle Feed)
              </span>

              <div className="h-28 overflow-y-auto space-y-1.5 pr-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
                {gameState.liveEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                      <span>{ev.message}</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-500">{ev.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL MÃ QR & CÀI ĐẶT PHÒNG CLOUD
          =================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-military-surface border border-military-border rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-military-border pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-vietnam-yellow" />
                Mã QR Điểm Danh & Tham Gia Chiến Trường
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Mã QR Cỡ Lớn Để Chiếu Bảng */}
            <div className="flex flex-col items-center justify-center space-y-3 bg-white p-6 rounded-2xl shadow-inner mx-auto max-w-xs">
              <QRCodeSVG
                value={playUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
              <span className="text-slate-800 text-xs font-bold text-center">
                Quét mã để vào màn hình Chiến sĩ
              </span>
            </div>

            <div className="space-y-1.5 text-center">
              <p className="text-xs text-slate-300">Hoặc mở trực tiếp đường dẫn:</p>
              <a
                href={playUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-vietnam-yellow underline hover:text-yellow-300 font-bold inline-flex items-center gap-1"
              >
                {playUrl} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Cài đặt Cloud Firebase URL */}
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <label className="block font-bold text-slate-300">
                Đồng bộ Cloud Realtime (Firebase Database URL - Tùy chọn):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://your-firebase-project.firebaseio.com"
                  value={firebaseUrlInput}
                  onChange={(e) => setFirebaseUrlInput(e.target.value)}
                  className="flex-1 bg-military-dark border border-military-border rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-vietnam-yellow"
                />
                <button
                  onClick={handleSaveFirebaseUrl}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Lưu URL
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL ĐỔI BỘ CÂU HỎI (.MD)
          =================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-military-surface border border-military-border rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-military-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-vietnam-yellow" />
                Cập Nhật Ngân Hàng Câu Hỏi Trắc Nghiệm (.md)
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Chọn file từ máy */}
            <div className="p-4 rounded-xl bg-military-dark border border-military-border space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Cách 1: Tải file .md từ máy tính:
              </span>
              <input
                type="file"
                accept=".md,.txt"
                onChange={handleUploadMarkdownFile}
                className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-vietnam-red file:text-white hover:file:bg-red-700 cursor-pointer"
              />
            </div>

            {/* Dán nội dung Markdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Cách 2: Dán trực tiếp nội dung Markdown vào đây:
              </span>
              <textarea
                rows={8}
                value={rawMarkdownInput}
                onChange={(e) => setRawMarkdownInput(e.target.value)}
                placeholder={`# Câu 1: Hội nghị Ban Chấp hành Trung ương Đảng lần thứ 21 (7/1973)...\n- [ ] A. Đấu tranh hòa bình\n- [x] B. Con đường bạo lực cách mạng\n- [ ] C. Rút quân\n- [ ] D. Đơn phương ngừng bắn\n> Giải thích: Lời giải chi tiết...`}
                className="w-full bg-military-dark border border-military-border rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-vietnam-yellow"
              />
              <button
                onClick={handleApplyPastedMarkdown}
                disabled={!rawMarkdownInput.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-vietnam-red to-red-700 hover:from-red-600 hover:to-red-800 disabled:opacity-50 text-white font-bold text-xs uppercase"
              >
                Phân Tích & Nạp Câu Hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          BẢNG VINH DANH & THỐNG KÊ CHI TIẾT CUỐI TRẬN (ANALYTICS MODAL)
          =================================================== */}
      {showStatsModal && summaryStats && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-military-surface border border-military-border rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-military-border pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-vietnam-gold" />
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  Bảng Vàng Vinh Danh Toàn Thắng 1975
                </h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Đóng
              </button>
            </div>

            {/* 1. ĐỘI VÔ ĐỊCH & MVP ĐỘI THẮNG */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-vietnam-red/40 via-amber-950/40 to-slate-900 border-2 border-vietnam-yellow/60 space-y-3 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-vietnam-yellow bg-vietnam-red/40 px-3 py-1 rounded-full border border-vietnam-red/60">
                  🏆 Cánh Quân Cắm Cờ Dinh Độc Lập Đầu Tiên
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Tiến độ: {summaryStats.winningTeam?.progress}%
                </span>
              </div>

              <h4 className="text-2xl font-black text-white">
                {summaryStats.winningTeam?.name} - {summaryStats.winningTeam?.corpsName}
              </h4>
              <p className="text-xs text-amber-200">
                {summaryStats.winningTeam?.axisName} • Tổng điểm toàn đội: <strong>{summaryStats.winningTeam?.totalScore}đ</strong>
              </p>

              {summaryStats.winningTeamMvp && (
                <div className="p-3.5 rounded-xl bg-military-dark/90 border border-amber-500/50 flex items-center justify-between text-xs mt-2">
                  <div>
                    <span className="font-black text-vietnam-gold block text-[11px] uppercase">
                      🎖️ MVP TRẬN ĐẤU (Chiến sĩ xuất sắc nhất đội Vô Địch):
                    </span>
                    <span className="text-base font-black text-white">{summaryStats.winningTeamMvp.name}</span>
                    <span className="text-slate-400 block text-[11px]">MSSV: {summaryStats.winningTeamMvp.studentCode || 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-vietnam-yellow">{summaryStats.winningTeamMvp.score} Điểm</span>
                    <span className="text-slate-400 block text-[11px]">Kỷ lục đúng liên tiếp: <strong>{summaryStats.winningTeamMvp.maxStreak}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. BẢNG XẾP HẠNG 6 ĐỘI (TEAM PODIUM) */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                1. Bảng Xếp Hạng Đua Điểm 6 Cánh Quân (Team Podium):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {summaryStats.teamRankings.map((team, idx) => (
                  <div
                    key={team.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between ${
                      idx === 0 
                        ? 'bg-amber-950/40 border-amber-500/60' 
                        : 'bg-military-dark border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">#{idx + 1} {team.name}</span>
                      <span className="text-vietnam-yellow font-bold">{team.progress}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-1">{team.corpsName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
                      <span>Điểm: <strong className="text-white">{team.totalScore}</strong></span>
                      <span>Chiến sĩ: <strong className="text-white">{team.memberCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. MVP TỪNG ĐỘI THUA (SVP - CHIẾN SĨ GÁNH TEAM ĐỂ THẦY CÔ CỘNG ĐIỂM) */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-vietnam-gold" />
                2. Chiến Sĩ Kiên Cường Nhất Của Từng Đội Còn Lại (SVP - Trao Điểm Khuyến Khích):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {summaryStats.losingTeamsMvps.map((info) => (
                  <div key={info.teamId} className="p-3 rounded-xl bg-military-dark border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-white text-xs block">{info.teamName}</span>
                      <span className="text-[11px] text-slate-400">{info.corpsName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-vietnam-yellow text-xs block">
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

            {/* 4. TOP 5 CHUỖI ĐÚNG DÀI NHẤT & TOP 10 ĐIỂM CÁ NHÂN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Top Streak */}
              <div className="space-y-2">
                <h4 className="font-black uppercase text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> Top 5 Chuỗi Đúng Liên Tiếp:
                </h4>
                <div className="space-y-1.5">
                  {summaryStats.topStreakPlayers.map((p, idx) => (
                    <div key={p.id} className="p-2 rounded-lg bg-military-dark border border-slate-800 flex items-center justify-between">
                      <span><strong className="text-vietnam-yellow mr-1.5">#{idx + 1}</strong> {p.name}</span>
                      <span className="font-black text-orange-400">{p.maxStreak} câu đúng</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Điểm */}
              <div className="space-y-2">
                <h4 className="font-black uppercase text-slate-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-vietnam-gold" /> Top Điểm Cá Nhân Cao Nhất:
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {summaryStats.topScorePlayers.map((p, idx) => (
                    <div key={p.id} className="p-2 rounded-lg bg-military-dark border border-slate-800 flex items-center justify-between">
                      <span><strong className="text-vietnam-yellow mr-1.5">#{idx + 1}</strong> {p.name}</span>
                      <span className="font-black text-vietnam-yellow">{p.score}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nút Xuất Báo Cáo CSV & Đóng */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => exportPlayersToCSV(gameState.players, gameState.teams)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> Xuất Báo Cáo Điểm Danh & Kết Quả (.CSV)
              </button>

              <button
                onClick={() => setShowStatsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs"
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
