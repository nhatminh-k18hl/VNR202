/**
 * THẦN TỐC 1975 - DỊCH VỤ ĐỒNG BỘ DỮ LIỆU ĐA CHẾ ĐỘ
 * Hỗ trợ Co-op Kíp Lái Xe Tăng, PvE Địch Phản Kích Lịch Sử, Hòm Tiếp Viện & Easter Eggs
 */

import { HISTORICAL_COUNTER_ATTACKS, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { 
  AnswerKey,
  BoostItem, 
  CrewRole,
  EnemyCounterAttack,
  GamePhase, 
  ItemType, 
  LiveBattleEvent, 
  PlayerState, 
  Question, 
  RoomState, 
  SupplyDraftItem,
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
  currentEnemyAttack: EnemyCounterAttack | null;
  supplyDraftPool: SupplyDraftItem[];
  discoveredEasterEggs: BoostItem[];
}

const STORAGE_KEY = 'than_toc_1975_state_v2';
const DB_URL_KEY = 'than_toc_1975_firebase_url';

class GameSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private state: FullGameState;
  private cloudDbUrl: string = '';
  private cloudPollTimer: any = null;
  private mainGameLoopTimer: any = null;
  private botTimer: any = null;

  // 18 Học viên ảo chia đều 6 nhóm (3 học viên / nhóm)
  private readonly botProfiles: { name: string; teamId: TeamId; role: CrewRole }[] = [
    // Nhóm 1
    { name: 'Vũ Quang Huy', teamId: 'team_1', role: 'COMMANDER' },
    { name: 'Đỗ Thu Phương', teamId: 'team_1', role: 'GUNNER' },
    { name: 'Nguyễn Đức Thắng', teamId: 'team_1', role: 'DRIVER' },
    // Nhóm 2
    { name: 'Lê Hoàng Long', teamId: 'team_2', role: 'COMMANDER' },
    { name: 'Trần Mai Chi', teamId: 'team_2', role: 'GUNNER' },
    { name: 'Phạm Quốc Bảo', teamId: 'team_2', role: 'DRIVER' },
    // Nhóm 3
    { name: 'Hoàng Minh Tuấn', teamId: 'team_3', role: 'COMMANDER' },
    { name: 'Ngô Bích Ngọc', teamId: 'team_3', role: 'GUNNER' },
    { name: 'Đinh Trọng Nghĩa', teamId: 'team_3', role: 'DRIVER' },
    // Nhóm 4
    { name: 'Bùi Thanh Tùng', teamId: 'team_4', role: 'COMMANDER' },
    { name: 'Lý Lan Hương', teamId: 'team_4', role: 'GUNNER' },
    { name: 'Dương Tiến Đạt', teamId: 'team_4', role: 'DRIVER' },
    // Nhóm 5
    { name: 'Phan Anh Quân', teamId: 'team_5', role: 'COMMANDER' },
    { name: 'Võ Quỳnh Nga', teamId: 'team_5', role: 'GUNNER' },
    { name: 'Hồ Văn Cường', teamId: 'team_5', role: 'DRIVER' },
    // Nhóm 7
    { name: 'Trương Hải Đăng', teamId: 'team_7', role: 'COMMANDER' },
    { name: 'Lê Thúy Vi', teamId: 'team_7', role: 'GUNNER' },
    { name: 'Nguyễn Khắc Việt', teamId: 'team_7', role: 'DRIVER' },
  ];

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.cloudDbUrl = localStorage.getItem(DB_URL_KEY) || import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    } else {
      this.cloudDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    }

    this.state = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('than_toc_1975_channel_v2');
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          this.state = event.data.payload;
          this.notifyListeners();
        }
      };
    }

    if (this.cloudDbUrl) {
      this.startCloudSync();
    }

    // Khởi động vòng lặp đếm ngược 1s
    this.startMainGameLoop();
  }

  private loadInitialState(): FullGameState {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.teams && parsed.roomState) {
            // Đảm bảo các mảng mới không bị undefined
            parsed.currentEnemyAttack = parsed.currentEnemyAttack || null;
            parsed.supplyDraftPool = parsed.supplyDraftPool || [];
            parsed.discoveredEasterEggs = parsed.discoveredEasterEggs || [];
            parsed.roomState.matchDurationSeconds = parsed.roomState.matchDurationSeconds || 300;
            parsed.roomState.timeRemainingSeconds = parsed.roomState.timeRemainingSeconds ?? 300;
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
        matchDurationSeconds: 300, // 5 phút
        timeRemainingSeconds: 300,
      },
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG)),
      players: [],
      currentEnemyAttack: null,
      supplyDraftPool: [],
      discoveredEasterEggs: [],
      liveEvents: [
        {
          id: 'ev_init',
          timestamp: Date.now(),
          message: '🎖️ Chỉ Huy Sở đã triển khai sa bàn chiến thuật. Sẵn sàng lệnh xuất kích!',
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
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignored
    }

    if (this.channel) {
      this.channel.postMessage({
        type: 'SYNC_STATE',
        payload: this.state,
      });
    }

    this.notifyListeners();
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
  // CLOUD FIREBASE REST API SYNC
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

    this.cloudPollTimer = setInterval(async () => {
      try {
        const res = await fetch(`${this.cloudDbUrl}/than_toc_1975.json`);
        if (res.ok) {
          const remoteData = await res.json();
          if (remoteData && remoteData.teams && remoteData.roomState) {
            this.state = remoteData;
            this.notifyListeners();
          }
        }
      } catch {
        // Ignored
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
  // VÒNG LẶP CHÍNH (MATCH TIMER & PVE THREAT)
  // ==========================================
  private startMainGameLoop() {
    if (this.mainGameLoopTimer) {
      clearInterval(this.mainGameLoopTimer);
    }

    let loopCounter = 0;

    this.mainGameLoopTimer = setInterval(() => {
      if (this.state.roomState.phase !== 'BATTLE') return;

      loopCounter++;
      let hasChanged = false;

      // 1. Đếm ngược thời gian trận đấu (5 phút)
      if (this.state.roomState.timeRemainingSeconds > 0) {
        this.state.roomState.timeRemainingSeconds -= 1;
        hasChanged = true;

        if (this.state.roomState.timeRemainingSeconds <= 0) {
          this.endBattleByTimeout();
          return;
        }
      }

      // 2. Xử lý Đếm ngược Địch Phản Kích (PvE Counter-Attack)
      if (this.state.currentEnemyAttack && this.state.currentEnemyAttack.status === 'WARNING') {
        const attack = this.state.currentEnemyAttack;
        const targetTeam = this.state.teams.find((t) => t.id === attack.targetTeamId);

        // Kiểm tra nếu đội mục tiêu vừa kích hoạt khiên
        if (targetTeam && targetTeam.hasShield) {
          attack.status = 'DEFENDED';
          targetTeam.hasShield = false;
          targetTeam.shieldCount = 0;
          soundService.playShieldBlock();

          this.addLiveEvent(
            `🛡️ KÍP LÁI BẢO TOÀN! [Lá chắn Trại Davis] của ${targetTeam.name} đã đỡ trúng đòn pháo kích!`,
            'defense',
            targetTeam.id
          );

          setTimeout(() => {
            if (this.state.currentEnemyAttack?.id === attack.id) {
              this.state.currentEnemyAttack = null;
              this.saveAndBroadcast();
            }
          }, 2000);

          hasChanged = true;
        } else {
          // Đếm ngược 1s
          attack.countdownSeconds -= 1;
          hasChanged = true;

          // Nếu hết thời gian mà không có khiên: Trúng đòn!
          if (attack.countdownSeconds <= 0) {
            attack.status = 'HIT';
            soundService.playEnemyStrike();

            if (targetTeam) {
              // Phạt kíp lái: Bị choáng váng 5s & trừ 10% điểm nếu có streak
              this.state.players
                .filter((p) => p.teamId === targetTeam.id)
                .forEach((p) => {
                  p.isShellShocked = true;
                  p.shellShockExpiresAt = Date.now() + 5000;
                  if (p.currentStreak > 0 || p.isSpeedBoostActive) {
                    p.score = Math.max(0, Math.round(p.score * 0.9));
                    p.currentStreak = 0;
                    p.isSpeedBoostActive = false;
                  }
                });

              this.addLiveEvent(
                `💥 TRÚNG ĐẠN! ${targetTeam.name} bị pháo kích địch đánh trúng! Kíp lái bị choáng váng trong 5 giây!`,
                'attack',
                targetTeam.id
              );
            }

            setTimeout(() => {
              if (this.state.currentEnemyAttack?.id === attack.id) {
                this.state.currentEnemyAttack = null;
                this.saveAndBroadcast();
              }
            }, 3000);
          }
        }
      }

      // 3. Kích hoạt Đợt Phản Kích Mới Mỗi ~40 giây
      if (loopCounter % 40 === 0 && !this.state.currentEnemyAttack) {
        this.triggerHistoricalEnemyAttack();
        hasChanged = true;
      }

      // 4. Thả Hòm Tiếp Viện Dã Chiến (Supply Drop) Mỗi ~35 giây
      if (loopCounter % 35 === 0) {
        this.spawnSupplyDraftDrop();
        hasChanged = true;
      }

      // 5. Giải trừ hiệu ứng choáng váng kíp lái hết hạn
      const now = Date.now();
      this.state.players.forEach((p) => {
        if (p.isShellShocked && p.shellShockExpiresAt && p.shellShockExpiresAt <= now) {
          p.isShellShocked = false;
          hasChanged = true;
        }
      });

      if (hasChanged) {
        this.saveAndBroadcast();
      }
    }, 1000);
  }

  // ==========================================
  // PVE: ĐỊCH PHẢN KÍCH LỊCH SỬ (CHỐNG TRẢ THẬT)
  // ==========================================
  public triggerHistoricalEnemyAttack() {
    if (this.state.roomState.phase !== 'BATTLE' || this.state.currentEnemyAttack) return;

    // Chọn ngẫu nhiên sự kiện lịch sử chân thực
    const randomEvent = HISTORICAL_COUNTER_ATTACKS[Math.floor(Math.random() * HISTORICAL_COUNTER_ATTACKS.length)];

    // Luôn nhắm vào đội đang dẫn đầu tiến độ hoặc điểm số
    const sortedTeams = [...this.state.teams].sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.totalScore - a.totalScore;
    });
    const leadingTeam = sortedTeams[0] || this.state.teams[0];

    const attack: EnemyCounterAttack = {
      id: 'atk_' + Date.now(),
      eventName: randomEvent.eventName,
      historicalDetail: randomEvent.historicalDetail,
      targetTeamId: leadingTeam.id,
      targetTeamName: leadingTeam.name,
      countdownSeconds: 3,
      totalWarningSeconds: 3,
      initiatedAt: Date.now(),
      strikesAt: Date.now() + 3000,
      status: 'WARNING',
    };

    this.state.currentEnemyAttack = attack;

    // Phát còi báo động khẩn cấp trên loa máy Admin
    soundService.playEnemyAlarm();

    this.addLiveEvent(
      `🚨 [ĐỊCH PHẢN KÍCH] "${randomEvent.eventName}"! Mục tiêu: ${leadingTeam.name}! Va chạm sau 3s... Kíp lái chuẩn bị Khiên!`,
      'attack',
      leadingTeam.id
    );

    this.saveAndBroadcast();
  }

  // ==========================================
  // TACTICAL CHESS: HÒM TIẾP VIỆN DÃ CHIẾN (GIÀNH ĐỒ)
  // ==========================================
  public spawnSupplyDraftDrop() {
    if (this.state.roomState.phase !== 'BATTLE') return;

    const availableItems: Omit<BoostItem, 'id' | 'acquiredAt'>[] = [
      {
        type: 'DAVIS_SHIELD',
        name: 'Lá chắn Trại Davis',
        description: 'Đỡ 1 đòn pháo kích của đối phương, bảo toàn kíp xe.',
        icon: '🛡️',
      },
      {
        type: 'TRUONG_SON_LOGISTICS',
        name: 'Tiếp viện Trường Sơn',
        description: 'Tăng tốc thần tốc +5% tiến độ xe tăng.',
        icon: '⛽',
      },
      {
        type: 'RAPID_DISPATCH',
        name: 'Mệnh lệnh Thần tốc',
        description: 'Nhân đôi điểm (+100%) câu tiếp. Trả lời sai bị trừ -10% điểm!',
        icon: '⚡',
      },
      {
        type: 'SMOKE_SCREEN',
        name: 'Màn khói Ngụy trang',
        description: 'Giải trừ ngay choáng váng do trúng đạn và bảo vệ xe.',
        icon: '💨',
      },
    ];

    // Có 15% cơ hội rơi Easter Egg nếu chưa xuất hiện
    if (Math.random() < 0.15 && this.state.discoveredEasterEggs.length < 2) {
      availableItems.push({
        type: 'EASTER_COMMUNICATION_CODE',
        name: 'Bản Mật Mã Cơ Yếu 1975',
        description: '[EASTER EGG] Loại bỏ ngay 2 đáp án sai cho câu trắc nghiệm hiện tại.',
        icon: '📻',
        isEasterEgg: true,
      });
    }

    // Chọn 2 món thả vào bãi chiến trường
    const dropped: SupplyDraftItem[] = [];
    for (let i = 0; i < 2; i++) {
      const template = availableItems[Math.floor(Math.random() * availableItems.length)];
      dropped.push({
        id: 'draft_' + Date.now() + '_' + i,
        item: {
          ...template,
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          acquiredAt: Date.now(),
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + 25000,
      });
    }

    this.state.supplyDraftPool = dropped;
    soundService.playSupplyDrop();

    this.addLiveEvent(
      '📦 [HÒM TIẾP VIỆN DÃ CHIẾN] Đã được thả dù xuống sa bàn! Các kíp lái hãy nhanh tay trưng dụng!',
      'info'
    );

    this.saveAndBroadcast();
  }

  /**
   * Kiểm tra quy tắc độc quyền vật phẩm:
   * "Mỗi món trong 1 đội chỉ có 1 người giữ"
   */
  public isItemTypeHeldByTeam(teamId: TeamId, itemType: ItemType): boolean {
    const teamPlayers = this.state.players.filter((p) => p.teamId === teamId);
    return teamPlayers.some((p) => p.inventory.some((i) => i.type === itemType));
  }

  /**
   * Người chơi nhặt/giành đồ từ Hòm tiếp viện dã chiến
   */
  public claimDraftItem(draftId: string, playerId: string): { success: boolean; message: string } {
    const draftIndex = this.state.supplyDraftPool.findIndex((d) => d.id === draftId);
    if (draftIndex === -1) {
      return { success: false, message: 'Vật phẩm đã bị người khác nhanh tay lấy mất!' };
    }

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Không tìm thấy thông tin chiến sĩ!' };
    }

    const draftItem = this.state.supplyDraftPool[draftIndex];

    // Quy tắc: Trong đội chưa ai được giữ loại vật phẩm này
    if (this.isItemTypeHeldByTeam(player.teamId, draftItem.item.type)) {
      return {
        success: false,
        message: `Đội bạn đã có chiến sĩ đang giữ [${draftItem.item.name}]. Hãy sử dụng trước khi nhặt thêm!`,
      };
    }

    // Nhặt thành công!
    player.inventory.push(draftItem.item);
    this.state.supplyDraftPool.splice(draftIndex, 1);

    // Nếu là Easter Egg: lưu vào danh sách đã phát hiện trong trận
    if (draftItem.item.isEasterEgg) {
      if (!this.state.discoveredEasterEggs.some((e) => e.type === draftItem.item.type)) {
        this.state.discoveredEasterEggs.push(draftItem.item);
      }
      this.addLiveEvent(
        `🌟 [BẢO VẬT HIẾM] ${player.name} (${this.getTeamName(player.teamId)}) đã phát hiện Easter Egg: [${draftItem.item.name}]!`,
        'easter_egg',
        player.teamId,
        player.name
      );
    } else {
      this.addLiveEvent(
        `📦 ${player.name} (${this.getTeamName(player.teamId)}) đã nhanh tay giành được [${draftItem.item.name}]!`,
        'boost',
        player.teamId,
        player.name
      );
    }

    soundService.playBoost();
    this.saveAndBroadcast();
    return { success: true, message: `Bạn đã giành được [${draftItem.item.name}]!` };
  }

  // ==========================================
  // XỬ LÝ TRẢ LỜI CÂU HỎI (THƯỞNG & PHẠT KÍP LÁI)
  // ==========================================
  public answerQuestion(
    playerId: string,
    questionId: string | number,
    selectedAnswer: AnswerKey,
    isCorrect: boolean
  ): { pointsEarned: number; streak: number; rolledItem?: BoostItem } {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return { pointsEarned: 0, streak: 0 };

    const team = this.state.teams.find((t) => t.id === player.teamId);
    if (!team) return { pointsEarned: 0, streak: 0 };

    player.totalAnswered += 1;
    let points = 0;
    let rolledItem: BoostItem | undefined = undefined;

    if (isCorrect) {
      soundService.playCorrect();
      player.correctCount += 1;
      player.currentStreak += 1;
      if (player.currentStreak > player.maxStreak) {
        player.maxStreak = player.currentStreak;
      }

      // Tính điểm cơ bản + chuỗi streak
      let basePoints = 10;
      if (player.currentStreak >= 3) basePoints += 5;
      if (player.currentStreak >= 5) basePoints += 10;

      // Nhân đôi nếu có Mệnh lệnh Thần tốc
      if (player.isSpeedBoostActive) {
        basePoints *= 2;
        player.isSpeedBoostActive = false;
        this.addLiveEvent(
          `⚡ ${player.name} bứt phá [Mệnh lệnh Thần tốc] nhân đôi điểm số (+${basePoints}đ)!`,
          'boost',
          team.id,
          player.name
        );
      }

      points = basePoints;
      player.score += points;
      team.totalScore += points;

      // Đẩy tiến độ xe tăng (1.5% - 2.5%)
      const progressDelta = 2;
      team.progress = Math.min(100, team.progress + progressDelta);

      // Roll vật phẩm ngẫu nhiên khi đạt Streak 3, 5, 7...
      if (player.currentStreak % 3 === 0) {
        rolledItem = this.rollItemForPlayer(player);
      }

      // Xóa đáp án loại bỏ của Easter Egg sau khi trả lời
      player.eliminatedOptions = undefined;

      // Kiểm tra chiến thắng 100%
      if (team.progress >= 100) {
        this.triggerVictory(team.id, player.name);
      }
    } else {
      soundService.playWrong();

      // CƠ CHẾ PHẠT: Nếu đang bật x2 mà trả lời sai -> Bị phạt trừ 10% điểm!
      if (player.isSpeedBoostActive) {
        const penalty = Math.round(player.score * 0.1);
        player.score = Math.max(0, player.score - penalty);
        team.totalScore = Math.max(0, team.totalScore - penalty);
        player.isSpeedBoostActive = false;
        this.addLiveEvent(
          `⚠️ ${player.name} thất bại khi kích hoạt [Mệnh lệnh Thần tốc], bị trừ -${penalty} điểm!`,
          'info',
          team.id,
          player.name
        );
      }

      player.currentStreak = 0;
      player.eliminatedOptions = undefined;
    }

    this.saveAndBroadcast();
    return { pointsEarned: points, streak: player.currentStreak, rolledItem };
  }

  /**
   * Roll vật phẩm có kiểm tra tính độc quyền đội
   */
  private rollItemForPlayer(player: PlayerState): BoostItem | undefined {
    const candidateTypes: ItemType[] = ['DAVIS_SHIELD', 'TRUONG_SON_LOGISTICS', 'RAPID_DISPATCH', 'SMOKE_SCREEN'];

    // Lọc những loại mà đội CHƯA ai giữ
    const eligibleTypes = candidateTypes.filter((type) => !this.isItemTypeHeldByTeam(player.teamId, type));
    if (eligibleTypes.length === 0) return undefined;

    const chosenType = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)];

    let item: BoostItem;
    switch (chosenType) {
      case 'DAVIS_SHIELD':
        item = {
          id: 'item_' + Date.now(),
          type: 'DAVIS_SHIELD',
          name: 'Lá chắn Trại Davis',
          description: 'Đỡ 1 đòn pháo kích của đối phương.',
          icon: '🛡️',
          acquiredAt: Date.now(),
        };
        break;
      case 'TRUONG_SON_LOGISTICS':
        item = {
          id: 'item_' + Date.now(),
          type: 'TRUONG_SON_LOGISTICS',
          name: 'Tiếp viện Trường Sơn',
          description: '+5% tiến độ xe tăng thần tốc.',
          icon: '⛽',
          acquiredAt: Date.now(),
        };
        break;
      case 'RAPID_DISPATCH':
        item = {
          id: 'item_' + Date.now(),
          type: 'RAPID_DISPATCH',
          name: 'Mệnh lệnh Thần tốc',
          description: 'x2 điểm câu tiếp. Sai bị trừ -10% điểm!',
          icon: '⚡',
          acquiredAt: Date.now(),
        };
        break;
      case 'SMOKE_SCREEN':
      default:
        item = {
          id: 'item_' + Date.now(),
          type: 'SMOKE_SCREEN',
          name: 'Màn khói Ngụy trang',
          description: 'Giải trừ choáng váng do trúng pháo.',
          icon: '💨',
          acquiredAt: Date.now(),
        };
        break;
    }

    player.inventory.push(item);
    this.addLiveEvent(
      `🎖️ ${player.name} đạt Streak ${player.currentStreak} 🔥 được Chỉ Huy Sở cấp [${item.name}]!`,
      'boost',
      player.teamId,
      player.name
    );

    return item;
  }

  // ==========================================
  // SỬ DỤNG VẬT PHẨM (MỤC TIÊU BẢO VỆ & HỖ TRỢ)
  // ==========================================
  public useItem(playerId: string, itemId: string, currentQuestion?: Question): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;

    const itemIndex = player.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = player.inventory[itemIndex];
    const team = this.state.teams.find((t) => t.id === player.teamId);
    if (!team) return false;

    // Sử dụng là hàng dùng 1 lần -> gỡ khỏi túi đồ ngay
    player.inventory.splice(itemIndex, 1);
    soundService.playBoost();

    switch (item.type) {
      case 'DAVIS_SHIELD': {
        team.hasShield = true;
        team.shieldCount = 1;

        // Nếu xe đang bị địch ngắm bắn: Đỡ đòn ngay lập tức!
        if (
          this.state.currentEnemyAttack &&
          this.state.currentEnemyAttack.targetTeamId === team.id &&
          this.state.currentEnemyAttack.status === 'WARNING'
        ) {
          this.state.currentEnemyAttack.status = 'DEFENDED';
          team.hasShield = false;
          team.shieldCount = 0;
          soundService.playShieldBlock();
          this.addLiveEvent(
            `🛡️ KÍP LÁI BẢO TOÀN! ${player.name} kịp thời bật [Lá chắn Trại Davis] hóa giải pháo kích địch!`,
            'defense',
            team.id,
            player.name
          );
        } else {
          this.addLiveEvent(
            `🛡️ ${player.name} đã dựng [Lá chắn Trại Davis] sẵn sàng đón đỡ pháo kích địch!`,
            'defense',
            team.id,
            player.name
          );
        }
        break;
      }

      case 'TRUONG_SON_LOGISTICS': {
        team.progress = Math.min(100, team.progress + 5);
        this.addLiveEvent(
          `⛽ [Tiếp viện Trường Sơn] bơm nhiên liệu! ${team.name} bứt phá thêm +5% tiến độ!`,
          'boost',
          team.id,
          player.name
        );
        if (team.progress >= 100) {
          this.triggerVictory(team.id, player.name);
        }
        break;
      }

      case 'RAPID_DISPATCH': {
        player.isSpeedBoostActive = true;
        this.addLiveEvent(
          `⚡ ${player.name} kích hoạt [Mệnh lệnh Thần tốc] (x2 ở câu đúng tiếp theo, sai phạt -10%)!`,
          'boost',
          team.id,
          player.name
        );
        break;
      }

      case 'SMOKE_SCREEN': {
        // Hóa giải choáng váng toàn bộ thành viên trong đội
        this.state.players
          .filter((p) => p.teamId === team.id)
          .forEach((p) => {
            p.isShellShocked = false;
          });
        this.addLiveEvent(
          `💨 ${player.name} tung [Màn khói Ngụy trang] che mắt địch và hồi phục kíp xe!`,
          'defense',
          team.id,
          player.name
        );
        break;
      }

      case 'EASTER_COMMUNICATION_CODE': {
        // Loại bỏ 2 đáp án sai cho câu hỏi hiện tại
        if (currentQuestion) {
          const keys: AnswerKey[] = ['A', 'B', 'C', 'D'];
          const wrongKeys = keys.filter((k) => k !== currentQuestion.correctAnswer);
          const eliminated = wrongKeys.slice(0, 2);
          player.eliminatedOptions = eliminated;
        }
        this.addLiveEvent(
          `📻 [MẬT MÃ CƠ YẾU] ${player.name} nhận chỉ lệnh loại bỏ 2 phương án sai!`,
          'easter_egg',
          team.id,
          player.name
        );
        break;
      }

      case 'EASTER_VICTORY_BANNER': {
        team.totalScore += 100;
        this.state.players
          .filter((p) => p.teamId === team.id)
          .forEach((p) => {
            p.score += 100;
            p.isShellShocked = false;
          });
        this.addLiveEvent(
          `🚩 [CỜ THÊU QUYẾT THẮNG] Nhuệ khí ngút trời! Toàn đội ${team.name} nhận +100 điểm danh dự!`,
          'easter_egg',
          team.id,
          player.name
        );
        break;
      }
    }

    this.saveAndBroadcast();
    return true;
  }

  // ==========================================
  // ĐIỀU KHIỂN PHÒNG & CHIẾN DỊCH
  // ==========================================
  public registerPlayer(playerData: {
    id: string;
    name: string;
    studentCode?: string;
    teamId: TeamId;
    role?: CrewRole;
  }): PlayerState {
    const existingIndex = this.state.players.findIndex((p) => p.id === playerData.id);

    // Tự động phân chia vai trò kíp lái nếu chưa có
    const teamMembers = this.state.players.filter((p) => p.teamId === playerData.teamId);
    const assignedRole = playerData.role || this.assignCrewRole(teamMembers.length);

    const newPlayer: PlayerState = {
      id: playerData.id,
      name: playerData.name.trim(),
      studentCode: playerData.studentCode?.trim(),
      teamId: playerData.teamId,
      role: assignedRole,
      score: existingIndex !== -1 ? this.state.players[existingIndex].score : 0,
      currentStreak: 0,
      maxStreak: existingIndex !== -1 ? this.state.players[existingIndex].maxStreak : 0,
      correctCount: existingIndex !== -1 ? this.state.players[existingIndex].correctCount : 0,
      totalAnswered: existingIndex !== -1 ? this.state.players[existingIndex].totalAnswered : 0,
      inventory: existingIndex !== -1 ? this.state.players[existingIndex].inventory : [],
    };

    if (existingIndex !== -1) {
      this.state.players[existingIndex] = newPlayer;
    } else {
      this.state.players.push(newPlayer);
    }

    this.updateTeamMemberCounts();
    this.saveAndBroadcast();
    return newPlayer;
  }

  private assignCrewRole(memberIndex: number): CrewRole {
    const roles: CrewRole[] = ['COMMANDER', 'GUNNER', 'DRIVER', 'LOADER', 'RADIO'];
    return roles[memberIndex % roles.length];
  }

  public setPhase(phase: GamePhase) {
    this.state.roomState.phase = phase;
    if (phase === 'BATTLE') {
      this.state.roomState.startedAt = Date.now();
      this.state.roomState.timeRemainingSeconds = this.state.roomState.matchDurationSeconds || 300;
      this.addLiveEvent('🚀 HIỆU LỆNH TỔNG TIẾN CÔNG! Các cánh quân đồng loạt xuất kích!', 'progress');
    }
    this.saveAndBroadcast();
  }

  public resetGame() {
    this.state.roomState.phase = 'WAITING';
    this.state.roomState.startedAt = undefined;
    this.state.roomState.finishedAt = undefined;
    this.state.roomState.winnerTeamId = null;
    this.state.roomState.timeRemainingSeconds = 300;

    this.state.currentEnemyAttack = null;
    this.state.supplyDraftPool = [];
    this.state.discoveredEasterEggs = []; // Xóa các Easter Egg đã xuất hiện khi reset

    this.state.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG));

    // Reset chỉ số chiến sĩ
    this.state.players.forEach((p) => {
      p.score = 0;
      p.currentStreak = 0;
      p.maxStreak = 0;
      p.correctCount = 0;
      p.totalAnswered = 0;
      p.inventory = [];
      p.isSpeedBoostActive = false;
      p.isShellShocked = false;
      p.eliminatedOptions = undefined;
    });

    this.updateTeamMemberCounts();
    this.addLiveEvent('🔄 Chỉ Huy Sở đã cài đặt lại toàn bộ sa bàn chiến trường.', 'info');
    this.saveAndBroadcast();
  }

  private triggerVictory(winnerTeamId: TeamId, heraldPlayerName?: string) {
    if (this.state.roomState.phase === 'FINISHED') return;

    this.state.roomState.phase = 'FINISHED';
    this.state.roomState.finishedAt = Date.now();
    this.state.roomState.winnerTeamId = winnerTeamId;

    const winnerTeam = this.state.teams.find((t) => t.id === winnerTeamId);
    soundService.playVictory();

    this.addLiveEvent(
      `🎉 TOÀN THẮNG 30/4/1975! Xe tăng của ${winnerTeam?.name} (${winnerTeam?.corpsName}) húc đổ cổng Dinh Độc Lập!`,
      'finish',
      winnerTeamId,
      heraldPlayerName
    );

    this.saveAndBroadcast();
  }

  private endBattleByTimeout() {
    if (this.state.roomState.phase === 'FINISHED') return;

    // Tính đội có tiến độ cao nhất (hoặc điểm cao nhất) làm đội thắng
    const sortedTeams = [...this.state.teams].sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.totalScore - a.totalScore;
    });

    const winner = sortedTeams[0];
    this.triggerVictory(winner.id, 'Hết 5 phút tác chiến');
  }

  // ==========================================
  // AI BOTS GIẢ LẬP 18 CHIẾN SĨ
  // ==========================================
  public toggleBots(): boolean {
    const nextState = !this.state.roomState.isBotActive;
    this.state.roomState.isBotActive = nextState;

    if (nextState) {
      this.botProfiles.forEach((bp, index) => {
        const botId = `bot_${bp.teamId}_${index}`;
        if (!this.state.players.some((p) => p.id === botId)) {
          this.state.players.push({
            id: botId,
            name: `${bp.name} (Bot)`,
            teamId: bp.teamId,
            role: bp.role,
            score: 0,
            currentStreak: 0,
            maxStreak: 0,
            correctCount: 0,
            totalAnswered: 0,
            inventory: [],
            isBot: true,
          });
        }
      });
      this.updateTeamMemberCounts();
      this.startBotLoop();
      this.addLiveEvent('🤖 18 Học viên ảo đã gia nhập kíp lái 6 cánh quân để thao diễn!', 'info');
    } else {
      this.stopBotLoop();
      this.state.players = this.state.players.filter((p) => !p.isBot);
      this.updateTeamMemberCounts();
      this.addLiveEvent('🤖 Đã tắt chế độ học viên ảo.', 'info');
    }

    this.saveAndBroadcast();
    return nextState;
  }

  private startBotLoop() {
    if (this.botTimer) clearInterval(this.botTimer);

    this.botTimer = setInterval(() => {
      if (this.state.roomState.phase !== 'BATTLE') return;

      const botPlayers = this.state.players.filter((p) => p.isBot);
      if (botPlayers.length === 0) return;

      // Chọn ngẫu nhiên 1 bot hành động
      const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
      const isCorrect = Math.random() < 0.75; // Tỷ lệ đúng 75%

      // Bot tự động dùng khiên nếu đội mình đang bị ngắm bắn
      const botTeam = this.state.teams.find((t) => t.id === randomBot.teamId);
      if (
        this.state.currentEnemyAttack &&
        this.state.currentEnemyAttack.targetTeamId === botTeam?.id &&
        this.state.currentEnemyAttack.status === 'WARNING'
      ) {
        const shieldItem = randomBot.inventory.find((i) => i.type === 'DAVIS_SHIELD');
        if (shieldItem) {
          this.useItem(randomBot.id, shieldItem.id);
          return;
        }
      }

      // Trả lời câu hỏi
      this.answerQuestion(randomBot.id, 'q_bot', 'A', isCorrect);

      // Bot nhặt hòm tiếp viện nếu có
      if (this.state.supplyDraftPool.length > 0 && Math.random() < 0.4) {
        const draft = this.state.supplyDraftPool[0];
        this.claimDraftItem(draft.id, randomBot.id);
      }
    }, 2800);
  }

  private stopBotLoop() {
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
  }

  // ==========================================
  // TIỆN ÍCH HỖ TRỢ
  // ==========================================
  private updateTeamMemberCounts() {
    this.state.teams.forEach((team) => {
      team.memberCount = this.state.players.filter((p) => p.teamId === team.id).length;
    });
  }

  private addLiveEvent(
    message: string,
    type: LiveBattleEvent['type'],
    teamId?: TeamId,
    playerName?: string
  ) {
    const newEvent: LiveBattleEvent = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      message,
      type,
      teamId,
      playerName,
    };
    this.state.liveEvents.unshift(newEvent);
    if (this.state.liveEvents.length > 40) {
      this.state.liveEvents.pop();
    }
  }

  public setCustomQuestions(questions: Question[]) {
    this.state.customQuestions = questions;
    this.addLiveEvent(`📚 Chỉ Huy Sở đã cập nhật bộ đề tác chiến gồm ${questions.length} câu hỏi!`, 'info');
    this.saveAndBroadcast();
  }

  private getTeamName(teamId: TeamId): string {
    const t = this.state.teams.find((x) => x.id === teamId);
    return t ? t.name : teamId;
  }
}

export const gameSyncService = new GameSyncService();
