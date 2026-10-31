import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { AdminPage } from './pages/AdminPage';
import { Swords, ShieldAlert, Compass, Sun, Moon } from 'lucide-react';

interface ThemeProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const NavigationHeader: React.FC<ThemeProps> = ({ isDark, toggleTheme }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c120e]/95 backdrop-blur-md border-b border-stone-200 dark:border-[#1e2a21] shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Quốc Kỳ Góc Trên Bên Trái & Tên Chiến Dịch */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Quốc Kỳ Việt Nam Tinh Tế (Cờ đỏ sao vàng) */}
          <div className="relative w-9 h-6 rounded-md bg-[#DA251D] flex items-center justify-center shadow-md border border-red-700/60 group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
            {/* Ngôi sao vàng 5 cánh */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#FFFF00] drop-shadow-sm">
              <polygon points="12,2 15,9 22,9 16.5,13.5 18.5,21 12,16.5 5.5,21 7.5,13.5 2,9 9,9" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-wider text-stone-900 dark:text-white uppercase group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors">
                THẦN TỐC <span className="text-red-600 dark:text-red-500">1975</span>
              </span>
            </div>
            <span className="text-[11px] text-stone-700 dark:text-stone-300 block -mt-0.5 font-medium">
              Sa Bàn Tác Chiến Mùa Xuân 1975
            </span>
          </div>
        </Link>

        {/* Menu Điều Hướng & Nút Chuyển Light/Dark Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                location.pathname === '/'
                  ? 'bg-red-50 dark:bg-stone-800 text-red-700 dark:text-amber-300 border border-red-200 dark:border-stone-700 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tổng Quan</span>
            </Link>

            <Link
              to="/play"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                location.pathname === '/play'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Vào Chiến Hào</span>
            </Link>

            <Link
              to="/admin"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                location.pathname === '/admin'
                  ? 'bg-stone-900 text-white dark:bg-red-700 dark:text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              <span>Chỉ Huy Sở</span>
            </Link>
          </nav>

          {/* Nút Toggle Light / Dark Mode */}
          <button
            onClick={toggleTheme}
            aria-label="Chuyển chế độ sáng tối"
            className="p-2 rounded-xl border border-stone-200 dark:border-[#223025] bg-stone-100 dark:bg-[#151e18] text-stone-700 dark:text-amber-300 hover:scale-105 transition-all shadow-sm"
            title={isDark ? 'Chuyển sang chế độ ban ngày (Light Mode)' : 'Chuyển sang chế độ ban đêm (Dark Mode)'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};

const NavigationFooter: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 dark:border-[#1e2a21] bg-stone-100/80 dark:bg-[#090e0b] mt-20 py-8 text-stone-600 dark:text-stone-300 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <p className="font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center justify-center md:justify-start gap-2">
            <span className="text-red-600 dark:text-amber-400">★</span> Sa Bàn Tác Chiến Lịch Sử "Thần Tốc 1975"
          </p>
          <p className="text-[11px] text-stone-600 dark:text-stone-300">
            Báo cáo đề tài Lịch sử Đảng Cộng sản Việt Nam (VNR202) • K18 - K20 Đại học FPT
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-600 dark:text-stone-300">
          <span className="px-2.5 py-1 rounded-md bg-stone-200 dark:bg-[#151e18] text-stone-800 dark:text-stone-200 font-semibold border border-stone-300 dark:border-stone-700">
            Thực hiện bởi: Nhóm 6
          </span>
          <span>•</span>
          <span>Chiến dịch Hồ Chí Minh 1975</span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Toàn Thắng 30/4</span>
        </div>
      </div>
    </footer>
  );
};

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('than_toc_theme');
      if (savedTheme) return savedTheme === 'dark';
    }
    return true; // Mặc định dark mode sa bàn chiến thuật
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('than_toc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('than_toc_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col transition-colors duration-200 bg-stone-50 dark:bg-[#0c120e] text-stone-900 dark:text-stone-100">
        <NavigationHeader isDark={isDark} toggleTheme={toggleTheme} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <NavigationFooter />
      </div>
    </HashRouter>
  );
};

export default App;
