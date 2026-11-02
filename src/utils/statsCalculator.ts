/**
 * THẦN TỐC 1975 - BỘ TÍNH TOÁN THỐNG KÊ CHIẾN TRƯỜNG & DANH HIỆU
 * Tự động tính toán MVP đội thắng, SVP từng đội thua, Top Streak, Top Điểm & Xuất CSV
 */

import { BoostItem, GameSummaryStats, PlayerState, TeamId, TeamMvpInfo, TeamState } from '../types/game';

/**
 * Tìm chiến sĩ xuất sắc nhất (MVP) trong một nhóm người chơi cụ thể
 */
export function findTeamMvp(teamPlayers: PlayerState[]): PlayerState | null {
  if (!teamPlayers || teamPlayers.length === 0) return null;

  return [...teamPlayers].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.maxStreak !== a.maxStreak) return b.maxStreak - a.maxStreak;
    return b.correctCount - a.correctCount;
  })[0];
}

/**
 * Lấy danh sách Top chiến sĩ có chuỗi trả lời đúng dài nhất (Top Streak)
 */
export function getTopStreakPlayers(players: PlayerState[], limit: number = 5): PlayerState[] {
  if (!players || players.length === 0) return [];

  return [...players]
    .sort((a, b) => {
      if (b.maxStreak !== a.maxStreak) return b.maxStreak - a.maxStreak;
      if (b.score !== a.score) return b.score - a.score;
      return b.correctCount - a.correctCount;
    })
    .slice(0, limit);
}

/**
 * Lấy danh sách Top chiến sĩ có tổng điểm cá nhân cao nhất (Top Score)
 */
export function getTopScorePlayers(players: PlayerState[], limit: number = 10): PlayerState[] {
  if (!players || players.length === 0) return [];

  return [...players]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return b.maxStreak - a.maxStreak;
    })
    .slice(0, limit);
}

/**
 * Xếp hạng 6 Đội đua theo quy tắc:
 * 1. Điểm đội quyết định chiến thắng tổng quan (cho phép các đội sau lật kèo)
 * 2. Nếu bằng điểm nhau, đội nào có tiến độ cao hơn sẽ xếp trên
 */
export function getTeamRankings(teams: TeamState[]): TeamState[] {
  return [...teams].sort((a, b) => {
    // 1. Điểm đội quyết định chiến thắng tổng quan
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // 2. Nếu bằng điểm, xét tiến độ về đích
    return b.progress - a.progress;
  });
}

export interface PlayerPersonalRanking {
  teamRank: number;
  totalTeams: number;
  teamName: string;
  corpsName: string;
  tankNumber: string;
  teamScore: number;
  teamProgress: number;
  playerTeamRank: number;
  teamMembersCount: number;
  isTeamMvp: boolean;
  overallRank: number;
  totalPlayers: number;
  score: number;
  maxStreak: number;
  correctCount: number;
  totalAnswered: number;
}

/**
 * Tính toán xếp hạng cá nhân chi tiết:
 * - Hạng của Đội (Team Rank)
 * - Vị trí của người chơi trong Đội (Player Team Rank, xét MVP)
 * - Hạng tổng thể toàn trường (Overall Rank)
 */
export function getPlayerRankingDetails(
  playerId: string,
  players: PlayerState[],
  teams: TeamState[]
): PlayerPersonalRanking | null {
  const player = players.find((p) => p.id === playerId);
  if (!player) return null;

  const rankedTeams = getTeamRankings(teams);
  const teamIndex = rankedTeams.findIndex((t) => t.id === player.teamId);
  const teamRank = teamIndex !== -1 ? teamIndex + 1 : 1;
  const team = teams.find((t) => t.id === player.teamId);

  const teamPlayers = players
    .filter((p) => p.teamId === player.teamId)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.maxStreak !== a.maxStreak) return b.maxStreak - a.maxStreak;
      return b.correctCount - a.correctCount;
    });

  const playerTeamIndex = teamPlayers.findIndex((p) => p.id === playerId);
  const playerTeamRank = playerTeamIndex !== -1 ? playerTeamIndex + 1 : 1;
  const isTeamMvp = playerTeamRank === 1;

  const overallPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return b.maxStreak - a.maxStreak;
  });
  const overallIndex = overallPlayers.findIndex((p) => p.id === playerId);
  const overallRank = overallIndex !== -1 ? overallIndex + 1 : 1;

  return {
    teamRank,
    totalTeams: teams.length,
    teamName: team?.name || '',
    corpsName: team?.corpsName || '',
    tankNumber: team?.tankNumber || '',
    teamScore: team?.totalScore || 0,
    teamProgress: team?.progress || 0,
    playerTeamRank,
    teamMembersCount: teamPlayers.length,
    isTeamMvp,
    overallRank,
    totalPlayers: players.length,
    score: player.score,
    maxStreak: player.maxStreak,
    correctCount: player.correctCount,
    totalAnswered: player.totalAnswered,
  };
}

/**
 * Tính toán toàn bộ thông số vinh danh cuối trận đấu (Game Summary Stats)
 */
export function calculateGameSummaryStats(
  players: PlayerState[],
  teams: TeamState[],
  winningTeamId?: TeamId,
  discoveredEasterEggs: BoostItem[] = []
): GameSummaryStats {
  // 1. Xếp hạng 6 Đội (Team Podium)
  const teamRankings = getTeamRankings(teams);

  // 2. Xác định đội thắng
  let winningTeam: TeamState | null = null;
  if (winningTeamId) {
    winningTeam = teams.find((t) => t.id === winningTeamId) || null;
  }
  if (!winningTeam && teamRankings.length > 0) {
    winningTeam = teamRankings[0];
  }

  const resolvedWinId = winningTeam ? winningTeam.id : null;

  // 3. MVP Đội Thắng
  const winPlayers = resolvedWinId ? players.filter((p) => p.teamId === resolvedWinId) : [];
  const winningTeamMvp = findTeamMvp(winPlayers);

  // 4. SVP Từng Đội Còn Lại
  const losingTeams = teams.filter((t) => t.id !== resolvedWinId);
  const losingTeamsMvps: TeamMvpInfo[] = losingTeams.map((team) => {
    const tPlayers = players.filter((p) => p.teamId === team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      corpsName: team.corpsName,
      mvp: findTeamMvp(tPlayers),
    };
  });

  // 5. Top Streak & Top Score
  const topStreakPlayers = getTopStreakPlayers(players, 5);
  const topScorePlayers = getTopScorePlayers(players, 10);

  return {
    winningTeam,
    winningTeamMvp,
    losingTeamsMvps,
    topStreakPlayers,
    topScorePlayers,
    teamRankings,
    discoveredEasterEggs,
  };
}

/**
 * Xuất danh sách bảng điểm toàn bộ sinh viên ra file CSV tải về máy
 */
export function exportPlayersToCSV(players: PlayerState[], teams: TeamState[]) {
  const teamMap = new Map(teams.map((t) => [t.id, `${t.name} - ${t.corpsName}`]));

  const headers = ['Hạng', 'Họ và Tên', 'MSSV', 'Cánh Quân / Nhóm', 'Vai Trò Kíp Lái', 'Điểm Số', 'Chuỗi Đúng Kỷ Lục', 'Số Câu Đúng', 'Tổng Câu Trả Lời', 'Tỷ Lệ Đúng (%)'];

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const rows = sortedPlayers.map((p, idx) => {
    const accuracy = p.totalAnswered > 0 ? ((p.correctCount / p.totalAnswered) * 100).toFixed(1) : '0.0';
    return [
      idx + 1,
      `"${p.name}"`,
      `"${p.studentCode || 'N/A'}"`,
      `"${teamMap.get(p.teamId) || p.teamId}"`,
      `"${p.role || 'Kíp lái'}"`,
      p.score,
      p.maxStreak,
      p.correctCount,
      p.totalAnswered,
      `"${accuracy}%"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Diem_Than_Toc_1975_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
