/**
 * THẦN TỐC 1975 - DỊCH VỤ ĐỒNG BỘ DỮ LIỆU ĐA CHẾ ĐỘ
 * Hỗ trợ thi đua đồng đội, Địch Phản Kích Theo Trọng Số Xác Suất, Hòm Tiếp Viện & Easter Eggs
 */

import { HISTORICAL_COUNTER_ATTACKS, INITIAL_TEAMS_CONFIG } from '../config/adminAuth';
import { 
  AnswerKey,
  BoostItem, 
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
import { Peer, type DataConnection } from 'peerjs';

type SyncListener = (state: FullGameState) => void;
type CountdownListener = (secondsRemaining: number) => void;

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

const STORAGE_KEY = 'than_toc_1975_state_v3';
const DB_URL_KEY = 'than_toc_1975_firebase_url';
export const DEFAULT_HOST_ROOM_ID = 'thantoc_vnr1975';

class GameSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private countdownListeners: Set<CountdownListener> = new Set();
  private state: FullGameState;
  private cloudDbUrl: string = '';
  private cloudPollTimer: any = null;
  private mainGameLoopTimer: any = null;
  private botTimer: any = null;
  private countdownTimer: any = null;

  // P2P WebRTC networking
  private peer: Peer | null = null;
  private isHost: boolean = false;
  private networkMode: 'standalone' | 'host' | 'client' = 'standalone';
  private hostConnections: Map<string, DataConnection> = new Map();
  private clientConnection: DataConnection | null = null;
  private clientReconnectTimer: any = null;
  private p2pConnectedCount: number = 0;
  private isClientConnectedToHost: boolean = false;
  private cloudStatus: 'ok' | 'error' | 'idle' = 'idle';

  // 18 Học viên ảo chia đều 6 nhóm (3 học viên / nhóm)
  private readonly botProfiles: { name: string; teamId: TeamId }[] = [
    // Nhóm 1
    { name: 'Vũ Quang Huy', teamId: 'team_1' },
    { name: 'Đỗ Thu Phương', teamId: 'team_1' },
    { name: 'Nguyễn Đức Thắng', teamId: 'team_1' },
    // Nhóm 2
    { name: 'Lê Hoàng Long', teamId: 'team_2' },
    { name: 'Trần Mai Chi', teamId: 'team_2' },
    { name: 'Phạm Quốc Bảo', teamId: 'team_2' },
    // Nhóm 3
    { name: 'Hoàng Minh Tuấn', teamId: 'team_3' },
    { name: 'Ngô Bích Ngọc', teamId: 'team_3' },
    { name: 'Đinh Trọng Nghĩa', teamId: 'team_3' },
    // Nhóm 4
    { name: 'Bùi Thanh Tùng', teamId: 'team_4' },
    { name: 'Lý Lan Hương', teamId: 'team_4' },
    { name: 'Dương Tiến Đạt', teamId: 'team_4' },
    // Nhóm 5
    { name: 'Phan Anh Quân', teamId: 'team_5' },
    { name: 'Võ Quỳnh Nga', teamId: 'team_5' },
    { name: 'Hồ Văn Cường', teamId: 'team_5' },
    // Nhóm 7
    { name: 'Trương Hải Đăng', teamId: 'team_7' },
    { name: 'Lê Thúy Vi', teamId: 'team_7' },
    { name: 'Nguyễn Khắc Việt', teamId: 'team_7' },
  ];

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.cloudDbUrl = localStorage.getItem(DB_URL_KEY) || import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    } else {
      this.cloudDbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    }

    this.state = this.loadInitialState();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('than_toc_1975_channel_v3');
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          this.state = event.data.payload;
          this.notifyListeners();
        } else if (event.data?.type === 'COUNTDOWN_TICK') {
          this.notifyCountdown(event.data.seconds);
        }
      };
    }

    if (this.cloudDbUrl) {
      this.startCloudSync();
    }

    this.startMainGameLoop();
  }

  private loadInitialState(): FullGameState {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.teams && parsed.roomState) {
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
        matchDurationSeconds: 300,
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
          message: '🎖️ Chỉ Huy Sở đã mở phòng tác chiến. Sẵn sàng lệnh xuất kích!',
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

    // Gửi cập nhật trực tiếp qua WebRTC P2P tới toàn bộ máy người chơi kết nối
    this.hostConnections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send({
            type: 'SYNC_STATE',
            payload: this.state,
          });
        } catch {
          // Ignored
        }
      }
    });

    this.notifyListeners();
    this.pushToCloud();
  }

  // ==========================================
  // P2P WEBRTC (PEERJS) REALTIME NETWORKING
  // ==========================================
  public initHost(roomId = DEFAULT_HOST_ROOM_ID) {
    if (this.isHost && this.peer && !this.peer.destroyed) return;
    this.isHost = true;
    this.networkMode = 'host';

    try {
      if (this.peer && !this.peer.destroyed) {
        this.peer.destroy();
      }

      this.peer = new Peer(roomId, { debug: 1 });

      this.peer.on('open', (id) => {
        console.log('[P2P Host] Sẵn sàng lắng nghe kết nối với Room ID:', id);
        this.notifyListeners();
      });

      this.peer.on('connection', (conn) => {
        const peerId = conn.peer;
        this.hostConnections.set(peerId, conn);
        this.p2pConnectedCount = this.hostConnections.size;

        conn.on('open', () => {
          conn.send({ type: 'SYNC_STATE', payload: this.getState() });
          this.notifyListeners();
        });

        conn.on('data', (data: any) => {
          this.handleIncomingClientAction(data, conn);
        });

        conn.on('close', () => {
          this.hostConnections.delete(peerId);
          this.p2pConnectedCount = this.hostConnections.size;
          this.notifyListeners();
        });

        conn.on('error', () => {
          this.hostConnections.delete(peerId);
          this.p2pConnectedCount = this.hostConnections.size;
        });
      });

      this.peer.on('error', (err: any) => {
        console.warn('[P2P Host] Peer error:', err?.type || err);
      });
    } catch (e) {
      console.warn('[P2P Host] Lỗi khởi tạo host:', e);
    }
  }

  public initClient(hostId = DEFAULT_HOST_ROOM_ID) {
    if (this.isHost) return;
    this.networkMode = 'client';

    if (this.peer && !this.peer.destroyed && this.clientConnection?.open) return;

    try {
      if (this.peer && !this.peer.destroyed) {
        this.peer.destroy();
      }

      this.peer = new Peer({ debug: 1 });

      this.peer.on('open', () => {
        this.connectToHost(hostId);
      });

      this.peer.on('error', (err) => {
        console.warn('[P2P Client] Peer error:', err);
      });
    } catch (e) {
      console.warn('[P2P Client] Khởi tạo client lỗi:', e);
    }
  }

  private connectToHost(hostId: string) {
    if (!this.peer || this.peer.destroyed) return;

    try {
      const conn = this.peer.connect(hostId, { reliable: true });
      this.clientConnection = conn;

      conn.on('open', () => {
        this.isClientConnectedToHost = true;
        conn.send({ type: 'REQUEST_SYNC' });
        this.notifyListeners();
      });

      conn.on('data', (msg: any) => {
        if (msg?.type === 'SYNC_STATE' && msg.payload) {
          this.state = msg.payload;
          this.notifyListeners();
        } else if (msg?.type === 'COUNTDOWN_TICK') {
          this.notifyCountdown(msg.seconds);
        }
      });

      conn.on('close', () => {
        this.isClientConnectedToHost = false;
        this.notifyListeners();
        if (this.clientReconnectTimer) clearTimeout(this.clientReconnectTimer);
        this.clientReconnectTimer = setTimeout(() => this.connectToHost(hostId), 3000);
      });

      conn.on('error', () => {
        this.isClientConnectedToHost = false;
        this.notifyListeners();
      });
    } catch {
      // Ignored
    }
  }

  private handleIncomingClientAction(data: any, conn: DataConnection) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'REQUEST_SYNC':
        conn.send({ type: 'SYNC_STATE', payload: this.getState() });
        break;

      case 'REGISTER_PLAYER':
        if (data.payload) {
          this.registerPlayer(data.payload);
        }
        break;

      case 'ANSWER_QUESTION':
        if (data.payload) {
          const { playerId, questionId, selectedAnswer, isCorrect } = data.payload;
          this.answerQuestion(playerId, questionId, selectedAnswer, isCorrect);
        }
        break;

      case 'USE_ITEM':
        if (data.payload) {
          const { playerId, itemId, currentQuestion } = data.payload;
          this.useItem(playerId, itemId, currentQuestion);
        }
        break;

      case 'CLAIM_DRAFT':
        if (data.payload) {
          const { draftId, playerId } = data.payload;
          this.claimDraftItem(draftId, playerId);
        }
        break;
    }
  }

  // ==========================================
  // ĐẾM NGƯỢC XUẤT KÍCH (COUNTDOWN 3, 2, 1)
  // ==========================================
  public subscribeCountdown(listener: CountdownListener): () => void {
    this.countdownListeners.add(listener);
    return () => this.countdownListeners.delete(listener);
  }

  private notifyCountdown(seconds: number) {
    this.state.roomState.countdownRemaining = seconds > 0 ? seconds : null;
    soundService.playCountdownTick(seconds === 0);
    this.countdownListeners.forEach((l) => {
      try {
        l(seconds);
      } catch {
        // Ignored
      }
    });
  }

  public startBattleWithCountdown(countdownSeconds: number = 3, onComplete?: () => void) {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    let sec = countdownSeconds;
    this.state.roomState.countdownRemaining = sec;
    this.broadcastCountdown(sec);

    this.countdownTimer = setInterval(() => {
      sec -= 1;
      this.state.roomState.countdownRemaining = sec > 0 ? sec : null;

      if (sec > 0) {
        this.broadcastCountdown(sec);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.state.roomState.countdownRemaining = null;
        this.broadcastCountdown(0);
        soundService.playBattleStart();
        this.setPhase('BATTLE');
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  private broadcastCountdown(sec: number) {
    this.notifyCountdown(sec);

    if (this.channel) {
      this.channel.postMessage({ type: 'COUNTDOWN_TICK', seconds: sec });
    }

    this.hostConnections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send({ type: 'COUNTDOWN_TICK', seconds: sec });
        } catch {
          // Ignored
        }
      }
    });
  }

  public getNetworkStatus() {
    return {
      mode: this.networkMode,
      isHost: this.isHost,
      connectedPeers: this.hostConnections.size,
      isConnectedToHost: this.isClientConnectedToHost,
      cloudStatus: this.cloudStatus,
      cloudDbUrl: this.cloudDbUrl,
    };
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

      // 2. Xử lý Đếm ngược Địch Phản Kích
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
            `🛡️ BẢO VỆ THÀNH CÔNG! [Lá chắn Trại Davis] của ${targetTeam.name} đã đỡ trọn đòn pháo kích!`,
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
          attack.countdownSeconds -= 1;
          hasChanged = true;

          // Hết giờ mà không có khiên: Trúng đòn!
          if (attack.countdownSeconds <= 0) {
            attack.status = 'HIT';
            soundService.playEnemyStrike();

            if (targetTeam) {
              // Thành viên trong đội bị choáng 1-2s & trừ 10% điểm nếu có streak
              this.state.players
                .filter((p) => p.teamId === targetTeam.id)
                .forEach((p) => {
                  p.isShellShocked = true;
                  p.shellShockExpiresAt = Date.now() + 2500;
                  if (p.currentStreak > 0 || p.isSpeedBoostActive) {
                    p.score = Math.max(0, Math.round(p.score * 0.9));
                    p.currentStreak = 0;
                    p.isSpeedBoostActive = false;
                  }
                });

              this.addLiveEvent(
                `💥 TRÚNG ĐẠN! ${targetTeam.name} bị pháo kích trúng! Thành viên bị choáng váng trong giây lát!`,
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

      // 3. Mặc định tự động thả thính mỗi 30 giây (kích hoạt địch phản kích sau 15s nếu đạt mốc 25%)
      if (loopCounter % 30 === 0) {
        this.spawnSupplyDraftDrop(false);
        hasChanged = true;
      }

      // 4. Giải trừ hiệu ứng choáng váng hết hạn
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
  // PVE: ĐỊCH BẮN NGẪU NHIÊN THEO TRỌNG SỐ XÁC SUẤT
  // (Đội nào càng cao điểm/tiến độ thì xác suất bị bắn càng cao hơn)
  // ==========================================
  public triggerHistoricalEnemyAttack() {
    if (this.state.roomState.phase !== 'BATTLE' || this.state.currentEnemyAttack) return;

    const randomEvent = HISTORICAL_COUNTER_ATTACKS[Math.floor(Math.random() * HISTORICAL_COUNTER_ATTACKS.length)];

    // Tính trọng số: đội tiến độ và điểm càng cao thì xác suất bị bắn càng lớn
    // nhưng các đội thấp hơn vẫn có tỉ lệ bị bắn ngẫu nhiên
    const teams = this.state.teams;
    const weights = teams.map((t) => Math.max(10, (t.progress || 0) * 2 + Math.floor((t.totalScore || 0) / 4)));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    let rand = Math.random() * totalWeight;
    let selectedTeam = teams[0];
    for (let i = 0; i < teams.length; i++) {
      if (rand < weights[i]) {
        selectedTeam = teams[i];
        break;
      }
      rand -= weights[i];
    }

    const attack: EnemyCounterAttack = {
      id: 'atk_' + Date.now(),
      eventName: randomEvent.eventName,
      historicalDetail: randomEvent.historicalDetail,
      targetTeamId: selectedTeam.id,
      targetTeamName: selectedTeam.name,
      countdownSeconds: 3,
      totalWarningSeconds: 3,
      initiatedAt: Date.now(),
      strikesAt: Date.now() + 3000,
      status: 'WARNING',
    };

    this.state.currentEnemyAttack = attack;
    this.state.roomState.lastEnemyAttackAt = Date.now();

    // Phát tiếng còi báo động khẩn cấp trên loa Admin (không đọc số 3,2,1)
    soundService.playEnemyAlarm();

    this.addLiveEvent(
      `🚨 [ĐỊCH PHẢN KÍCH] "${randomEvent.eventName}" đang ngắm bắn ${selectedTeam.name}! Hãy bật Khiên ngay!`,
      'attack',
      selectedTeam.id
    );

    this.saveAndBroadcast();
  }

  /**
   * Admin chủ động kích hoạt địch phản kích (delay tối thiểu 20s giữa các lần bất kể bấm hay tự động)
   */
  public manualTriggerHistoricalEnemyAttack(): { success: boolean; message: string } {
    const now = Date.now();
    const lastTime = this.state.roomState.lastEnemyAttackAt || 0;
    const cooldown = 20000; // 20 giây

    if (now - lastTime < cooldown) {
      const remainingSeconds = Math.ceil((cooldown - (now - lastTime)) / 1000);
      return { success: false, message: `Vui lòng chờ thêm ${remainingSeconds}s nữa trước khi kích hoạt phản kích!` };
    }

    this.triggerHistoricalEnemyAttack();
    return { success: true, message: 'Đã kích hoạt đợt địch phản kích thành công!' };
  }

  // ==========================================
  // THẢ TIẾP TẾ / THẢ THÍNH (TỰ ĐỘNG 30S & ADMIN BẤM DELAY 10S)
  // ==========================================
  public spawnSupplyDraftDrop(isManual: boolean = false) {
    if (this.state.roomState.phase !== 'BATTLE') return;

    const availableItems: Omit<BoostItem, 'id' | 'acquiredAt'>[] = [
      {
        type: 'DAVIS_SHIELD',
        name: 'Lá chắn Trại Davis',
        description: 'Đỡ 1 đòn pháo kích của đối phương, bảo vệ toàn đội.',
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

    if (Math.random() < 0.15 && this.state.discoveredEasterEggs.length < 2) {
      availableItems.push({
        type: 'EASTER_COMMUNICATION_CODE',
        name: 'Bản Mật Mã Cơ Yếu 1975',
        description: '[EASTER EGG] Loại bỏ ngay 2 đáp án sai cho câu trắc nghiệm hiện tại.',
        icon: '📻',
        isEasterEgg: true,
      });
    }

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
      '📦 [HÒM TIẾP TẾ ĐÃ RƠI] Hộp đồ đã rơi xuống sa bàn! Click nhanh vào hộp để nhận quà!',
      'info'
    );

    // Mặc định: sau 15s khi thính rơi tự động, nếu đạt mốc 25% thì địch sẽ phản kích
    if (!isManual) {
      setTimeout(() => {
        if (this.state.roomState.phase !== 'BATTLE' || this.state.currentEnemyAttack) return;
        const maxProgress = Math.max(...this.state.teams.map((t) => t.progress));
        if (maxProgress >= 25) {
          const timeSinceLast = Date.now() - (this.state.roomState.lastEnemyAttackAt || 0);
          if (timeSinceLast >= 20000) {
            this.triggerHistoricalEnemyAttack();
          }
        }
      }, 15000);
    }

    this.saveAndBroadcast();
  }

  /**
   * Admin chủ động bấm thả thính (delay tối thiểu 10s giữa 2 lần)
   */
  public manualDropSupplyDraft(): { success: boolean; message: string } {
    const now = Date.now();
    const lastTime = this.state.roomState.lastManualAirdropAt || 0;
    const cooldown = 10000; // 10 giây

    if (now - lastTime < cooldown) {
      const remainingSeconds = Math.ceil((cooldown - (now - lastTime)) / 1000);
      return { success: false, message: `Vui lòng chờ thêm ${remainingSeconds}s nữa trước khi thả thính tiếp!` };
    }

    this.state.roomState.lastManualAirdropAt = now;
    this.spawnSupplyDraftDrop(true);
    return { success: true, message: 'Đã thả hòm tiếp tế thành công xuống sa bàn!' };
  }

  public isItemTypeHeldByTeam(teamId: TeamId, itemType: ItemType): boolean {
    const teamPlayers = this.state.players.filter((p) => p.teamId === teamId);
    return teamPlayers.some((p) => p.inventory.some((i) => i.type === itemType));
  }

  /**
   * Click trực tiếp vào hộp tiếp tế để nhận đồ
   */
  public claimDraftItem(draftId: string, playerId: string): { success: boolean; message: string } {
    const draftIndex = this.state.supplyDraftPool.findIndex((d) => d.id === draftId);
    if (draftIndex === -1) {
      return { success: false, message: 'Hộp tiếp tế đã có người khác nhanh tay lấy rồi!' };
    }

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Không tìm thấy thông tin thành viên!' };
    }

    const draftItem = this.state.supplyDraftPool[draftIndex];

    if (this.isItemTypeHeldByTeam(player.teamId, draftItem.item.type)) {
      return {
        success: false,
        message: `Đội bạn đã có người giữ [${draftItem.item.name}]. Hãy sử dụng trước khi nhận thêm!`,
      };
    }

    player.inventory.push(draftItem.item);
    this.state.supplyDraftPool.splice(draftIndex, 1);

    if (draftItem.item.isEasterEgg) {
      if (!this.state.discoveredEasterEggs.some((e) => e.type === draftItem.item.type)) {
        this.state.discoveredEasterEggs.push(draftItem.item);
      }
      this.addLiveEvent(
        `🌟 [EASTER EGG] ${player.name} (${this.getTeamName(player.teamId)}) đã mở được: [${draftItem.item.name}]!`,
        'easter_egg',
        player.teamId,
        player.name
      );
    } else {
      this.addLiveEvent(
        `📦 ${player.name} (${this.getTeamName(player.teamId)}) đã nhận [${draftItem.item.name}]!`,
        'boost',
        player.teamId,
        player.name
      );
    }

    soundService.playBoost();
    this.saveAndBroadcast();

    if (this.networkMode === 'client' && this.clientConnection?.open) {
      this.clientConnection.send({
        type: 'CLAIM_DRAFT',
        payload: { draftId, playerId },
      });
    }

    return { success: true, message: `Bạn đã nhận [${draftItem.item.name}]!` };
  }

  // ==========================================
  // XỬ LÝ TRẢ LỜI CÂU HỎI
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

      let basePoints = 10;
      if (player.currentStreak >= 3) basePoints += 5;
      if (player.currentStreak >= 5) basePoints += 10;

      if (player.isSpeedBoostActive) {
        basePoints *= 2;
        player.isSpeedBoostActive = false;
        this.addLiveEvent(
          `⚡ ${player.name} nhân đôi điểm số thành công (+${basePoints}đ)!`,
          'boost',
          team.id,
          player.name
        );
      }

      points = basePoints;
      player.score += points;
      team.totalScore += points;

      const progressDelta = 2;
      team.progress = Math.min(100, team.progress + progressDelta);

      if (player.currentStreak % 3 === 0) {
        rolledItem = this.rollItemForPlayer(player);
      }

      player.eliminatedOptions = undefined;

      if (team.progress >= 100) {
        this.triggerVictory(team.id, player.name);
      }
    } else {
      soundService.playWrong();

      if (player.isSpeedBoostActive) {
        const penalty = Math.round(player.score * 0.1);
        player.score = Math.max(0, player.score - penalty);
        team.totalScore = Math.max(0, team.totalScore - penalty);
        player.isSpeedBoostActive = false;
        this.addLiveEvent(
          `⚠️ ${player.name} trả lời sai khi kích hoạt x2, bị trừ -${penalty} điểm!`,
          'info',
          team.id,
          player.name
        );
      }

      player.currentStreak = 0;
      player.eliminatedOptions = undefined;
    }

    this.saveAndBroadcast();

    if (this.networkMode === 'client' && this.clientConnection?.open) {
      this.clientConnection.send({
        type: 'ANSWER_QUESTION',
        payload: { playerId, questionId, selectedAnswer, isCorrect },
      });
    }

    return { pointsEarned: points, streak: player.currentStreak, rolledItem };
  }

  private rollItemForPlayer(player: PlayerState): BoostItem | undefined {
    const candidateTypes: ItemType[] = ['DAVIS_SHIELD', 'TRUONG_SON_LOGISTICS', 'RAPID_DISPATCH', 'SMOKE_SCREEN'];
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
          description: '+5% tiến độ xe tăng.',
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
      `🎖️ ${player.name} đạt chuỗi ${player.currentStreak} 🔥 được tặng [${item.name}]!`,
      'boost',
      player.teamId,
      player.name
    );

    return item;
  }

  // ==========================================
  // SỬ DỤNG VẬT PHẨM
  // ==========================================
  public useItem(playerId: string, itemId: string, currentQuestion?: Question): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;

    const itemIndex = player.inventory.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return false;

    const item = player.inventory[itemIndex];
    const team = this.state.teams.find((t) => t.id === player.teamId);
    if (!team) return false;

    player.inventory.splice(itemIndex, 1);
    soundService.playBoost();

    switch (item.type) {
      case 'DAVIS_SHIELD': {
        team.hasShield = true;
        team.shieldCount = 1;

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
            `🛡️ BẢO VỆ THÀNH CÔNG! ${player.name} kịp thời bật [Lá chắn Trại Davis] hóa giải pháo kích địch!`,
            'defense',
            team.id,
            player.name
          );
        } else {
          this.addLiveEvent(
            `🛡️ ${player.name} đã bật [Lá chắn Trại Davis] sẵn sàng đón đỡ pháo kích địch!`,
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
          `⛽ [Tiếp viện Trường Sơn] bổ sung nhiên liệu! ${team.name} tăng thêm +5% tiến độ!`,
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
        this.state.players
          .filter((p) => p.teamId === team.id)
          .forEach((p) => {
            p.isShellShocked = false;
          });
        this.addLiveEvent(
          `💨 ${player.name} tung [Màn khói Ngụy trang] hóa giải choáng cho toàn đội!`,
          'defense',
          team.id,
          player.name
        );
        break;
      }

      case 'EASTER_COMMUNICATION_CODE': {
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
          `🚩 [CỜ THÊU TOÀN THẮNG] Toàn đội ${team.name} nhận ngay +100 điểm!`,
          'easter_egg',
          team.id,
          player.name
        );
        break;
      }
    }

    this.saveAndBroadcast();

    if (this.networkMode === 'client' && this.clientConnection?.open) {
      this.clientConnection.send({
        type: 'USE_ITEM',
        payload: { playerId, itemId, currentQuestion },
      });
    }

    return true;
  }

  // ==========================================
  // ĐIỀU KHIỂN PHÒNG
  // ==========================================
  public registerPlayer(playerData: {
    id: string;
    name: string;
    studentCode?: string;
    teamId: TeamId;
    role?: string;
  }): PlayerState {
    const existingIndex = this.state.players.findIndex((p) => p.id === playerData.id);

    const newPlayer: PlayerState = {
      id: playerData.id,
      name: playerData.name.trim(),
      studentCode: playerData.studentCode?.trim(),
      teamId: playerData.teamId,
      role: playerData.role || 'Thành viên',
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
      soundService.playPlayerJoin();
    }

    this.updateTeamMemberCounts();
    this.saveAndBroadcast();

    if (this.networkMode === 'client' && this.clientConnection?.open) {
      this.clientConnection.send({
        type: 'REGISTER_PLAYER',
        payload: playerData,
      });
    }

    return newPlayer;
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
    this.state.roomState.lastManualAirdropAt = undefined;
    this.state.roomState.lastEnemyAttackAt = undefined;

    this.state.currentEnemyAttack = null;
    this.state.supplyDraftPool = [];
    this.state.discoveredEasterEggs = [];

    this.state.teams = JSON.parse(JSON.stringify(INITIAL_TEAMS_CONFIG));

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

    const sortedTeams = [...this.state.teams].sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress;
      return b.totalScore - a.totalScore;
    });

    const winner = sortedTeams[0];
    this.triggerVictory(winner.id, 'Hết 5 phút tác chiến');
  }

  // ==========================================
  // AI BOTS GIẢ LẬP
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
            role: 'Thành viên',
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
      this.addLiveEvent('🤖 18 Học viên ảo đã tham gia 6 nhóm để thao diễn!', 'info');
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

      const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
      const isCorrect = Math.random() < 0.75;

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

      this.answerQuestion(randomBot.id, 'q_bot', 'A', isCorrect);

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
    this.addLiveEvent(`📚 Đã cập nhật ${questions.length} câu hỏi mới!`, 'info');
    this.saveAndBroadcast();
  }

  private getTeamName(teamId: TeamId): string {
    const t = this.state.teams.find((x) => x.id === teamId);
    return t ? t.name : teamId;
  }
}

export const gameSyncService = new GameSyncService();
