/**
 * THẦN TỐC 1975 - HỆ THỐNG ĐỊNH NGHĨA DỮ LIỆU (GAME TYPES)
 * Phục vụ thuyết trình Chủ đề 6 môn VNR202 (Đại học FPT)
 */

/**
 * 4 phương án lựa chọn cho câu hỏi trắc nghiệm
 */
export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

/**
 * Kiểu đáp án đúng hợp lệ
 */
export type AnswerKey = 'A' | 'B' | 'C' | 'D';

/**
 * Interface câu hỏi trắc nghiệm lịch sử được parse từ Markdown
 */
export interface Question {
  id: string | number;
  text: string;
  options: QuestionOptions;
  correctAnswer: AnswerKey;
  explanation: string;
}

/**
 * Định danh 6 đội đua tương ứng với các nhóm sinh viên trong lớp:
 * Nhóm 1, Nhóm 2, Nhóm 3, Nhóm 4, Nhóm 5, Nhóm 7
 * (Lưu ý: Nhóm 6 là Ban tổ chức / Admin Chỉ Huy Sở, không tham gia đua điểm)
 */
export type TeamId = 'team_1' | 'team_2' | 'team_3' | 'team_4' | 'team_5' | 'team_7';

/**
 * Các loại hiệu ứng tác động lên cánh quân (vật phẩm chiến thuật)
 */
export type EffectType = 'SHIELD' | 'SLOW' | 'DEBUFF' | 'SPEED_UP' | 'DOUBLE_POINTS';

export interface ActiveEffect {
  id: string;
  type: EffectType;
  name: string;
  description: string;
  appliedAt: number; // timestamp
  durationMs: number; // thời lượng hiệu lực
  expiresAt: number; // timestamp hết hạn
  sourcePlayerName?: string;
}

/**
 * Trạng thái của một Cánh quân (Đội đua) trên hành trình tiến về Sài Gòn
 */
export interface TeamState {
  id: TeamId;
  name: string; // Tên nhóm sinh viên (VD: "Nhóm 1")
  corpsName: string; // Tên cánh quân lịch sử 1975 (VD: "Quân đoàn 1 - Binh đoàn Quyết Thắng")
  axisName: string; // Hướng tiến công (VD: "Cánh quân hướng Bắc")
  color: string; // Màu nhận diện UI
  badgeIcon?: string;
  progress: number; // Tiến độ tiến quân: 0% -> 100% (cắm cờ Dinh Độc Lập)
  totalScore: number; // Tổng điểm tích lũy của toàn đội
  memberCount: number; // Số lượng chiến sĩ đang online
  activeEffects: ActiveEffect[]; // Các hiệu ứng đang tác động (Shield, Slow, Debuff...)
}

/**
 * Vật phẩm chiến thuật (Boost Items) sinh viên có thể nhận khi duy trì chuỗi Streak
 */
export interface BoostItem {
  id: string;
  type: EffectType;
  name: string;
  description: string;
  icon: string;
  acquiredAt: number;
}

/**
 * Trạng thái của từng cá nhân người chơi (Chiến sĩ)
 */
export interface PlayerState {
  id: string;
  name: string;
  studentCode?: string; // MSSV (tùy chọn)
  teamId: TeamId;
  score: number; // Điểm số cá nhân
  currentStreak: number; // Chuỗi trả lời đúng liên tiếp hiện tại
  maxStreak: number; // Kỷ lục chuỗi đúng dài nhất trận đấu
  correctCount: number; // Tổng số câu trả lời đúng
  totalAnswered: number; // Tổng số câu đã trả lời
  inventory: BoostItem[]; // Danh sách vật phẩm chiến thuật đang sở hữu
  lastAnswerTime?: number; // Thời điểm trả lời câu gần nhất (để tính tốc độ)
}

/**
 * Cột mốc lịch sử tương ứng với tiến độ tiến quân (0% -> 100%)
 */
export interface HistoricalMilestone {
  percentage: number; // 0, 25, 50, 75, 100
  title: string;
  description: string;
  historicalEvent: string;
}

/**
 * Đại diện MVP của một đội bại trận (SVP - Second/Support Valuable Player)
 */
export interface TeamMvpInfo {
  teamId: TeamId;
  teamName: string;
  corpsName: string;
  mvp: PlayerState | null;
}

/**
 * Cấu trúc dữ liệu thống kê bảng vàng vinh danh cuối trận đấu
 */
export interface GameSummaryStats {
  winningTeam: TeamState | null; // Cánh quân cắm cờ đầu tiên tại Dinh Độc Lập
  winningTeamMvp: PlayerState | null; // Chiến sĩ xuất sắc nhất đội vô địch (MVP Trận Đấu)
  losingTeamsMvps: TeamMvpInfo[]; // Chiến sĩ kiên cường nhất của từng cánh quân còn lại (SVP mỗi đội)
  topStreakPlayers: PlayerState[]; // Top chiến sĩ có chuỗi đúng dài nhất (Thần Tốc Bách Phát Bách Trúng)
  topScorePlayers: PlayerState[]; // Top chiến sĩ có điểm cá nhân cao nhất toàn mặt trận
}
