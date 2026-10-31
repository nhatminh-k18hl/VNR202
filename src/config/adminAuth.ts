/**
 * THẦN TỐC 1975 - CẤU HÌNH ADMIN, 6 CÁNH QUÂN, KÍP LÁI VÀ SỰ KIỆN LỊCH SỬ CHÂN THỰC
 * Phục vụ thuyết trình Chủ đề 6 môn VNR202 (Đại học FPT)
 */

import { BoostItem, CrewRoleInfo, HistoricalMilestone, TeamState } from '../types/game';

export const ADMIN_CONFIG = {
  roleName: 'Chỉ Huy Sở - Bộ Chỉ huy Chiến dịch Hồ Chí Minh',
  groupName: 'Nhóm 6 (VNR202)',
  defaultUsername: import.meta.env.VITE_ADMIN_USERNAME || 'admin_nhom6',
  defaultPassword: import.meta.env.VITE_ADMIN_PASSWORD || '30041975',
};

/**
 * 5 Vị trí Kíp lái xe tăng (Co-op Tank Crew)
 */
export const CREW_ROLES: CrewRoleInfo[] = [
  {
    role: 'COMMANDER',
    title: 'Trưởng xe',
    badge: '⭐',
    description: 'Chỉ huy kíp xe, quyết định thời điểm kích hoạt Lá chắn Trại Davis để bảo vệ xe.',
  },
  {
    role: 'GUNNER',
    title: 'Pháo thủ',
    badge: '🎯',
    description: 'Ngắm bắn mục tiêu trắc nghiệm chuẩn xác, duy trì chuỗi Streak rực lửa.',
  },
  {
    role: 'DRIVER',
    title: 'Lái xe',
    badge: '🚀',
    description: 'Thần tốc vượt địa hình, đạp ga đưa xe tăng vượt qua các điểm chốt.',
  },
  {
    role: 'LOADER',
    title: 'Nạp đạn',
    badge: '⚡',
    description: 'Bảo đảm hỏa lực liên tục, chuẩn bị cho các đợt bứt phá điểm số x2.',
  },
  {
    role: 'RADIO',
    title: 'Thông tin',
    badge: '📻',
    description: 'Bắt sóng chỉ huy, cảnh báo sớm các đợt tập kích pháo của đối phương.',
  },
];

/**
 * Danh sách 6 Đội đua đại diện 6 cánh quân lịch sử
 */
export const INITIAL_TEAMS_CONFIG: TeamState[] = [
  {
    id: 'team_1',
    name: 'Nhóm 1',
    corpsName: 'Quân đoàn 1 - Binh đoàn Quyết Thắng',
    axisName: 'Cánh quân hướng Bắc',
    tankNumber: '843',
    color: '#DC2626', // Red
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    hasShield: false,
    shieldCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_2',
    name: 'Nhóm 2',
    corpsName: 'Quân đoàn 2 - Binh đoàn Hương Giang',
    axisName: 'Cánh quân hướng Đông Nam',
    tankNumber: '390',
    color: '#2563EB', // Blue
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    hasShield: false,
    shieldCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_3',
    name: 'Nhóm 3',
    corpsName: 'Quân đoàn 3 - Binh đoàn Tây Nguyên',
    axisName: 'Cánh quân hướng Tây Bắc',
    tankNumber: '985',
    color: '#059669', // Emerald
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    hasShield: false,
    shieldCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_4',
    name: 'Nhóm 4',
    corpsName: 'Quân đoàn 4 - Binh đoàn Cửu Long',
    axisName: 'Cánh quân hướng Đông',
    tankNumber: '707',
    color: '#D97706', // Amber
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    hasShield: false,
    shieldCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_5',
    name: 'Nhóm 5',
    corpsName: 'Đoàn 232 & Biệt động Sài Gòn',
    axisName: 'Cánh quân hướng Tây Nam',
    tankNumber: '256',
    color: '#7C3AED', // Purple
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    hasShield: false,
    shieldCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_7',
    name: 'Nhóm 7',
    corpsName: 'Cánh quân thứ 6 - Hải quân Trường Sa & Phi đội A-37',
    axisName: 'Mũi đột kích nội đô, Biển đảo & Đường không',
    tankNumber: '112',
    color: '#0891B2', // Cyan
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    hasShield: false,
    shieldCount: 0,
    activeEffects: [],
  },
];

/**
 * 5 Cột mốc lịch sử trải dài từ 0% đến 100% trên sa bàn đường đua
 */
export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    percentage: 0,
    title: 'Hiệp Định Paris',
    subTitle: 'Xuất kích Thần tốc',
    historicalEvent: '1/1973 - 7/1973: Nghị quyết TW 21 khẳng định con đường cách mạng bạo lực; chuẩn bị tổng lực cho mùa Xuân 1975.',
  },
  {
    percentage: 25,
    title: 'Giải Phóng Phước Long',
    subTitle: 'Đòn trinh sát chiến lược',
    historicalEvent: '6/1/1975: Chiến thắng Phước Long chứng minh thế áp đảo và khả năng can thiệp trở lại của Mỹ bị triệt tiêu.',
  },
  {
    percentage: 50,
    title: 'Buôn Ma Thuột',
    subTitle: 'Đòn điểm huyệt Tây Nguyên',
    historicalEvent: '10/3/1975: Đòn giáng sấm sét giải phóng Buôn Ma Thuột, đẩy quân ngụy vào cuộc tháo chạy hỗn loạn trên Đường số 7.',
  },
  {
    percentage: 75,
    title: 'Huế - Đà Nẵng',
    subTitle: 'Đập tan căn cứ liên hợp',
    historicalEvent: '26/3 - 29/3/1975: Quét sạch căn cứ quân sự liên hợp khổng lồ tại Đà Nẵng, mở toang cửa ngõ tiến về Sài Gòn.',
  },
  {
    percentage: 100,
    title: 'Dinh Độc Lập',
    subTitle: 'Đại thắng 30/4/1975',
    historicalEvent: '11h30 ngày 30/4/1975: Xe tăng 390 và 843 húc đổ cổng Dinh Độc Lập, cắm cờ Giải phóng. Non sông toàn thắng!',
  },
];

/**
 * Sự kiện Địch Phản Kích Lịch Sử (Real Historical Counter-Attacks)
 */
export const HISTORICAL_COUNTER_ATTACKS = [
  {
    eventName: 'Tử thủ phòng tuyến ngã ba Dầu Giây - Xuân Lộc',
    historicalDetail: 'Sư đoàn 18 VNCH tử thủ quyết liệt tại cánh cửa thép ngõ phía Đông, tập trung hỏa lực pháo binh và không quân phản kích.',
  },
  {
    eventName: 'Pháo binh đối phương phản kích tại Đèo An Khê - Chư Pao',
    historicalDetail: 'Hỏa lực pháo binh tầm xa của đối phương bắn chặn hòng làm chậm bước tiến của Binh đoàn Tây Nguyên.',
  },
  {
    eventName: 'Cụm phòng ngự Căn cứ Nước Trong - Thiết giáp Long Bình',
    historicalDetail: 'Cụm xe tăng M48 và bộ binh địch tại ngã ba Biên Hòa điên cuồng nã đạn nhằm cản bước Quân đoàn 2.',
  },
  {
    eventName: 'Không quân đối phương oanh tạc cắt cầu Bến Lức',
    historicalDetail: 'Phi đội máy bay ném bom đối phương oanh kích nhằm cắt đứt cầu phao và đường tiến quân của Đoàn 232.',
  },
  {
    eventName: 'Pháo đài bến cảng Hải quân Sơn Trà kháng cự',
    historicalDetail: 'Hỏa lực pháo bờ biển đối phương bắn chặn dữ dội vào đội hình thọc sâu ven biển của quân ta.',
  },
];

/**
 * Danh sách toàn bộ Vật phẩm & Easter Eggs (Để quản lý và hiển thị hướng dẫn)
 */
export const ALL_POWER_UPS: Omit<BoostItem, 'id' | 'acquiredAt'>[] = [
  {
    type: 'DAVIS_SHIELD',
    name: 'Lá chắn Trại Davis',
    description: 'Kích hoạt vòng phòng hộ thép, hóa giải hoàn toàn 1 đợt pháo kích hoặc tập kích của đối phương.',
    icon: '🛡️',
  },
  {
    type: 'TRUONG_SON_LOGISTICS',
    name: 'Tiếp viện Trường Sơn',
    description: 'Tăng cường nhiên liệu xăng dầu dã chiến, lập tức đẩy tiến độ xe tăng lên thêm +5%.',
    icon: '⛽',
  },
  {
    type: 'RAPID_DISPATCH',
    name: 'Mệnh lệnh Thần tốc',
    description: 'Thần tốc hơn nữa: Nhân đôi (+100%) điểm cho câu trả lời đúng tiếp theo. Nếu sai: bị phạt -10% điểm!',
    icon: '⚡',
  },
  {
    type: 'SMOKE_SCREEN',
    name: 'Màn khói Ngụy trang',
    description: 'Tung khói mù giải trừ ngay hiệu ứng choáng váng do trúng đạn và miễn nhiễm pháo kích trong 5s.',
    icon: '💨',
  },
  {
    type: 'EASTER_COMMUNICATION_CODE',
    name: 'Bản Mật Mã Cơ Yếu 1975',
    description: '[EASTER EGG] Cơ yếu Trung ương giải mã: Loại bỏ ngay 2 đáp án sai cho câu hỏi trắc nghiệm hiện tại.',
    icon: '📻',
    isEasterEgg: true,
  },
  {
    type: 'EASTER_VICTORY_BANNER',
    name: 'Cờ Thêu Quyết Chiến Toàn Thắng',
    description: '[EASTER EGG] Cờ lệnh tiếp thêm nhuệ khí: Thưởng ngay +100 điểm danh dự cho toàn đội và hồi phục kíp lái.',
    icon: '🚩',
    isEasterEgg: true,
  },
];

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUser = (import.meta.env.VITE_ADMIN_USERNAME || 'admin_nhom6').trim();
  const expectedPass = (import.meta.env.VITE_ADMIN_PASSWORD || '30041975').trim();

  return username.trim() === expectedUser && password.trim() === expectedPass;
}
