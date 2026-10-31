/**
 * THẦN TỐC 1975 - DỊCH VỤ ĐỒNG BỘ DỮ LIỆU ĐA CHẾ ĐỘ (CLOUD REALTIME + LOCAL MULTI-TAB + AI BOTS)
 * Chạy mượt mà trong mọi hoàn cảnh (kể cả khi không có mạng hoặc chưa setup Firebase).
 */

import { INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { 
  BoostItem, 
  GamePhase, 
  ItemType, 
  LiveBattleEvent, 
  PlayerState, 
  Question, 
  RoomState, 
  TeamId, 
  TeamState 
} from '../types/game';
import { soundService } from './soundService';

type SyncListener = (state: FullGameState) => void;

export interface FullGameState {
  roomState: RoomState;
  teams: TeamState[];
  players: PlayerState[];
  liveEvents: LiveBattleEvent[];
  customQuestions?: Question[];
}

const STORAGE_KEY = 'than_toc_1975_state_v1';
const DB_URL_KEY = 'than_toc_1975_firebase_url';

class GameSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private state: FullGameState;
  private cloudDbUrl: string = '';
  private cloudPollTimer: any = null;
  private botTimer: any = null;

  // 18 Học viên ảo chia đều 6 nhóm (3 học viên / nhóm)
  private readonly botProfiles = [
    // Nhóm 1
    { name: 'Vũ Quang Huy', teamId: 'team_1' as TeamId },
    { name: 'Đỗ Thu Phương', teamId: 'team_1' as TeamId },
    { name: 'Nguyễn Đức Thắng', teamId: 'team_1' as TeamId },
    // Nhóm 2
    { name: 'Lê Hoàng Long', teamId: 'team_2' as TeamId },
    { name: 'Trần Mai Chi', teamId: 'team_2' as TeamId },
    { name: 'Phạm Quốc Bảo', teamId: 'team_2' as TeamId },
    // Nhóm 3
    { name: 'Hoàng Minh Tuấn', teamId: 'team_3' as TeamId },
    { name: 'Ngô Bích Ngọc', teamId: 'team_3' as TeamId },
    { name: 'Đinh Trọng Nghĩa', teamId: 'team_3' as TeamId },
    // Nhóm 4
    { name: 'Bùi Thanh Tùng', teamId: 'team_4' as TeamId },
    { name: 'Lý Lan Hương', teamId: 'team_4' as TeamId },
    { name: 'Dương Tiến Đạt', teamId: 'team_4' as TeamId },
    // Nhóm 5
    { name: 'Phan Anh Quân', teamId: 'team_5' as TeamId },
    { name: 'Võ Quỳnh Nga', teamId: 'team_5' as TeamId },
    { name: 'Hồ Văn Cường', teamId: 'team_5' as TeamId },
    // Nhóm 7
    { name: 'Trương Hải Đăng', teamId: 'team_7' as TeamId },
    { name: 'Lê Thúy Vi', teamId: 'team_7' as TeamId },
    { name: 'Nguyễn Khắc Việt', teamId: 'team_7' as TeamId },
  ];

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.cloudDbUrl = localStorage.getItem(DB_URL_KEY) || import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    } else {
      this.cloudDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    }

    // Khởi tạo state từ localStorage hoặc cấu hình mặc định
    this.state = this.loadInitialState();

    // Khởi tạo BroadcastChannel để đồng bộ tức thì đa tab
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('than_toc_1975_channel');
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          this.state = event.data.payload;
          this.notifyListeners();
        }
      };
    }

    // Bắt đầu đồng bộ Cloud nếu có URL
    if (this.cloudDbUrl) {
      this.startCloudSync();
    }
  }

  private loadInitialState(): FullGameState {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.teams && parsed.roomState) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc local state, khởi tạo mới:', e);
    }

    return {
      roomState: {
        phase: 'WAITING',
        isBotActive: false,
        firebaseDbUrl: this.cloudDbUrl,
      },
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG)),
      players: [],
      liveEvents: [
        {
          id: 'ev_init',
          timestamp: Date.now(),
          message: '🎖️ Chỉ Huy Sở đã thiết lập chiến trường. Sẵn sàng lệnh xuất kích!',
          type: 'info',
        },
      ],
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public getState(): FullGameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  private saveAndBroadcast() {
    // 1. Lưu LocalStorage
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignored
    }

    // 2. Broadcast qua các tab khác
    if (this.channel) {
      this.channel.postMessage({
        type: 'SYNC_STATE',
        payload: this.state,
      });
    }

    // 3. Thông báo các component trong cùng tab
    this.notifyListeners();

    // 4. Đẩy lên Cloud Firebase nếu có URL
    this.pushToCloud();
  }

  private notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Lỗi listener trong sync service:', err);
      }
    });
  }

  // ==========================================
  // CẤU HÌNH & ĐỒNG BỘ CLOUD FIREBASE REST API
  // ==========================================
  public setCloudDbUrl(url: string) {
    this.cloudDbUrl = url.trim().replace(/\/+$/, '');
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_URL_KEY, this.cloudDbUrl);
    }
    this.state.roomState.firebaseDbUrl = this.cloudDbUrl;
    this.saveAndBroadcast();
    this.startCloudSync();
  }

  public getCloudDbUrl(): string {
    return this.cloudDbUrl;
  }

  private startCloudSync() {
    if (this.cloudPollTimer) {
      clearInterval(this.cloudPollTimer);
      this.cloudPollTimer = null;
    }

    if (!this.cloudDbUrl) return;

    // Polling định kỳ 2.5s để đồng bộ trạng thái khi chơi qua nhiều máy
    this.cloudPollTimer = setInterval(async () => {
      if (!this.cloudDbUrl) return;
      try {
        const res = await fetch(`${this.cloudDbUrl}/than_toc_1975.json`);
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && cloudData.teams && cloudData.roomState) {
            // Hợp nhất dữ liệu cloud
            this.state = cloudData;
            this.notifyListeners();
          }
        }
      } catch {
        // Im lặng khi offline
      }
    }, 2500);
  }

  private async pushToCloud() {
    if (!this.cloudDbUrl) return;
    try {
      await fetch(`${this.cloudDbUrl}/than_toc_1975.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state),
      });
    } catch {
      // Ignored
    }
  }

  // ==========================================
  // QUẢN TRỊ TRẠNG THÁI PHÒNG (ADMIN ACTIONS)
  // ==========================================
  public setGamePhase(phase: GamePhase) {
    this.state.roomState.phase = phase;
    if (phase === 'BATTLE' && !this.state.roomState.startedAt) {
      this.state.roomState.startedAt = Date.now();
      this.addLiveEvent('🚀 HIỆU LỆNH TỔNG TIẾN CÔNG ĐÃ PHÁT ĐỘNG! 6 CÁNH QUÂN THẦN TỐC XUẤT KÍCH!', 'info');
    }
    if (phase === 'FINISHED') {
      this.state.roomState.finishedAt = Date.now();
    }
    this.saveAndBroadcast();
  }

  public resetGame() {
    this.setBotActive(false);
    this.state.roomState = {
      phase: 'WAITING',
      startedAt: undefined,
      finishedAt: undefined,
      winnerTeamId: null,
      firebaseDbUrl: this.cloudDbUrl,
      isBotActive: false,
    };
    this.state.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG));
    this.state.players = [];
    this.state.liveEvents = [
      {
        id: 'ev_' + Date.now(),
        timestamp: Date.now(),
        message: '🔄 Chiến trường đã được làm mới. Chuẩn bị ván đấu mới!',
        type: 'info',
      },
    ];
    this.saveAndBroadcast();
  }

  public setCustomQuestions(questions: Question[]) {
    this.state.customQuestions = questions;
    this.addLiveEvent(`📝 Đã nạp ngân hàng ${questions.length} câu hỏi mới vào chiến trường.`, 'info');
    this.saveAndBroadcast();
  }

  // ==========================================
  // HÀNH ĐỘNG CỦA NGƯỜI CHƠI (PLAYER ACTIONS)
  // ==========================================
  public registerPlayer(player: { id: string; name: string; studentCode?: string; teamId: TeamId }): PlayerState {
    let existing = this.state.players.find((p) => p.id === player.id);
    if (!existing) {
      existing = {
        id: player.id,
        name: player.name,
        studentCode: player.studentCode,
        teamId: player.teamId,
        score: 0,
        currentStreak: 0,
        maxStreak: 0,
        correctCount: 0,
        totalAnswered: 0,
        inventory: [],
      };
      this.state.players.push(existing);
    } else {
      existing.name = player.name;
      existing.studentCode = player.studentCode;
      existing.teamId = player.teamId;
    }

    // Cập nhật số thành viên trong đội
    this.recalculateTeamMembers();
    this.addLiveEvent(`🎖️ Chiến sĩ ${player.name} gia nhập ${this.getTeamName(player.teamId)}!`, 'info', player.teamId, player.name);
    this.saveAndBroadcast();
    return existing;
  }

  /**
   * Chiến sĩ trả lời câu hỏi: Tính điểm, streak và đẩy tiến độ xe tăng
   */
  public submitAnswer(playerId: string, isCorrect: boolean): { points: number; newStreak: number; progressGain: number } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { points: 0, newStreak: 0, progressGain: 0 };

    player.totalAnswered += 1;
    let points = 0;
    let progressGain = 0;

    const team = this.state.teams.find((t) => t.id === player.teamId);

    if (isCorrect) {
      soundService.playCorrect();
      player.correctCount += 1;
      player.currentStreak += 1;
      player.maxStreak = Math.max(player.maxStreak, player.currentStreak);

      // Điểm cá nhân: 100 + (streak * 20)
      const isSpeedBoost = !!player.isSpeedBoostActive;
      points = (100 + player.currentStreak * 20) * (isSpeedBoost ? 2 : 1);
      player.score += points;

      // Tiến độ xe tăng: +4% mỗi câu đúng (hoặc +8% nếu có SpeedBoost)
      progressGain = isSpeedBoost ? 8 : 4;

      // Kiểm tra nếu đội bị hiệu ứng CHẶN ĐƯỜNG 7 (làm chậm 50%)
      const isSlowed = team?.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');
      if (isSlowed) {
        progressGain = Math.max(1, Math.round(progressGain * 0.5));
      }

      if (team) {
        team.progress = Math.min(100, team.progress + progressGain);
        team.totalScore += points;
      }

      // Xóa hiệu ứng x2 sau khi dùng
      if (isSpeedBoost) {
        player.isSpeedBoostActive = false;
      }

      // Nhận vật phẩm thưởng mỗi khi streak chia hết cho 3 (3, 6, 9...)
      if (player.currentStreak > 0 && player.currentStreak % 3 === 0) {
        const rewardedItem = this.generateRandomBoostItem();
        player.inventory.push(rewardedItem);
        this.addLiveEvent(
          `🔥 ${player.name} (${this.getTeamName(player.teamId)}) đạt Streak ${player.currentStreak} và nhận được [${rewardedItem.name}]!`,
          'streak',
          player.teamId,
          player.name
        );
      }

      // Kiểm tra điều kiện CẮM CỜ DINH ĐỘC LẬP (100%)
      if (team && team.progress >= 100 && this.state.roomState.phase !== 'FINISHED') {
        this.triggerVictory(team.id, player.name);
      }
    } else {
      soundService.playWrong();
      player.currentStreak = 0;
      player.isSpeedBoostActive = false;
    }

    this.saveAndBroadcast();
    return { points, newStreak: player.currentStreak, progressGain };
  }

  /**
   * Kích hoạt vật phẩm chiến thuật từ túi đồ
   */
  public activateItem(playerId: string, itemId: string, targetTeamId?: TeamId): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;

    const itemIdx = player.inventory.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) return false;

    const item = player.inventory[itemIdx];
    player.inventory.splice(itemIdx, 1); // Trừ vật phẩm

    const sourceTeam = this.state.teams.find((t) => t.id === player.teamId);
    if (!sourceTeam) return false;

    soundService.playBoost();

    switch (item.type) {
      case 'SPEED_ORDER':
        // ⚡ Mệnh lệnh thần tốc: x2 điểm & x2 tiến độ câu tiếp theo
        player.isSpeedBoostActive = true;
        this.addLiveEvent(`⚡ ${player.name} kích hoạt [Mệnh lệnh Thần tốc] (x2 ở câu kế tiếp)!`, 'boost', player.teamId, player.name);
        break;

      case 'TRUONG_SON_PIPE':
        // ⛽ Đường ống Trường Sơn: +6% tiến độ tức thì
        sourceTeam.progress = Math.min(100, sourceTeam.progress + 6);
        this.addLiveEvent(`⛽ [Đường ống Trường Sơn] tiếp viện thần tốc! ${sourceTeam.name} tiến thêm +6%!`, 'boost', sourceTeam.id, player.name);
        if (sourceTeam.progress >= 100) {
          this.triggerVictory(sourceTeam.id, player.name);
        }
        break;

      case 'DAVIS_SHIELD':
        // 🛡️ Lá chắn Trại Davis: Bảo vệ đội nhà trong 10s
        sourceTeam.activeEffects.push({
          id: 'eff_' + Date.now(),
          type: 'DAVIS_SHIELD',
          name: 'Lá chắn Trại Davis',
          appliedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          targetTeamId: sourceTeam.id,
          sourceTeamId: sourceTeam.id,
          sourcePlayerName: player.name,
        });
        this.addLiveEvent(`🛡️ ${sourceTeam.name} bật [Lá chắn Trại Davis] kiên cố trong 10 giây!`, 'boost', sourceTeam.id, player.name);
        break;

      case 'PLEIKU_DECEPTION': {
        // 🎭 Nghi binh Pleiku: Làm rung/nhiễu đội đang dẫn đầu trong 6s
        soundService.playAttack();
        const leadingTeam = [...this.state.teams]
          .filter((t) => t.id !== sourceTeam.id)
          .sort((a, b) => b.progress - a.progress)[0];

        if (leadingTeam) {
          // Kiểm tra nếu đội bị tấn công có Lá chắn Trại Davis
          const hasShield = leadingTeam.activeEffects.some((e) => e.type === 'DAVIS_SHIELD');
          if (hasShield) {
            this.addLiveEvent(`🛡️ [Lá chắn Trại Davis] của ${leadingTeam.name} đã vô hiệu hóa đòn Nghi binh Pleiku!`, 'info', leadingTeam.id);
          } else {
            leadingTeam.activeEffects.push({
              id: 'eff_' + Date.now(),
              type: 'PLEIKU_DECEPTION',
              name: 'Nghi binh Pleiku',
              appliedAt: Date.now(),
              expiresAt: Date.now() + 6000,
              targetTeamId: leadingTeam.id,
              sourceTeamId: sourceTeam.id,
              sourcePlayerName: player.name,
            });
            this.addLiveEvent(
              `🎭 ${player.name} (${sourceTeam.name}) tung đòn [Nghi binh Pleiku] làm rối loạn ${leadingTeam.name} trong 6 giây!`,
              'attack',
              leadingTeam.id,
              player.name
            );
          }
        }
        break;
      }

      case 'ROUTE_7_BLOCK': {
        // 🚧 Chặn đường số 7: Làm chậm 50% đội chỉ định trong 8s
        soundService.playAttack();
        const victimTeamId = targetTeamId || this.findDefaultTargetTeam(sourceTeam.id);
        const victimTeam = this.state.teams.find((t) => t.id === victimTeamId);

        if (victimTeam) {
          const hasShield = victimTeam.activeEffects.some((e) => e.type === 'DAVIS_SHIELD');
          if (hasShield) {
            this.addLiveEvent(`🛡️ [Lá chắn Trại Davis] của ${victimTeam.name} đã chặn đứng đòn cản đường!`, 'info', victimTeam.id);
          } else {
            victimTeam.activeEffects.push({
              id: 'eff_' + Date.now(),
              type: 'ROUTE_7_BLOCK',
              name: 'Chặn đường số 7',
              appliedAt: Date.now(),
              expiresAt: Date.now() + 8000,
              targetTeamId: victimTeam.id,
              sourceTeamId: sourceTeam.id,
              sourcePlayerName: player.name,
            });
            this.addLiveEvent(
              `🚧 ${player.name} (${sourceTeam.name}) lập rào cản [Chặn đường số 7], làm chậm 50% bước tiến của ${victimTeam.name}!`,
              'attack',
              victimTeam.id,
              player.name
            );
          }
        }
        break;
      }
    }

    this.cleanExpiredEffects();
    this.saveAndBroadcast();
    return true;
  }

  // ==========================================
  // CHẾ ĐỘ GIẢ LẬP 18 HỌC VIÊN AI (DEMO BOTS)
  // ==========================================
  public setBotActive(active: boolean) {
    this.state.roomState.isBotActive = active;

    if (active) {
      // Khởi tạo 18 bot nếu chưa có
      this.initBotPlayers();
      this.startBotLoop();
      this.addLiveEvent('🤖 ĐÃ KÍCH HOẠT 18 CHIẾN SĨ GIẢ LẬP VÀO 6 CÁNH QUÂN! Sẵn sàng diễn tập thần tốc!', 'info');
    } else {
      if (this.botTimer) {
        clearInterval(this.botTimer);
        this.botTimer = null;
      }
      this.addLiveEvent('⏸️ Đã tạm dừng các chiến sĩ giả lập.', 'info');
    }

    this.saveAndBroadcast();
  }

  private initBotPlayers() {
    this.botProfiles.forEach((profile, index) => {
      const botId = `bot_${index + 1}`;
      if (!this.state.players.some((p) => p.id === botId)) {
        this.state.players.push({
          id: botId,
          name: profile.name,
          teamId: profile.teamId,
          score: Math.floor(Math.random() * 200),
          currentStreak: 0,
          maxStreak: 0,
          correctCount: 0,
          totalAnswered: 0,
          inventory: [],
          isBot: true,
        });
      }
    });
    this.recalculateTeamMembers();
  }

  private startBotLoop() {
    if (this.botTimer) clearInterval(this.botTimer);

    this.botTimer = setInterval(() => {
      if (!this.state.roomState.isBotActive || this.state.roomState.phase !== 'BATTLE') return;

      // Chọn ngẫu nhiên 1 bot để thực hiện hành động
      const botPlayers = this.state.players.filter((p) => p.isBot);
      if (botPlayers.length === 0) return;

      const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];

      // 82% tỉ lệ trả lời đúng
      const isCorrect = Math.random() < 0.82;
      this.submitAnswer(randomBot.id, isCorrect);

      // Nếu bot có vật phẩm trong túi, 50% tỉ lệ bot tự động tung chiêu
      if (randomBot.inventory.length > 0 && Math.random() < 0.5) {
        const itemToUse = randomBot.inventory[0];
        this.activateItem(randomBot.id, itemToUse.id);
      }

      this.cleanExpiredEffects();
    }, 1800);
  }

  // ==========================================
  // CÁC HÀM TIỆN ÍCH HỖ TRỢ
  // ==========================================
  private triggerVictory(teamId: TeamId, playerName?: string) {
    this.state.roomState.phase = 'FINISHED';
    this.state.roomState.winnerTeamId = teamId;
    this.state.roomState.finishedAt = Date.now();

    const winTeam = this.state.teams.find((t) => t.id === teamId);
    soundService.playVictory();

    this.addLiveEvent(
      `🏆 TOÀN THẮNG 30/4/1975! ${winTeam?.name} (${winTeam?.corpsName}) ĐÃ HÚC ĐỔ CỔNG DINH ĐỘC LẬP VÀ CẮM CỜ ĐẦU TIÊN!`,
      'finish',
      teamId,
      playerName
    );
  }

  private addLiveEvent(message: string, type: LiveBattleEvent['type'], teamId?: TeamId, playerName?: string) {
    this.state.liveEvents.unshift({
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      message,
      type,
      teamId,
      playerName,
    });

    // Giữ tối đa 50 sự kiện gần nhất
    if (this.state.liveEvents.length > 50) {
      this.state.liveEvents.pop();
    }
  }

  private cleanExpiredEffects() {
    const now = Date.now();
    this.state.teams.forEach((team) => {
      team.activeEffects = team.activeEffects.filter((e) => e.expiresAt > now);
    });
  }

  private recalculateTeamMembers() {
    this.state.teams.forEach((team) => {
      team.memberCount = this.state.players.filter((p) => p.teamId === team.id).length;
    });
  }

  private getTeamName(teamId: TeamId): string {
    const team = this.state.teams.find((t) => t.id === teamId);
    return team ? team.name : teamId;
  }

  private findDefaultTargetTeam(excludeTeamId: TeamId): TeamId {
    const otherTeams = this.state.teams
      .filter((t) => t.id !== excludeTeamId)
      .sort((a, b) => b.progress - a.progress);
    return otherTeams[0]?.id || 'team_1';
  }

  private generateRandomBoostItem(): BoostItem {
    const types: ItemType[] = ['SPEED_ORDER', 'TRUONG_SON_PIPE', 'DAVIS_SHIELD', 'PLEIKU_DECEPTION', 'ROUTE_7_BLOCK'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    const meta: Record<ItemType, { name: string; desc: string; icon: string }> = {
      SPEED_ORDER: { name: 'Mệnh lệnh Thần tốc', desc: 'x2 điểm & sức đẩy ở câu tiếp theo', icon: 'Zap' },
      TRUONG_SON_PIPE: { name: 'Đường ống Trường Sơn', desc: 'Cộng thẳng +6% tiến độ xe tăng', icon: 'Fuel' },
      DAVIS_SHIELD: { name: 'Lá chắn Trại Davis', desc: 'Bảo vệ đội nhà miễn nhiễm mọi đòn đánh trong 10s', icon: 'Shield' },
      PLEIKU_DECEPTION: { name: 'Nghi binh Pleiku', desc: 'Làm rung & nhiễu câu hỏi của đội dẫn đầu trong 6s', icon: 'Sparkles' },
      ROUTE_7_BLOCK: { name: 'Chặn đường số 7', desc: 'Làm chậm 50% tiến quân của đối thủ trong 8s', icon: 'AlertTriangle' },
    };

    return {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type: chosenType,
      name: meta[chosenType].name,
      description: meta[chosenType].desc,
      icon: meta[chosenType].icon,
      acquiredAt: Date.now(),
    };
  }
}

export const gameSyncService = new GameSyncService();
