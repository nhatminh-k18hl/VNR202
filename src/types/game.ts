/**
 * THẦN TỐC 1975 - HỆ THỐNG ĐỊNH NGHĨA DỮ LIỆU ĐẦY ĐỦ (GAME TYPES)
 * Thiết kế theo cơ chế Co-op Kíp Lái Xe Tăng & PvE Địch Phản Kích Lịch Sử
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
 * 6 Đội đua tham gia chiến dịch (5 Cánh quân + Cánh quân thứ 6)
 */
export type TeamId = 'team_1' | 'team_2' | 'team_3' | 'team_4' | 'team_5' | 'team_7';

/**
 * Các vị trí trong kíp lái xe tăng (Co-op Tank Crew Role)
 */
export type CrewRole = 'COMMANDER' | 'GUNNER' | 'DRIVER' | 'LOADER' | 'RADIO';

export interface CrewRoleInfo {
  role: CrewRole;
  title: string;
  badge: string;
  description: string;
}

/**
 * Danh mục Vật phẩm Chiến thuật (Tactical Items - Thiên về Hỗ trợ & Phòng ngự Kíp Lái)
 */
export type ItemType =
  | 'DAVIS_SHIELD'            // 🛡️ Lá chắn Trại Davis (Đỡ 1 đòn pháo kích của địch)
  | 'TRUONG_SON_LOGISTICS'    // ⛽ Tiếp viện Trường Sơn (+5% tiến độ thần tốc)
  | 'RAPID_DISPATCH'          // ⚡ Mệnh lệnh Thần tốc (x2 điểm câu tiếp, nhưng sai bị phạt -10%)
  | 'SMOKE_SCREEN'            // 💨 Màn khói ngụy trang (Hóa giải choáng ngợp & miễn nhiễm 5s)
  | 'EASTER_COMMUNICATION_CODE' // 📻 [Easter Egg] Bản Mật Mã Cơ Yếu (Loại bỏ 2 đáp án sai)
  | 'EASTER_VICTORY_BANNER';   // 🚩 [Easter Egg] Cờ Quyết Chiến Quyết Thắng (+100đ toàn đội)

export interface BoostItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
  isEasterEgg?: boolean;
  acquiredAt: number;
}

/**
 * Hòm Tiếp Viện Dã Chiến (Supply Draft Pool - Cơ chế Giành Đồ / Trưng dụng chiến thuật)
 */
export interface SupplyDraftItem {
  id: string;
  item: BoostItem;
  createdAt: number;
  expiresAt: number;
  claimedByTeamId?: TeamId;
  claimedByPlayerName?: string;
}

/**
 * Sự kiện Địch Phản Kích (PvE Historical Counter-Attack Target)
 */
export interface EnemyCounterAttack {
  id: string;
  eventName: string;         // Tên sự kiện lịch sử có thật (VD: "Phòng tuyến thép Xuân Lộc phản kích")
  historicalDetail: string;  // Chi tiết lịch sử chân thực
  targetTeamId: TeamId;      // Mục tiêu: Luôn ngắm vào đội dẫn đầu
  targetTeamName: string;
  countdownSeconds: number;  // 3s -> 2s -> 1s cảnh báo trước khi trúng đạn
  totalWarningSeconds: number;
  initiatedAt: number;
  strikesAt: number;
  status: 'WARNING' | 'DEFENDED' | 'HIT';
}

export interface ActiveEffect {
  id: string;
  type: ItemType;
  name: string;
  appliedAt: number;
  expiresAt: number;
  teamId: TeamId;
  sourcePlayerName: string;
}

export interface TeamState {
  id: TeamId;
  name: string;          // Tên nhóm sinh viên (VD: "Nhóm 1")
  corpsName: string;      // Tên cánh quân lịch sử 1975
  axisName: string;       // Hướng tiến công lịch sử
  tankNumber: string;     // Số hiệu xe tăng tiêu biểu (390, 843,...)
  color: string;          // Màu nhận diện
  progress: number;       // Tiến độ tiến quân: 0% -> 100%
  totalScore: number;     // Tổng điểm tích lũy toàn đội
  memberCount: number;    // Số chiến sĩ kíp lái
  hasShield: boolean;     // Đang bật Khiên Trại Davis chống pháo kích
  shieldCount: number;    // Số lần đỡ đòn còn lại (mặc định 1 lần/khiên)
  activeEffects: ActiveEffect[];
  isUnderAttack?: boolean; // Đang bị địch ngắm bắn
}

export interface PlayerState {
  id: string;
  name: string;
  studentCode?: string;
  teamId: TeamId;
  role: CrewRole;
  score: number;
  currentStreak: number;
  maxStreak: number;
  correctCount: number;
  totalAnswered: number;
  inventory: BoostItem[];    // Tối đa mỗi đội chỉ có 1 món cùng loại
  isSpeedBoostActive?: boolean; // Mệnh lệnh Thần tốc x2 điểm đang kích hoạt
  isShellShocked?: boolean;     // Kíp lái bị choáng váng do trúng đạn (mờ câu hỏi 1-2s)
  shellShockExpiresAt?: number;
  eliminatedOptions?: AnswerKey[]; // Đáp án bị loại bỏ bởi Easter Egg Mật Mã Cơ Yếu
  isBot?: boolean;
}

export interface HistoricalMilestone {
  percentage: number;
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
  matchDurationSeconds: number; // Mặc định 300s (5 phút)
  timeRemainingSeconds: number; // Thời gian trận đấu còn lại
}

export interface LiveBattleEvent {
  id: string;
  timestamp: number;
  message: string;
  type: 'boost' | 'attack' | 'progress' | 'streak' | 'finish' | 'info' | 'easter_egg' | 'defense';
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
  discoveredEasterEggs: BoostItem[];
}
