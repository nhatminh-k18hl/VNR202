/**
 * THẦN TỐC 1975 - DỊCH VỤ ĐỒNG BỘ DỮ LIỆU ĐA CHẾ ĐỘ (CLOUD REALTIME + LOCAL MULTI-TAB + AI BOTS)
 * Tích hợp: Trận đánh 5 phút, Phe địch phản kích (Dữ liệu thật 1975), Chợ quân nhu Tactics Draft.
 */

import { HISTORICAL_ENEMY_ATTACKS, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { 
  BoostItem, 
  EnemyCounterAttack,
  GamePhase, 
  ItemType, 
  LiveBattleEvent, 
  PlayerState, 
  Question, 
  RoomState, 
  TacticsMarketItem,
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

const STORAGE_KEY = 'than_toc_1975_state_v2';
const DB_URL_KEY = 'than_toc_1975_firebase_url';

function createDefaultMarketItems(): TacticsMarketItem[] {
  return [
    {
      id: 'mkt_shield_' + Date.now(),
      type: 'DAVIS_SHIELD',
      name: 'Lá Chắn Trại Davis',
      icon: '🛡️',
      description: 'Phòng thủ tuyệt đối: Chặn 100% đòn phản kích của địch trong 12s, bảo vệ trọn vẹn điểm số.',
      stock: 1,
    },
    {
      id: 'mkt_speed_' + Date.now(),
      type: 'SPEED_ORDER',
      name: 'Mệnh Lệnh Thần Tốc',
      icon: '⚡',
      description: 'Nhân đôi tiến độ và điểm số khi kíp lái trả lời chính xác câu hỏi tiếp theo.',
      stock: 1,
    },
    {
      id: 'mkt_pipe_' + Date.now(),
      type: 'TRUONG_SON_PIPE',
      name: 'Xăng Dầu Trường Sơn',
      icon: '⛽',
      description: 'Tiếp tế nhiên liệu dã chiến: Tăng ngay +6% tiến độ cho xe tăng và xóa mọi chấn động.',
      stock: 1,
    },
    {
      id: 'mkt_deception_' + Date.now(),
      type: 'PLEIKU_DECEPTION',
      name: 'Nghi Binh Tây Nguyên',
      icon: '🎭',
      description: 'Nghi binh hỏa mù: Vô hiệu hóa đợt không kích và phân tán hỏa lực địch.',
      stock: 1,
    },
  ];
}

class GameSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private state: FullGameState;
  private cloudDbUrl: string = '';
  private cloudPollTimer: any = null;
  private botTimer: any = null;
  private gameClockTimer: any = null;
  private enemyAttackCheckTimer: any = null;
  private attackCountdownTimer: any = null;

  // 18 Học viên ảo chia đều 6 nhóm (3 học viên / nhóm)
  private readonly botProfiles = [
    { name: 'Vũ Quang Huy', teamId: 'team_1' as TeamId },
    { name: 'Đỗ Thu Phương', teamId: 'team_1' as TeamId },
    { name: 'Nguyễn Đức Thắng', teamId: 'team_1' as TeamId },
    { name: 'Lê Hoàng Long', teamId: 'team_2' as TeamId },
    { name: 'Trần Mai Chi', teamId: 'team_2' as TeamId },
    { name: 'Phạm Quốc Bảo', teamId: 'team_2' as TeamId },
    { name: 'Hoàng Minh Tuấn', teamId: 'team_3' as TeamId },
    { name: 'Ngô Bích Ngọc', teamId: 'team_3' as TeamId },
    { name: 'Đinh Trọng Nghĩa', teamId: 'team_3' as TeamId },
    { name: 'Bùi Thanh Tùng', teamId: 'team_4' as TeamId },
    { name: 'Lý Lan Hương', teamId: 'team_4' as TeamId },
    { name: 'Dương Tiến Đạt', teamId: 'team_4' as TeamId },
    { name: 'Phan Anh Quân', teamId: 'team_5' as TeamId },
    { name: 'Võ Quỳnh Nga', teamId: 'team_5' as TeamId },
    { name: 'Hồ Văn Cường', teamId: 'team_5' as TeamId },
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

    this.state = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('than_toc_1975_channel');
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

    // Khởi động đồng hồ trận đấu
    this.startGameClock();
  }

  private loadInitialState(): FullGameState {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.roomState && parsed.teams) {
            if (!parsed.roomState.tacticsMarket) {
              parsed.roomState.tacticsMarket = createDefaultMarketItems();
            }
            if (typeof parsed.roomState.remainingSeconds !== 'number') {
              parsed.roomState.remainingSeconds = 300;
            }
            return parsed;
          }
        }
      }
    } catch {
      // Ignored
    }

    return {
      roomState: {
        phase: 'WAITING',
        winnerTeamId: null,
        firebaseDbUrl: this.cloudDbUrl,
        isBotActive: false,
        remainingSeconds: 300, // 5 phút đếm ngược
        activeEnemyAttack: null,
        tacticsMarket: createDefaultMarketItems(),
      },
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG)),
      players: [],
      liveEvents: [
        {
          id: 'ev_init',
          timestamp: Date.now(),
          message: '⭐ Sa bàn tác chiến Thần Tốc 1975 đã sẵn sàng nhận lệnh.',
          type: 'info',
        },
      ],
    };
  }

  // ==========================================
  // ĐỒNG HỒ TRẬN ĐẤU (5 PHÚT & PHẢN KÍCH ĐỊCH)
  // ==========================================
  private startGameClock() {
    if (typeof window === 'undefined') return;

    if (this.gameClockTimer) clearInterval(this.gameClockTimer);
    this.gameClockTimer = setInterval(() => {
      if (this.state.roomState.phase === 'BATTLE') {
        // Giảm 1s thời gian trận đấu
        if (this.state.roomState.remainingSeconds > 0) {
          this.state.roomState.remainingSeconds -= 1;
        }

        // Hết giờ: tự động toàn thắng đội dẫn đầu
        if (this.state.roomState.remainingSeconds <= 0) {
          this.finishBattleByTimeOut();
          return;
        }

        // Kiểm tra và dọn dẹp các hiệu ứng hết hạn
        this.cleanExpiredEffects();

        // Kiểm tra phát động Địch phản kích
        this.checkEnemyCounterAttack();

        this.saveAndBroadcast();
      }
    }, 1000);
  }

  private cleanExpiredEffects() {
    const now = Date.now();
    let hasChanged = false;

    this.state.teams.forEach((t) => {
      const active = t.activeEffects.filter((e) => e.expiresAt > now);
      if (active.length !== t.activeEffects.length) {
        t.activeEffects = active;
        hasChanged = true;
      }
    });

    if (hasChanged) {
      this.saveAndBroadcast();
    }
  }

  /**
   * Địch phản kích: Tự động kích hoạt khi có đội tiến nhanh (> 15%)
   */
  private checkEnemyCounterAttack() {
    if (this.state.roomState.activeEnemyAttack) return; // Đang có đợt phản kích chưa xử lý

    // Tìm đội đang dẫn đầu tiến độ
    const leadingTeam = [...this.state.teams].sort((a, b) => b.progress - a.progress)[0];
    if (!leadingTeam || leadingTeam.progress < 15) return;

    // Xác suất 12% mỗi giây kiểm tra (tương đương ~25-35s xảy ra 1 đợt)
    if (Math.random() > 0.12) return;

    // Chọn sự kiện lịch sử tương ứng với tiến độ của đội dẫn đầu
    const attackConfig = HISTORICAL_ENEMY_ATTACKS.find(
      (cfg) => leadingTeam.progress >= cfg.minProgress && leadingTeam.progress < cfg.maxProgress
    ) || HISTORICAL_ENEMY_ATTACKS[HISTORICAL_ENEMY_ATTACKS.length - 1];

    const attack: EnemyCounterAttack = {
      id: 'atk_' + Date.now(),
      targetTeamId: leadingTeam.id,
      targetTeamName: leadingTeam.name,
      historicalEventName: attackConfig.historicalEventName,
      historicalDetail: attackConfig.historicalDetail,
      issuedAt: Date.now(),
      countdownMs: 1200, // 1.2s đếm ngược khẩn cấp
      remainingMs: 1200,
      isDefended: false,
      isResolved: false,
    };

    this.state.roomState.activeEnemyAttack = attack;
    soundService.playAttack();

    this.addLiveEvent(
      `🚨 BÁO ĐỘNG ĐỎ: Địch nã pháo phản kích tại "${attackConfig.historicalEventName}" nhắm vào ${leadingTeam.name}!`,
      'enemy',
      leadingTeam.id
    );

    // Bắt đầu đếm ngược 1.2 giây
    this.startAttackCountdown(attack.id);
  }

  private startAttackCountdown(attackId: string) {
    const stepMs = 100;
    if (this.attackCountdownTimer) clearInterval(this.attackCountdownTimer);

    this.attackCountdownTimer = setInterval(() => {
      const atk = this.state.roomState.activeEnemyAttack;
      if (!atk || atk.id !== attackId || atk.isResolved) {
        clearInterval(this.attackCountdownTimer);
        return;
      }

      atk.remainingMs = Math.max(0, atk.remainingMs - stepMs);

      // Nếu đã hết thời gian đếm ngược mà chưa đỡ được: Bị trúng đạn pháo!
      if (atk.remainingMs <= 0) {
        clearInterval(this.attackCountdownTimer);
        this.resolveEnemyAttackFailed(atk);
      } else {
        this.saveAndBroadcast();
      }
    }, stepMs);
  }

  /**
   * Đỡ đòn thành công khi thành viên kíp lái bấm Kích hoạt Lá chắn hoặc Nghi binh
   */
  public defendEnemyAttack(playerId: string, teamId: TeamId): boolean {
    const atk = this.state.roomState.activeEnemyAttack;
    if (!atk || atk.isResolved || atk.targetTeamId !== teamId) return false;

    const team = this.state.teams.find((t) => t.id === teamId);
    const player = this.state.players.find((p) => p.id === playerId);
    if (!team) return false;

    // Kiểm tra đội có Lá chắn Trại Davis hoặc Nghi binh Tây Nguyên
    const hasShield = team.heldItem?.type === 'DAVIS_SHIELD' || team.activeEffects.some((e) => e.type === 'DAVIS_SHIELD');
    const hasDeception = team.heldItem?.type === 'PLEIKU_DECEPTION';

    if (!hasShield && !hasDeception) {
      return false; // Không có trang bị phòng thủ
    }

    atk.isDefended = true;
    atk.isResolved = true;
    atk.defenderName = player?.name || 'Chiến sĩ kíp lái';
    atk.usedItemType = hasShield ? 'DAVIS_SHIELD' : 'PLEIKU_DECEPTION';

    // Xóa vật phẩm đã dùng
    if (team.heldItem) {
      team.heldItem = null;
    }
    if (player) {
      player.inventory = [];
    }

    // Thưởng điểm phòng thủ phối hợp
    team.totalScore += 150;
    if (player) player.score += 150;

    soundService.playShieldBlock();

    this.addLiveEvent(
      `🛡️ PHÒNG THỦ THÀNH CÔNG! ${atk.defenderName} (${team.name}) đã kích hoạt Lá Chắn bẻ gãy đòn phản kích "${atk.historicalEventName}"! (+150đ)`,
      'boost',
      teamId,
      atk.defenderName
    );

    // Đóng đợt phản kích sau 1.5s để hiển thị thông báo
    setTimeout(() => {
      if (this.state.roomState.activeEnemyAttack?.id === atk.id) {
        this.state.roomState.activeEnemyAttack = null;
        this.saveAndBroadcast();
      }
    }, 1500);

    this.saveAndBroadcast();
    return true;
  }

  /**
   * Không kịp đỡ: Trúng đạn pháo của địch, xe bị khựng lại
   */
  private resolveEnemyAttackFailed(atk: EnemyCounterAttack) {
    atk.isResolved = true;
    atk.isDefended = false;

    const team = this.state.teams.find((t) => t.id === atk.targetTeamId);
    if (team) {
      team.totalScore = Math.max(0, team.totalScore - 100);
      team.progress = Math.max(0, team.progress - 3);

      // Hiệu ứng khựng xe trong 4s
      team.activeEffects.push({
        id: 'eff_shell_' + Date.now(),
        type: 'ROUTE_7_BLOCK',
        name: 'Chấn động pháo kích',
        appliedAt: Date.now(),
        expiresAt: Date.now() + 4000,
        targetTeamId: team.id,
        sourceTeamId: team.id,
        sourcePlayerName: 'Quân ngụy phản kích',
      });
    }

    soundService.playExplosion();

    this.addLiveEvent(
      `💥 TRÚNG ĐẠN PHÁO! ${atk.targetTeamName} bị khựng lại trước đòn phản kích "${atk.historicalEventName}" (-100đ, lùi 3%)!`,
      'enemy',
      atk.targetTeamId
    );

    setTimeout(() => {
      if (this.state.roomState.activeEnemyAttack?.id === atk.id) {
        this.state.roomState.activeEnemyAttack = null;
        this.saveAndBroadcast();
      }
    }, 2000);

    this.saveAndBroadcast();
  }

  // ==========================================
  // CHỢ QUÂN NHU DÃ CHIẾN (TACTICS DRAFT MARKET)
  // ==========================================
  public claimMarketItem(playerId: string, teamId: TeamId, marketItemId: string): { success: boolean; message: string } {
    const team = this.state.teams.find((t) => t.id === teamId);
    const player = this.state.players.find((p) => p.id === playerId);
    if (!team || !player) return { success: false, message: 'Dữ liệu chiến sĩ không hợp lệ!' };

    // Quy tắc sống còn: Mỗi đội chỉ giữ tối đa 1 vật phẩm chưa dùng
    if (team.heldItem !== null) {
      return {
        success: false,
        message: `Kíp xe ${team.name} đã trang bị "${team.heldItem.name}"! Hãy sử dụng trước khi tiếp nhận quân nhu mới.`,
      };
    }

    const marketItem = this.state.roomState.tacticsMarket.find((item) => item.id === marketItemId);
    if (!marketItem || marketItem.stock <= 0) {
      return {
        success: false,
        message: 'Vật phẩm này đã bị cánh quân khác nhanh tay giành mất!',
      };
    }

    // Trừ kho
    marketItem.stock = 0;
    marketItem.claimedByTeamId = teamId;
    marketItem.claimedByTeamName = team.name;
    marketItem.claimedByPlayerName = player.name;

    const newItem: BoostItem = {
      id: 'item_' + Date.now(),
      type: marketItem.type,
      name: marketItem.name,
      description: marketItem.description,
      icon: marketItem.icon,
      acquiredAt: Date.now(),
    };

    team.heldItem = newItem;
    player.inventory = [newItem];

    soundService.playClaimItem();

    this.addLiveEvent(
      `📦 QUÂN NHU TIẾP TẾ: ${player.name} (${team.name}) đã nhanh tay tranh được "${newItem.name}" từ Chợ Quân Nhu!`,
      'boost',
      teamId,
      player.name
    );

    // Nếu chợ hết hàng, tự động tiếp tế sau 15 giây
    const remainingStock = this.state.roomState.tacticsMarket.filter((i) => i.stock > 0).length;
    if (remainingStock === 0) {
      setTimeout(() => {
        this.restockMarket();
      }, 15000);
    }

    this.saveAndBroadcast();
    return { success: true, message: `Trang bị thành công "${newItem.name}" cho kíp xe!` };
  }

  public restockMarket() {
    this.state.roomState.tacticsMarket = createDefaultMarketItems();
    this.addLiveEvent('🚚 ĐOÀN XE VẬN TẢI 559 ĐÃ TIẾP TẾ ĐỢT VẬT PHẨM MỚI VÀO CHỢ QUÂN NHU!', 'info');
    this.saveAndBroadcast();
  }

  /**
   * Kíp lái sử dụng vật phẩm đang giữ
   */
  public useTeamHeldItem(playerId: string, teamId: TeamId): boolean {
    const team = this.state.teams.find((t) => t.id === teamId);
    const player = this.state.players.find((p) => p.id === playerId);
    if (!team || !team.heldItem) return false;

    const item = team.heldItem;
    const playerName = player?.name || 'Chiến sĩ';

    switch (item.type) {
      case 'DAVIS_SHIELD':
        team.activeEffects.push({
          id: 'eff_' + Date.now(),
          type: 'DAVIS_SHIELD',
          name: 'Lá Chắn Trại Davis',
          appliedAt: Date.now(),
          expiresAt: Date.now() + 12000, // 12 giây
          targetTeamId: team.id,
          sourceTeamId: team.id,
          sourcePlayerName: playerName,
        });
        soundService.playBoost();
        this.addLiveEvent(`🛡️ ${playerName} (${team.name}) đã giăng Lá Chắn Trại Davis bảo vệ xe tăng trong 12s!`, 'boost', team.id);
        break;

      case 'SPEED_ORDER':
        if (player) player.isSpeedBoostActive = true;
        team.activeEffects.push({
          id: 'eff_' + Date.now(),
          type: 'SPEED_ORDER',
          name: 'Mệnh Lệnh Thần Tốc',
          appliedAt: Date.now(),
          expiresAt: Date.now() + 15000,
          targetTeamId: team.id,
          sourceTeamId: team.id,
          sourcePlayerName: playerName,
        });
        soundService.playBoost();
        this.addLiveEvent(`⚡ ${playerName} (${team.name}) truyền Mệnh Lệnh Thần Tốc: x2 tốc độ và điểm câu tiếp theo!`, 'boost', team.id);
        break;

      case 'TRUONG_SON_PIPE':
        team.progress = Math.min(100, team.progress + 6);
        team.activeEffects = team.activeEffects.filter((e) => e.type !== 'ROUTE_7_BLOCK');
        soundService.playBoost();
        this.addLiveEvent(`⛽ ${playerName} (${team.name}) kết nối Xăng Dầu Trường Sơn: Xe vọt tiến +6% và hóa giải mọi chấn động!`, 'boost', team.id);
        break;

      case 'PLEIKU_DECEPTION':
        team.activeEffects.push({
          id: 'eff_' + Date.now(),
          type: 'PLEIKU_DECEPTION',
          name: 'Nghi Binh Tây Nguyên',
          appliedAt: Date.now(),
          expiresAt: Date.now() + 10000,
          targetTeamId: team.id,
          sourceTeamId: team.id,
          sourcePlayerName: playerName,
        });
        soundService.playBoost();
        this.addLiveEvent(`🎭 ${playerName} (${team.name}) tung đòn Nghi Binh Tây Nguyên: Hóa giải các đợt không kích của địch!`, 'boost', team.id);
        break;
    }

    // Giải phóng ô chứa vật phẩm của kíp lái
    team.heldItem = null;
    if (player) {
      player.inventory = [];
    }

    this.saveAndBroadcast();
    return true;
  }

  // ==========================================
  // QUẢN LÝ PHÒNG VÀ ĐIỀU KHIỂN CHIẾN TRƯỜNG
  // ==========================================
  public startBattle() {
    this.state.roomState.phase = 'BATTLE';
    this.state.roomState.startedAt = Date.now();
    this.state.roomState.remainingSeconds = 300; // 5 phút chuẩn mực
    this.state.roomState.winnerTeamId = null;
    this.state.roomState.activeEnemyAttack = null;
    this.state.roomState.tacticsMarket = createDefaultMarketItems();

    this.addLiveEvent('📢 HIỆU LỆNH XUẤT KÍCH ĐÃ PHÁT! Trận đánh 5 phút chính thức bắt đầu!', 'progress');
    soundService.playBoost();
    this.saveAndBroadcast();
  }

  public pauseBattle() {
    this.state.roomState.phase = 'PAUSED';
    this.addLiveEvent('⏸️ Chỉ Huy Sở tạm dừng trận đấu.', 'info');
    this.saveAndBroadcast();
  }

  public resumeBattle() {
    this.state.roomState.phase = 'BATTLE';
    this.addLiveEvent('▶️ Chỉ Huy Sở tiếp tục trận đấu!', 'info');
    this.saveAndBroadcast();
  }

  public finishBattleByWinner(winnerTeamId: TeamId) {
    this.state.roomState.phase = 'FINISHED';
    this.state.roomState.finishedAt = Date.now();
    this.state.roomState.winnerTeamId = winnerTeamId;
    this.state.roomState.activeEnemyAttack = null;

    const winnerTeam = this.state.teams.find((t) => t.id === winnerTeamId);
    if (winnerTeam) winnerTeam.progress = 100;

    soundService.playVictory();
    this.addLiveEvent(
      `🚩 TOÀN THẮNG 30/4/1975! Xe tăng của ${winnerTeam?.name} (${winnerTeam?.corpsName}) đã húc đổ cổng Dinh Độc Lập!`,
      'finish',
      winnerTeamId
    );
    this.saveAndBroadcast();
  }

  private finishBattleByTimeOut() {
    this.state.roomState.phase = 'FINISHED';
    this.state.roomState.finishedAt = Date.now();
    this.state.roomState.activeEnemyAttack = null;

    // Đội có tiến độ cao nhất là đội chiến thắng
    const sorted = [...this.state.teams].sort((a, b) => b.progress - a.progress || b.totalScore - a.totalScore);
    const winner = sorted[0];
    this.state.roomState.winnerTeamId = winner.id;

    soundService.playVictory();
    this.addLiveEvent(
      `⌛ HẾT GIỜ CHIẾN DỊCH (5 PHÚT)! ${winner.name} (${winner.corpsName}) dẫn đầu sa bàn và giành chiến thắng lịch sử!`,
      'finish',
      winner.id
    );
    this.saveAndBroadcast();
  }

  public resetGame() {
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
    if (this.attackCountdownTimer) {
      clearInterval(this.attackCountdownTimer);
      this.attackCountdownTimer = null;
    }

    this.state.roomState = {
      phase: 'WAITING',
      startedAt: undefined,
      finishedAt: undefined,
      winnerTeamId: null,
      firebaseDbUrl: this.cloudDbUrl,
      isBotActive: false,
      remainingSeconds: 300,
      activeEnemyAttack: null,
      tacticsMarket: createDefaultMarketItems(),
    };
    this.state.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG));
    this.state.players = [];
    this.state.liveEvents = [
      {
        id: 'ev_' + Date.now(),
        timestamp: Date.now(),
        message: '🔄 Sa bàn đã được đặt lại. Sẵn sàng cho lượt diễn tập mới!',
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

    this.recalculateTeamMembers();
    this.addLiveEvent(`🎖️ Chiến sĩ ${player.name} gia nhập ${this.getTeamName(player.teamId)}!`, 'info', player.teamId, player.name);
    this.saveAndBroadcast();
    return existing;
  }

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

      const isSpeedBoost = !!player.isSpeedBoostActive;
      points = (100 + player.currentStreak * 20) * (isSpeedBoost ? 2 : 1);
      player.score += points;

      progressGain = isSpeedBoost ? 8 : 4;

      const isSlowed = team?.activeEffects.some((e) => e.type === 'ROUTE_7_BLOCK');
      if (isSlowed) {
        progressGain = Math.max(1, Math.round(progressGain * 0.5));
      }

      if (team) {
        team.progress = Math.min(100, team.progress + progressGain);
        team.totalScore += points;
      }

      if (isSpeedBoost) {
        player.isSpeedBoostActive = false;
      }

      // Kiểm tra chạm vạch đích 100%
      if (team && team.progress >= 100 && this.state.roomState.phase === 'BATTLE') {
        this.finishBattleByWinner(team.id);
      }
    } else {
      soundService.playWrong();
      player.currentStreak = 0;
    }

    this.saveAndBroadcast();
    return { points, newStreak: player.currentStreak, progressGain };
  }

  // ==========================================
  // HỆ THỐNG BOT GIẢ LẬP DEMO (18 HỌC VIÊN ẢO)
  // ==========================================
  public toggleBots(): boolean {
    const newStatus = !this.state.roomState.isBotActive;
    this.state.roomState.isBotActive = newStatus;

    if (newStatus) {
      this.botProfiles.forEach((profile, index) => {
        const botId = `bot_${profile.teamId}_${index}`;
        if (!this.state.players.some((p) => p.id === botId)) {
          this.state.players.push({
            id: botId,
            name: profile.name,
            teamId: profile.teamId,
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
      this.recalculateTeamMembers();
      this.startBotSimulation();
      this.addLiveEvent('🤖 Đã kích hoạt 18 học viên giả lập chia đều 6 cánh quân!', 'info');
    } else {
      this.stopBotSimulation();
      this.state.players = this.state.players.filter((p) => !p.isBot);
      this.recalculateTeamMembers();
      this.addLiveEvent('🤖 Đã tắt học viên giả lập.', 'info');
    }

    this.saveAndBroadcast();
    return newStatus;
  }

  private startBotSimulation() {
    if (this.botTimer) clearInterval(this.botTimer);

    this.botTimer = setInterval(() => {
      if (this.state.roomState.phase !== 'BATTLE') return;

      const bots = this.state.players.filter((p) => p.isBot);
      if (bots.length === 0) return;

      // Chọn ngẫu nhiên 1-2 bot hành động
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      const isCorrect = Math.random() > 0.3; // 70% trả lời đúng

      this.submitAnswer(randomBot.id, isCorrect);

      // Bot tự động đỡ đòn phản kích nếu đội mình bị nhắm và có trang bị
      const atk = this.state.roomState.activeEnemyAttack;
      if (atk && !atk.isResolved && atk.targetTeamId === randomBot.teamId) {
        this.defendEnemyAttack(randomBot.id, randomBot.teamId);
      }

      // Bot tranh nhặt đồ từ Chợ Quân Nhu nếu đội chưa có
      const team = this.state.teams.find((t) => t.id === randomBot.teamId);
      if (team && team.heldItem === null && Math.random() > 0.6) {
        const available = this.state.roomState.tacticsMarket.filter((i) => i.stock > 0);
        if (available.length > 0) {
          const itemToClaim = available[Math.floor(Math.random() * available.length)];
          this.claimMarketItem(randomBot.id, randomBot.teamId, itemToClaim.id);
        }
      }
    }, 2800);
  }

  private stopBotSimulation() {
    if (this.botTimer) {
      clearInterval(this.botTimer);
      this.botTimer = null;
    }
  }

  // ==========================================
  // HỖ TRỢ ĐỒNG BỘ LOCAL & CLOUD
  // ==========================================
  private recalculateTeamMembers() {
    const counts: Record<string, number> = {};
    this.state.players.forEach((p) => {
      counts[p.teamId] = (counts[p.teamId] || 0) + 1;
    });
    this.state.teams.forEach((t) => {
      t.memberCount = counts[t.id] || 0;
    });
  }

  private addLiveEvent(message: string, type: LiveBattleEvent['type'], teamId?: TeamId, playerName?: string) {
    const newEvent: LiveBattleEvent = {
      id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      message,
      type,
      teamId,
      playerName,
    };
    this.state.liveEvents.unshift(newEvent);
    if (this.state.liveEvents.length > 25) {
      this.state.liveEvents.pop();
    }
  }

  private getTeamName(teamId: TeamId): string {
    return this.state.teams.find((t) => t.id === teamId)?.name || teamId;
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
      this.channel.postMessage({ type: 'SYNC_STATE', payload: this.state });
    }

    this.notifyListeners();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): FullGameState {
    return this.state;
  }

  public getCloudDbUrl(): string {
    return this.cloudDbUrl;
  }

  public setCloudDbUrl(url: string) {
    this.cloudDbUrl = url.trim().replace(/\/$/, '');
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_URL_KEY, this.cloudDbUrl);
    }
    this.state.roomState.firebaseDbUrl = this.cloudDbUrl;
    this.saveAndBroadcast();
    this.startCloudSync();
  }

  private startCloudSync() {
    if (!this.cloudDbUrl || typeof window === 'undefined') return;
    if (this.cloudPollTimer) clearInterval(this.cloudPollTimer);

    this.cloudPollTimer = setInterval(async () => {
      try {
        const res = await fetch(`${this.cloudDbUrl}/than_toc_1975_room.json`);
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && cloudData.roomState) {
            this.state = cloudData;
            this.notifyListeners();
          }
        }
      } catch {
        // Fallback silently to BroadcastChannel
      }
    }, 3000);
  }
}

export const gameSyncService = new GameSyncService();
