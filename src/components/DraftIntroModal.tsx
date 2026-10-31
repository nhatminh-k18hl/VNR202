import React, { useState } from 'react';
import { 
  Shield, 
  Flame, 
  Zap, 
  Target, 
  Clock, 
  Users, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { soundService } from '../services/soundService';

interface DraftIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DraftIntroModal: React.FC<DraftIntroModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'crew' | 'pacing' | 'boss' | 'market'>('crew');
  const [testShieldActive, setTestShieldActive] = useState<boolean>(false);
  const [testBossAlert, setTestBossAlert] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestBossStrike = () => {
    setTestBossAlert(true);
    soundService.playAttack();
    setTimeout(() => {
      setTestBossAlert(false);
    }, 2000);
  };

  const handleTestShield = () => {
    setTestShieldActive(true);
    soundService.playShieldBlock();
    setTimeout(() => {
      setTestShieldActive(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141f16] border-2 border-amber-500/80 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center text-sm font-black transition-all"
        >
          ✕
        </button>

        {/* Tiêu đề Modal */}
        <div className="space-y-1 border-b border-[#233526] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIỄN TẬP TÁC CHIẾN • DRAFT HƯỚNG DẪN CHIẾN LƯỢC</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Sổ Tay Tác Chiến & Quy Tắc Chiến Trường 1975
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Hướng dẫn phối hợp kíp lái xe tăng, cơ chế tranh quân nhu Tactics và hóa giải phản kích địch
          </p>
        </div>

        {/* Thanh chuyển Tab */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0c140d] p-1.5 rounded-2xl border border-[#233526]">
          <button
            onClick={() => setActiveTab('crew')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'crew'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Kíp Lái Xe Tăng</span>
          </button>

          <button
            onClick={() => setActiveTab('pacing')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pacing'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Nhịp Độ 5 Phút</span>
          </button>

          <button
            onClick={() => setActiveTab('boss')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'boss'
                ? 'bg-red-950 text-red-300 border border-red-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Địch Phản Kích</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'market'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>4. Chợ Quân Nhu</span>
          </button>
        </div>

        {/* Nội dung từng Tab */}
        <div className="space-y-4 min-h-[220px]">
          {/* TAB 1: KÍP LÁI XE TĂNG */}
          {activeTab === 'crew' && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-2">
                <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Mỗi Nhóm Là Một Kíp Xe Tăng T-54 Phối Hợp Hiệp Đồng
                </h4>
                <p className="leading-relaxed">
                  Thay vì chơi đơn lẻ, các thành viên trong nhóm gắn kết như một kíp xe tiến công. Điểm số và tiến độ của cả đội phụ thuộc vào sự hiệp đồng nhịp nhàng:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526]">
                    <span className="font-black text-white block">🎖️ Trưởng xe & Pháo thủ:</span>
                    <span className="text-slate-400">Trả lời chính xác các câu hỏi lịch sử để pháo điểm hỏa, đẩy xe tăng lao về phía trước (+4% tiến độ/câu).</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526]">
                    <span className="font-black text-white block">🛡️ Báo vụ & Tiếp đạn:</span>
                    <span className="text-slate-400">Canh chừng rada báo động đỏ và nhanh tay nhặt vật phẩm bảo vệ từ Chợ Quân Nhu để che chắn cho xe.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NHỊP ĐỘ 5 PHÚT & 20S/CÂU */}
          {activeTab === 'pacing' && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-3">
                <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Quy Tắc Thần Tốc: 5 Phút Toàn Trận • 20 Giây Mỗi Câu
                </h4>
                <ul className="space-y-2 list-disc list-inside leading-relaxed text-slate-300">
                  <li><strong className="text-white">Tổng thời gian chiến dịch:</strong> Đúng 5 phút (300 giây) đếm ngược liên tục. Không được chần chừ!</li>
                  <li><strong className="text-white">Thao tác chuột nhanh 20s:</strong> Mỗi câu hỏi chỉ mở trong tối đa 20 giây. Hết 20 giây sẽ tự động chuyển sang câu tiếp theo và bị tính lỡ thời cơ hỏa lực.</li>
                  <li><strong className="text-white">Chuỗi đúng (Streak 🔥):</strong> Trả lời đúng liên tiếp 3, 6, 9 câu sẽ kích hoạt điểm thưởng cấp số nhân và mở khóa quyền ưu tiên nhận quân nhu dã chiến.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: ĐỊCH PHẢN KÍCH (DỮ LIỆU LỊCH SỬ THẬT) */}
          {activeTab === 'boss' && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 space-y-3">
                <h4 className="font-black text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  Kẻ Thù Phản Kích (Dữ Liệu Lịch Sử Thật 1975)
                </h4>
                <p className="leading-relaxed">
                  Quân đội đối phương sẽ tập trung hỏa lực phản kích dữ dội vào <strong className="text-amber-300">cánh quân đang dẫn đầu tiến độ</strong>:
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-300 pl-2 border-l-2 border-red-600">
                  <p>• <strong>Mốc 25%:</strong> Phản kích Đèo Chu Pao (Chiến dịch Tây Nguyên).</p>
                  <p>• <strong>Mốc 50%:</strong> Không kích Phước An - Nông Trại (Buôn Ma Thuột).</p>
                  <p>• <strong>Mốc 70%:</strong> Tuyến phòng thủ từ xa Phan Rang (Lá chắn thép).</p>
                  <p>• <strong>Mốc 85%:</strong> Tử chiến Cánh cửa thép Xuân Lộc (Sư đoàn 18 Lê Minh Đảo).</p>
                  <p>• <strong>Mốc 95%:</strong> Tử thủ cửa ngõ Sài Gòn (Cầu Rạch Chiếc, Cầu Đồng Nai).</p>
                </div>

                <div className="pt-2 border-t border-red-900/60 flex items-center justify-between">
                  <span className="text-slate-400">Đếm ngược 1.2s trước khi trúng pháo:</span>
                  <button
                    onClick={handleTestBossStrike}
                    className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-[11px] flex items-center gap-1.5 transition-all shadow"
                  >
                    <Play className="w-3 h-3" /> Thử Báo Động Phản Kích
                  </button>
                </div>
              </div>

              {testBossAlert && (
                <div className="p-3 rounded-xl bg-red-900 border border-red-500 text-white font-black text-center animate-bounce">
                  🚨 CẢNH BÁO ĐỎ: Sư đoàn 18 địch tại Xuân Lộc nã pháo cản đường! (Đếm ngược 1.2s!)
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHỢ QUÂN NHU DÃ CHIẾN (TACTICS DRAFT) */}
          {activeTab === 'market' && (
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-[#0d160e] border border-[#233526] space-y-3">
                <h4 className="font-black text-amber-300 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Cơ Chế Tranh Quân Nhu Tactics (Bảo Vệ Đội Nhà)
                </h4>
                <p className="leading-relaxed">
                  Vật phẩm sinh ra là để <strong className="text-emerald-400">bảo vệ và gia tăng sức mạnh cho phe ta</strong>, không dùng để hãm hại lẫn nhau:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526]">
                    <span className="font-black text-emerald-400 flex items-center gap-1">🛡️ Lá Chắn Trại Davis:</span>
                    <span className="text-[11px] text-slate-400">Chặn 100% đòn pháo kích của địch trong 12s, hóa giải hoàn toàn chấn động.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526]">
                    <span className="font-black text-amber-300 flex items-center gap-1">⚡ Mệnh Lệnh Thần Tốc:</span>
                    <span className="text-[11px] text-slate-400">Nhân đôi tốc độ tiến quân và điểm số câu tiếp theo của toàn kíp lái.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526]">
                    <span className="font-black text-blue-400 flex items-center gap-1">⛽ Xăng Dầu Trường Sơn:</span>
                    <span className="text-[11px] text-slate-400">Tiếp tế khẩn cấp: Tăng vọt +6% tiến độ và xóa ngay lập tức mọi chấn động.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141f16] border border-[#233526]">
                    <span className="font-black text-purple-400 flex items-center gap-1">🎭 Nghi Binh Tây Nguyên:</span>
                    <span className="text-[11px] text-slate-400">Tung hỏa mù nghi binh đánh lừa phi cơ trinh sát và pháo binh địch.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200">
                  ⚠️ <strong>Quy tắc độc quyền:</strong> Mỗi đội chỉ được giữ <strong>duy nhất 1 vật phẩm chưa dùng</strong>. Khi chợ mở, các đội phải nhanh tay tranh mua/nhặt đồ, ai nhặt trước người khác sẽ hết lượt!
                </div>

                <div className="pt-2 border-t border-[#1e2e21] flex items-center justify-between">
                  <span className="text-slate-400">Thử nghiệm âm thanh kích hoạt khiên:</span>
                  <button
                    onClick={handleTestShield}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-[11px] flex items-center gap-1.5 transition-all shadow"
                  >
                    <Shield className="w-3 h-3" /> Kích Hoạt Lá Chắn (Boong)
                  </button>
                </div>

                {testShieldActive && (
                  <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-300 text-center font-bold">
                    🛡️ Lá Chắn Trại Davis đã bung tỏa bảo vệ xe tăng thành công!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nút hoàn tất */}
        <div className="pt-3 border-t border-[#233526] flex items-center justify-between">
          <span className="text-xs text-slate-400">Sẵn sàng xuất kích thần tốc!</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950/60 transition-all"
          >
            Đã Nắm Rõ Mệnh Lệnh • Đóng Hướng Dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
