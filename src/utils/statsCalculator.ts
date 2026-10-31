/**
 * THẦN TỐC 1975 - BỘ TÍNH TOÁN THỐNG KÊ CHIẾN TRƯỜNG & DANH HIỆU
 * Tự động tính toán MVP đội thắng, SVP từng đội thua, Top Streak, Top Điểm & Xuất CSV
 */

import { GameSummaryStats, PlayerState, TeamId, TeamMvpInfo, TeamState } from '../types/game';

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
 * Tính toán toàn bộ thông số vinh danh cuối trận đấu (Game Summary Stats)
 */
export function calculateGameSummaryStats(
  players: PlayerState[],
  teams: TeamState[],
  winningTeamId?: TeamId
): GameSummaryStats {
  // 1. Xếp hạng 6 Đội (Team Podium): Ưu tiên đội 100%, sau đó theo tiến độ % và tổng điểm
  const teamRankings = [...teams].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    return b.totalScore - a.totalScore;
  });

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
  };
}

/**
 * Xuất danh sách bảng điểm toàn bộ sinh viên ra file CSV tải về máy
 */
export function exportPlayersToCSV(players: PlayerState[], teams: TeamState[]) {
  const teamMap = new Map(teams.map((t) => [t.id, `${t.name} - ${t.corpsName}`]));

  const headers = ['Hạng', 'Họ và Tên', 'MSSV', 'Cánh Quân / Nhóm', 'Điểm Số', 'Chuỗi Đúng Kỷ Lục', 'Số Câu Đúng', 'Tổng Câu Trả Lời', 'Tỷ Lệ Đúng (%)'];

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const rows = sortedPlayers.map((p, idx) => {
    const accuracy = p.totalAnswered > 0 ? ((p.correctCount / p.totalAnswered) * 100).toFixed(1) : '0.0';
    return [
      idx + 1,
      `"${p.name}"`,
      `"${p.studentCode || 'N/A'}"`,
      `"${teamMap.get(p.teamId) || p.teamId}"`,
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
