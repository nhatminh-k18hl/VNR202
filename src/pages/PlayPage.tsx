import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flame, 
  Shield, 
  Zap, 
  Award, 
  User, 
  CheckCircle, 
  Clock, 
  Flag,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { PlayerState, Question, TeamId } from '../types/game';
import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { fetchAndParseQuestions } from '../utils/markdownParser';

export const PlayPage: React.FC = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>('team_1');
  const [playerName, setPlayerName] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);

  // Dữ liệu câu hỏi demo cho người chơi
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);

  // State người chơi
  const [playerState, setPlayerState] = useState<PlayerState>({
    id: 'player_demo_1',
    name: 'Chiến sĩ Giải phóng',
    teamId: 'team_1',
    score: 0,
    currentStreak: 0,
    maxStreak: 0,
    correctCount: 0,
    totalAnswered: 0,
    inventory: [
      {
        id: 'boost_shield',
        type: 'SHIELD',
        name: 'Khiên Phòng Thủ',
        description: 'Bảo vệ cánh quân khỏi đòn Slow hoặc Debuff của đối phương',
        icon: 'Shield',
        acquiredAt: Date.now(),
      },
      {
        id: 'boost_speed',
        type: 'SPEED_UP',
        name: 'Hành Quân Thần Tốc',
        description: 'Tăng 1.5x tốc độ hành tiến trong 2 câu tiếp theo',
        icon: 'Zap',
        acquiredAt: Date.now(),
      }
    ],
  });

  useEffect(() => {
    fetchAndParseQuestions('./questions.md')
      .then((qs) => {
        if (qs.length > 0) setQuestions(qs);
      })
      .catch((err) => console.warn('Không thể nạp questions.md trong PlayPage:', err));
  }, []);

  const selectedTeam = INITIAL_TEAMS_CONFIG.find((t) => t.id === selectedTeamId) || INITIAL_TEAMS_CONFIG[0];

  const handleJoinBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setPlayerState((prev) => ({
      ...prev,
      name: playerName.trim(),
      studentCode: studentCode.trim() || undefined,
      teamId: selectedTeamId,
    }));
    setIsJoined(true);
  };

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (hasAnswered) return;
    setSelectedAnswer(key);
    setHasAnswered(true);

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = currentQ && currentQ.correctAnswer === key;

    setPlayerState((prev) => {
      const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const points = isCorrect ? 100 + (prev.currentStreak * 20) : 0;

      return {
        ...prev,
        score: prev.score + points,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        totalAnswered: prev.totalAnswered + 1,
      };
    });
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % (questions.length || 1));
  };

  const activeQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Thanh điều hướng quay lại */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
        </Link>
        <span className="text-xs px-3 py-1 rounded-full bg-military-card border border-military-border text-vietnam-yellow font-medium">
          Mặt Trận Người Chơi • Chế Độ Trải Nghiệm Mẫu
        </span>
      </div>

      {!isJoined ? (
        /* MÀN HÌNH ĐĂNG KÝ VÀ CHỌN CÁNH QUÂN */
        <div className="bg-military-surface/90 border border-military-border rounded-2xl p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2 border-b border-military-border pb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-vietnam-yellow bg-vietnam-red/20 px-3 py-1 rounded-full border border-vietnam-red/40">
              Chiến Dịch Hồ Chí Minh 1975
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              Ghi Danh Xuất Kích - Chọn Cánh Quân Của Bạn
            </h1>
            <p className="text-sm text-slate-300">
              Vui lòng chọn Nhóm của bạn trong lớp và nhập họ tên để cùng toàn đội thi đua giải phóng Sài Gòn.
            </p>
          </div>

          <form onSubmit={handleJoinBattle} className="space-y-6">
            {/* Lựa chọn 6 Cánh quân */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-200">
                1. Chọn Cánh Quân / Nhóm Thi Đua Của Bạn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {INITIAL_TEAMS_CONFIG.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      type="button"
                      key={team.id}
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-military-card border-vietnam-yellow ring-2 ring-vietnam-yellow/40 shadow-lg'
                          : 'bg-military-dark/70 border-military-border hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-base">{team.name}</span>
                        {isSelected && <CheckCircle className="w-5 h-5 text-vietnam-yellow" />}
                      </div>
                      <p className="text-xs font-semibold text-slate-300 mt-1">{team.corpsName}</p>
                      <span 
                        className="inline-block text-[10px] font-bold mt-2 px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${team.color}20`, color: team.color }}
                      >
                        {team.axisName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhập Tên và MSSV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Họ và Tên Chiến Sĩ: <span className="text-vietnam-red">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full bg-military-dark border border-military-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vietnam-yellow focus:ring-1 focus:ring-vietnam-yellow"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  Mã Số Sinh Viên (MSSV):
                </label>
                <input
                  type="text"
                  placeholder="VD: SE123456 (Không bắt buộc)"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full bg-military-dark border border-military-border rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-vietnam-yellow focus:ring-1 focus:ring-vietnam-yellow"
                />
              </div>
            </div>

            {/* Nút Gia Nhập */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-vietnam-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-extrabold text-base tracking-wide uppercase shadow-lg shadow-red-900/30 hover:shadow-red-800/50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-vietnam-yellow" />
              Sẵn Sàng Xuất Kích Cùng {selectedTeam.name}
            </button>
          </form>
        </div>
      ) : (
        /* MÀN HÌNH CHIẾN ĐẤU CỦA CHIẾN SĨ */
        <div className="space-y-6">
          {/* Thông tin Dashboard cá nhân & Đội đua */}
          <div className="bg-military-surface/90 border border-military-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg border"
                style={{ backgroundColor: `${selectedTeam.color}30`, borderColor: selectedTeam.color }}
              >
                {selectedTeam.name.replace('Nhóm ', 'N')}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  {playerState.name}
                  <span className="text-xs font-normal text-slate-400">({selectedTeam.corpsName})</span>
                </h3>
                <span className="text-xs text-vietnam-yellow font-medium">
                  {selectedTeam.axisName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center">
              <div className="px-3 py-1.5 rounded-xl bg-military-dark border border-military-border">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Điểm số</span>
                <span className="text-lg font-black text-vietnam-yellow">{playerState.score}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-military-dark border border-military-border">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 fill-orange-400" /> Streak
                </span>
                <span className="text-lg font-black text-orange-400">{playerState.currentStreak}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-military-dark border border-military-border">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Kỷ lục</span>
                <span className="text-lg font-black text-emerald-400">{playerState.maxStreak}</span>
              </div>
            </div>
          </div>

          {/* Hộp túi đồ vật phẩm Boost (Inventory) */}
          <div className="p-4 rounded-xl bg-military-dark/80 border border-military-border space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-vietnam-gold" /> Kho Quân Tư Trang (Vật phẩm Boost)
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {playerState.inventory.map((item) => (
                <div 
                  key={item.id}
                  className="px-3 py-2 rounded-lg bg-military-card border border-military-border text-xs flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-vietnam-yellow animate-ping"></span>
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-slate-400 text-[11px]">- {item.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* GIAO DIỆN TRẢ LỜI CÂU HỎI TRẮC NGHIỆM */}
          {activeQuestion ? (
            <div className="bg-military-surface/90 border border-military-border rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-military-border pb-4">
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded bg-vietnam-red/20 text-vietnam-yellow border border-vietnam-red/40">
                  Câu hỏi #{activeQuestion.id} (Thử nghiệm)
                </span>
                <span className="text-xs text-slate-400">
                  Tổng {questions.length} câu hỏi đã nạp từ Markdown
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {activeQuestion.text}
              </h2>

              {/* 4 Phương án A, B, C, D */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isSelected = selectedAnswer === key;
                  const isCorrect = activeQuestion.correctAnswer === key;

                  let buttonStyle = 'bg-military-dark/80 border-military-border text-slate-200 hover:border-vietnam-yellow/60';
                  if (hasAnswered) {
                    if (isCorrect) {
                      buttonStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      buttonStyle = 'bg-red-950/70 border-red-500 text-red-200';
                    } else {
                      buttonStyle = 'opacity-50 bg-military-dark/40 border-slate-800 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={hasAnswered}
                      className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${buttonStyle}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        hasAnswered && isCorrect 
                          ? 'bg-emerald-600 text-white' 
                          : isSelected 
                            ? 'bg-vietnam-red text-white' 
                            : 'bg-slate-800 text-slate-300'
                      }`}>
                        {key}
                      </span>
                      <span className="text-sm leading-snug flex-1">{activeQuestion.options[key]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Khi đã trả lời xong */}
              {hasAnswered && (
                <div className="space-y-4 pt-2">
                  <div className={`p-4 rounded-xl border text-sm ${
                    selectedAnswer === activeQuestion.correctAnswer
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                      : 'bg-red-950/40 border-red-700/60 text-red-200'
                  }`}>
                    <p className="font-bold flex items-center gap-2">
                      {selectedAnswer === activeQuestion.correctAnswer 
                        ? '🎉 Chính xác! Bạn nhận được điểm và gia tăng chuỗi Streak.' 
                        : '❌ Chưa chính xác! Chuỗi Streak trở về 0.'}
                    </p>
                    {activeQuestion.explanation && (
                      <p className="text-xs mt-2 text-slate-300 border-t border-slate-700/60 pt-2">
                        <strong className="text-vietnam-yellow">Ý nghĩa lịch sử:</strong> {activeQuestion.explanation}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700"
                  >
                    Chuyển Sang Câu Tiếp Theo →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-military-surface/90 border border-military-border rounded-2xl">
              Đang tải danh sách câu hỏi từ hệ thống...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
