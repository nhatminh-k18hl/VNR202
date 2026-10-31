import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldAlert, 
  FileUp, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Flame, 
  Users, 
  Activity, 
  Lock,
  LogOut
} from 'lucide-react';
import { ADMIN_CONFIG, INITIAL_TEAMS_CONFIG, verifyAdminCredentials } from '../config/adminAuth';
import { GameSummaryStats, PlayerState, Question, TeamState } from '../types/game';
import { fetchAndParseQuestions, parseQuestionsMarkdown } from '../utils/markdownParser';
import { calculateGameSummaryStats } from '../utils/statsCalculator';

export const AdminPage: React.FC = () => {
  // Trạng thái đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('admin_nhom6');
  const [passwordInput, setPasswordInput] = useState<string>('30041975');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Quản lý câu hỏi
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Trạng thái mô phỏng chiến trường & thống kê
  const [teams, setTeams] = useState<TeamState[]>(INITIAL_TEAMS_CONFIG);
  const [summaryStats, setSummaryStats] = useState<GameSummaryStats | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Load questions khi đăng nhập thành công
  const loadPublicQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const loaded = await fetchAndParseQuestions('./questions.md');
      setQuestions(loaded);
      setNotification(`Đã tải thành công ${loaded.length} câu hỏi từ ./questions.md`);
    } catch (err: any) {
      setNotification(`Lỗi nạp questions.md: ${err?.message}`);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPublicQuestions();
    }
  }, [isAuthenticated]);

  // Xử lý nạp file Markdown cục bộ từ máy tính
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseQuestionsMarkdown(text);
        if (parsed.length > 0) {
          setQuestions(parsed);
          setNotification(`Nạp thành công ${parsed.length} câu hỏi từ file "${file.name}"`);
        } else {
          setNotification(`Cảnh báo: Không tìm thấy câu hỏi hợp lệ trong file "${file.name}"`);
        }
      } catch (err: any) {
        setNotification(`Lỗi đọc file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(usernameInput, passwordInput)) {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Tên đăng nhập hoặc Mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Chạy thử nghiệm tính toán MVP / SVP / Top Streak từ dữ liệu mô phỏng
  const handleRunStatsSimulation = () => {
    // Tạo danh sách người chơi giả lập cho 6 đội để kiểm tra thuật toán statsCalculator
    const mockPlayers: PlayerState[] = [
      { id: 'p1', name: 'Nguyễn Văn Toàn', teamId: 'team_1', score: 850, currentStreak: 6, maxStreak: 8, correctCount: 9, totalAnswered: 10, inventory: [] },
      { id: 'p2', name: 'Trần Thị Mai', teamId: 'team_1', score: 620, currentStreak: 3, maxStreak: 4, correctCount: 7, totalAnswered: 10, inventory: [] },
      { id: 'p3', name: 'Lê Hoàng Nam', teamId: 'team_2', score: 920, currentStreak: 8, maxStreak: 9, correctCount: 10, totalAnswered: 10, inventory: [] },
      { id: 'p4', name: 'Phạm Thu Trang', teamId: 'team_2', score: 450, currentStreak: 2, maxStreak: 3, correctCount: 5, totalAnswered: 10, inventory: [] },
      { id: 'p5', name: 'Đỗ Minh Quân', teamId: 'team_3', score: 780, currentStreak: 5, maxStreak: 7, correctCount: 8, totalAnswered: 10, inventory: [] },
      { id: 'p6', name: 'Vũ Thanh Hằng', teamId: 'team_4', score: 690, currentStreak: 4, maxStreak: 5, correctCount: 7, totalAnswered: 10, inventory: [] },
      { id: 'p7', name: 'Bùi Gia Bảo', teamId: 'team_5', score: 710, currentStreak: 5, maxStreak: 6, correctCount: 8, totalAnswered: 10, inventory: [] },
      { id: 'p8', name: 'Ngô Hải Yến', teamId: 'team_7', score: 880, currentStreak: 7, maxStreak: 8, correctCount: 9, totalAnswered: 10, inventory: [] },
    ];

    // Cập nhật tiến độ mẫu cho các đội
    const updatedTeams: TeamState[] = teams.map((team) => {
      if (team.id === 'team_2') return { ...team, progress: 100, totalScore: 1370 };
      if (team.id === 'team_7') return { ...team, progress: 85, totalScore: 880 };
      if (team.id === 'team_1') return { ...team, progress: 80, totalScore: 1470 };
      return { ...team, progress: 60, totalScore: 700 };
    });

    setTeams(updatedTeams);

    // Tính toán bằng statsCalculator
    const stats = calculateGameSummaryStats(mockPlayers, updatedTeams, 'team_2');
    setSummaryStats(stats);
    setShowStatsModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-military-border pb-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-vietnam-red/20 text-red-300 border border-vietnam-red/40 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-vietnam-red" />
            {ADMIN_CONFIG.roleName}
          </span>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        /* FORM ĐĂNG NHẬP ADMIN CHỈ HUY SỞ */
        <div className="max-w-md mx-auto bg-military-surface border border-military-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-vietnam-red/20 border border-vietnam-red/40 text-red-400 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Chỉ Huy Sở - Đăng Nhập</h1>
            <p className="text-xs text-slate-300">
              Khu vực dành riêng cho Ban Tổ Chức (Nhóm 6 - VNR202) để quản trị nhịp độ trận đấu và câu hỏi.
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Tên đăng nhập:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-military-dark border border-military-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vietnam-red focus:ring-1 focus:ring-vietnam-red"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mật khẩu:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-military-dark border border-military-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-vietnam-red focus:ring-1 focus:ring-vietnam-red"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-vietnam-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-900/30"
            >
              Mở Khóa Chỉ Huy Sở
            </button>
          </form>

          {/* Gợi ý thông tin đăng nhập mẫu */}
          <div className="pt-4 border-t border-military-border/80 text-xs text-slate-400 space-y-1 bg-military-dark/50 p-3 rounded-xl">
            <p className="font-semibold text-slate-300">Thông tin đăng nhập mặc định (.env):</p>
            <p>• Tài khoản: <code className="text-vietnam-yellow">admin_nhom6</code></p>
            <p>• Mật khẩu: <code className="text-vietnam-yellow">30041975</code></p>
          </div>
        </div>
      ) : (
        /* GIAO DIỆN QUẢN TRỊ CHỈ HUY SỞ */
        <div className="space-y-8">
          {/* Action Toolbar */}
          <div className="bg-military-surface border border-military-border rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-vietnam-red" />
                  Trung Tâm Điều Hành Chiến Dịch
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quản lý ngân hàng câu hỏi Markdown, kích hoạt hiệu ứng trận đấu và giám sát 6 cánh quân.
                </p>
              </div>

              {/* Các nút hành động chính */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Nút test tải questions.md */}
                <button
                  onClick={loadPublicQuestions}
                  disabled={loadingQuestions}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
                  Tải lại public/questions.md
                </button>

                {/* Nút nạp file Markdown từ máy */}
                <label className="px-3.5 py-2 rounded-xl bg-military-card hover:bg-military-border text-vietnam-yellow text-xs font-semibold flex items-center gap-2 border border-vietnam-yellow/30 cursor-pointer transition-colors">
                  <FileUp className="w-3.5 h-3.5" />
                  Nạp file .md từ máy tính
                  <input
                    type="file"
                    accept=".md,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Nút test tính toán thống kê MVP */}
                <button
                  onClick={handleRunStatsSimulation}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Mô phỏng Tính Thống Kê & MVP
                </button>
              </div>
            </div>

            {/* Banner thông báo trạng thái */}
            {notification && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{notification}</span>
              </div>
            )}
          </div>

          {/* BẢNG GIÁM SÁT 6 CÁNH QUÂN THỜI GIAN THỰC */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-vietnam-yellow" />
                Trạng Thái 6 Cánh Quân (Nhóm 1, 2, 3, 4, 5, 7)
              </h3>
              <span className="text-xs text-slate-400">
                Tiến độ: 0% → 100% (Cắm cờ Dinh Độc Lập)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-military-surface border border-military-border rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{team.name}</span>
                      <p className="text-xs text-slate-400">{team.corpsName}</p>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${team.color}20`, color: team.color }}
                    >
                      {team.progress}%
                    </span>
                  </div>

                  {/* Thanh tiến độ */}
                  <div className="w-full bg-military-dark rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${team.progress}%`, backgroundColor: team.color }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Tổng điểm: <strong className="text-white">{team.totalScore}</strong></span>
                    <span>Chiến sĩ: <strong className="text-white">{team.memberCount}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUẢN LÝ DANH SÁCH CÂU HỎI ĐÃ NẠP */}
          <div className="bg-military-surface border border-military-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-military-border pb-3">
              <h3 className="text-lg font-bold text-white">
                Ngân Hàng Câu Hỏi Trắc Nghiệm ({questions.length} câu)
              </h3>
              <span className="text-xs text-vietnam-yellow bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Cú pháp: # Câu X, - [x], > Giải thích
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-military-dark/80 border border-military-border space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-200">
                      <span className="text-vietnam-yellow font-bold mr-2">Câu {q.id}:</span>
                      {q.text}
                    </p>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex-shrink-0">
                      Đáp án: {q.correctAnswer}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <div 
                        key={opt}
                        className={`p-1.5 rounded ${
                          q.correctAnswer === opt ? 'bg-emerald-900/30 text-emerald-300 font-medium' : ''
                        }`}
                      >
                        <strong>{opt}.</strong> {q.options[opt]}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <p className="text-[11px] text-amber-300/80 italic border-t border-slate-800 pt-1">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL MÔ PHỎNG KẾT QUẢ THỐNG KÊ MVP / SVP */}
      {showStatsModal && summaryStats && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-military-surface border border-military-border rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-military-border pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-vietnam-gold" />
                <h3 className="text-xl font-black text-white">
                  Bảng Vàng Vinh Danh Toàn Thắng (Mô Phỏng statsCalculator)
                </h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Đội Vô Địch & MVP */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-vietnam-red/30 to-amber-950/40 border border-vietnam-red/50 space-y-2">
              <span className="text-xs font-black uppercase text-vietnam-yellow">
                🏆 Cánh Quân Cắm Cờ Dinh Độc Lập (Đội Chiến Thắng):
              </span>
              <h4 className="text-lg font-black text-white">
                {summaryStats.winningTeam?.name} - {summaryStats.winningTeam?.corpsName}
              </h4>
              {summaryStats.winningTeamMvp && (
                <div className="p-3 rounded-lg bg-military-dark/80 border border-amber-500/40 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-vietnam-gold block">🎖️ MVP Trận Đấu (Chiến sĩ xuất sắc nhất):</span>
                    <span className="text-sm font-extrabold text-white">{summaryStats.winningTeamMvp.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-vietnam-yellow font-bold text-sm">{summaryStats.winningTeamMvp.score} Điểm</span>
                    <span className="text-slate-400 block text-[11px]">Streak Kỷ lục: {summaryStats.winningTeamMvp.maxStreak}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SVP của từng đội thua */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-300">
                ⭐ Chiến Sĩ Kiên Cường Nhất Của Từng Đội Còn Lại (SVP):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {summaryStats.losingTeamsMvps.map((info) => (
                  <div key={info.teamId} className="p-2.5 rounded-lg bg-military-dark border border-slate-800">
                    <span className="text-slate-400 font-semibold block">{info.teamName} ({info.corpsName})</span>
                    <span className="font-bold text-white text-sm">
                      {info.mvp ? `${info.mvp.name} - ${info.mvp.score}đ` : 'Chưa có chiến sĩ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Streak */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> Top Chiến Sĩ Bách Phát Bách Trúng (Top Streak):
              </h4>
              <div className="space-y-1.5 text-xs">
                {summaryStats.topStreakPlayers.slice(0, 3).map((p, idx) => (
                  <div key={p.id} className="p-2 rounded bg-military-dark flex items-center justify-between border border-slate-800">
                    <span>
                      <strong className="text-vietnam-yellow mr-2">#{idx + 1}</strong>
                      {p.name}
                    </span>
                    <span className="font-bold text-orange-400">{p.maxStreak} câu liên tiếp</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Đóng Bảng Vinh Danh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
