import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  Sparkles,
  Package,
  Layers,
  X,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { ADMIN_CONFIG, ALL_POWER_UPS, HISTORICAL_MILESTONES, verifyAdminCredentials } from '../config/adminAuth';
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

  // Modal điều khiển (Khắc phục triệt để lỗi không đóng được modal)
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showPowerUpsModal, setShowPowerUpsModal] = useState<boolean>(false);

  // Cờ đánh dấu người dùng đã chủ động đóng bảng thống kê
  const hasUserDismissedStatsModalRef = useRef<boolean>(false);
  const lastFinishedAtRef = useRef<number | null>(null);

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

      // Tự động kích hoạt bảng vinh danh và pháo hoa CHỈ MỘT LẦN duy nhất khi trận đấu kết thúc
      if (newState.roomState.phase === 'FINISHED') {
        const finishedAt = newState.roomState.finishedAt || Date.now();
        if (lastFinishedAtRef.current !== finishedAt) {
          lastFinishedAtRef.current = finishedAt;
          hasUserDismissedStatsModalRef.current = false;

          const stats = calculateGameSummaryStats(
            newState.players,
            newState.teams,
            newState.roomState.winnerTeamId || undefined,
            newState.discoveredEasterEggs
          );
          setSummaryStats(stats);
          setShowStatsModal(true);
          triggerFireworks();
        }
      } else {
        lastFinishedAtRef.current = null;
        hasUserDismissedStatsModalRef.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

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
    } catch {
      // Ignored
    }
  };

  const handleStartBattle = () => {
    gameSyncService.setPhase('BATTLE');
    setNotice('Đã phát lệnh TỔNG TIẾN CÔNG! Thời gian 5 phút bắt đầu đếm ngược.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handlePauseBattle = () => {
    gameSyncService.setPhase('PAUSED');
    setNotice('Đã tạm dừng chiến dịch.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleResetBattle = () => {
    if (window.confirm('Bạn có chắc chắn muốn cài đặt lại toàn bộ sa bàn và kết quả thi đấu?')) {
      gameSyncService.resetGame();
      setShowStatsModal(false);
      hasUserDismissedStatsModalRef.current = false;
      setNotice('Đã cài đặt lại toàn bộ sa bàn và xóa các Easter Eggs ván trước.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleManualTriggerEnemyAttack = () => {
    gameSyncService.triggerHistoricalEnemyAttack();
    setNotice('Đã phát lệnh phản kích của đối phương!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleManualDropSupply = () => {
    gameSyncService.spawnSupplyDraftDrop();
    setNotice('Đã thả Hòm Tiếp Viện Dã Chiến xuống sa bàn!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveQuestions = () => {
    if (!rawMarkdownInput.trim()) {
      setNotice('Vui lòng dán nội dung câu hỏi định dạng Markdown!');
      return;
    }
    const parsed = parseQuestionsMarkdown(rawMarkdownInput);
    if (parsed.length === 0) {
      setNotice('Không parse được câu hỏi nào. Vui lòng kiểm tra định dạng Markdown!');
      return;
    }
    gameSyncService.setCustomQuestions(parsed);
    setShowQuestionModal(false);
    setNotice(`Đã cập nhật thành công ${parsed.length} câu hỏi tác chiến!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveFirebaseUrl = () => {
    gameSyncService.setCloudDbUrl(firebaseUrlInput);
    setNotice('Đã cập nhật cấu hình đồng bộ Firebase Cloud URL!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleCloseStatsModal = () => {
    hasUserDismissedStatsModalRef.current = true;
    setShowStatsModal(false);
  };

  const handleOpenStatsModalManually = () => {
    const stats = calculateGameSummaryStats(
      gameState.players,
      gameState.teams,
      gameState.roomState.winnerTeamId || undefined,
      gameState.discoveredEasterEggs
    );
    setSummaryStats(stats);
    setShowStatsModal(true);
  };

  // URL người chơi tham gia
  const playUrl = `${window.location.origin}${window.location.pathname}#/play`;

  // ==========================================
  // MÀN HÌNH ĐĂNG NHẬP ADMIN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-800 dark:text-amber-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black uppercase text-stone-900 dark:text-white">
              Chỉ Huy Sở
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Khu vực điều hành sa bàn tác chiến (Dành riêng cho Ban Quản Trò)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-500 text-red-700 dark:text-red-300 text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Tên đăng nhập Chỉ Huy Sở:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Mật khẩu tác chiến:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-red-700 dark:hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
            >
              Xác Nhận Vào Chỉ Huy Sở
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link to="/" className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white">
              ← Trở về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÀN HÌNH ĐIỀU HÀNH CHỈ HUY SỞ
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast thông báo */}
      {notice && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl border border-stone-700">
          {notice}
        </div>
      )}

      {/* THANH ĐIỀU KHIỂN ĐỈNH TRANG */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223025]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-wide">
                Chỉ Huy Sở Sa Bàn Tác Chiến
              </h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                gameState.roomState.phase === 'BATTLE' 
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse border border-red-500' 
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}>
                {gameState.roomState.phase}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Chiến dịch Hồ Chí Minh 1975 • Ban Điều Hành
            </p>
          </div>
        </div>

        {/* Nút tác vụ nhanh: QR, Đề, Vật phẩm, Bot, Mute, Logout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Thời gian trận đấu 5 phút */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#151e18] border border-stone-200 dark:border-[#223025] font-mono font-black text-xs text-red-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <span>
              {Math.floor(gameState.roomState.timeRemainingSeconds / 60)}:
              {String(gameState.roomState.timeRemainingSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#151e18] border border-stone-200 dark:border-[#223025] text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-400 flex items-center gap-1.5 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" /> Mã QR Chiếu Lớp
          </button>

          <button
            onClick={() => setShowPowerUpsModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#151e18] border border-stone-200 dark:border-[#223025] text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-400 flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" /> Quản Lý Vật Phẩm & Easter Eggs
          </button>

          <button
            onClick={() => setShowQuestionModal(true)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#151e18] border border-stone-200 dark:border-[#223025] text-xs font-bold text-stone-700 dark:text-stone-300 hover:border-amber-400 flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> Bộ Đề Tác Chiến
          </button>

          <button
            onClick={() => gameSyncService.toggleBots()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              gameState.roomState.isBotActive
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-500'
                : 'bg-stone-100 dark:bg-[#151e18] border-stone-200 dark:border-[#223025] text-stone-700 dark:text-stone-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> {gameState.roomState.isBotActive ? 'Tắt 18 Bot' : 'Bật 18 Bot Demo'}
          </button>

          <button
            onClick={handleOpenStatsModalManually}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-black flex items-center gap-1.5 shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5" /> Bảng Vinh Danh
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-[#223025] bg-stone-100 dark:bg-[#151e18] text-stone-600 dark:text-stone-400 hover:text-red-500"
            title="Đăng xuất Chỉ Huy Sở"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KHỐI NÚT ĐIỀU HÀNH CHIẾN TRƯỜNG CHÍNH */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {gameState.roomState.phase !== 'BATTLE' ? (
            <button
              onClick={handleStartBattle}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <Play className="w-3.5 h-3.5" /> Phát Lệnh Tổng Tiến Công
            </button>
          ) : (
            <button
              onClick={handlePauseBattle}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md"
            >
              <Pause className="w-3.5 h-3.5" /> Tạm Dừng Chiến Dịch
            </button>
          )}

          <button
            onClick={handleResetBattle}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Cài Đặt Lại Trận Mới
          </button>

          <button
            onClick={handleManualTriggerEnemyAttack}
            className="px-3.5 py-2 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-1.5 hover:bg-red-200"
            title="Kích hoạt hỏa lực địch phản kích vào đội dẫn đầu"
          >
            <Target className="w-3.5 h-3.5" /> Kích Hoạt Địch Phản Kích
          </button>

          <button
            onClick={handleManualDropSupply}
            className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-200"
            title="Thả hòm tiếp viện dã chiến xuống sa bàn"
          >
            <Package className="w-3.5 h-3.5" /> Thả Dù Tiếp Viện
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
          <span>Chiến sĩ: <strong className="text-stone-900 dark:text-white">{gameState.players.length}</strong></span>
          <span>•</span>
          <span>Sự kiện: <strong className="text-stone-900 dark:text-white">{gameState.liveEvents.length}</strong></span>
        </div>
      </div>

      {/* CẢNH BÁO ĐỊCH PHẢN KÍCH (HIỂN THỊ ĐẦY ĐỦ THÔNG TIN LỊCH SỬ CHÂN THỰC) */}
      {gameState.currentEnemyAttack && gameState.currentEnemyAttack.status === 'WARNING' && (
        <div className="p-4 rounded-2xl bg-red-600 text-white border-2 border-amber-300 shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="space-y-0.5">
            <span className="font-mono text-[11px] font-black uppercase text-amber-200 block">
              [ CẢNH BÁO TÁC CHIẾN • HỎA LỰC ĐỊCH PHẢN KÍCH ]
            </span>
            <h3 className="font-black text-sm sm:text-base">
              {gameState.currentEnemyAttack.eventName}
            </h3>
            <p className="text-xs text-red-100 leading-snug">
              {gameState.currentEnemyAttack.historicalDetail}
            </p>
            <div className="text-xs font-bold pt-1 text-amber-300">
              Mục tiêu ngắm bắn: <strong>{gameState.currentEnemyAttack.targetTeamName}</strong> (Đang dẫn đầu)
            </div>
          </div>

          <div className="text-center font-mono bg-black/40 px-4 py-2 rounded-xl border border-white/40 flex-shrink-0">
            <span className="text-[10px] text-red-200 block">VA CHẠM SAU</span>
            <span className="text-2xl font-black text-amber-300">{gameState.currentEnemyAttack.countdownSeconds}s</span>
          </div>
        </div>
      )}

      {/* ===================================================
          SA BÀN ĐUA 6 LÀN XE TĂNG TIẾN VỀ DINH ĐỘC LẬP
          =================================================== */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-md space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-[#1e2a21]">
          <div>
            <h2 className="text-base font-black uppercase text-stone-900 dark:text-white tracking-wide">
              Sa Bàn Tiến Quân 6 Cánh Quân Lịch Sử
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Đường đua 0% (Hiệp định Paris) → 100% (Cổng Dinh Độc Lập)
            </p>
          </div>

          {/* 5 Mốc lịch sử sa bàn */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold text-stone-400">
            {HISTORICAL_MILESTONES.map((m) => (
              <span key={m.percentage} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {m.percentage}%: {m.title}
              </span>
            ))}
          </div>
        </div>

        {/* 6 LÀN ĐUA */}
        <div className="space-y-4">
          {gameState.teams.map((team) => {
            const isFinished = team.progress >= 100;
            const isTargeted = gameState.currentEnemyAttack?.targetTeamId === team.id && gameState.currentEnemyAttack?.status === 'WARNING';

            return (
              <div
                key={team.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTargeted
                    ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 ring-2 ring-red-500'
                    : 'border-stone-200 dark:border-[#202e23] bg-stone-50/80 dark:bg-[#0e1610]'
                }`}
              >
                {/* Thông tin đội & Chỉ số kíp lái */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <strong className="font-black text-stone-900 dark:text-white">{team.name}</strong>
                    <span className="text-stone-500 dark:text-stone-400">({team.corpsName})</span>
                    {team.hasShield && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500">
                        🛡️ Khiên bật
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 dark:text-stone-400">
                      Kíp xe: <strong className="text-stone-900 dark:text-white">{team.memberCount}</strong> chiến sĩ
                    </span>
                    <span className="font-black text-amber-600 dark:text-amber-400">
                      {team.totalScore}đ
                    </span>
                    <span className="font-mono font-black text-stone-900 dark:text-white text-sm">
                      {team.progress}%
                    </span>
                  </div>
                </div>

                {/* Đường đua sa bàn (Làn xe tăng chạy) */}
                <div className="relative h-20 rounded-xl bg-stone-200/70 dark:bg-[#070b08] border border-stone-300 dark:border-[#1a261c] overflow-hidden flex items-center">
                  {/* Các vạch mốc 25%, 50%, 75% */}
                  <div className="absolute left-[25%] top-0 bottom-0 w-[1px] border-r border-dashed border-stone-400/40 dark:border-stone-700/50" />
                  <div className="absolute left-[50%] top-0 bottom-0 w-[1px] border-r border-dashed border-stone-400/40 dark:border-stone-700/50" />
                  <div className="absolute left-[75%] top-0 bottom-0 w-[1px] border-r border-dashed border-stone-400/40 dark:border-stone-700/50" />

                  {/* Xe tăng di chuyển trên sa bàn */}
                  <div
                    className="absolute transition-all duration-700 ease-out z-10"
                    style={{
                      left: `clamp(0%, calc(${team.progress}% - 80px), calc(100% - 130px))`,
                    }}
                  >
                    <TankSvg
                      color={team.color}
                      tankNumber={team.tankNumber}
                      isMoving={gameState.roomState.phase === 'BATTLE'}
                      hasShield={team.hasShield}
                      className="w-28 h-16"
                    />
                  </div>

                  {/* Cổng Dinh Độc Lập ở vạch đích 100% */}
                  <div className="absolute right-1 top-0 bottom-0 z-20 flex items-center">
                    <PalaceGateSvg isOpened={isFinished} className="w-16 h-16" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RADAR CHIẾN SỰ THỜI GIAN THỰC & DANH SÁCH CHIẾN SĨ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nhật Ký Sự Kiện Chiến Sự */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-[#1e2a21]">
            <span className="font-black text-xs uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              Bản Tin Radar Chiến Sự
            </span>
            <span className="text-[11px] text-stone-400">Tự động cập nhật</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
            {gameState.liveEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded-xl bg-stone-50 dark:bg-[#0c120e] border border-stone-200 dark:border-[#1e2a21] flex items-center justify-between text-stone-700 dark:text-stone-300"
              >
                <span>{ev.message}</span>
                <span className="text-[10px] text-stone-400 font-mono flex-shrink-0 ml-2">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Easter Eggs Xuất Hiện Trong Trận & Cấu Hình Cloud */}
        <div className="space-y-4">
          {/* Easter Eggs Trong Trận */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
            <span className="font-black text-xs uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Easter Eggs Đã Phát Hiện Trong Trận ({gameState.discoveredEasterEggs.length})
            </span>

            {gameState.discoveredEasterEggs.length > 0 ? (
              <div className="space-y-2">
                {gameState.discoveredEasterEggs.map((egg) => (
                  <div
                    key={egg.id}
                    className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs flex items-center gap-2.5"
                  >
                    <span className="text-xl">{egg.icon}</span>
                    <div>
                      <strong className="text-amber-900 dark:text-amber-200 block font-bold">{egg.name}</strong>
                      <span className="text-stone-600 dark:text-stone-400 text-[11px]">{egg.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic py-2">
                Chưa có Easter Egg nào được kíp lái khám phá trong ván này. Hãy bảo đảm các thành viên cùng trả lời đúng để roll ra bảo vật hiếm!
              </p>
            )}
          </div>

          {/* Cấu Hình Đồng Bộ Cloud URL */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
            <span className="font-black text-xs uppercase text-stone-900 dark:text-white block">
              Cấu Hình Đồng Bộ Cloud (Firebase Realtime DB)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={firebaseUrlInput}
                onChange={(e) => setFirebaseUrlInput(e.target.value)}
                placeholder="https://<project-id>.firebaseio.com"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-xs font-mono"
              />
              <button
                onClick={handleSaveFirebaseUrl}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Lưu URL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          MODAL 1: MÃ QR CHIẾU LÊN MÀN HÌNH CHO CẢ LỚP
          =================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-sm w-full p-6 space-y-5 text-center shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-stone-900 dark:text-white">
                Mã QR Quét Tham Gia
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sinh viên mở camera điện thoại quét để vào thẳng chiến trường
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner border border-stone-200">
              <QRCodeSVG value={playUrl} size={200} level="M" />
            </div>

            <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-[#0c120e] text-stone-700 dark:text-stone-300 text-xs font-mono break-all select-all">
              {playUrl}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs"
            >
              Đóng Cửa Sổ QR
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 2: QUẢN LÝ TẤT CẢ VẬT PHẨM & EASTER EGGS
          =================================================== */}
      {showPowerUpsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPowerUpsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-500">Quản Trị Chiến Lược</span>
              <h3 className="text-lg font-black uppercase text-stone-900 dark:text-white">
                Danh Mục Toàn Bộ Vật Phẩm & Easter Eggs
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Xem toàn bộ kho power-ups dã chiến, tỉ lệ kích hoạt và cơ chế bảo vệ kíp xe
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {ALL_POWER_UPS.map((pu) => (
                <div
                  key={pu.type}
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    pu.isEasterEgg
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                      : 'bg-stone-50 dark:bg-[#0e1610] border-stone-200 dark:border-[#223025]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-lg">{pu.icon}</span>
                      {pu.name}
                    </span>
                    {pu.isEasterEgg && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                        EASTER EGG
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                    {pu.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPowerUpsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs"
              >
                Đóng Bảng Quản Lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 3: BỘ ĐỀ TÁC CHIẾN (DÁN ĐỀ TRỰC TIẾP)
          =================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-stone-900 dark:text-white">
                Cập Nhật Bộ Đề Tác Chiến (Markdown)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Dán câu hỏi theo định dạng: `# Câu X`, `- [x] Đáp án đúng`, `> Giải thích:`
              </p>
            </div>

            <textarea
              rows={10}
              value={rawMarkdownInput}
              onChange={(e) => setRawMarkdownInput(e.target.value)}
              placeholder="# Câu 1: Hội nghị TW 21 (7/1973) chủ trương...
- [ ] Phương án A
- [x] Phương án B
- [ ] Phương án C
- [ ] Phương án D
> Giải thích: ..."
              className="w-full p-3.5 rounded-2xl border border-stone-300 dark:border-[#2a3c2e] bg-stone-50 dark:bg-[#0c120e] text-xs font-mono focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQuestions}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Lưu & Cập Nhật Toàn Phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 4: BẢNG VINH DANH CUỐI TRẬN (ĐÓNG HẲN ĐƯỢC)
          =================================================== */}
      {showStatsModal && summaryStats && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseStatsModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase text-amber-500">Chiến dịch toàn thắng</span>
              <h2 className="text-2xl font-black uppercase text-stone-900 dark:text-white">
                Bảng Vinh Danh Chiến Sĩ & Kíp Xe
              </h2>
            </div>

            {/* Đội Vô Địch & MVP */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 block uppercase">
                  🏆 Cánh quân cắm cờ đầu tiên tại Dinh Độc Lập:
                </span>
                <h3 className="text-xl font-black text-stone-900 dark:text-white">
                  {summaryStats.winningTeam ? summaryStats.winningTeam.name : 'Đang cập nhật'}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  {summaryStats.winningTeam?.corpsName}
                </p>
              </div>

              {summaryStats.winningTeamMvp && (
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">MVP Cánh Quân Thắng Cuộc</span>
                  <strong className="text-base font-black text-red-600 dark:text-amber-400 block">
                    {summaryStats.winningTeamMvp.name}
                  </strong>
                  <span className="text-xs text-stone-600 dark:text-stone-400">
                    {summaryStats.winningTeamMvp.score}đ • Streak kỷ lục: {summaryStats.winningTeamMvp.maxStreak}
                  </span>
                </div>
              )}
            </div>

            {/* SVP Các Cánh Quân Còn Lại (Cộng Điểm Khuyến Khích) */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Chiến Sĩ Xuất Sắc Nhất Của Từng Đội Còn Lại (SVP - Dành cho Thầy/Cô cộng điểm):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {summaryStats.losingTeamsMvps.map((info) => (
                  <div
                    key={info.teamId}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-[#0e1610] border border-stone-200 dark:border-[#223025] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-stone-900 dark:text-white block">{info.teamName}</span>
                      <span className="text-[11px] text-stone-500">{info.corpsName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600 dark:text-amber-400 block">
                        {info.mvp ? info.mvp.name : 'Chưa có'}
                      </span>
                      {info.mvp && (
                        <span className="text-[11px] text-stone-500">{info.mvp.score}đ</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút Xuất CSV & Đóng Hẳn */}
            <div className="pt-4 border-t border-stone-200 dark:border-[#223025] flex items-center justify-between gap-3">
              <button
                onClick={() => exportPlayersToCSV(gameState.players, gameState.teams)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> Xuất Kết Quả (.CSV)
              </button>

              <button
                onClick={handleCloseStatsModal}
                className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs uppercase hover:bg-stone-800"
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
