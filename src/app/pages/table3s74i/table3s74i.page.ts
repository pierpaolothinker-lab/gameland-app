import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular/standalone';
import { Socket } from 'socket.io-client';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { ICardIT } from 'src/app/shared/domain/models/cardIT.model';
import {
  TressettePlayer,
  TressettePosition,
  TressetteTableView,
  TressetteTrickCard,
} from 'src/app/shared/domain/models/tressette-table.model';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { environment } from 'src/environments/environment';

interface AuthoritativePayload {
  table?: TressetteTableView;
  myHand?: ICardIT[];
  currentTrick?: TressetteTrickCard[];
  points?: { teamSN: number; teamEO: number };
}

interface TurnEventPayload {
  tableId?: string;
  turnPlayer?: string;
  turnPlayerUsername?: string;
  turnPosition?: TressettePosition;
  turnPlayerPosition?: TressettePosition;
  turnDeadlineUtc?: string;
  deadlineUtc?: string;
  turnDeadlineMs?: number;
  secondsRemaining?: number;
  remainingSeconds?: number;
  countdownSeconds?: number;
  timeoutSeconds?: number;
  currentPlayer?: {
    username?: string;
    position?: TressettePosition;
  };
}

interface CardPlayedPayload extends AuthoritativePayload {
  card: ICardIT;
  source?: 'manual' | 'timeout_auto' | string;
  nextTurn?: TurnEventPayload;
}

interface TrickEndedPayload extends AuthoritativePayload {
  winner?: string;
  winnerPosition?: TressettePosition;
  trickCards?: TressetteTrickCard[];
}

@Component({
  selector: 'app-table3s74i',
  templateUrl: './table3s74i.page.html',
  styleUrls: ['./table3s74i.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonSpinner, CommonModule, CardNAComponent],
})
export class Table3s74iPage implements OnInit, OnDestroy {
  table?: TressetteTableView;
  tableId = '';
  loading = false;

  errorMessage = '';
  infoMessage = 'In attesa snapshot tavolo...';
  socketMessage = 'disconnected';

  dataMode: DataMode;
  turnPlayerUsername = '';
  turnPlayerPosition: TressettePosition | null = null;
  countdownSeconds: number | null = null;
  lastPlayedMessage = '';
  trickRevealActive = false;
  trickWinnerMessage = '';

  readonly positions: TressettePosition[] = ['NORD', 'EST', 'SUD', 'OVEST'];
  readonly socketUrl = environment.backend.socketUrl;

  private socket?: Socket;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private trickRevealTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly tableService: TressetteTableService,
    private readonly authSessionService: AuthSessionService,
    private readonly dataModeService: DataModeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.dataMode = this.dataModeService.mode;
  }

  ngOnInit(): void {
    const routeTableId = this.route.snapshot.paramMap.get('tableId')?.trim() ?? '';
    if (!routeTableId) {
      this.errorMessage = 'TableId mancante o non valido';
      this.infoMessage = 'Apri un tavolo dalla lobby.';
      return;
    }

    this.tableId = routeTableId;

    this.dataModeService.mode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => {
        const changed = mode !== this.dataMode;
        this.dataMode = mode;

        if (changed) {
          this.reconnectSocketForMode();
        } else {
          this.ensureSocketConnected();
        }

        this.fetchTable();
      });
  }

  ngOnDestroy(): void {
    this.clearCountdown();
    this.cancelTrickRevealTimer(true);
    this.socket?.disconnect();
  }

  get isSocketConnected(): boolean {
    return this.socketMessage === 'connected';
  }

  get connectionBannerVisible(): boolean {
    return !this.isSocketConnected;
  }

  get myUsername(): string {
    return this.authSessionService.currentUser.username;
  }

  get myPlayer(): TressettePlayer | undefined {
    return this.table?.players.find((player) => player.username === this.myUsername);
  }

  get canPlayCards(): boolean {
    if (!this.table || this.table.status !== 'in_game') {
      return false;
    }

    if (!this.isSocketConnected) {
      return false;
    }

    if (!this.turnPlayerUsername) {
      return false;
    }

    return this.turnPlayerUsername === this.myUsername;
  }

  get effectiveHandCards(): ICardIT[] {
    return this.table?.myHand ?? [];
  }

  get currentTurnLabel(): string {
    if (!this.turnPlayerUsername) {
      return '--';
    }

    const position = this.turnPlayerPosition ?? this.resolvePositionByUsername(this.turnPlayerUsername);
    return `${this.turnPlayerUsername} (${position ?? '-'})`;
  }

  onDataModeChange(mode: DataMode): void {
    this.dataModeService.setMode(mode);
  }

  playCard(card: ICardIT): void {
    if (!this.canPlayCards || !this.socket) {
      this.infoMessage = 'Mossa non disponibile: attendi il tuo turno o riconnessione socket.';
      return;
    }

    this.socket.emit('tressette:play-card', {
      tableId: this.tableId,
      username: this.myUsername,
      card,
    });
    this.infoMessage = `Carta inviata: ${card.value}`;
  }

  goToLobby(): void {
    void this.router.navigate(['/tressette-lobby']);
  }

  getPlayer(position: TressettePosition): TressettePlayer | undefined {
    return this.table?.players.find((player) => player.position === position);
  }

  isTurnPosition(position: TressettePosition): boolean {
    return this.turnPlayerPosition === position;
  }

  getTrickCard(position: TressettePosition): ICardIT | null {
    return this.table?.currentTrick?.find((trickCard) => trickCard.position === position)?.card ?? null;
  }

  getSeatCountdown(position: TressettePosition): number | null {
    if (!this.isTurnPosition(position) || this.countdownSeconds === null) {
      return null;
    }

    return this.countdownSeconds;
  }

  trackByPosition(_: number, position: TressettePosition): TressettePosition {
    return position;
  }

  calculateOffset(_: HTMLElement): { deltaX: number; deltaY: number } {
    return { deltaX: 0, deltaY: 0 };
  }

  private buildWatchPayload(): { tableId: string; mode: DataMode; username: string } {
    return {
      tableId: this.tableId,
      mode: this.dataMode,
      username: this.myUsername,
    };
  }

  private fetchTable(): void {
    this.loading = true;

    this.tableService.getTableRealtime(this.tableId).subscribe({
      next: (table) => {
        this.table = table;
        this.loading = false;
        this.errorMessage = '';
        this.infoMessage = `Snapshot tavolo ${table.tableId} caricato`;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Tavolo non trovato o backend non raggiungibile.';
      },
    });
  }

  private reconnectSocketForMode(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }

    this.socketMessage = 'disconnected';
    this.ensureSocketConnected();
  }

  private ensureSocketConnected(): void {
    if (this.socket || !this.tableId) {
      return;
    }

    this.socket = this.tableService.connectSocket();

    this.socket.on('connect', () => {
      this.socketMessage = 'connected';
      this.infoMessage = 'Socket connesso';
      console.info('[tressette][socket] connected', {
        tableId: this.tableId,
        socketUrl: this.socketUrl,
        mode: this.dataMode,
      });
      this.socket?.emit('tressette:watch-table', this.buildWatchPayload());
    });

    this.socket.on('disconnect', (reason: string) => {
      this.socketMessage = `disconnected (${reason ?? 'unknown'})`;
      console.warn('[tressette][socket] disconnected', { tableId: this.tableId, reason, mode: this.dataMode });
    });

    this.socket.on('tressette:table-updated', (table: TressetteTableView) => {
      if (table.tableId !== this.tableId) {
        return;
      }

      this.applyAuthoritativePayload({ table });
      this.errorMessage = '';
      this.infoMessage = 'Tavolo aggiornato realtime';
    });

    this.socket.on('tressette:hand-started', (payload?: { table?: TressetteTableView }) => {
      const applied = this.applyAuthoritativePayload(payload);
      if (!applied && this.table) {
        this.table = { ...this.table, status: 'in_game' };
      }

      this.errorMessage = '';
      this.infoMessage = 'Mano avviata';
    });

    this.socket.on('tressette:turn-started', (payload: TurnEventPayload) => {
      this.applyTurnPayload(payload);
    });

    this.socket.on('tressette:turn-bootstrap', (payload: TurnEventPayload & AuthoritativePayload) => {
      this.applyAuthoritativePayload(payload);
      this.applyTurnPayload(payload);
    });

    this.socket.on('tressette:turn-updated', (payload: TurnEventPayload) => {
      this.applyTurnPayload(payload);
    });

    this.socket.on('tressette:player-state', (payload: AuthoritativePayload) => {
      const applied = this.applyAuthoritativePayload(payload);
      if (!applied) {
        this.fetchTable();
      }
    });

    this.socket.on('tressette:card-played', (payload: CardPlayedPayload) => {
      this.lastPlayedMessage =
        payload.source === 'timeout_auto' ? 'Carta giocata automaticamente per timeout' : 'Carta giocata';

      const filteredPayload: AuthoritativePayload = {
        ...payload,
        currentTrick:
          this.trickRevealActive && Array.isArray(payload.currentTrick) && payload.currentTrick.length === 0
            ? undefined
            : payload.currentTrick,
      };

      const applied = this.applyAuthoritativePayload(filteredPayload, {
        cancelTrickReveal: !this.trickRevealActive,
      });
      if (!applied) {
        this.fetchTable();
      }

      if (payload.nextTurn) {
        this.applyTurnPayload(payload.nextTurn);
      }
    });

    this.socket.on('tressette:trick-ended', (payload: TrickEndedPayload) => {
      const previousTrick = this.table?.currentTrick ?? [];
      const revealTrick = payload.trickCards ?? payload.currentTrick ?? previousTrick;

      const winner = payload.winner ?? '-';
      const position = payload.winnerPosition ? ` (${payload.winnerPosition})` : '';
      this.trickWinnerMessage = `Trick presa da: ${winner}${position}`;
      this.trickRevealActive = true;

      const payloadWithoutTrick: AuthoritativePayload = {
        ...payload,
        currentTrick: undefined,
        table: payload.table
          ? {
              ...payload.table,
              currentTrick: undefined,
            }
          : undefined,
      };

      const applied = this.applyAuthoritativePayload(payloadWithoutTrick, { cancelTrickReveal: false });
      if (this.table) {
        this.table = { ...this.table, currentTrick: revealTrick };
      } else if (!applied && !this.table) {
        this.fetchTable();
      }

      this.scheduleTrickRevealClear();
      this.infoMessage = this.trickWinnerMessage;
    });

    this.socket.on('tressette:error', (payload: { error?: { code?: string; message?: string } }) => {
      this.errorMessage = payload?.error?.message ?? 'Errore socket';
    });
  }

  private applyAuthoritativePayload(payload?: AuthoritativePayload, options?: { cancelTrickReveal?: boolean }): boolean {
    if (!payload) {
      return false;
    }

    const shouldCancelTrickReveal = options?.cancelTrickReveal ?? true;

    if (payload.table) {
      if (payload.table.tableId !== this.tableId) {
        return false;
      }

      if (shouldCancelTrickReveal) {
        this.cancelTrickRevealTimer(true);
      }

      const previousTable = this.table;
      const nextTable: TressetteTableView = {
        ...payload.table,
        myHand: payload.table.myHand ?? previousTable?.myHand ?? [],
        currentTrick: payload.table.currentTrick ?? previousTable?.currentTrick ?? [],
      };

      this.table = nextTable;
      return true;
    }

    if (!this.table) {
      return false;
    }

    let changed = false;
    let nextTable = this.table;

    if (Array.isArray(payload.myHand)) {
      nextTable = { ...nextTable, myHand: payload.myHand };
      changed = true;
    }

    if (Array.isArray(payload.currentTrick)) {
      nextTable = { ...nextTable, currentTrick: payload.currentTrick };
      changed = true;
    }

    if (payload.points) {
      nextTable = { ...nextTable, points: payload.points };
      changed = true;
    }

    if (changed) {
      if (shouldCancelTrickReveal) {
        this.cancelTrickRevealTimer(true);
      }
      this.table = nextTable;
    }

    return changed;
  }

  private scheduleTrickRevealClear(): void {
    this.cancelTrickRevealTimer(false);
    this.trickRevealTimeoutId = setTimeout(() => {
      if (this.table) {
        this.table = { ...this.table, currentTrick: [] };
      }
      this.trickRevealActive = false;
      this.trickWinnerMessage = '';
      this.trickRevealTimeoutId = undefined;
    }, 2000);
  }

  private cancelTrickRevealTimer(resetMessage: boolean): void {
    if (this.trickRevealTimeoutId) {
      clearTimeout(this.trickRevealTimeoutId);
      this.trickRevealTimeoutId = undefined;
    }

    if (resetMessage) {
      this.trickRevealActive = false;
      this.trickWinnerMessage = '';
    }
  }

  private applyTurnPayload(payload: TurnEventPayload): void {
    if (payload.tableId && payload.tableId !== this.tableId) {
      return;
    }

    this.turnPlayerUsername = payload.turnPlayerUsername ?? payload.turnPlayer ?? payload.currentPlayer?.username ?? '';
    this.turnPlayerPosition =
      payload.turnPlayerPosition ??
      payload.turnPosition ??
      payload.currentPlayer?.position ??
      this.resolvePositionByUsername(this.turnPlayerUsername);

    const initial = this.resolveInitialCountdown(payload);
    this.startCountdown(initial);
  }

  private resolveInitialCountdown(payload: TurnEventPayload): number {
    if (typeof payload.secondsRemaining === 'number') {
      return Math.max(0, payload.secondsRemaining);
    }

    if (typeof payload.remainingSeconds === 'number') {
      return Math.max(0, payload.remainingSeconds);
    }

    if (typeof payload.turnDeadlineMs === 'number') {
      return Math.max(0, Math.ceil((payload.turnDeadlineMs - Date.now()) / 1000));
    }

    const deadlineUtc = payload.turnDeadlineUtc ?? payload.deadlineUtc;
    if (deadlineUtc) {
      const deadlineMs = Date.parse(deadlineUtc);
      if (!Number.isNaN(deadlineMs)) {
        return Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
      }
    }

    const fallback = payload.countdownSeconds ?? payload.timeoutSeconds ?? 20;
    return Math.max(0, fallback);
  }

  private startCountdown(startFrom: number): void {
    this.clearCountdown();
    this.countdownSeconds = startFrom;

    if (startFrom <= 0) {
      return;
    }

    this.countdownInterval = setInterval(() => {
      if (this.countdownSeconds === null) {
        return;
      }

      if (this.countdownSeconds <= 0) {
        this.clearCountdown();
        this.countdownSeconds = 0;
        return;
      }

      this.countdownSeconds -= 1;
      if (this.countdownSeconds <= 0) {
        this.clearCountdown();
        this.countdownSeconds = 0;
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  private resolvePositionByUsername(username: string): TressettePosition | null {
    if (!username || !this.table) {
      return null;
    }

    return this.table.players.find((player) => player.username === username)?.position ?? null;
  }
}
