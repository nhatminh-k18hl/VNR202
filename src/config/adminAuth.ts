/**
 * THẦN TỐC 1975 - CẤU HÌNH ADMIN, 6 CÁNH QUÂN, 5 MỐC LỊCH SỬ & DỮ LIỆU ĐỊCH PHẢN KÍCH THẬT
 * Thiết kế chuẩn mực cho Sa Bàn Tác Chiến Đại Thắng Mùa Xuân 1975
 */

import { HistoricalMilestone, TeamState } from '../types/game';

export const ADMIN_CONFIG = {
  roleName: 'Chỉ Huy Sở - Bộ Chỉ huy Chiến dịch Hồ Chí Minh',
  groupName: 'Nhóm 6',
  defaultUsername: import.meta.env.VITE_ADMIN_USERNAME || 'admin_nhom6',
  defaultPassword: import.meta.env.VITE_ADMIN_PASSWORD || '30041975',
};

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
    color: '#EF4444', // Red
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
    heldItem: null,
  },
  {
    id: 'team_2',
    name: 'Nhóm 2',
    corpsName: 'Quân đoàn 2 - Binh đoàn Hương Giang',
    axisName: 'Cánh quân hướng Đông Nam',
    tankNumber: '390',
    color: '#3B82F6', // Blue
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
    heldItem: null,
  },
  {
    id: 'team_3',
    name: 'Nhóm 3',
    corpsName: 'Quân đoàn 3 - Binh đoàn Tây Nguyên',
    axisName: 'Cánh quân hướng Tây Bắc',
    tankNumber: '985',
    color: '#10B981', // Emerald
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
    heldItem: null,
  },
  {
    id: 'team_4',
    name: 'Nhóm 4',
    corpsName: 'Quân đoàn 4 - Binh đoàn Cửu Long',
    axisName: 'Cánh quân hướng Đông',
    tankNumber: '707',
    color: '#F59E0B', // Amber
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
    heldItem: null,
  },
  {
    id: 'team_5',
    name: 'Nhóm 5',
    corpsName: 'Đoàn 232 & Biệt động Sài Gòn',
    axisName: 'Cánh quân hướng Tây Nam',
    tankNumber: '256',
    color: '#8B5CF6', // Purple
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
    heldItem: null,
  },
  {
    id: 'team_7',
    name: 'Nhóm 7',
    corpsName: 'Cánh quân thứ 6 - Hải quân Trường Sa & Phi đội A-37',
    axisName: 'Mũi đột kích nội đô, Biển đảo & Đường không',
    tankNumber: '112',
    color: '#06B6D4', // Cyan
    progress: 0,
    totalScore: 0,
    memberCount: 0,
    activeEffects: [],
    heldItem: null,
  },
];

/**
 * 5 Cột mốc lịch sử trải dài từ 0% đến 100% trên sa bàn đường đua
 */
export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    percentage: 0,
    title: 'Hội Nghị TW 21',
    subTitle: 'Con đường bạo lực cách mạng',
    historicalEvent: 'Tháng 7/1973: Nghị quyết 21 xác định tiếp tục con đường bạo lực cách mạng, kiên quyết phản công và tiến công địch.',
  },
  {
    percentage: 25,
    title: 'Đường 14 - Phước Long',
    subTitle: 'Đòn trinh sát chiến lược',
    historicalEvent: 'Tháng 1/1975: Giải phóng hoàn toàn tỉnh Phước Long. Khẳng định khả năng suy sụp của quân đội Sài Gòn và sự bất lực của Mỹ.',
  },
  {
    percentage: 50,
    title: 'Buôn Ma Thuột',
    subTitle: 'Đột phá khẩu Tây Nguyên',
    historicalEvent: '10-11/3/1975: Đòn điểm huyệt hiểm hóc giải phóng Buôn Ma Thuột, làm rung chuyển toàn bộ chiến trường và mở toang cánh cửa Tây Nguyên.',
  },
  {
    percentage: 75,
    title: 'Huế - Đà Nẵng',
    subTitle: 'Thần tốc tiến về phương Nam',
    historicalEvent: '26-29/3/1975: Đập tan căn cứ liên hợp quân sự khổng lồ của địch tại miền Trung, tạo thế áp đảo tuyệt đối để giải phóng Sài Gòn.',
  },
  {
    percentage: 100,
    title: 'Dinh Độc Lập',
    subTitle: 'Toàn thắng 30/4/1975',
    historicalEvent: '11h30 ngày 30/4/1975: Xe tăng húc đổ cổng Dinh Độc Lập, cắm cờ Giải phóng trên nóc Dinh. Chiến dịch Hồ Chí Minh toàn thắng!',
  },
];

/**
 * DỮ LIỆU ĐỊCH PHẢN KÍCH LỊCH SỬ THẬT 1975 (AUTHENTIC ENEMY COUNTER-ATTACKS)
 * Nhắm vào cánh quân dẫn đầu theo các mốc tiến độ
 */
export const HISTORICAL_ENEMY_ATTACKS = [
  {
    minProgress: 10,
    maxProgress: 35,
    historicalEventName: 'Phản kích Đèo Chu Pao (Chiến dịch Tây Nguyên)',
    historicalDetail: 'Quân đoàn 2 VNCH điều Trung đoàn 44, 45 cùng pháo binh nã đạn cản đường tiến quân của ta!',
  },
  {
    minProgress: 35,
    maxProgress: 55,
    historicalEventName: 'Không kích Phước An - Nông Trại (Buôn Ma Thuột)',
    historicalDetail: 'Trực thăng và phi cơ A-37 thuộc Sư đoàn 6 Không quân địch ném bom phản kích đội hình thọc sâu!',
  },
  {
    minProgress: 55,
    maxProgress: 75,
    historicalEventName: 'Lá Chắn Thép Phan Rang (Tuyến phòng thủ từ xa)',
    historicalDetail: 'Bộ Tổng tham mưu Sài Gòn lập phòng tuyến Phan Rang do tướng Nguyễn Vĩnh Nghi chỉ huy dội pháo chặn đường!',
  },
  {
    minProgress: 75,
    maxProgress: 90,
    historicalEventName: 'Tử Chiến Cánh Cửa Thép Xuân Lộc',
    historicalDetail: 'Sư đoàn 18 VNCH (Lê Minh Đảo) điên cuồng ném bom CBU-55 và đại bác tử thủ bảo vệ cửa ngõ Sài Gòn!',
  },
  {
    minProgress: 90,
    maxProgress: 100,
    historicalEventName: 'Tử Thủ Cầu Rạch Chiếc & Cửa Ngõ Nội Đô',
    historicalDetail: 'Lữ đoàn 3 kỵ binh thiết giáp và lính dù địch phục kích tại đầu cầu hòng chặn xe tăng lao vào Dinh Độc Lập!',
  },
];

/**
 * Xác thực thông tin đăng nhập Admin
 */
export function verifyAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return (
    username.trim() === ADMIN_CONFIG.defaultUsername &&
    password.trim() === ADMIN_CONFIG.defaultPassword
  );
}
