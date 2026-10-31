import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { AdminPage } from './pages/AdminPage';
import { Swords, ShieldAlert, Home } from 'lucide-react';

const NavigationHeader: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-military-dark/90 backdrop-blur-md border-b border-military-border/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vietnam-red to-red-800 flex items-center justify-center border border-vietnam-gold/40 shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform">
            <span className="text-vietnam-gold text-xl font-black">★</span>
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white uppercase group-hover:text-vietnam-yellow transition-colors flex items-center gap-1.5">
              Thần Tốc <span className="text-vietnam-red">1975</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
              VNR202 • Chủ Đề 6 (Nhóm 6)
            </span>
          </div>
        </Link>

        {/* Navigation Quick Links */}
        <nav className="flex items-center gap-2 text-xs font-bold">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname === '/'
                ? 'bg-military-card text-vietnam-yellow border border-military-border'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trang Chủ</span>
          </Link>

          <Link
            to="/play"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname === '/play'
                ? 'bg-military-card text-vietnam-yellow border border-military-border'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>Chiến Trường</span>
          </Link>

          <Link
            to="/admin"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname === '/admin'
                ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Chỉ Huy Sở</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

const NavigationFooter: React.FC = () => {
  return (
    <footer className="border-t border-military-border/60 bg-military-dark/80 mt-16 py-8 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="space-y-1">
          <p className="font-bold text-slate-300">
            Dự Án Trắc Nghiệm Tương Tác Lịch Sử "Thần Tốc 1975"
          </p>
          <p className="text-[11px] text-slate-500">
            Môn học: VNR202 - Lịch sử Đảng Cộng sản Việt Nam • Bài tập thảo luận Chủ đề 6
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>Thực hiện bởi: <strong className="text-vietnam-yellow">Nhóm 6</strong></span>
          <span>•</span>
          <span>Tương thích: <strong>GitHub Pages</strong></span>
          <span>•</span>
          <span>Đường dẫn: <strong>base: './'</strong></span>
        </div>
      </div>
    </footer>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-military-dark text-slate-100">
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
