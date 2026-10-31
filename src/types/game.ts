/**
 * THẦN TỐC 1975 - HỆ THỐNG ĐỊNH NGHĨA DỮ LIỆU ĐẦY ĐỦ (GAME TYPES)
 * Phục vụ thuyết trình Chủ đề 6 môn VNR202 (Đại học FPT)
 */

export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

export type AnswerKey = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string | number;
  text: string;
  options: QuestionOptions;
  correctAnswer: AnswerKey;
  explanation: string;
}

/**
 * 6 Đội đua tham gia chiến dịch
 */
export type TeamId = 'team_1' | 'team_2' | 'team_3' | 'team_4' | 'team_5' | 'team_7';

/**
 * 5 Loại Vật phẩm Chiến thuật (Tactical Items)
 */
export type ItemType =
  | 'SPEED_ORDER'       // ⚡ Mệnh lệnh Thần tốc (x2 điểm & x2 tiến độ câu tiếp)
  | 'TRUONG_SON_PIPE'   // ⛽ Đường ống Trường Sơn (+6% tiến độ tức thì)
  | 'PLEIKU_DECEPTION'  // 🎭 Nghi binh Pleiku (Làm rung/nhiễu đội dẫn đầu trong 6s)
  | 'ROUTE_7_BLOCK'     // 🚧 Chặn đường số 7 (Làm chậm 50% đội mục tiêu trong 8s)
  | 'DAVIS_SHIELD';     // 🛡️ Lá chắn Trại Davis (Miễn nhiễm tấn công trong 10s)

export interface BoostItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
  acquiredAt: number;
}

export interface ActiveEffect {
  id: string;
  type: ItemType;
  name: string;
  appliedAt: number;
  expiresAt: number;
  targetTeamId: TeamId;
  sourceTeamId: TeamId;
  sourcePlayerName: string;
}

export interface TeamState {
  id: TeamId;
  name: string;          // Tên nhóm sinh viên (VD: "Nhóm 1")
  corpsName: string;      // Tên cánh quân lịch sử 1975
  axisName: string;       // Hướng tiến công lịch sử
  tankNumber: string;     // Số hiệu xe tăng tiêu biểu (390, 843,...)
  color: string;          // Màu nhận diện trên sa bàn
  progress: number;       // Tiến độ tiến quân: 0% -> 100%
  totalScore: number;     // Tổng điểm tích lũy toàn đội
  memberCount: number;    // Số chiến sĩ tham gia
  activeEffects: ActiveEffect[]; // Các hiệu ứng đang tác động lên xe tăng
}

export interface PlayerState {
  id: string;
  name: string;
  studentCode?: string;
  teamId: TeamId;
  score: number;
  currentStreak: number;
  maxStreak: number;
  correctCount: number;
  totalAnswered: number;
  inventory: BoostItem[];
  isSpeedBoostActive?: boolean; // Cờ hiệu x2 câu tiếp
  isBot?: boolean;
}

export interface HistoricalMilestone {
  percentage: number; // 0, 25, 50, 75, 100
  title: string;
  subTitle: string;
  historicalEvent: string;
}

export type GamePhase = 'WAITING' | 'BATTLE' | 'PAUSED' | 'FINISHED';

export interface RoomState {
  phase: GamePhase;
  startedAt?: number;
  finishedAt?: number;
  winnerTeamId?: TeamId | null;
  firebaseDbUrl?: string;
  isBotActive: boolean;
  currentQuestionId?: string | number;
}

export interface LiveBattleEvent {
  id: string;
  timestamp: number;
  message: string;
  type: 'boost' | 'attack' | 'progress' | 'streak' | 'finish' | 'info';
  teamId?: TeamId;
  playerName?: string;
}

export interface TeamMvpInfo {
  teamId: TeamId;
  teamName: string;
  corpsName: string;
  mvp: PlayerState | null;
}

export interface GameSummaryStats {
  winningTeam: TeamState | null;
  winningTeamMvp: PlayerState | null;
  losingTeamsMvps: TeamMvpInfo[];
  topStreakPlayers: PlayerState[];
  topScorePlayers: PlayerState[];
  teamRankings: TeamState[];
}
