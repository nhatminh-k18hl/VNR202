/**
 * THẦN TỐC 1975 - CẤU HÌNH ADMIN, 6 CÁNH QUÂN VÀ 5 MỐC LỊCH SỬ SA BÀN
 * Phục vụ thuyết trình Chủ đề 6 môn VNR202 (Đại học FPT)
 */

import { HistoricalMilestone, TeamState } from '../types/game';

export const ADMIN_CONFIG = {
  roleName: 'Chỉ Huy Sở - Bộ Chỉ huy Chiến dịch Hồ Chí Minh',
  groupName: 'Nhóm 6 (VNR202)',
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
    historicalEvent: '1/1973 - 7/1973: Nghị quyết TW 21 khẳng định con đường bạo lực cách mạng; chuẩn bị mọi mặt cho cuộc Tổng tiến công mùa Xuân 1975.',
  },
  {
    percentage: 25,
    title: 'Giải Phóng Phước Long',
    subTitle: 'Đòn trinh sát chiến lược',
    historicalEvent: '6/1/1975: Chiến thắng Phước Long chứng minh sức mạnh áp đảo của quân ta và khả năng Mỹ không thể tái can thiệp bằng quân sự.',
  },
  {
    percentage: 50,
    title: 'Buôn Ma Thuột',
    subTitle: 'Đòn điểm huyệt Tây Nguyên',
    historicalEvent: '10/3/1975: Đòn giáng sấm sét giải phóng Buôn Ma Thuột, đẩy quân ngụy vào cuộc tháo chạy hoảng loạn trên Đường số 7.',
  },
  {
    percentage: 75,
    title: 'Huế - Đà Nẵng',
    subTitle: 'Đập tan căn cứ liên hợp',
    historicalEvent: '26/3 - 29/3/1975: Giải phóng Huế, quét sạch căn cứ quân sự liên hợp khổng lồ tại Đà Nẵng, mở toang cửa ngõ tiến về Sài Gòn.',
  },
  {
    percentage: 100,
    title: 'Dinh Độc Lập',
    subTitle: 'Đại thắng 30/4/1975',
    historicalEvent: '11h30 ngày 30/4/1975: Xe tăng 390 và 843 húc đổ cổng Dinh Độc Lập, cắm cờ Giải phóng. Non sông Việt Nam hoàn toàn thu về một mối!',
  },
];

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedUser = (import.meta.env.VITE_ADMIN_USERNAME || 'admin_nhom6').trim();
  const expectedPass = (import.meta.env.VITE_ADMIN_PASSWORD || '30041975').trim();

  return username.trim() === expectedUser && password.trim() === expectedPass;
}
