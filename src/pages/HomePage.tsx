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
  Target
} from 'lucide-react';
import { HISTORICAL_MILESTONES, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-14">
      {/* ===================================================
          HERO BANNER - HÀO KHÍ MÙA XUÂN 1975
          =================================================== */}
      <section className="text-center space-y-6 pt-4 pb-2 relative">
        {/* Dấu Mật Lịch Sử */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-700/80 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-950/60">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>VNR202 • Lịch Sử Đảng Cộng Sản Việt Nam • Chủ Đề 6</span>
        </div>

        {/* Tiêu đề chính hào hùng */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
            <span className="text-amber-300">THẦN TỐC</span>{' '}
            <span className="text-red-500">1975</span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-200/90 uppercase tracking-widest">
            Đại Thắng Mùa Xuân • Giải Phóng Hoàn Toàn Miền Nam
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
                Nhập vai chiến sĩ giải phóng quân thuộc 6 Cánh quân (Nhóm 1, 2, 3, 4, 5 và 7). 
                Cùng đồng đội trả lời trắc nghiệm, tích lũy Streak, tung Lệnh bài chiến thuật để đẩy xe tăng T-54 húc đổ cổng Dinh Độc Lập!
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#233526] flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">6 Cánh quân thi đua</span>
            <span className="text-amber-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Bắt đầu xung phong →
            </span>
          </div>
        </Link>

        {/* Cửa Khẩu 2: Dành cho Ban Quản trò Nhóm 6 */}
        <Link 
          to="/admin"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1315] via-[#1a0e10] to-[#0c140d] p-7 sm:p-8 border-2 border-[#4a1f23] hover:border-red-500/80 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-1.5 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/25 transition-all" />

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-red-600/15 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform shadow-lg shadow-red-950/40">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                Ban Quản Trò Nhóm 6
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                Chỉ Huy Sở Mặt Trận
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bộ Chỉ huy Chiến dịch Hồ Chí Minh (Căn cứ Tà Thiết - Lộc Ninh): Quản trị sa bàn 6 làn xe tăng thời gian thực, điều phối nhịp độ câu hỏi, chiếu mã QR điểm danh cả lớp và xuất báo cáo điểm cuối trận.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#3b1c20] flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Tài khoản BTC: admin_nhom6</span>
            <span className="text-red-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Mở bản đồ tác chiến →
            </span>
          </div>
        </Link>
      </section>

      {/* ===================================================
          QUY TẮC TÁC CHIẾN & THỂ LỆ THI ĐẤU
          =================================================== */}
      <section className="bg-[#141f16]/90 border border-[#2b422e] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-[#233526] pb-3">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
            Thể Lệ Tác Chiến & Cách Thức Ghi Điểm
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0d160e] border border-[#233526] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-black text-sm border border-red-600/40">
              1
            </div>
            <h3 className="font-bold text-white text-sm">Trả Lời & Đẩy Xe Tăng</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mỗi câu trả lời đúng cộng <strong>100 điểm + (Streak x 20)</strong> và đẩy xe tăng của cánh quân tiến lên <strong>+4%</strong> (hoặc <strong>+8%</strong> nếu có Mệnh lệnh Thần tốc).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d160e] border border-[#233526] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/40">
              2
            </div>
            <h3 className="font-bold text-white text-sm">Tích Lũy Lệnh Bài</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Duy trì chuỗi đúng liên tiếp đạt <strong>Streak 3, 6, 9...</strong> để nhận Lệnh bài chiến thuật: Đường ống Trường Sơn, Lá chắn Trại Davis, Nghi binh Pleiku, Chặn đường số 7.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d160e] border border-[#233526] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/40">
              3
            </div>
            <h3 className="font-bold text-white text-sm">Cắm Cờ Toàn Thắng</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cánh quân đầu tiên chạm mốc <strong>100%</strong> sẽ húc đổ cổng Dinh Độc Lập, cắm cờ Giải phóng và giành danh hiệu Vô địch toàn trận.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          6 CÁNH QUÂN THẦN TỐC LỊCH SỬ NĂM 1975
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
              6 Cánh Quân Lịch Sử (Tương Ứng 6 Nhóm Đua Trong Lớp)
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Nhóm 6 là Ban Quản Trò</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <span className="text-emerald-400 font-bold">Sẵn sàng nhận lệnh</span>
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
