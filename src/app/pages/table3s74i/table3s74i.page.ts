import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular/standalone';
import { Socket } from 'socket.io-client';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { ICardIT, Suit } from 'src/app/shared/domain/models/cardIT.model';
import {
  TressettePlayer,
  TressettePosition,
  TressetteTableView,
  TressetteTrickCard,
} from 'src/app/shared/domain/models/tressette-table.model';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { environment } from 'src/environments/environment';

interface HandMetadataPayload {
  handIndex?: number;
  handNumber?: number;
  currentHandIndex?: number;
  hand?: {
    index?: number;
    number?: number;
  };
}

interface AuthoritativePayload extends HandMetadataPayload {
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
  username?: string;
  playerUsername?: string;
  position?: TressettePosition;
  playerPosition?: TressettePosition;
}

interface TrickEndedPayload extends AuthoritativePayload {
  winner?: string;
  winnerPosition?: TressettePosition;
  trickCards?: TressetteTrickCard[];
}

interface HandLifecyclePayload extends AuthoritativePayload {
  status?: 'in_game' | 'waiting' | 'ended';
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
  handTransitionActive = false;
  handTransitionMessage = '';
  currentHandIndex: number | null = null;

  readonly positions: TressettePosition[] = ['NORD', 'EST', 'SUD', 'OVEST'];
  readonly socketUrl = environment.backend.socketUrl;

  private socket?: Socket;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private trickRevealTimeoutId?: ReturnType<typeof setTimeout>;
  private handTransitionTimeoutId?: ReturnType<typeof setTimeout>;
  private pendingTrickReveal = false;
  private pendingRevealTrick: TressetteTrickCard[] | null = null;
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
    this.clearHandTransition();
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
    return [...(this.table?.myHand ?? [])].sort((a, b) => this.compareCardsForHandDisplay(a, b));
  }

  get currentTurnLabel(): string {
    if (!this.turnPlayerUsername) {
      return '--';
    }

    const position = this.turnPlayerPosition ?? this.resolvePositionByUsername(this.turnPlayerUsername);
    return `${this.turnPlayerUsername} (${position ?? '-'})`;
  }

  get handLabel(): string {
    if (typeof this.currentHandIndex === 'number') {
      return `Mano ${this.currentHandIndex + 1}`;
    }

    return this.table?.status === 'in_game' ? 'Mano 1' : 'Mano in corso';
  }

  onDataModeChange(mode: DataMode): void {
    this.dataModeService.setMode(mode);
  }

  playCard(card: ICardIT): void {
    if (!this.isCardPlayable(card) || !this.socket) {
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

  getSeatCountdown(position: TressettePosition): number | null {
    if (!this.isTurnPosition(position)) {
      return null;
    }

    return this.countdownSeconds;
  }

  getTrickCard(position: TressettePosition): ICardIT | null {
    return this.table?.currentTrick?.find((trickCard) => trickCard.position === position)?.card ?? null;
  }

  isCardPlayable(card: ICardIT): boolean {
    if (!this.canPlayCards) {
      return false;
    }

    const leadSuit = this.getLeadSuit();
    if (leadSuit === null) {
      return true;
    }

    const hasLeadSuitInHand = this.effectiveHandCards.some((entry) => entry.suit === leadSuit);
    if (!hasLeadSuitInHand) {
      return true;
    }

    return card.suit === leadSuit;
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
        this.updateCurrentHandIndex({ table }, table);
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

      const filteredTable: TressetteTableView =
        (this.isAnyTrickRevealActive() && Array.isArray(table.currentTrick) && table.currentTrick.length === 0) ||
        this.shouldDeferEmptyTrickFromSnapshot(table.currentTrick)
          ? {
              ...table,
              currentTrick: undefined,
              myHand: this.isAnyTrickRevealActive() && Array.isArray(table.myHand) && table.myHand.length === 0 ? undefined : table.myHand,
            }
          : table;

      this.applyAuthoritativePayload(
        { table: filteredTable },
        {
          cancelTrickReveal: !this.isAnyTrickRevealActive(),
        }
      );
      this.errorMessage = '';
      this.infoMessage = 'Tavolo aggiornato realtime';
    });

    this.socket.on('tressette:hand-started', (payload?: HandLifecyclePayload) => {
      const previousHandIndex = this.currentHandIndex;
      const applied = this.applyAuthoritativePayload(payload);
      if (!applied && this.table) {
        this.table = { ...this.table, status: 'in_game' };
      }

      this.showHandTransitionIfChanged(previousHandIndex, payload);
      this.errorMessage = '';
      this.infoMessage = 'Mano avviata';
    });

    this.socket.on('tressette:hand-ended', (payload?: HandLifecyclePayload) => {
      this.applyAuthoritativePayload(payload);
      this.infoMessage = 'Mano terminata, in attesa della successiva';
    });

    this.socket.on('tressette:score-updated', (payload?: AuthoritativePayload) => {
      this.applyAuthoritativePayload(payload);
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
      const deferEmptyTrick = this.shouldDeferEmptyTrickFromSnapshot(payload.currentTrick);
      const filteredPayload: AuthoritativePayload = {
        ...payload,
        currentTrick:
          (this.isAnyTrickRevealActive() || deferEmptyTrick) && Array.isArray(payload.currentTrick) && payload.currentTrick.length === 0
            ? undefined
            : payload.currentTrick,
        myHand:
          this.isAnyTrickRevealActive() && Array.isArray(payload.myHand) && payload.myHand.length === 0 ? undefined : payload.myHand,
      };

      const applied = this.applyAuthoritativePayload(filteredPayload, {
        cancelTrickReveal: !this.isAnyTrickRevealActive(),
      });
      if (!applied && !this.isAnyTrickRevealActive()) {
        this.fetchTable();
      }
    });

    this.socket.on('tressette:card-played', (payload: CardPlayedPayload) => {
      this.lastPlayedMessage =
        payload.source === 'timeout_auto' ? 'Carta giocata automaticamente per timeout' : 'Carta giocata';

      this.capturePotentialClosingTrick(payload);
      const deferEmptyTrick = this.shouldDeferEmptyTrickFromSnapshot(payload.currentTrick);
      const filteredPayload: AuthoritativePayload = {
        ...payload,
        currentTrick:
          (this.isAnyTrickRevealActive() || deferEmptyTrick) && Array.isArray(payload.currentTrick) && payload.currentTrick.length === 0
            ? undefined
            : payload.currentTrick,
        myHand:
          this.isAnyTrickRevealActive() && Array.isArray(payload.myHand) && payload.myHand.length === 0 ? undefined : payload.myHand,
      };

      const applied = this.applyAuthoritativePayload(filteredPayload, {
        cancelTrickReveal: !this.isAnyTrickRevealActive(),
      });
      if (!applied && !this.isAnyTrickRevealActive()) {
        this.fetchTable();
      }

      if (payload.nextTurn) {
        this.applyTurnPayload(payload.nextTurn);
      }
    });

    this.socket.on('tressette:trick-ended', (payload: TrickEndedPayload) => {
      const previousTrick = this.table?.currentTrick ?? [];
      const revealTrick = payload.trickCards ?? payload.currentTrick ?? this.pendingRevealTrick ?? previousTrick;

      const winner = payload.winner ?? '-';
      this.trickWinnerMessage = `Prende ${winner}`;
      this.trickRevealActive = true;
      this.pendingTrickReveal = false;
      this.pendingRevealTrick = null;

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
      if (payload?.error?.code === 'INVALID_SUIT_RESPONSE') {
        this.errorMessage = 'Carta non valida: devi rispondere al seme di uscita.';
        return;
      }

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
      this.updateCurrentHandIndex(payload, nextTable);
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

    this.updateCurrentHandIndex(payload, nextTable);
    return changed;
  }


  private updateCurrentHandIndex(
    payload?: HandMetadataPayload | { table?: TressetteTableView },
    fallbackTable?: TressetteTableView
  ): void {
    const parsedHandIndex = this.extractHandIndex(payload);
    if (parsedHandIndex !== null) {
      this.currentHandIndex = parsedHandIndex;
      return;
    }

    if (this.currentHandIndex !== null) {
      return;
    }

    const tableFromPayload = payload && 'table' in payload ? payload.table : undefined;
    const tableForFallback = fallbackTable ?? tableFromPayload ?? this.table;
    if (tableForFallback?.status === 'in_game') {
      // Robust fallback only for missing initial hand metadata: first hand is Mano 1.
      this.currentHandIndex = 0;
    }
  }
  private extractHandIndex(payload?: HandMetadataPayload | { table?: TressetteTableView }): number | null {
    const table = payload && 'table' in payload ? payload.table : undefined;

    const handNumberCandidates = [
      (payload as HandMetadataPayload | undefined)?.handNumber,
      (payload as HandMetadataPayload | undefined)?.hand?.number,
      table?.handNumber,
    ];

    for (const value of handNumberCandidates) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        // handNumber is 1-based (Mano 1, Mano 2, ...). Convert once to internal 0-based index.
        return value - 1;
      }
    }

    const indexCandidates = [
      (payload as HandMetadataPayload | undefined)?.handIndex,
      (payload as HandMetadataPayload | undefined)?.currentHandIndex,
      (payload as HandMetadataPayload | undefined)?.hand?.index,
      table?.handIndex,
    ];

    for (const value of indexCandidates) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, value);
      }
    }

    return null;
  }

  private showHandTransitionIfChanged(previousHandIndex: number | null, payload?: HandLifecyclePayload): void {
    const nextHandIndex = this.extractHandIndex(payload) ?? this.currentHandIndex;
    if (nextHandIndex === null) {
      this.handTransitionMessage = 'Nuova mano iniziata';
      this.handTransitionActive = true;
      this.scheduleHandTransitionHide();
      return;
    }

    if (previousHandIndex === nextHandIndex) {
      return;
    }

    this.handTransitionMessage = `Nuova mano iniziata: Mano ${nextHandIndex + 1}`;
    this.handTransitionActive = true;
    this.scheduleHandTransitionHide();
  }

  private scheduleHandTransitionHide(): void {
    this.clearHandTransition();
    this.handTransitionActive = true;
    this.handTransitionTimeoutId = setTimeout(() => {
      this.handTransitionActive = false;
      this.handTransitionMessage = '';
      this.handTransitionTimeoutId = undefined;
    }, 3000);
  }

  private clearHandTransition(): void {
    if (this.handTransitionTimeoutId) {
      clearTimeout(this.handTransitionTimeoutId);
      this.handTransitionTimeoutId = undefined;
    }
  }

  private scheduleTrickRevealClear(): void {
    this.cancelTrickRevealTimer(false);
    this.trickRevealTimeoutId = setTimeout(() => {
      if (this.table) {
        this.table = { ...this.table, currentTrick: [] };
      }
      this.trickRevealActive = false;
      this.trickWinnerMessage = '';
      this.pendingTrickReveal = false;
      this.pendingRevealTrick = null;
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
      this.pendingTrickReveal = false;
      this.pendingRevealTrick = null;
    }
  }


  private isAnyTrickRevealActive(): boolean {
    return this.trickRevealActive || this.pendingTrickReveal;
  }

  private shouldDeferEmptyTrickFromSnapshot(currentTrick?: TressetteTrickCard[]): boolean {
    if (!Array.isArray(currentTrick) || currentTrick.length !== 0) {
      return false;
    }

    const localTrickLen = this.table?.currentTrick?.length ?? 0;
    return this.trickRevealActive || this.pendingTrickReveal || localTrickLen >= 3;
  }

  private capturePotentialClosingTrick(payload: CardPlayedPayload): void {
    if (!payload.card || (Array.isArray(payload.currentTrick) && payload.currentTrick.length > 0)) {
      return;
    }

    const localTrick = this.table?.currentTrick ?? [];
    if (localTrick.length !== 3) {
      return;
    }

    const position =
      payload.position ??
      payload.playerPosition ??
      this.resolvePositionByUsername(payload.username ?? payload.playerUsername ?? '') ??
      this.turnPlayerPosition;
    if (!position) {
      return;
    }

    const username =
      payload.username ??
      payload.playerUsername ??
      this.table?.players.find((player) => player.position === position)?.username ??
      this.turnPlayerUsername;

    const nextTrick: TressetteTrickCard[] = [...localTrick, { position, username, card: payload.card }];
    this.pendingTrickReveal = true;
    this.pendingRevealTrick = nextTrick;

    if (this.table) {
      this.table = { ...this.table, currentTrick: nextTrick };
    }
  }

  private compareCardsForHandDisplay(left: ICardIT, right: ICardIT): number {
    const suitOrder: Suit[] = [Suit.Denari, Suit.Spade, Suit.Coppe, Suit.Bastoni];
    const sovereigntyOrder = [3, 2, 1, 10, 9, 8, 7, 6, 5, 4];

    const leftSuitIndex = suitOrder.indexOf(left.suit);
    const rightSuitIndex = suitOrder.indexOf(right.suit);
    if (leftSuitIndex !== rightSuitIndex) {
      return leftSuitIndex - rightSuitIndex;
    }

    const leftValueIndex = sovereigntyOrder.indexOf(left.value);
    const rightValueIndex = sovereigntyOrder.indexOf(right.value);
    return leftValueIndex - rightValueIndex;
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

  private getLeadSuit(): number | null {
    if (this.trickRevealActive) {
      return null;
    }

    const leadCard = this.table?.currentTrick?.[0]?.card;
    if (!leadCard || typeof leadCard.suit !== 'number') {
      return null;
    }

    return leadCard.suit;
  }

  private resolvePositionByUsername(username: string): TressettePosition | null {
    if (!username || !this.table) {
      return null;
    }

    return this.table.players.find((player) => player.username === username)?.position ?? null;
  }
}













