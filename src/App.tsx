import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { AdminPage } from './pages/AdminPage';
import { Swords, ShieldAlert, Compass, Sun, Moon, HelpCircle } from 'lucide-react';
import { DraftIntroModal } from './components/DraftIntroModal';

const NavigationHeader: React.FC<{ onOpenDraftModal: () => void }> = ({ onOpenDraftModal }) => {
  const location = useLocation();
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('than_toc_theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('than_toc_theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('than_toc_theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c140d]/95 backdrop-blur-md border-b border-[#233526] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Tên Chiến Dịch & Huy hiệu */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-950 flex items-center justify-center border border-amber-400/60 shadow-lg shadow-red-950/80 group-hover:scale-105 transition-transform">
            <span className="text-amber-300 text-xl font-black drop-shadow">★</span>
            <div className="absolute -bottom-0.5 inset-x-1 h-[2px] bg-amber-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors">
                THẦN TỐC <span className="text-red-500">1975</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
              Sa Bàn Tác Chiến Đại Thắng Mùa Xuân
            </span>
          </div>
        </Link>

        {/* Menu Điều Hướng & Công Cụ */}
        <nav className="flex items-center gap-2">
          {/* Nút Mở Hướng Dẫn / Draft */}
          <button
            onClick={onOpenDraftModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/40 transition-all flex items-center gap-1.5"
            title="Xem Sổ Tay Tác Chiến & Hướng Dẫn Luật Chơi"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Diễn Tập (Draft)</span>
          </button>

          {/* Nút Chuyển Đổi Light / Dark Mode */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-[#233526] transition-all"
            title={isLightMode ? 'Chuyển sang Chế độ Tối (Sa bàn đêm)' : 'Chuyển sang Chế độ Sáng (Bản đồ giấy ráp)'}
          >
            {isLightMode ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname === '/'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tổng Quan</span>
          </Link>

          <Link
            to="/play"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname === '/play'
                ? 'bg-red-950/90 text-amber-300 border border-red-700 shadow-md shadow-red-950/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>Chiến Hào</span>
          </Link>

          <Link
            to="/admin"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname === '/admin'
                ? 'bg-red-700 text-white border border-red-500 shadow-lg shadow-red-900/60'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/80'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>Chỉ Huy Sở</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

const NavigationFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#1e2e21] bg-[#090f0a] mt-20 py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <p className="font-extrabold text-slate-200 uppercase tracking-wide flex items-center justify-center md:justify-start gap-2">
            <span className="text-amber-400">★</span> Sa Bàn Tác Chiến Lịch Sử "Thần Tốc 1975"
          </p>
          <p className="text-[11px] text-slate-400">
            Mô phỏng chiến dịch giải phóng Sài Gòn • Toàn thắng 30/4/1975
          </p>
        </div>

        {/* Thông tin Nhóm 6 đặt trang trọng tại Footer theo đúng yêu cầu */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="px-3 py-1 rounded-xl bg-[#162218] border border-[#233526] text-amber-300 font-bold">
            Ban Quản Trò & Vận Hành Sa Bàn: Nhóm 6
          </span>
          <span>•</span>
          <span>Chủ đề 6 • Môn VNR202 • Đại Học FPT</span>
        </div>
      </div>
    </footer>
  );
};

export function App() {
  const [isDraftModalOpen, setIsDraftModalOpen] = useState<boolean>(false);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col selection:bg-red-600 selection:text-white">
        <NavigationHeader onOpenDraftModal={() => setIsDraftModalOpen(true)} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage onOpenDraftModal={() => setIsDraftModalOpen(true)} />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/admin" element={<AdminPage onOpenDraftModal={() => setIsDraftModalOpen(true)} />} />
          </Routes>
        </main>

        <NavigationFooter />

        {/* Modal Hướng Dẫn Diễn Tập (Draft Walkthrough) */}
        <DraftIntroModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
        />
      </div>
    </HashRouter>
  );
}

export default App;
