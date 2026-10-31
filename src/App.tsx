import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { AdminPage } from './pages/AdminPage';
import { Swords, ShieldAlert, Compass } from 'lucide-react';

const NavigationHeader: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#0c140d]/95 backdrop-blur-md border-b border-[#233526] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Huy hiệu & Tên Chiến Dịch */}
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
              <span className="hidden sm:inline-block text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-950/80 text-amber-300 border border-red-800/80">
                CHỦ ĐỀ 6
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
              Đại Thắng Mùa Xuân • Môn VNR202 - Đại Học FPT
            </span>
          </div>
        </Link>

        {/* Menu Điều Hướng Phong Cách Sa Bàn */}
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname === '/'
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40 shadow-sm'
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
            <span>Vào Chiến Hào</span>
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
            Phục vụ buổi thảo luận & thuyết trình môn Lịch sử Đảng Cộng sản Việt Nam (VNR202) • K18 - K20
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded bg-[#162218] border border-[#233526] text-amber-300 font-semibold">
            Ban Quản Trò: Nhóm 6
          </span>
          <span>•</span>
          <span>Chiến dịch Hồ Chí Minh 1975</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Toàn Thắng 30/4</span>
        </div>
      </div>
    </footer>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#0c140d] text-slate-100">
        <NavigationHeader />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <NavigationFooter />
      </div>
    </HashRouter>
  );
};

export default App;
