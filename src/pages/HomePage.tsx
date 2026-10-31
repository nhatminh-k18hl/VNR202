import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  ShieldAlert, 
  Flag, 
  Users, 
  ChevronRight,
  Sparkles,
  Compass,
  Trophy,
  Flame,
  Zap,
  Target,
  Clock,
  Shield,
  HelpCircle,
  Play
} from 'lucide-react';
import { HISTORICAL_MILESTONES, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';

interface HomePageProps {
  onOpenDraftModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenDraftModal }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* ===================================================
          HERO BANNER - HÀO KHÍ MÙA XUÂN 1975
          =================================================== */}
      <section className="text-center space-y-5 pt-4 pb-2 relative">
        {/* Tiêu đề chính */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
            <span className="text-amber-300">THẦN TỐC</span>{' '}
            <span className="text-red-500">1975</span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-200/90 uppercase tracking-widest">
            Sa Bàn Tác Chiến Lịch Sử • Giải Phóng Hoàn Toàn Miền Nam
          </p>
        </div>

        {/* Bức Điện Mật Lịch Sử Của Đại Tướng Võ Nguyên Giáp (7/4/1975) */}
        <div className="max-w-3xl mx-auto p-5 sm:p-6 rounded-2xl bg-[#141f16]/90 border border-[#2b422e] shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 text-red-400 font-mono text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>[ ĐIỆN KHẨN MẬT • BỘ QUỐC PHÒNG • 7/4/1975 ]</span>
          </div>

          <blockquote className="text-sm sm:text-base text-amber-100 font-serif italic leading-relaxed border-l-4 border-amber-400 pl-4 py-1">
            "Thần tốc, thần tốc hơn nữa; Táo bạo, táo bạo hơn nữa; Tranh thủ từng phút, từng giờ; Xốc tới mặt trận; Giải phóng miền Nam; Quyết chiến và toàn thắng!"
          </blockquote>

          <div className="text-right text-xs text-slate-400 font-bold mt-2">
            — Đại tướng Võ Nguyên Giáp (Văn)
          </div>
        </div>

        {/* Nút Bấm Vào Draft Để Giới Thiệu & Diễn Tập */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {onOpenDraftModal && (
            <button
              onClick={onOpenDraftModal}
              className="px-5 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-400/80 text-amber-300 hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:scale-105"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Xem Sổ Tay Tác Chiến & Hướng Dẫn Diễn Tập (Draft)</span>
            </button>
          )}
        </div>
      </section>

      {/* ===================================================
          HAI CỬA KHẨU XUẤT KÍCH CHÍNH (ROLE SELECTION)
          =================================================== */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Cửa Khẩu 1: Dành cho Sinh viên các nhóm */}
        <Link 
          to="/play"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18261b] via-[#121c14] to-[#0c140d] p-7 sm:p-8 border-2 border-[#2b422e] hover:border-amber-400/80 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-1.5 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform shadow-lg shadow-amber-950/40">
                <Swords className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                Dành Cho Các Nhóm Đua
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                Vào Chiến Hào Tác Chiến
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Nhập vai thành viên kíp lái xe tăng thuộc 6 Cánh quân. Phối hợp trả lời nhanh trắc nghiệm trong 20 giây, kích hoạt Lá chắn đỡ đòn phản kích của địch và tranh quân nhu dã chiến!
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#233526] flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">6 Cánh quân thi đua</span>
            <span className="text-amber-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Nhận lệnh xuất kích →
            </span>
          </div>
        </Link>

        {/* Cửa Khẩu 2: Dành cho Ban Quản trò Chỉ Huy Sở */}
        <Link 
          to="/admin"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#261515] via-[#1a0f0f] to-[#0d0909] p-7 sm:p-8 border-2 border-red-900/60 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20 hover:-translate-y-1.5 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shadow-lg shadow-red-950/60">
                <ShieldAlert className="w-7 h-7 text-amber-300" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-red-950/80 text-amber-300 border border-red-800">
                Ban Quản Trò
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                Chỉ Huy Sở Tác Chiến
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Sa bàn toàn cảnh 6 làn tiến quân, đếm ngược 5 phút toàn trận, quản lý ngân hàng câu hỏi, chiếu mã QR cho cả lớp và xuất Bảng Vinh Danh (MVP, SVP, Top Streak).
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#311e1e] flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Căn cứ Tà Thiết - Lộc Ninh</span>
            <span className="text-red-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Mở Sa Bàn Tác Chiến →
            </span>
          </div>
        </Link>
      </section>

      {/* ===================================================
          HƯỚNG DẪN TÁC CHIẾN & VẬT PHẨM QUÂN NHU BẢO VỆ
          =================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#233526] pb-3">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              Hướng Dẫn Tác Chiến & Kho Quân Nhu Dã Chiến
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Quy tắc bảo vệ đồng đội & cạnh tranh Tactics</span>
        </div>

        {/* 3 Quy tắc cốt lõi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-black">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-black text-white text-sm">1. Kíp Lái Xe Tăng Phối Hợp</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mỗi nhóm là một kíp xe tăng T-54. Cùng trả lời trắc nghiệm, tích lũy điểm và chia sẻ chung 1 ô vật phẩm phòng thủ để bảo vệ tiến độ xe tăng.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/40 flex items-center justify-center text-red-400 font-black">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="font-black text-white text-sm">2. Trận Đánh 5 Phút • 20s/Câu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chiến dịch diễn ra trong 5 phút (300 giây). Mỗi câu hỏi mở trong tối đa 20 giây bằng thao tác chuột nhanh. Hết giờ sẽ lỡ nhịp hỏa lực!
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-black text-white text-sm">3. Địch Phản Kích (Đếm Ngược 1s)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hỏa lực địch tập trung đánh cánh quân dẫn đầu với các sự kiện lịch sử thật (Xuân Lộc, Buôn Ma Thuột...). Kíp lái phải nhanh tay nhấn Khiên đỡ đòn trong 1s!
            </p>
          </div>
        </div>

        {/* Danh sách 4 Vật phẩm bảo vệ trong Chợ Quân Nhu */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-amber-300 text-sm uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              4 Trang Bị Bảo Vệ Dã Chiến Trong Chợ Quân Nhu (Tactics Draft):
            </h3>
            <span className="text-[11px] text-slate-400 italic">Mỗi đội giữ tối đa 1 món chưa dùng</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#141f16] border border-[#233526] space-y-1.5 hover:border-emerald-500/60 transition-all">
              <span className="text-2xl">🛡️</span>
              <h4 className="font-black text-white text-xs">Lá Chắn Trại Davis</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Phòng thủ tuyệt đối: Chặn 100% đòn pháo kích của địch trong 12s, hóa giải hoàn toàn khựng xe và nhận +150đ thưởng phối hợp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141f16] border border-[#233526] space-y-1.5 hover:border-amber-500/60 transition-all">
              <span className="text-2xl">⚡</span>
              <h4 className="font-black text-white text-xs">Mệnh Lệnh Thần Tốc</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nhân đôi tốc độ tiến quân (+8% tiến độ) và nhân đôi điểm số khi kíp lái trả lời chính xác câu hỏi tiếp theo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141f16] border border-[#233526] space-y-1.5 hover:border-blue-500/60 transition-all">
              <span className="text-2xl">⛽</span>
              <h4 className="font-black text-white text-xs">Xăng Dầu Trường Sơn</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tiếp tế nhiên liệu dã chiến: Tăng vọt +6% tiến độ cho xe tăng ngay lập tức và hóa giải mọi chấn động pháo kích.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141f16] border border-[#233526] space-y-1.5 hover:border-purple-500/60 transition-all">
              <span className="text-2xl">🎭</span>
              <h4 className="font-black text-white text-xs">Nghi Binh Tây Nguyên</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tung hỏa mù nghi binh đánh lừa phi cơ trinh sát và phân tán hỏa lực đối phương trong 10 giây.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          DANH SÁCH 6 CÁNH QUÂN LỊCH SỬ THAM GIA THI ĐUA
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
            6 Cánh Quân Lịch Sử Tham Gia Chiến Dịch 1975
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {INITIAL_TEAMS_CONFIG.map((team) => (
            <div
              key={team.id}
              className="p-4 rounded-2xl border border-[#2b422e] bg-[#141f16]/80 flex flex-col justify-between space-y-3 hover:border-amber-400/50 transition-all shadow"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                  </span>
                  <span 
                    className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase"
                    style={{ backgroundColor: `${team.color}25`, color: team.color, border: `1px solid ${team.color}50` }}
                  >
                    Xe tăng {team.tankNumber}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200">{team.corpsName}</h3>
                <p className="text-[11px] text-amber-300/80">{team.axisName}</p>
              </div>

              <div className="pt-2 border-t border-[#1e2e21] flex items-center justify-between text-[11px] text-slate-400">
                <span>Vạch xuất kích: 0%</span>
                <span className="text-emerald-400 font-bold">Kíp lái sẵn sàng</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================
          5 CỘT MỐC LỊCH SỬ TIẾN QUÂN (0% -> 100%)
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Flag className="w-5 h-5 text-red-500" />
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
            5 Cột Mốc Lịch Sử Trên Sa Bàn Tiến Quân
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {HISTORICAL_MILESTONES.map((milestone) => (
            <div
              key={milestone.percentage}
              className="p-4 rounded-2xl border border-[#2b422e] bg-[#0d160e]/90 space-y-2.5 flex flex-col justify-between shadow"
            >
              <div>
                <span className="text-xs font-black text-amber-300 bg-red-950/80 px-2.5 py-0.5 rounded-md border border-red-800/80 inline-block">
                  MỐC {milestone.percentage}%
                </span>
                <h3 className="text-sm font-black text-white mt-2 leading-snug">{milestone.title}</h3>
                <p className="text-[11px] font-bold text-amber-400/90 mt-0.5">{milestone.subTitle}</p>
              </div>
              <p className="text-[11px] text-slate-400 italic pt-2 border-t border-[#1e2e21] leading-relaxed">
                {milestone.historicalEvent}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
