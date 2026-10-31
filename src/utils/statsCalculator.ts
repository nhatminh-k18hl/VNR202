/**
 * THẦN TỐC 1975 - BỘ TÍNH TOÁN THỐNG KÊ CHIẾN TRƯỜNG & DANH HIỆU
 * Tự động tính toán MVP đội thắng, MVP từng đội thua (SVP), Top Streak và Top Điểm
 */

import { GameSummaryStats, PlayerState, TeamId, TeamMvpInfo, TeamState } from '../types/game';

/**
 * Tìm chiến sĩ xuất sắc nhất (MVP) trong một nhóm người chơi cụ thể
 * Tiêu chí: Điểm cao nhất -> Chuỗi đúng dài nhất (maxStreak) -> Tổng số câu đúng (correctCount)
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
 * Lấy danh sách Top chiến sĩ có chuỗi trả lời đúng liên tiếp dài nhất (Top Streak)
 */
export function getTopStreakPlayers(players: PlayerState[], limit: number = 3): PlayerState[] {
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
 * Lấy danh sách Top chiến sĩ có tổng điểm cá nhân cao nhất toàn mặt trận (Top Score)
 */
export function getTopScorePlayers(players: PlayerState[], limit: number = 3): PlayerState[] {
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
 * @param players Danh sách toàn bộ người chơi tham gia trận đấu
 * @param teams Danh sách 6 cánh quân
 * @param winningTeamId ID đội chiến thắng (nếu để trống sẽ tự động lấy đội có tiến độ cao nhất / điểm cao nhất)
 */
export function calculateGameSummaryStats(
  players: PlayerState[],
  teams: TeamState[],
  winningTeamId?: TeamId
): GameSummaryStats {
  // 1. Xác định đội thắng cuộc (Ưu tiên đội chạm mốc 100% hoặc điểm cao nhất)
  let winningTeam: TeamState | null = null;

  if (winningTeamId) {
    winningTeam = teams.find((t) => t.id === winningTeamId) || null;
  }

  if (!winningTeam && teams.length > 0) {
    winningTeam = [...teams].sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.totalScore - a.totalScore;
    })[0];
  }

  const resolvedWinningTeamId = winningTeam ? winningTeam.id : null;

  // 2. Tìm MVP đội thắng (Chiến sĩ xuất sắc nhất phe cắm cờ)
  const winningTeamPlayers = resolvedWinningTeamId
    ? players.filter((p) => p.teamId === resolvedWinningTeamId)
    : [];
  const winningTeamMvp = findTeamMvp(winningTeamPlayers);

  // 3. Tìm MVP của từng đội còn lại (SVP - Chiến sĩ kiên cường nhất từng cánh quân)
  const losingTeams = teams.filter((t) => t.id !== resolvedWinningTeamId);
  const losingTeamsMvps: TeamMvpInfo[] = losingTeams.map((team) => {
    const teamPlayers = players.filter((p) => p.teamId === team.id);
    return {
      teamId: team.id,
      teamName: team.name,
      corpsName: team.corpsName,
      mvp: findTeamMvp(teamPlayers),
    };
  });

  // 4. Tìm Top 5 Streak (Bách phát bách trúng)
  const topStreakPlayers = getTopStreakPlayers(players, 5);

  // 5. Tìm Top 5 Score (Đại dũng tướng)
  const topScorePlayers = getTopScorePlayers(players, 5);

  return {
    winningTeam,
    winningTeamMvp,
    losingTeamsMvps,
    topStreakPlayers,
    topScorePlayers,
  };
}
