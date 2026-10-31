/**
 * THẦN TỐC 1975 - HỆ THỐNG ĐỊNH NGHĨA DỮ LIỆU ĐẦY ĐỦ (GAME TYPES)
 * Thiết kế cho Sa Bàn Tác Chiến Đại Thắng Mùa Xuân 1975
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
 * Vai trò trong Kíp Lái Xe Tăng (Tank Crew Roles)
 */
export type CrewRole = 
  | 'COMMANDER'  // Trưởng xe: Quyết định kích hoạt Khiên & Lệnh Thần Tốc
  | 'DRIVER'     // Lái xe: Giữ vững tay lái, vượt địa hình
  | 'GUNNER'     // Pháo thủ: Ngắm bắn đáp án chính xác
  | 'LOADER'     // Tiếp đạn & Quân nhu: Tranh giành vật phẩm Chợ Quân Nhu
  | 'RADIO';     // Báo vụ: Cảnh báo sớm pháo kích địch

/**
 * 4 Loại Vật phẩm Chiến thuật Phòng Thủ & Tác Chiến Dã Chiến (Không đánh lẫn nhau)
 */
export type ItemType =
  | 'DAVIS_SHIELD'      // 🛡️ Lá chắn Trại Davis (Phòng thủ tuyệt đối: Chặn 100% đòn phản kích của địch)
  | 'PLEIKU_DECEPTION'  // 🎭 Nghi binh Tây Nguyên (Hóa giải không kích & phân tán hỏa lực địch)
  | 'SPEED_ORDER'       // ⚡ Mệnh lệnh Thần tốc (Nhân đôi tốc độ tiến quân và điểm số câu tiếp theo)
  | 'TRUONG_SON_PIPE';  // ⛽ Xăng dầu Trường Sơn (Hồi phục nhiên liệu, tiến ngay +6% và hóa giải khựng)

export interface BoostItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
  acquiredAt: number;
}

/**
 * Vật phẩm trong Chợ Quân Nhu Dã Chiến (Tactics Draft Market)
 * Cơ chế giống Auto Chess: số lượng giới hạn, các đội tranh nhau nhặt/mua
 */
export interface TacticsMarketItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  icon: string;
  stock: number; // 0 hoặc 1
  claimedByTeamId?: TeamId;
  claimedByTeamName?: string;
  claimedByPlayerName?: string;
}

/**
 * Đợt Địch Phản Kích (Boss Counter-Attack) với Dữ Liệu Lịch Sử Thật
 */
export interface EnemyCounterAttack {
  id: string;
  targetTeamId: TeamId;
  targetTeamName: string;
  historicalEventName: string; // Tên chiến sự thật 1975
  historicalDetail: string;    // Chi tiết bối cảnh lịch sử
  issuedAt: number;
  countdownMs: number;         // 1000ms đếm ngược
  remainingMs: number;
  isDefended: boolean;
  isResolved: boolean;
  defenderName?: string;
  usedItemType?: ItemType;
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
  heldItem: BoostItem | null;    // Quy tắc: Mỗi đội chỉ giữ tối đa 1 vật phẩm chưa dùng!
}

export interface PlayerState {
  id: string;
  name: string;
  studentCode?: string;
  teamId: TeamId;
  crewRole?: CrewRole;
  score: number;
  currentStreak: number;
  maxStreak: number;
  correctCount: number;
  totalAnswered: number;
  inventory: BoostItem[];
  isSpeedBoostActive?: boolean;
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
  remainingSeconds: number; // Đếm ngược 5 phút (300s)
  activeEnemyAttack: EnemyCounterAttack | null;
  tacticsMarket: TacticsMarketItem[];
}

export interface LiveBattleEvent {
  id: string;
  timestamp: number;
  message: string;
  type: 'boost' | 'attack' | 'progress' | 'streak' | 'finish' | 'info' | 'enemy';
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
