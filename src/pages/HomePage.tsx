import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  ShieldAlert, 
  Sparkles, 
  MousePointerClick, 
  Shield, 
  Zap, 
  Play, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  Award,
  X
} from 'lucide-react';
import { ALL_POWER_UPS, CREW_ROLES, HISTORICAL_MILESTONES } from '../config/adminAuth';
import { TankSvg } from '../assets/svg/TankSvg';

export const HomePage: React.FC = () => {
  // Modal Chơi thử / Game Draft giới thiệu trước khi vào trận
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [draftStep, setDraftStep] = useState<number>(1);
  const [draftSelectedOption, setDraftSelectedOption] = useState<string | null>(null);
  const [draftHasShield, setDraftHasShield] = useState<boolean>(false);
  const [draftAttackCountdown, setDraftAttackCountdown] = useState<number | null>(null);
  const [draftAttackStatus, setDraftAttackStatus] = useState<'IDLE' | 'WARNING' | 'DEFENDED' | 'HIT'>('IDLE');

  const startDraftSimulation = () => {
    setShowDraftModal(true);
    setDraftStep(1);
    setDraftSelectedOption(null);
    setDraftHasShield(false);
    setDraftAttackStatus('IDLE');
    setDraftAttackCountdown(null);
  };

  const triggerDraftAttackWarning = () => {
    setDraftAttackStatus('WARNING');
    setDraftAttackCountdown(3);

    const timer = setInterval(() => {
      setDraftAttackCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setDraftAttackStatus((currentStatus) => (currentStatus === 'DEFENDED' ? 'DEFENDED' : 'HIT'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDraftUseShield = () => {
    setDraftHasShield(true);
    if (draftAttackStatus === 'WARNING') {
      setDraftAttackStatus('DEFENDED');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* ===================================================
          HERO BANNER - HÀO KHÍ THẦN TỐC 1975
          =================================================== */}
      <section className="text-center space-y-5 pt-4 pb-2 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Chiến Dịch Lịch Sử Mùa Xuân 1975</span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase text-stone-900 dark:text-white drop-shadow-sm">
            <span className="text-red-600 dark:text-red-500">THẦN TỐC</span>{' '}
            <span className="text-stone-800 dark:text-amber-400">1975</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold text-stone-700 dark:text-stone-300">
            Sa bàn thi đua tương tác trực tuyến • 6 Cánh quân tiến về Sài Gòn
          </p>
        </div>

        {/* Bức Điện Mật Lịch Sử (Võ Nguyên Giáp - 7/4/1975) */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141c16] border border-stone-200 dark:border-[#223025] shadow-sm relative text-left">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>[ ĐIỆN MẬT BỘ QUỐC PHÒNG • 7/4/1975 ]</span>
          </div>

          <blockquote className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 italic leading-relaxed border-l-2 border-red-600 dark:border-amber-400 pl-3 py-0.5">
            "Thần tốc, thần tốc hơn nữa; Táo bạo, táo bạo hơn nữa; Tranh thủ từng phút, từng giờ; Xốc tới mặt trận; Giải phóng miền Nam; Quyết chiến và toàn thắng!"
          </blockquote>
          <div className="text-right text-[11px] text-stone-600 dark:text-stone-300 font-bold mt-1">
            — Đại tướng Võ Nguyên Giáp
          </div>
        </div>
      </section>

      {/* ===================================================
          CỬA KHẨU THAO TÁC: VÀO CHƠI & BẢN NHÁP DRAFT DEMO
          =================================================== */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Cửa Khẩu 1: Vào Chiến Hào */}
        <Link
          to="/play"
          className="group p-6 rounded-2xl bg-white dark:bg-[#131b15] border-2 border-stone-200 dark:border-[#223025] hover:border-red-500 dark:hover:border-amber-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 flex items-center justify-center text-red-600 dark:text-amber-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-amber-400 flex items-center gap-1.5">
                Vào Chiến Hào Tác Chiến
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h2>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                Nhập tên và chọn 1 trong 6 cánh quân. Cùng kíp xe hợp sức giải đáp trắc nghiệm và bảo vệ xe tăng!
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1e2a21] text-xs font-bold text-red-600 dark:text-amber-400 flex items-center justify-between">
            <span>Dành cho cả lớp</span>
            <span>Tham gia →</span>
          </div>
        </Link>

        {/* Cửa Khẩu 2: Chơi Thử / Game Draft Demo */}
        <button
          onClick={startDraftSimulation}
          className="text-left group p-6 rounded-2xl bg-white dark:bg-[#131b15] border-2 border-dashed border-amber-300 dark:border-amber-700/80 hover:border-amber-500 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Play className="w-6 h-6 ml-0.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1.5">
                Chơi Thử / Game Draft
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Thuyết Trình
                </span>
              </h2>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                Mở phòng tập dượt nhanh để thuyết minh luật chơi, thử thao tác chuột, đón đòn pháo kích và dùng khiên đỡ đòn.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1e2a21] text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Tập dượt cơ chế</span>
            <span>Mở Draft →</span>
          </div>
        </button>

        {/* Cửa Khẩu 3: Chỉ Huy Sở (Admin) */}
        <Link
          to="/admin"
          className="group p-6 rounded-2xl bg-white dark:bg-[#131b15] border-2 border-stone-200 dark:border-[#223025] hover:border-stone-400 dark:hover:border-stone-600 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 dark:text-white group-hover:text-stone-700 dark:group-hover:text-stone-300 flex items-center gap-1.5">
                Chỉ Huy Sở Quản Trò
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h2>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                Dành cho Ban điều hành: Màn hình lớn sa bàn 6 làn xe tăng, phát loa còi báo động, thả dù tiếp viện và vinh danh kết quả.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1e2a21] text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
            <span>Dành cho máy chiếu</span>
            <span>Vào Quản Trò →</span>
          </div>
        </Link>
      </section>

      {/* ===================================================
          HƯỚNG DẪN CƠ CHẾ CHƠI & THAO TÁC NHANH BẰNG CHUỘT
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-red-600 dark:text-red-500" />
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white uppercase tracking-wide">
            Cơ Chế Tác Chiến & Thao Tác Nhanh
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Thao tác trắc nghiệm */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-red-600 dark:text-red-400">1. Trả Lời Siêu Tốc</span>
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">15 - 20s/câu</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Thao tác chuột hoặc phím tắt</h3>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Nhấp chuột trái chọn nhanh phương án A, B, C, D hoặc bấm các phím số <strong className="text-stone-900 dark:text-white">[1, 2, 3, 4]</strong> trên bàn phím để trả lời ngay mà không cần di chuột nhiều.
            </p>
          </div>

          {/* Card 2: Kíp lái xe tăng Co-op */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">2. Kíp Lái Đồng Lòng</span>
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">Xe tăng chung</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Các thành viên là một kíp xe</h3>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Mỗi đội gồm các chiến sĩ cùng đẩy 1 chiếc xe tăng tiến về Dinh Độc Lập. Khi cả đội cùng đúng trong một thời điểm, cơ hội nhận được vật phẩm quý hoặc Easter Egg sẽ tăng vọt!
            </p>
          </div>

          {/* Card 3: Địch Phản Kích & Khiên Bảo Vệ */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">3. Chống Địch Phản Kích</span>
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">Đếm ngược 3s</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Vật phẩm sinh ra để bảo vệ</h3>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              Hỏa lực địch (Xuân Lộc, Long Bình, Dầu Giây...) sẽ nhắm bắn đội cao nhất. Bật <strong>Lá chắn Trại Davis</strong> trong 3s cảnh báo để đỡ đòn, nếu không kíp xe sẽ bị choáng váng 5s!
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          DANH MỤC VẬT PHẨM & QUY TẮC ĐỘC QUYỀN ĐỘI
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white uppercase tracking-wide">
              Kho Lệnh Bài Chiến Thuật & Tiếp Viện
            </h2>
          </div>
          <span className="text-xs text-stone-600 dark:text-stone-300">Mỗi đội tối đa 1 món cùng loại</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_POWER_UPS.filter((p) => !p.isEasterEgg).map((powerUp) => (
            <div
              key={powerUp.type}
              className="p-4 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-base">{powerUp.icon}</span>
                  {powerUp.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  Dùng 1 lần
                </span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {powerUp.description}
              </p>
            </div>
          ))}
        </div>

        {/* Thông tin thêm về Quy Tắc Giành Đồ (Supply Draft) */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#18211a] border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📦</span>
            <div>
              <strong className="text-stone-900 dark:text-white block font-bold">Hòm Tiếp Viện Thả Dù (Supply Draft)</strong>
              <span>Xuất hiện định kỳ trên sa bàn. Chiến sĩ nào nhanh tay nhặt trước sẽ sở hữu món đồ cho kíp xe của mình!</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-full whitespace-nowrap">
            Cạnh tranh thời gian thực
          </span>
        </div>
      </section>

      {/* ===================================================
          MODAL CHƠI THỬ / GAME DRAFT GIỚI THIỆU TRỰC TIẾP
          =================================================== */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#2a3c2e] rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowDraftModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-800 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-amber-500" /> Bản Nháp / Thao Diễn Giới Thiệu (Draft Sandbox)
              </span>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Thử Nghiệm Thao Tác & Cơ Chế Chiến Thuật
              </h3>
            </div>

            {/* Bước 1: Trả lời trắc nghiệm & phím tắt */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500">Câu hỏi thử nghiệm</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 18s
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                Hội nghị lần thứ 21 Ban Chấp hành Trung ương Đảng (7/1973) đã xác định con đường nào cho cách mạng miền Nam?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'A', text: 'Con đường đấu tranh hòa bình' },
                  { key: 'B', text: 'Con đường bạo lực cách mạng', correct: true },
                  { key: 'C', text: 'Chỉ dựa vào ngoại giao quốc tế' },
                  { key: 'D', text: 'Chờ đợi đối phương tự sụp đổ' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setDraftSelectedOption(opt.key)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all flex items-center justify-between ${
                      draftSelectedOption === opt.key
                        ? opt.correct
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                          : 'bg-red-50 dark:bg-red-950/80 border-red-500 text-red-800 dark:text-red-200'
                        : 'bg-white dark:bg-[#151e17] border-stone-200 dark:border-[#28382c] hover:border-amber-400 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <span>
                      <strong className="mr-2 font-mono text-red-600 dark:text-amber-400">[{opt.key}]</strong>
                      {opt.text}
                    </span>
                    {draftSelectedOption === opt.key && (
                      <span>{opt.correct ? '✓ Đúng (+15đ)' : '✕ Sai'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bước 2: Mô phỏng Địch Phản Kích & Dùng Khiên */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500">Mô phỏng Địch Phản Kích (PvE)</span>
                {draftAttackStatus === 'IDLE' && (
                  <button
                    onClick={triggerDraftAttackWarning}
                    className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 shadow-sm"
                  >
                    Kích hoạt thử pháo kích địch
                  </button>
                )}
              </div>

              {draftAttackStatus === 'WARNING' && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 border border-red-500 text-red-800 dark:text-red-200 text-xs space-y-2 animate-pulse">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      CẢNH BÁO: Pháo binh địch tại Xuân Lộc bắn chặn!
                    </span>
                    <span className="text-base font-black font-mono text-red-600 dark:text-amber-400">
                      Va chạm sau: {draftAttackCountdown}s
                    </span>
                  </div>
                  <p className="text-[11px]">Bấm vào nút Khiên dưới đây trước khi hết giờ để hóa giải:</p>
                </div>
              )}

              {draftAttackStatus === 'DEFENDED' && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>ĐÃ ĐỠ THÀNH CÔNG!</strong> Lá chắn Trại Davis đã chặn đòn pháo. Kíp xe an toàn!</span>
                </div>
              )}

              {draftAttackStatus === 'HIT' && (
                <div className="p-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs flex items-center gap-2">
                  <span className="text-base">💥</span>
                  <span><strong>TRÚNG ĐẠN!</strong> Không kịp bật khiên, kíp lái bị choáng váng và trừ điểm streak.</span>
                </div>
              )}

              {/* Nút dùng khiên thử nghiệm */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-600 dark:text-stone-400">Túi đồ của bạn:</span>
                <button
                  onClick={handleDraftUseShield}
                  disabled={draftHasShield}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    draftHasShield
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {draftHasShield ? 'Đã bật Khiên thép' : 'Bật [Lá chắn Trại Davis]'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs hover:bg-stone-800"
              >
                Đã Hiểu Luật • Sẵn Sàng Ra Trận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
