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
  Compass,
  Clock,
  AlertTriangle,
  HelpCircle,
  Zap,
  ShoppingBag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { ADMIN_CONFIG, HISTORICAL_MILESTONES, verifyAdminCredentials } from '../config/adminAuth';
import { FullGameState, gameSyncService } from '../services/gameSyncService';
import { soundService } from '../services/soundService';
import { calculateGameSummaryStats, exportPlayersToCSV } from '../utils/statsCalculator';
import { parseQuestionsMarkdown } from '../utils/markdownParser';
import { GamePhase, GameSummaryStats, TeamState } from '../types/game';
import { TankSvg } from '../assets/svg/TankSvg';
import { PalaceGateSvg } from '../assets/svg/PalaceGateSvg';

interface AdminPageProps {
  onOpenDraftModal?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenDraftModal }) => {
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

  // Modal điều khiển (ĐÃ FIX LỖI TỰ ĐỘNG POPUP LẠI)
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Quản lý câu hỏi & Firebase URL
  const [rawMarkdownInput, setRawMarkdownInput] = useState<string>('');
  const [firebaseUrlInput, setFirebaseUrlInput] = useState<string>(gameSyncService.getCloudDbUrl());
  const [notice, setNotice] = useState<string | null>(null);

  // Thống kê cuối trận
  const [summaryStats, setSummaryStats] = useState<GameSummaryStats | null>(null);
  const prevPhaseRef = useRef<GamePhase>(gameState.roomState.phase);

  // Lắng nghe cập nhật từ gameSyncService (Chỉ mở modal tự động khi vừa mới chuyển sang FINISHED)
  useEffect(() => {
    const unsubscribe = gameSyncService.subscribe((newState) => {
      setGameState(newState);

      // Chỉ kích hoạt tự động 1 lần duy nhất khi chuyển từ trạng thái khác sang FINISHED
      if (prevPhaseRef.current !== 'FINISHED' && newState.roomState.phase === 'FINISHED') {
        const stats = calculateGameSummaryStats(newState.players, newState.teams, newState.roomState.winnerTeamId || undefined);
        setSummaryStats(stats);
        setShowStatsModal(true);
        triggerFireworks();
      }
      prevPhaseRef.current = newState.roomState.phase;
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

  const handleSaveQuestions = () => {
    if (!rawMarkdownInput.trim()) {
      setNotice('Vui lòng dán nội dung file Markdown trước khi lưu!');
      return;
    }

    try {
      const parsed = parseQuestionsMarkdown(rawMarkdownInput);
      if (parsed.length === 0) {
        setNotice('Không tìm thấy câu hỏi hợp lệ trong nội dung Markdown!');
        return;
      }

      gameSyncService.setCustomQuestions(parsed);
      setNotice(`✅ Đã nạp thành công ${parsed.length} câu hỏi vào ngân hàng tác chiến!`);
      setTimeout(() => {
        setShowQuestionModal(false);
        setNotice(null);
      }, 1500);
    } catch (err: any) {
      setNotice(`❌ Lỗi định dạng: ${err.message || 'Không thể đọc nội dung'}`);
    }
  };

  const handleUpdateFirebaseUrl = () => {
    gameSyncService.setCloudDbUrl(firebaseUrlInput);
    setNotice('✅ Đã cập nhật Firebase Realtime Database URL!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenStatsModalManually = () => {
    const stats = calculateGameSummaryStats(gameState.players, gameState.teams, gameState.roomState.winnerTeamId || undefined);
    setSummaryStats(stats);
    setShowStatsModal(true);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // GIAO DIỆN ĐĂNG NHẬP DÀNH CHO ADMIN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#141f16] border-2 border-red-800/80 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950/80 border border-red-700/80 flex items-center justify-center text-amber-300 shadow-lg shadow-red-950/60">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Chỉ Huy Sở Tác Chiến
            </h1>
            <p className="text-xs text-slate-400">
              Căn cứ Tà Thiết - Lộc Ninh • Bàn Điều Hành Dành Cho Ban Quản Trò
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Tên Đăng Nhập:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin_nhom6"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0c140d] border border-[#2b422e] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Mật Khẩu Mật Lệnh:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="30041975"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0c140d] border border-[#2b422e] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-bold bg-red-950/60 p-2.5 rounded-xl border border-red-800">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950/60 transition-all"
            >
              Xác Thực Mật Lệnh & Vào Chỉ Huy Sở →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN CHỈ HUY SỞ CHÍNH THỨC
  // ==========================================
  const playUrl = `${window.location.origin}${window.location.pathname}#/play`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ===================================================
          THANH ĐIỀU HÀNH TỔNG CHỈ HUY TRÊN CÙNG
          =================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141f16] border border-[#233526] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-700/80 flex items-center justify-center text-amber-300 shadow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Chỉ Huy Sở Chiến Dịch Hồ Chí Minh
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Trực Tiếp
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Căn cứ Tà Thiết - Lộc Ninh • Điều phối 6 Cánh quân giải phóng
            </p>
          </div>
        </div>

        {/* Đồng hồ 5 phút & Nút điều khiển trận đánh */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Đồng hồ 5 phút */}
          <div className="px-3.5 py-2 rounded-xl bg-[#0c140d] border border-[#233526] flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Thời gian 5p:</span>
            <span className="font-mono font-black text-amber-300 text-sm">
              {formatSeconds(gameState.roomState.remainingSeconds)}
            </span>
          </div>

          {gameState.roomState.phase === 'BATTLE' ? (
            <button
              onClick={() => gameSyncService.pauseBattle()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
            >
              <Pause className="w-3.5 h-3.5" /> Tạm Dừng
            </button>
          ) : (
            <button
              onClick={() => gameSyncService.startBattle()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-950/60"
            >
              <Play className="w-3.5 h-3.5" /> Phát Lệnh Xuất Kích (5 Phút)
            </button>
          )}

          <button
            onClick={() => gameSyncService.resetGame()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt Lại
          </button>

          {/* Nút bật/tắt Bot Giả Lập 6 Đội */}
          <button
            onClick={() => gameSyncService.toggleBots()}
            className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 border transition-all ${
              gameState.roomState.isBotActive
                ? 'bg-purple-950 text-purple-300 border-purple-600 shadow'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{gameState.roomState.isBotActive ? 'Tắt 18 Bot Giả Lập' : 'Bật 18 Bot Giả Lập'}</span>
          </button>

          {/* Nút Xem Bảng Vinh Danh */}
          <button
            onClick={handleOpenStatsModalManually}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 font-black text-xs flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Bảng Vinh Danh</span>
          </button>

          {/* Nút Mở Hướng Dẫn Diễn Tập (Draft) */}
          {onOpenDraftModal && (
            <button
              onClick={onOpenDraftModal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 text-amber-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Diễn Tập (Draft)</span>
            </button>
          )}

          <button
            onClick={() => setShowQrModal(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="Chiếu Mã QR Cho Cả Lớp"
          >
            <QrCode className="w-4 h-4 text-amber-300" />
          </button>

          <button
            onClick={() => setShowQuestionModal(true)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            title="Quản Lý Bộ Đề Tác Chiến"
          >
            <FileText className="w-4 h-4 text-emerald-300" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 text-red-400 hover:text-red-300 border border-slate-700"
            title="Đăng Xuất Khỏi Chỉ Huy Sở"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CẢNH BÁO ĐỊCH PHẢN KÍCH THỜI GIAN THỰC TRÊN MÀN CHỈ HUY SỞ */}
      {gameState.roomState.activeEnemyAttack && (
        <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-600 flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-red-300 text-xs uppercase tracking-wider">
                  ĐỊCH ĐANG PHẢN KÍCH: "{gameState.roomState.activeEnemyAttack.historicalEventName}"
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-red-500">
                  Mục tiêu: {gameState.roomState.activeEnemyAttack.targetTeamName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {gameState.roomState.activeEnemyAttack.historicalDetail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-black text-amber-300">
              Đếm ngược 1s: <strong className="text-red-400 text-base">{((gameState.roomState.activeEnemyAttack.remainingMs) / 1000).toFixed(1)}s</strong>
            </span>
          </div>
        </div>
      )}

      {/* ===================================================
          SA BÀN TÁC CHIẾN 6 LÀN ĐUA TIẾN VỀ DINH ĐỘC LẬP
          =================================================== */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0d160e] border-2 border-[#233526] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1e2e21] pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
              Sa Bàn 6 Làn Tiến Quân Về Dinh Độc Lập (0% → 100%)
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-300">
            Tổng số chiến sĩ trong phòng: {gameState.players.length} đồng chí
          </span>
        </div>

        {/* Thước đo 5 cột mốc lịch sử */}
        <div className="relative pt-2 pb-1 px-4 hidden sm:block">
          <div className="flex justify-between text-[11px] font-black text-slate-400 border-b border-[#233526] pb-2">
            {HISTORICAL_MILESTONES.map((m) => (
              <div key={m.percentage} className="text-center">
                <span className="text-amber-400 block">{m.percentage}%</span>
                <span className="text-slate-300">{m.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Làn xe tăng */}
        <div className="space-y-4">
          {gameState.teams.map((team) => {
            const isMoving = gameState.roomState.phase === 'BATTLE' && team.progress > 0 && team.progress < 100;
            const hasShield = team.activeEffects.some((e) => e.type === 'DAVIS_SHIELD') || team.heldItem?.type === 'DAVIS_SHIELD';
            const hasSpeed = team.activeEffects.some((e) => e.type === 'SPEED_ORDER');
            const isSlowed = team.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');

            return (
              <div
                key={team.id}
                className="p-3.5 rounded-2xl bg-[#141f16] border border-[#233526] space-y-2 relative overflow-hidden shadow"
              >
                {/* Thông tin Cánh quân */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                    <span className="font-black text-white text-sm">{team.name}</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">({team.corpsName})</span>
                    {team.heldItem && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                        {team.heldItem.icon} {team.heldItem.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-bold">
                    <span className="text-slate-400">Quân số: <strong className="text-white">{team.memberCount}</strong></span>
                    <span className="text-slate-400">Điểm: <strong className="text-amber-300">{team.totalScore}đ</strong></span>
                    <span className="text-base font-black text-white font-mono">{team.progress}%</span>
                  </div>
                </div>

                {/* Đường chạy xe tăng & Cổng Dinh Độc Lập */}
                <div className="relative h-20 rounded-xl bg-[#0a100b] border border-[#1e2e21] overflow-hidden flex items-center px-2">
                  {/* Vạch kẻ đường dã chiến */}
                  <div className="absolute inset-x-0 h-[2px] bg-dashed border-b border-dashed border-[#233526]" />

                  {/* Xe tăng T-54 tiến quân theo % tiến độ */}
                  <div
                    className="absolute transition-all duration-700 ease-out z-10"
                    style={{ left: `calc(${Math.min(90, team.progress)}% - 50px)` }}
                  >
                    <TankSvg
                      color={team.color}
                      tankNumber={team.tankNumber}
                      isMoving={isMoving}
                      hasShield={hasShield}
                      hasSpeedBoost={hasSpeed}
                      isSlowed={isSlowed}
                      className="w-24 h-14"
                    />
                  </div>

                  {/* Cổng Dinh Độc Lập ở vạch 100% */}
                  <div className="absolute right-2 top-1 bottom-1 flex items-center z-20">
                    <PalaceGateSvg
                      isGateOpen={team.progress >= 100}
                      hasVictoryBanner={team.progress >= 100}
                      className="w-16 h-16"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================
          BẢNG RADA BÁO CÁO CHIẾN SỰ THỜI GIAN THỰC
          =================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rada dòng sự kiện */}
        <div className="p-5 rounded-3xl bg-[#0d160e] border border-[#233526] space-y-3">
          <h3 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Bảng Tin Quân Báo Trực Tiếp
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
            {gameState.liveEvents.map((ev) => (
              <div key={ev.id} className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526] flex items-center justify-between text-slate-300">
                <span>{ev.message}</span>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chợ Quân Nhu Dã Chiến (Hiện trạng kho) */}
        <div className="p-5 rounded-3xl bg-[#0d160e] border border-[#233526] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Hiện Trạng Chợ Quân Nhu (Tactics Draft)
            </h3>
            <button
              onClick={() => gameSyncService.restockMarket()}
              className="text-[10px] font-black uppercase text-amber-300 hover:underline"
            >
              + Tiếp Tế Lại Kho
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {gameState.roomState.tacticsMarket.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-[#141f16] border border-[#233526] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-white">{item.icon} {item.name}</span>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                    item.stock > 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                  }`}>
                    {item.stock > 0 ? 'Còn' : 'Đã Giành'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {item.stock > 0 ? item.description : `Giành bởi: ${item.claimedByTeamName || 'Đối thủ'}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================
          MODAL CHIẾU MÃ QR MẬT LỆNH THAM GIA
          =================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Quét Mã QR Nhận Lệnh Xuất Kích
            </h3>
            <p className="text-xs text-slate-400">
              Chiếu lên máy chiếu cho cả lớp dùng camera điện thoại quét để vào phòng
            </p>

            <div className="p-5 bg-white rounded-2xl inline-block shadow-xl">
              <QRCodeSVG value={playUrl} size={220} />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-amber-300 font-mono break-all bg-[#0c140d] p-3 rounded-xl border border-[#233526]">
                {playUrl}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(playUrl);
                  setNotice('Đã sao chép đường link tham gia!');
                }}
                className="text-xs text-slate-300 hover:text-white font-bold underline"
              >
                Sao chép liên kết vào clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL QUẢN LÝ BỘ ĐỀ TÁC CHIẾN
          =================================================== */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-emerald-500 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Quản Lý Bộ Đề Tác Chiến
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dán nội dung bộ đề Markdown vào khung bên dưới để đồng bộ tức thì cho cả lớp
              </p>
            </div>

            <textarea
              rows={12}
              value={rawMarkdownInput}
              onChange={(e) => setRawMarkdownInput(e.target.value)}
              placeholder={`# Câu 1: Trận đánh then chốt giải phóng Buôn Ma Thuột diễn ra vào thời gian nào?\n- [ ] 10-11/3/1974\n- [x] 10-11/3/1975\n- [ ] 30/4/1975\n- [ ] 26/3/1975\n> Giải thích: Ngày 10 và 11/3/1975, quân ta tiến công Buôn Ma Thuột...`}
              className="w-full p-4 rounded-xl bg-[#0c140d] border border-[#2b422e] text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-400"
            />

            {notice && (
              <p className="text-xs text-amber-300 font-bold bg-[#0c140d] p-3 rounded-xl border border-[#233526]">
                {notice}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#233526]">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveQuestions}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow"
              >
                Cập Nhật Bộ Đề Mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          MODAL BẢNG VINH DANH & TUYÊN DƯƠNG CÔNG TRẠNG (ĐÃ FIX LỖI ĐÓNG)
          =================================================== */}
      {showStatsModal && summaryStats && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141f16] border-2 border-amber-400 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* NÚT ĐÓNG HẲN (X) */}
            <button
              onClick={handleCloseStatsModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center text-sm font-black transition-all"
            >
              ✕
            </button>

            <div className="text-center space-y-1 border-b border-[#233526] pb-4">
              <span className="text-3xl">🚩</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                Bảng Tuyên Dương Công Trạng Mùa Xuân 1975
              </h3>
              <p className="text-xs text-slate-400">
                Thống kê kết quả thi đua giữa 6 Cánh quân • Dữ liệu cho thầy cô cộng điểm
              </p>
            </div>

            {/* 1. ĐỘI VÔ ĐỊCH HÚC ĐỔ CỔNG DINH ĐỘC LẬP */}
            {summaryStats.winningTeam && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#141f16] to-[#0c140d] border-2 border-amber-400 space-y-2 text-center shadow-xl">
                <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                  ★ CÁNH QUÂN TIÊN PHONG TOÀN THẮNG 30/4 ★
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {summaryStats.winningTeam.name} — {summaryStats.winningTeam.corpsName}
                </h4>
                <p className="text-xs text-amber-200">
                  {summaryStats.winningTeam.axisName} • Xe tăng {summaryStats.winningTeam.tankNumber}
                </p>
              </div>
            )}

            {/* 2. CHIẾN SĨ GÁNH TEAM TỪNG ĐỘI (SVP) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Chiến Sĩ Xuất Sắc Nhất Từng Cánh Quân (SVP - Trao Điểm Khuyến Khích):
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

            {/* 3. TOP CHUỖI ĐÚNG & TOP ĐIỂM */}
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
                  <Trophy className="w-4 h-4 text-amber-400" /> Top Điểm Cá Nhân Toàn Chiến Trường:
                </h4>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {summaryStats.topScorePlayers.map((p, idx) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-[#0d160e] border border-[#233526] flex items-center justify-between">
                      <span><strong className="text-amber-300 mr-2">#{idx + 1}</strong> {p.name}</span>
                      <span className="font-black text-amber-300">{p.score}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nút Xuất Báo Cáo CSV & Đóng Hẳn */}
            <div className="pt-4 border-t border-[#233526] flex items-center justify-between gap-3">
              <button
                onClick={() => exportPlayersToCSV(gameState.players, gameState.teams)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" /> Xuất Báo Cáo Điểm Danh (.CSV)
              </button>

              <button
                onClick={handleCloseStatsModal}
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
