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
  Clock,
  ChevronRight,
  Package,
  X
} from 'lucide-react';
import { ALL_POWER_UPS, HISTORICAL_MILESTONES } from '../config/adminAuth';

export const HomePage: React.FC = () => {
  const [showDraftModal, setShowDraftModal] = useState<boolean>(false);
  const [draftSelectedOption, setDraftSelectedOption] = useState<string | null>(null);
  const [draftHasShield, setDraftHasShield] = useState<boolean>(false);
  const [draftAttackCountdown, setDraftAttackCountdown] = useState<number | null>(null);
  const [draftAttackStatus, setDraftAttackStatus] = useState<'IDLE' | 'WARNING' | 'DEFENDED' | 'HIT'>('IDLE');

  const startDraftSimulation = () => {
    setShowDraftModal(true);
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
          HERO BANNER
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
          <p className="text-sm sm:text-base font-semibold text-stone-600 dark:text-stone-300">
            Trò chơi thi đua trắc nghiệm thời gian thực • 6 Cánh quân tiến về Sài Gòn
          </p>
        </div>

        {/* Bức Điện Mật Lịch Sử */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141c16] border border-stone-200 dark:border-[#223025] shadow-sm relative text-left">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>[ ĐIỆN MẬT BỘ QUỐC PHÒNG • 7/4/1975 ]</span>
          </div>

          <blockquote className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 italic leading-relaxed border-l-2 border-red-600 dark:border-amber-400 pl-3 py-0.5">
            "Thần tốc, thần tốc hơn nữa; Táo bạo, táo bạo hơn nữa; Tranh thủ từng phút, từng giờ; Xốc tới mặt trận; Giải phóng miền Nam; Quyết chiến và toàn thắng!"
          </blockquote>
          <div className="text-right text-[11px] text-stone-500 dark:text-stone-400 font-bold mt-1">
            — Đại tướng Võ Nguyên Giáp
          </div>
        </div>
      </section>

      {/* ===================================================
          CỬA KHẨU THAO TÁC CHÍNH
          =================================================== */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Vào Chơi */}
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
                Vào Chơi Ngay
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Nhập tên và chọn nhóm của bạn. Cùng các thành viên trả lời câu hỏi và đẩy xe tăng tiến về đích!
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1e2a21] text-xs font-bold text-red-600 dark:text-amber-400 flex items-center justify-between">
            <span>Dành cho thành viên các nhóm</span>
            <span>Vào phòng →</span>
          </div>
        </Link>

        {/* Chơi Thử / Game Draft Demo */}
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
                Chơi Thử / Xem Trước
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Demo
                </span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Bấm vào đây để thử nhanh cách chơi: click chọn đáp án, xem địch bắn và thử bấm nút bật khiên đỡ đạn.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1e2a21] text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>Tập dượt luật chơi</span>
            <span>Mở Chơi Thử →</span>
          </div>
        </button>

        {/* Quản Trò (Admin) */}
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
                Màn Hình Quản Trò
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Dành cho máy chiếu: Chiếu đường đua xe tăng của 6 đội, bấm bắt đầu, thả hộp tiếp tế và xem bảng xếp hạng.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1e2a21] text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
            <span>Dành cho ban tổ chức</span>
            <span>Vào Quản Trò →</span>
          </div>
        </Link>
      </section>

      {/* ===================================================
          HƯỚNG DẪN CÁCH CHƠI SIÊU DỄ HIỂU (3 BƯỚC)
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-5 h-5 text-red-600 dark:text-red-500" />
          <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white uppercase tracking-wide">
            Cách Chơi Rất Đơn Giản
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-red-600 dark:text-red-400">Bước 1: Click Chuột Trả Lời</span>
              <span className="text-[11px] font-bold text-stone-400">18s / câu</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Dùng chuột click chọn đáp án</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Chỉ cần dùng chuột click vào đáp án A, B, C hoặc D. Trả lời đúng sẽ cộng điểm và xe tăng của đội bạn sẽ tiến lên phía trước.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">Bước 2: Click Hộp Tiếp Tế</span>
              <span className="text-[11px] font-bold text-stone-400">Rơi mỗi 30s</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Nhặt đồ bảo vệ xe tăng</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Khi thấy hộp tiếp tế thả dù rơi xuống, hãy nhanh tay click thẳng vào hộp đồ để nhận vật phẩm (Khiên bảo vệ, Tăng tốc...) cho đội mình.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Bước 3: Bật Khiên Khi Bị Bắn</span>
              <span className="text-[11px] font-bold text-stone-400">Còi báo động</span>
            </div>
            <h3 className="font-bold text-sm text-stone-900 dark:text-white">Đỡ đòn pháo kích của địch</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Địch sẽ bắn ngẫu nhiên (đội điểm cao có nguy cơ bị bắn nhiều hơn). Khi có còi báo động nhắm vào đội mình, ai có Khiên hãy click dùng ngay để không bị choáng!
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          CÁC MÓN ĐỒ TIẾP TẾ
          =================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white uppercase tracking-wide">
              Các Món Đồ Hỗ Trợ
            </h2>
          </div>
          <span className="text-xs text-stone-500">Mỗi đội chỉ giữ tối đa 1 món cùng loại</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_POWER_UPS.filter((p) => !p.isEasterEgg).map((powerUp) => (
            <div
              key={powerUp.type}
              className="p-4 rounded-2xl bg-white dark:bg-[#131b15] border border-stone-200 dark:border-[#223025] space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-stone-900 dark:text-white flex items-center gap-1.5">
                  <span className="text-base">{powerUp.icon}</span>
                  {powerUp.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  Dùng 1 lần
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {powerUp.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================
          MODAL CHƠI THỬ / GAME DRAFT
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
                <Play className="w-3.5 h-3.5 fill-amber-500" /> Chơi Thử Nhanh (Xem Trước Cách Chơi)
              </span>
              <h3 className="text-lg font-black text-stone-900 dark:text-white">
                Tập Dượt Thao Tác Chuột & Bật Khiên
              </h3>
            </div>

            {/* Bước 1: Trả lời trắc nghiệm */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500">Câu hỏi thử:</span>
                <span className="font-mono text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 18s
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                Hội nghị lần thứ 21 Ban Chấp hành Trung ương Đảng (7/1973) xác định con đường nào cho cách mạng miền Nam?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'A', text: 'Con đường đấu tranh hòa bình' },
                  { key: 'B', text: 'Con đường bạo lực cách mạng', correct: true },
                  { key: 'C', text: 'Chỉ dựa vào ngoại giao' },
                  { key: 'D', text: 'Chờ đối phương tự sụp đổ' },
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
                      <strong className="mr-1.5 text-red-600 dark:text-amber-400">{opt.key}.</strong>
                      {opt.text}
                    </span>
                    {draftSelectedOption === opt.key && (
                      <span>{opt.correct ? '✓ Đúng (+15đ)' : '✕ Sai'}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bước 2: Thử địch bắn và bấm khiên */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d140e] border border-stone-200 dark:border-[#223025] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-500">Thử tình huống địch bắn:</span>
                {draftAttackStatus === 'IDLE' && (
                  <button
                    onClick={triggerDraftAttackWarning}
                    className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 shadow-sm"
                  >
                    Thử tạo tiếng địch bắn
                  </button>
                )}
              </div>

              {draftAttackStatus === 'WARNING' && (
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950 border border-red-500 text-red-800 dark:text-red-200 text-xs space-y-1.5 animate-pulse">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      CẢNH BÁO: Địch đang bắn pháo vào xe bạn!
                    </span>
                    <span className="text-sm font-black font-mono text-red-600 dark:text-amber-400">
                      Đang tới...
                    </span>
                  </div>
                  <p className="text-[11px]">Click nhanh vào nút Bật Khiên bên dưới để không bị trúng đạn:</p>
                </div>
              )}

              {draftAttackStatus === 'DEFENDED' && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-500 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>ĐÃ BẬT KHIÊN ĐỠ ĐÒN THÀNH CÔNG!</strong> Xe của đội bạn hoàn toàn an toàn.</span>
                </div>
              )}

              {draftAttackStatus === 'HIT' && (
                <div className="p-3 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs flex items-center gap-2">
                  <span className="text-base">💥</span>
                  <span><strong>BỊ TRÚNG ĐẠN!</strong> Không bật khiên kịp, thành viên sẽ bị mờ câu hỏi trong 1-2s.</span>
                </div>
              )}

              {/* Nút bấm khiên */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-500">Đồ trong túi của bạn:</span>
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
                  {draftHasShield ? 'Đã bật Khiên' : 'Bật [Lá chắn Trại Davis]'}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDraftModal(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-700 text-white font-bold text-xs hover:bg-stone-800"
              >
                Đã Hiểu Luật • Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
