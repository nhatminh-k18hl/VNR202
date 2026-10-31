import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Bot, 
  Trophy, 
  QrCode, 
  FileText, 
  Download, 
  Lock, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Award,
  Radio,
  Clock,
  Sparkles,
  Package,
  Layers,
  X,
  Target,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { ADMIN_CONFIG, ALL_POWER_UPS, HISTORICAL_MILESTONES, verifyAdminCredentials } from '../config/adminAuth';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';
import { calculateGameSummaryStats, exportPlayersToCSV } from '../utils/statsCalculator';
import { parseQuestionsMarkdown } from '../utils/markdownParser';
import { GameSummaryStats } from '../types/game';
import { TankSvg } from '../assets/svg/TankSvg';
import { PalaceGateSvg } from '../assets/svg/PalaceGateSvg';

const TERRAIN_CONFIG: Record<string, {
  name: string;
  badge: string;
  subTitle: string;
  trackBg: string;
  patternType: 'highway' | 'dunes' | 'basalt' | 'forest' | 'water' | 'runway';
}> = {
  team_1: {
    name: 'Quân đoàn 1 (Binh đoàn Quyết Thắng)',
    badge: '🛣️ QL1A & Đèo Hải Vân',
    subTitle: 'Đường nhựa Quốc lộ 1A & dốc đèo sỏi đá',
    trackBg: 'bg-gradient-to-r from-slate-200 via-stone-300 to-slate-200 dark:from-slate-900 dark:via-[#1e293b] dark:to-slate-950 border-slate-300 dark:border-slate-800',
    patternType: 'highway',
  },
  team_2: {
    name: 'Quân đoàn 2 (Binh đoàn Hương Giang)',
    badge: '🏖️ Duyên hải Cát trắng & Phan Rang',
    subTitle: 'Cát trắng duyên hải & nắng gió miền Trung',
    trackBg: 'bg-gradient-to-r from-amber-100 via-amber-200/50 to-yellow-100 dark:from-[#3f200c] dark:via-[#5c2e0b]/80 dark:to-[#2e1708] border-amber-300 dark:border-amber-900/60',
    patternType: 'dunes',
  },
  team_3: {
    name: 'Quân đoàn 3 (Binh đoàn Tây Nguyên)',
    badge: '⛰️ Cao nguyên Đất đỏ Bazan Buôn Ma Thuột',
    subTitle: 'Đất đỏ Bazan nứt nẻ & rừng khộp Tây Nguyên',
    trackBg: 'bg-gradient-to-r from-orange-200 via-amber-200/60 to-red-200 dark:from-[#450a0a] dark:via-[#7c2d12]/90 dark:to-[#380e08] border-orange-300 dark:border-red-900/70',
    patternType: 'basalt',
  },
  team_4: {
    name: 'Quân đoàn 4 (Binh đoàn Cửu Long)',
    badge: '🌲 Rừng cao su Long Khánh & Xuân Lộc',
    subTitle: 'Rừng cao su bạt ngàn & Cánh cửa thép Xuân Lộc',
    trackBg: 'bg-gradient-to-r from-emerald-100 via-stone-200 to-green-100 dark:from-[#064e3b]/90 dark:via-[#14532d]/80 dark:to-[#092e1d] border-emerald-300 dark:border-emerald-900/60',
    patternType: 'forest',
  },
  team_5: {
    name: 'Đoàn 232 (Cánh quân Tây Nam)',
    badge: '🌊 Kênh rạch phù sa Vàm Cỏ & Bến Lức',
    subTitle: 'Đồng bằng sông nước Cửu Long & đầm lầy phù sa',
    trackBg: 'bg-gradient-to-r from-teal-100 via-cyan-100 to-sky-100 dark:from-[#042f2e] dark:via-[#115e59]/80 dark:to-[#083344] border-teal-300 dark:border-teal-900/60',
    patternType: 'water',
  },
  team_7: {
    name: 'Nhóm 7 - Cánh quân 6',
    badge: '⚓ Biển đảo Trường Sa & Đường băng Tân Sơn Nhất',
    subTitle: 'Sóng biển đảo & đường băng phi trường Tân Sơn Nhất',
    trackBg: 'bg-gradient-to-r from-blue-100 via-indigo-100 to-sky-100 dark:from-[#0f172a] dark:via-[#1e3a8a]/80 dark:to-[#172554] border-blue-300 dark:border-blue-900/60',
    patternType: 'runway',
  },
};

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('than_toc_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState<string>('admin_nhom6');
  const [passwordInput, setPasswordInput] = useState<string>('30041975');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [gameState, setGameState] = useState<FullGameState>(gameSyncService.getState());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  // Modal điều khiển
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showPowerUpsModal, setShowPowerUpsModal] = useState<boolean>(false);

  const hasUserDismissedStatsModalRef = useRef<boolean>(false);
  const lastFinishedAtRef = useRef<number | null>(null);

  const [rawMarkdownInput, setRawMarkdownInput] = useState<string>('');
  const [firebaseUrlInput, setFirebaseUrlInput] = useState<string>(gameSyncService.getCloudDbUrl());
  const [notice, setNotice] = useState<string | null>(null);

  // Cooldown bấm nút Thả Thính (10s)
  const [airdropCooldownSeconds, setAirdropCooldownSeconds] = useState<number>(0);
  // Cooldown bấm nút Địch Phản Kích (20s)
  const [enemyAttackCooldownSeconds, setEnemyAttackCooldownSeconds] = useState<number>(0);

  // Thống kê cuối trận
  const [summaryStats, setSummaryStats] = useState<GameSummaryStats | null>(null);

  useEffect(() => {
    const unsubscribe = gameSyncService.subscribe((newState) => {
      setGameState(newState);

      // Cập nhật cooldown nếu vừa có đợt phản kích
      const lastAttack = newState.roomState.lastEnemyAttackAt || 0;
      const elapsed = Date.now() - lastAttack;
      if (elapsed < 20000) {
        setEnemyAttackCooldownSeconds(Math.ceil((20000 - elapsed) / 1000));
      }

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

  // Đếm ngược cooldown 10s nút thả thính
  useEffect(() => {
    if (airdropCooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setAirdropCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [airdropCooldownSeconds]);

  // Đếm ngược cooldown 20s nút địch phản kích
  useEffect(() => {
    if (enemyAttackCooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setEnemyAttackCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [enemyAttackCooldownSeconds]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(usernameInput, passwordInput)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('than_toc_admin_auth', 'true');
      setLoginError(null);
    } else {
      setLoginError('Tên đăng nhập hoặc Mật khẩu không đúng!');
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
    setNotice('Đã phát lệnh BẮT ĐẦU! Thời gian 5 phút bắt đầu đếm ngược.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handlePauseBattle = () => {
    gameSyncService.setPhase('PAUSED');
    setNotice('Đã tạm dừng trận đấu.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleResetBattle = () => {
    if (window.confirm('Bạn có chắc chắn muốn cài đặt lại toàn bộ phòng chơi và kết quả?')) {
      gameSyncService.resetGame();
      setShowStatsModal(false);
      hasUserDismissedStatsModalRef.current = false;
      setNotice('Đã cài đặt lại ván mới.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleManualTriggerEnemyAttack = () => {
    if (enemyAttackCooldownSeconds > 0) {
      setNotice(`Vui lòng chờ thêm ${enemyAttackCooldownSeconds}s nữa trước khi phát động địch phản kích!`);
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    const res = gameSyncService.manualTriggerHistoricalEnemyAttack();
    if (res.success) {
      setEnemyAttackCooldownSeconds(20);
      setNotice(res.message);
    } else {
      if (res.remainingSeconds) {
        setEnemyAttackCooldownSeconds(res.remainingSeconds);
      }
      setNotice(res.message);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  // Admin bấm Thả Thính với cooldown 10s
  const handleManualDropSupply = () => {
    if (airdropCooldownSeconds > 0) {
      setNotice(`Vui lòng chờ thêm ${airdropCooldownSeconds}s nữa trước khi thả thính tiếp!`);
      setTimeout(() => setNotice(null), 2500);
      return;
    }

    const res = gameSyncService.manualDropSupplyDraft();
    if (res.success) {
      setAirdropCooldownSeconds(10);
      setNotice(res.message);
    } else {
      setNotice(res.message);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveQuestions = () => {
    if (!rawMarkdownInput.trim()) {
      setNotice('Vui lòng dán nội dung câu hỏi định dạng Markdown!');
      return;
    }
    const parsed = parseQuestionsMarkdown(rawMarkdownInput);
    if (parsed.length === 0) {
      setNotice('Không parse được câu hỏi nào. Vui lòng kiểm tra lại định dạng!');
      return;
    }
    gameSyncService.setCustomQuestions(parsed);
    setShowQuestionModal(false);
    setNotice(`Đã cập nhật thành công ${parsed.length} câu hỏi mới!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveFirebaseUrl = () => {
    gameSyncService.setCloudDbUrl(firebaseUrlInput);
    setNotice('Đã cập nhật cấu hình Firebase Cloud URL!');
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

  const playUrl = `${window.location.origin}${window.location.pathname}#/play`;

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
                Tên đăng nhập:
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
                Mật khẩu:
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
              Vào Quản Trò
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {notice && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl border border-stone-700">
          {notice}
        </div>
      )}

      {/* HEADER QUẢN TRÒ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-[#223025]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-wide">
                Màn Hình Quản Trò
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
              Chiến dịch 1975 • Bảng Điều Hành Máy Chiếu
            </p>
          </div>
        </div>

        {/* CÁC NÚT TÁC VỤ */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Đồng hồ 5 phút */}
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
            <FileText className="w-3.5 h-3.5" /> Bộ Câu Hỏi
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
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* THANH ĐIỀU HÀNH TRẬN ĐẤU */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {gameState.roomState.phase !== 'BATTLE' ? (
            <button
              onClick={handleStartBattle}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-red-600/30"
            >
              <Play className="w-3.5 h-3.5" /> Bắt Đầu Trận Đấu
            </button>
          ) : (
            <button
              onClick={handlePauseBattle}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md"
            >
              <Pause className="w-3.5 h-3.5" /> Tạm Dừng
            </button>
          )}

          <button
            onClick={handleResetBattle}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Cài Đặt Lại
          </button>

          <button
            onClick={handleManualTriggerEnemyAttack}
            disabled={enemyAttackCooldownSeconds > 0}
            className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              enemyAttackCooldownSeconds > 0
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-300 dark:border-stone-700 cursor-not-allowed'
                : 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-200'
            }`}
            title="Kích hoạt địch bắn ngẫu nhiên (xác suất theo điểm số, cooldown 20s)"
          >
            <Target className="w-3.5 h-3.5" />
            <span>
              {enemyAttackCooldownSeconds > 0 ? `Địch Phản Kích (${enemyAttackCooldownSeconds}s)` : 'Địch Phản Kích'}
            </span>
          </button>

          {/* NÚT THẢ THÍNH / THẢ TIẾP TẾ VỚI COOLDOWN 10S */}
          <button
            onClick={handleManualDropSupply}
            disabled={airdropCooldownSeconds > 0}
            className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              airdropCooldownSeconds > 0
                ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-300 dark:border-stone-700 cursor-not-allowed'
                : 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
            }`}
            title="Thả hộp tiếp tế xuống sa bàn nếu mãi không ai nhặt (delay 10s)"
          >
            <Package className="w-3.5 h-3.5" />
            <span>
              {airdropCooldownSeconds > 0 ? `Thả Thính (${airdropCooldownSeconds}s)` : 'Thả Tiếp Tế (Thả Thính)'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
          <span>Thành viên: <strong className="text-stone-900 dark:text-white">{gameState.players.length}</strong></span>
          <span>•</span>
          <span>Sự kiện: <strong className="text-stone-900 dark:text-white">{gameState.liveEvents.length}</strong></span>
        </div>
      </div>

      {/* CẢNH BÁO ĐỊCH PHẢN KÍCH (KHÔNG ĐỌC SỐ 3,2,1) */}
      {gameState.currentEnemyAttack && gameState.currentEnemyAttack.status === 'WARNING' && (
        <div className="p-4 rounded-2xl bg-red-600 text-white border-2 border-amber-300 shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="space-y-0.5">
            <span className="font-mono text-[11px] font-black uppercase text-amber-200 block">
              [ CẢNH BÁO: ĐỊCH ĐANG BẮN PHÁO ]
            </span>
            <h3 className="font-black text-sm sm:text-base">
              {gameState.currentEnemyAttack.eventName}
            </h3>
            <p className="text-xs text-red-100 leading-snug">
              {gameState.currentEnemyAttack.historicalDetail}
            </p>
            <div className="text-xs font-bold pt-1 text-amber-300">
              Mục tiêu ngắm bắn: <strong>{gameState.currentEnemyAttack.targetTeamName}</strong> (Còi báo động đang kêu!)
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          SA BÀN ĐUA 6 LÀN XE TĂNG
          =================================================== */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-md space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-[#1e2a21]">
          <div>
            <h2 className="text-base font-black uppercase text-stone-900 dark:text-white tracking-wide">
              Đường Đua Xe Tăng 6 Cánh Quân
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              0% (Hiệp định Paris) → 100% (Cổng Dinh Độc Lập)
            </p>
          </div>

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
            const teamMembers = gameState.players.filter((p) => p.teamId === team.id);
            const terrain = TERRAIN_CONFIG[team.id] || {
              name: team.name,
              badge: '🗺️ Chiến trường 1975',
              subTitle: 'Mặt trận tiến quân thần tốc',
              trackBg: 'bg-stone-200/70 dark:bg-[#070b08] border-stone-300 dark:border-[#1a261c]',
              patternType: 'highway' as const,
            };

            return (
              <div
                key={team.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTargeted
                    ? 'border-red-500 bg-red-50/70 dark:bg-red-950/40 ring-2 ring-red-500'
                    : 'border-stone-200 dark:border-[#202e23] bg-stone-50/80 dark:bg-[#0e1610]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                    />

                    {/* Tên nhóm với Tooltip Hover xem danh sách thành viên đã join */}
                    <div className="relative group cursor-pointer select-none">
                      <div className="flex items-center gap-1.5 border-b border-dotted border-stone-400 dark:border-stone-600 hover:border-red-500 transition-colors">
                        <strong className="font-black text-stone-900 dark:text-white">
                          {team.name}
                        </strong>
                        <span className="text-stone-500 dark:text-stone-400">({team.corpsName})</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5 inline" /> {teamMembers.length}
                        </span>
                      </div>

                      {/* Tooltip nổi lên khi hover chuột */}
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 p-3 rounded-2xl bg-stone-900 text-white dark:bg-[#0c120e] border border-stone-700 dark:border-[#2a3c2e] shadow-2xl text-xs space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-stone-700 dark:border-[#1e2a21] pb-1.5">
                          <span className="font-bold text-amber-400 truncate">{team.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 dark:bg-[#152018] text-stone-300 font-mono">
                            {teamMembers.length} thành viên
                          </span>
                        </div>
                        {teamMembers.length === 0 ? (
                          <p className="text-stone-400 italic text-[11px] py-1">Chưa có thành viên nào tham gia nhóm này.</p>
                        ) : (
                          <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                            {teamMembers.map((m) => (
                              <li key={m.id} className="flex items-center justify-between text-[11px] py-1 border-b border-stone-800/80 dark:border-[#1c291f] last:border-0">
                                <span className="font-medium text-stone-200 truncate">{m.name}</span>
                                <span className="font-mono text-[10px] text-amber-300 ml-2">{m.studentId || 'Chưa có MSSV'}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800 dark:border-[#1e2a21] flex items-center justify-between">
                          <span>Chiến trường:</span>
                          <span className="text-amber-300 font-medium">{terrain.subTitle}</span>
                        </div>
                      </div>
                    </div>

                    {team.hasShield && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500">
                        🛡️ Khiên bật
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 dark:text-stone-400">
                      Thành viên: <strong className="text-stone-900 dark:text-white">{team.memberCount}</strong>
                    </span>
                    <span className="font-black text-amber-600 dark:text-amber-400">
                      {team.totalScore}đ
                    </span>
                    <span className="font-mono font-black text-stone-900 dark:text-white text-sm">
                      {team.progress}%
                    </span>
                  </div>
                </div>

                {/* Đường đua với Địa hình Chiến trường riêng biệt */}
                <div className={`relative h-24 rounded-2xl border overflow-hidden flex items-center transition-all ${terrain.trackBg}`}>
                  {/* Họa tiết địa hình đặc trưng */}
                  {terrain.patternType === 'highway' && (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] border-b-2 border-dashed border-amber-400/90" />
                      <div className="absolute top-2.5 left-0 right-0 h-[1px] border-b border-white/30 dark:border-white/10" />
                      <div className="absolute bottom-2.5 left-0 right-0 h-[1px] border-b border-white/30 dark:border-white/10" />
                    </div>
                  )}

                  {terrain.patternType === 'dunes' && (
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 60">
                        <path d="M0,35 Q100,15 200,35 T400,35" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 dark:text-amber-400" />
                        <path d="M0,48 Q100,30 200,48 T400,48" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-700/60 dark:text-amber-300/50" />
                      </svg>
                    </div>
                  )}

                  {terrain.patternType === 'basalt' && (
                    <div className="absolute inset-0 pointer-events-none opacity-45">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 60">
                        <path d="M0,20 L60,26 L120,18 L180,27 L240,15 L320,24 L400,20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-950/40 dark:text-orange-950/60" />
                        <path d="M0,45 L80,39 L160,48 L220,38 L300,46 L400,42" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-900/40 dark:text-amber-900/50" />
                      </svg>
                      <div className="absolute inset-0 bg-[radial-gradient(#7c2d12_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                    </div>
                  )}

                  {terrain.patternType === 'forest' && (
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                      <div className="absolute inset-0 flex justify-around items-center px-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-[13px] leading-none text-emerald-800/50 dark:text-emerald-400/50 select-none">🌲</span>
                            <div className="w-[1.5px] h-3 bg-stone-500/30" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {terrain.patternType === 'water' && (
                    <div className="absolute inset-0 pointer-events-none opacity-35">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 60">
                        <path d="M0,25 C50,15 100,35 150,25 C200,15 250,35 300,25 C350,15 400,35 450,25" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-600 dark:text-cyan-400" />
                        <path d="M0,45 C50,35 100,55 150,45 C200,35 250,55 300,45 C350,35 400,55 450,45" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-600 dark:text-teal-300" />
                      </svg>
                    </div>
                  )}

                  {terrain.patternType === 'runway' && (
                    <div className="absolute inset-0 pointer-events-none opacity-35">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] border-b-2 border-dashed border-white/70 dark:border-white/50" />
                      <div className="absolute left-3 top-2 bottom-2 w-8 flex gap-1 items-center">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="w-1 h-full bg-white/40 rounded-xs" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Badge định danh địa hình chiến trường */}
                  <div className="absolute left-2.5 top-2 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-stone-900/75 dark:bg-black/75 backdrop-blur-xs text-[10px] font-bold text-stone-200 border border-white/10 shadow-sm flex items-center gap-1">
                      {terrain.badge}
                    </span>
                  </div>

                  {/* Vạch mốc tiến độ lịch sử 25%, 50%, 75% */}
                  <div className="absolute left-[25%] top-0 bottom-0 w-[1px] border-r border-dashed border-stone-400/50 dark:border-stone-600/50 z-0" />
                  <div className="absolute left-[50%] top-0 bottom-0 w-[1px] border-r border-dashed border-stone-400/50 dark:border-stone-600/50 z-0" />
                  <div className="absolute left-[75%] top-0 bottom-0 w-[1px] border-r border-dashed border-stone-400/50 dark:border-stone-600/50 z-0" />

                  {/* Xe tăng tiến quân */}
                  <div
                    className="absolute transition-all duration-700 ease-out z-20"
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

                  {/* Cổng Dinh Độc Lập */}
                  <div className="absolute right-1 top-0 bottom-0 z-20 flex items-center">
                    <PalaceGateSvg isOpened={isFinished} className="w-16 h-16" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RADAR & EASTER EGGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nhật Ký Sự Kiện */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-[#1e2a21]">
            <span className="font-black text-xs uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              Bản Tin Chiến Sự Trực Tiếp
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

        {/* Easter Eggs & Cấu Hình Cloud */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] shadow-sm space-y-3">
            <span className="font-black text-xs uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Easter Eggs Đã Xuất Hiện Trong Ván Này ({gameState.discoveredEasterEggs.length})
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
                Chưa có Easter Egg nào xuất hiện trong ván này.
              </p>
            )}
          </div>

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
          MODAL 1: MÃ QR
          =================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-sm w-full p-6 space-y-5 text-center shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-stone-900 dark:text-white">
                Mã QR Quét Tham Gia
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Mở camera quét để vào phòng chơi
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
              className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs cursor-pointer"
            >
              Đóng Cửa Sổ QR
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 2: QUẢN LÝ VẬT PHẨM & EASTER EGGS
          =================================================== */}
      {showPowerUpsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPowerUpsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-500">Quản Lý Đồ Tiếp Tế</span>
              <h3 className="text-lg font-black uppercase text-stone-900 dark:text-white">
                Danh Sách Vật Phẩm & Easter Eggs
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Xem toàn bộ các món đồ có thể rơi từ Hộp tiếp tế thả dù
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
                className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs cursor-pointer"
              >
                Đóng Bảng Quản Lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 3: BỘ CÂU HỎI
          =================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-stone-900 dark:text-white">
                Cập Nhật Bộ Câu Hỏi (Markdown)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Dán câu hỏi theo định dạng: {'# Câu X'}, {'- [x] Đáp án đúng'}, {'> Giải thích:'}
              </p>
            </div>

            <textarea
              rows={10}
              value={rawMarkdownInput}
              onChange={(e) => setRawMarkdownInput(e.target.value)}
              placeholder="# Câu 1: Nội dung câu hỏi...
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
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQuestions}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Lưu & Cập Nhật Toàn Phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL 4: BẢNG VINH DANH CUỐI TRẬN
          =================================================== */}
      {showStatsModal && summaryStats && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseStatsModal}
              className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase text-amber-500">Chiến dịch hoàn thành</span>
              <h2 className="text-2xl font-black uppercase text-stone-900 dark:text-white">
                Bảng Vinh Danh Các Đội
              </h2>
            </div>

            {/* Đội Vô Địch & MVP */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 block uppercase">
                  🏆 Đội về đích đầu tiên:
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
                  <span className="text-xs text-stone-500 block">Thành viên xuất sắc nhất đội thắng</span>
                  <strong className="text-base font-black text-red-600 dark:text-amber-400 block">
                    {summaryStats.winningTeamMvp.name}
                  </strong>
                  <span className="text-xs text-stone-600 dark:text-stone-400">
                    {summaryStats.winningTeamMvp.score}đ • Streak: {summaryStats.winningTeamMvp.maxStreak}
                  </span>
                </div>
              )}
            </div>

            {/* MVP Các Đội Còn Lại */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-stone-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Thành Viên Xuất Sắc Nhất Từng Đội Còn Lại (Cộng Điểm):
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

            {/* Nút Xuất CSV & Đóng */}
            <div className="pt-4 border-t border-stone-200 dark:border-[#223025] flex items-center justify-between gap-3">
              <button
                onClick={() => exportPlayersToCSV(gameState.players, gameState.teams)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase flex items-center gap-2 shadow cursor-pointer"
              >
                <Download className="w-4 h-4" /> Xuất Kết Quả (.CSV)
              </button>

              <button
                onClick={handleCloseStatsModal}
                className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs uppercase hover:bg-stone-800 cursor-pointer"
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
