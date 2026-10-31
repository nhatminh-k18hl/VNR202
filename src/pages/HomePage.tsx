import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Swords, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Flame, 
  Flag, 
  Users, 
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { Question } from '../types/game';
import { fetchAndParseQuestions } from '../utils/markdownParser';
import { HISTORICAL_MILESTONES, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';

export const HomePage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | number | null>(1);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Sử dụng đường dẫn tương đối ./questions.md để tương thích hoàn toàn với GitHub Pages
      const loaded = await fetchAndParseQuestions('./questions.md');
      setQuestions(loaded);
    } catch (err: any) {
      setError(err?.message || 'Không thể đọc file questions.md');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Banner mang hào khí lịch sử 1975 */}
      <section className="text-center space-y-4 pt-4 pb-6 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vietnam-red/20 border border-vietnam-red/40 text-vietnam-yellow text-sm font-semibold tracking-wide">
          <Sparkles className="w-4 h-4 text-vietnam-gold animate-pulse" />
          <span>VNR202 - Lịch Sử Đảng Cộng Sản Việt Nam • Chủ Đề 6</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-md">
          <span className="text-vietnam-yellow">Thần Tốc</span>{' '}
          <span className="text-vietnam-red">1975</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium">
          Hệ thống Web Game Trắc nghiệm Tương tác Thời gian thực mô phỏng 5 Cánh quân thần tốc
          tiến về giải phóng Sài Gòn, cắm cờ toàn thắng tại Dinh Độc Lập trưa ngày 30/4/1975.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs md:text-sm text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> React 18 + Vite + TS
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Tailwind CSS
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-vietnam-gold"></span> GitHub Pages Ready (`base: './'`)
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Firebase Realtime Hub
          </span>
        </div>
      </section>

      {/* LỰA CHỌN VAI TRÒ - 2 CỔNG ĐIỀU HƯỚNG CHÍNH */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Cổng 1: Chiến trường Người chơi */}
        <Link 
          to="/play"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-military-card to-slate-900 p-8 border border-military-border hover:border-vietnam-yellow/60 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-vietnam-gold/5 rounded-full blur-2xl group-hover:bg-vietnam-gold/15 transition-all"></div>
          
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-xl bg-vietnam-yellow/10 border border-vietnam-yellow/30 flex items-center justify-center text-vietnam-yellow group-hover:scale-110 transition-transform">
              <Swords className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Dành cho Sinh viên
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <h2 className="text-2xl font-bold text-white group-hover:text-vietnam-yellow transition-colors flex items-center gap-2">
              Vào Chiến Trường
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-sm text-slate-300">
              Nhập vai chiến sĩ giải phóng quân thuộc 6 Cánh quân (Nhóm 1, 2, 3, 4, 5 và 7). Trả lời trắc nghiệm, duy trì chuỗi Streak, nhận vật phẩm và đẩy nhanh tiến độ cắm cờ Dinh Độc Lập!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>6 Cánh quân thi đua</span>
            <span className="text-vietnam-yellow font-medium">Bấm để tham chiến →</span>
          </div>
        </Link>

        {/* Cổng 2: Chỉ Huy Sở Admin */}
        <Link 
          to="/admin"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-military-surface p-8 border border-military-border hover:border-vietnam-red/70 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-vietnam-red/10 rounded-full blur-2xl group-hover:bg-vietnam-red/20 transition-all"></div>
          
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-xl bg-vietnam-red/20 border border-vietnam-red/40 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Dành cho Admin Nhóm 6
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <h2 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
              Chỉ Huy Sở Mặt Trận
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-sm text-slate-300">
              Bộ Chỉ huy Chiến dịch Hồ Chí Minh: Điều phối nhịp độ câu hỏi, quản lý bảng xếp hạng thời gian thực, kích hoạt hiệu ứng vật phẩm và tính toán bảng vinh danh MVP/SVP cuối trận.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Xác thực: admin_nhom6 / 30041975</span>
            <span className="text-red-400 font-medium">Đăng nhập Quản trị →</span>
          </div>
        </Link>
      </section>

      {/* TIỆN ÍCH KIỂM TRA BỘ ĐỌC MARKDOWN VÀ DỮ LIỆU CÂU HỎI MẪU */}
      <section className="bg-military-surface/90 border border-military-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-military-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-vietnam-yellow" />
              <h2 className="text-xl font-bold text-white">Kiểm Tra Bộ Đọc File Markdown (`public/questions.md`)</h2>
            </div>
            <p className="text-sm text-slate-400">
              Tự động thực hiện <code className="text-vietnam-yellow bg-slate-900 px-1.5 py-0.5 rounded">fetch('./questions.md')</code> và phân tích cú pháp trắc nghiệm lịch sử.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang đọc file...
              </span>
            ) : error ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Lỗi đọc file
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> {questions.length} câu hỏi đã nạp thành công
              </span>
            )}

            <button
              onClick={loadQuestions}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Tải lại questions.md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Không thể nạp file câu hỏi từ đường dẫn public:</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Danh sách câu hỏi mẫu được nạp */}
        {!loading && questions.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Xem thử 5 câu hỏi mẫu về Chủ đề 6 (Nhấp vào câu để xem đáp án đúng & giải thích):
            </p>
            <div className="space-y-3">
              {questions.map((q) => {
                const isExpanded = expandedQuestionId === q.id;
                return (
                  <div
                    key={q.id}
                    className="border border-military-border/80 rounded-xl bg-military-dark/60 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="w-full text-left p-4 flex items-start justify-between gap-4 hover:bg-military-card/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-vietnam-red/20 text-vietnam-yellow border border-vietnam-red/40 flex items-center justify-center font-bold text-xs">
                          {q.id}
                        </span>
                        <span className="font-semibold text-sm text-slate-200">{q.text}</span>
                      </div>
                      <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800 flex-shrink-0">
                        {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {(['A', 'B', 'C', 'D'] as const).map((key) => {
                            const isCorrect = q.correctAnswer === key;
                            return (
                              <div
                                key={key}
                                className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {key}
                                </span>
                                <span className="flex-1">{q.options[key]}</span>
                                {isCorrect && (
                                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                                    Đáp án đúng
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                            <span className="font-bold text-vietnam-gold flex-shrink-0">💡 Giải thích:</span>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* DANH SÁCH 6 CÁNH QUÂN LỊCH SỬ THAM GIA ĐUA */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-vietnam-yellow" />
          <h2 className="text-xl font-bold text-white">6 Cánh Quân Lịch Sử (Tương ứng 6 Nhóm Đua trong Lớp)</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_TEAMS_CONFIG.map((team) => (
            <div
              key={team.id}
              className="p-4 rounded-xl border border-military-border bg-military-surface/60 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">{team.name}</span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{ backgroundColor: `${team.color}25`, color: team.color, border: `1px solid ${team.color}40` }}
                  >
                    {team.axisName}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">{team.corpsName}</h3>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Tiến độ ban đầu: 0%</span>
                <span className="text-emerald-400 font-medium">Sẵn sàng xuất kích</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 CỘT MỐC LỊCH SỬ TIẾN QUÂN (0% -> 100%) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-vietnam-red" />
          <h2 className="text-xl font-bold text-white">5 Cột Mốc Lịch Sử Tiến Độ Chiến Dịch</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {HISTORICAL_MILESTONES.map((milestone) => (
            <div
              key={milestone.percentage}
              className="p-3.5 rounded-xl border border-military-border bg-military-dark/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-black text-vietnam-yellow bg-vietnam-red/30 px-2 py-0.5 rounded border border-vietnam-red/40">
                  {milestone.percentage}% TIẾN ĐỘ
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{milestone.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-3">{milestone.description}</p>
              </div>
              <p className="text-[11px] text-amber-300/80 italic pt-2 border-t border-slate-800">
                {milestone.historicalEvent}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
