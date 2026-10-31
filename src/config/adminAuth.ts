/**
 * THẦN TỐC 1975 - CẤU HÌNH ADMIN, DANH SÁCH 6 ĐỘI ĐUA VÀ CỘT MỐC LỊCH SỬ
 * Phục vụ thuyết trình Chủ đề 6 môn VNR202 (Đại học FPT)
 */

import { HistoricalMilestone, TeamId, TeamState } from '../types/game';

/**
 * Thông tin Quản trị viên Chỉ Huy Sở (Nhóm 6 - BTC lớp)
 */
export const ADMIN_CONFIG = {
  roleName: 'Chỉ Huy Sở - Bộ Chỉ huy Chiến dịch Hồ Chí Minh',
  groupName: 'Nhóm 6 (VNR202)',
  defaultUsername: import.meta.env.VITE_ADMIN_USERNAME || 'admin_nhom6',
  defaultPassword: import.meta.env.VITE_ADMIN_PASSWORD || '30041975',
};

/**
 * Danh sách 6 Đội đua tương ứng với 6 Nhóm sinh viên trong lớp:
 * - 5 Cánh quân thần tốc lịch sử năm 1975
 * - Cánh quân thứ 6: Mũi đột kích Đặc công - Biệt động thành & Hải quân giải phóng Trường Sa
 * (Nhóm 6 là Admin/BTC, không tham gia vào danh sách 6 đội đua)
 */
export const INITIAL_TEAMS_CONFIG: TeamState[] = [
  {
    id: 'team_1',
    name: 'Nhóm 1',
    corpsName: 'Quân đoàn 1 - Binh đoàn Quyết Thắng',
    axisName: 'Cánh quân hướng Bắc',
    color: '#EF4444', // Red 500
    badgeIcon: 'ShieldAlert',
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_2',
    name: 'Nhóm 2',
    corpsName: 'Quân đoàn 2 - Binh đoàn Hương Giang',
    axisName: 'Cánh quân hướng Đông Nam',
    color: '#3B82F6', // Blue 500
    badgeIcon: 'Zap',
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_3',
    name: 'Nhóm 3',
    corpsName: 'Quân đoàn 3 - Binh đoàn Tây Nguyên',
    axisName: 'Cánh quân hướng Tây Bắc',
    color: '#10B981', // Emerald 500
    badgeIcon: 'Flame',
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_4',
    name: 'Nhóm 4',
    corpsName: 'Quân đoàn 4 - Binh đoàn Cửu Long',
    axisName: 'Cánh quân hướng Đông',
    color: '#F59E0B', // Amber 500
    badgeIcon: 'Compass',
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_5',
    name: 'Nhóm 5',
    corpsName: 'Đoàn 232 - Binh đoàn Tây Nam',
    axisName: 'Cánh quân hướng Tây Nam',
    color: '#8B5CF6', // Purple 500
    badgeIcon: 'Crosshair',
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
  },
  {
    id: 'team_7',
    name: 'Nhóm 7',
    corpsName: 'Mũi Đặc công Biệt động & Hải quân Trường Sa',
    axisName: 'Mũi đột kích nội đô & Biển đảo',
    color: '#06B6D4', // Cyan 500
    badgeIcon: 'Anchor',
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
  },
];

/**
 * 5 Cột mốc lịch sử tương ứng với tiến độ tiến quân từ 0% đến 100%
 */
export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    percentage: 0,
    title: 'Xuất Kích Thần Tốc',
    description: 'Bức điện khẩn lịch sử của Đại tướng Võ Nguyên Giáp',
    historicalEvent: '7/4/1975: "Thần tốc, thần tốc hơn nữa; Táo bạo, táo bạo hơn nữa; Tranh thủ từng phút, từng giờ; Xốc tới mặt trận; Giải phóng miền Nam; Quyết chiến và toàn thắng!".',
  },
  {
    percentage: 25,
    title: 'Phá Vỡ Phòng Tuyến Phía Ngoài',
    description: 'Chọc thủng "Lá chắn thép" Phan Rang và "Cửa ngõ thép" Xuân Lộc',
    historicalEvent: '16/4 - 21/4/1975: Quân ta phá vỡ phòng tuyến Phan Rang, đập tan phòng tuyến then chốt Xuân Lộc, mở toang cửa ngõ phía Đông Bắc tiến vào Sài Gòn.',
  },
  {
    percentage: 50,
    title: 'Tổng Công Kích Cửa Ngõ Sài Gòn',
    description: '5 cánh quân đồng loạt khép chặt vòng vây hợp điểm',
    historicalEvent: '17h00 ngày 26/4/1975: Chiến dịch Hồ Chí Minh mở màn. Pháo binh ta dội bão lửa vào các căn cứ địch, 5 cánh quân dũng mãnh tiến công áp sát nội đô.',
  },
  {
    percentage: 75,
    title: 'Đột Kích Các Mục Tiêu Đầu Não',
    description: 'Đánh chiếm sân bay Tân Sơn Nhất, Bộ Tổng Tham mưu ngụy',
    historicalEvent: 'Sáng 30/4/1975: Các mũi thọc sâu đập tan các ổ đề kháng cuối cùng, chiếm sân bay Tân Sơn Nhất, Đài phát thanh, Biệt khu Thủ đô và Tổng nha Cảnh sát.',
  },
  {
    percentage: 100,
    title: 'Cắm Cờ Dinh Độc Lập - Toàn Thắng',
    description: 'Lá cờ Mặt trận Dân tộc Giải phóng tung bay trên nóc Dinh Độc Lập',
    historicalEvent: '11 giờ 30 phút ngày 30/4/1975: Xe tăng ta húc đổ cổng Dinh Độc Lập, Tổng thống Dương Văn Minh đầu hàng không điều kiện. Miền Nam hoàn toàn giải phóng!',
  },
];

/**
 * Hàm kiểm tra đăng nhập Quản trị viên
 * @param username Tên đăng nhập do người dùng nhập
 * @param password Mật khẩu do người dùng nhập
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUser = (import.meta.env.VITE_ADMIN_USERNAME || 'admin_nhom6').trim();
  const expectedPass = (import.meta.env.VITE_ADMIN_PASSWORD || '30041975').trim();

  return username.trim() === expectedUser && password.trim() === expectedPass;
}
