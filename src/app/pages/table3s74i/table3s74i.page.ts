import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonSpinner } from '@ionic/angular/standalone';
import { Socket } from 'socket.io-client';

import { AuthSessionService } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { DeckITService } from 'src/app/services/fakes/deck-it.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { ICardIT } from 'src/app/shared/domain/models/cardIT.model';
import { TressettePlayer, TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { environment } from 'src/environments/environment';

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
}

interface CardPlayedPayload {
  position?: TressettePosition;
  turnPlayerPosition?: TressettePosition;
  username?: string;
  card: ICardIT;
  source?: 'manual' | 'timeout_auto' | string;
  nextTurn?: TurnEventPayload;
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

  readonly positions: TressettePosition[] = ['NORD', 'EST', 'SUD', 'OVEST'];
  readonly handCards: ICardIT[];
  readonly socketUrl = environment.backend.socketUrl;

  playedCards: Record<TressettePosition, ICardIT | null> = {
    NORD: null,
    EST: null,
    SUD: null,
    OVEST: null,
  };

  private socket?: Socket;
  private countdownInterval?: ReturnType<typeof setInterval>;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly tableService: TressetteTableService,
    private readonly authSessionService: AuthSessionService,
    private readonly dataModeService: DataModeService,
    private readonly deckService: DeckITService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.handCards = this.deckService.getPlayerCards();
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
      this.socket?.emit('tressette:watch-table', { tableId: this.tableId, mode: this.dataMode });
    });

    this.socket.on('disconnect', (reason: string) => {
      this.socketMessage = `disconnected (${reason ?? 'unknown'})`;
      console.warn('[tressette][socket] disconnected', { tableId: this.tableId, reason, mode: this.dataMode });
    });

    this.socket.on('tressette:table-updated', (table: TressetteTableView) => {
      if (table.tableId !== this.tableId) {
        return;
      }

      this.table = table;
      this.errorMessage = '';
      this.infoMessage = 'Tavolo aggiornato realtime';
    });

    this.socket.on('tressette:hand-started', (payload?: { table?: TressetteTableView }) => {
      if (payload?.table?.tableId === this.tableId) {
        this.table = payload.table;
      }

      if (this.table) {
        this.table.status = 'in_game';
      }

      this.errorMessage = '';
      this.infoMessage = 'Mano avviata';
      this.playedCards = { NORD: null, EST: null, SUD: null, OVEST: null };
    });

    this.socket.on('tressette:turn-started', (payload: TurnEventPayload) => {
      this.applyTurnPayload(payload);
    });

    this.socket.on('tressette:turn-bootstrap', (payload: TurnEventPayload) => {
      this.applyTurnPayload(payload);
    });

    this.socket.on('tressette:turn-updated', (payload: TurnEventPayload) => {
      this.applyTurnPayload(payload);
    });

    this.socket.on('tressette:card-played', (payload: CardPlayedPayload) => {
      const position = this.resolvePlayedCardPosition(payload);
      if (!position) {
        return;
      }

      this.playedCards[position] = payload.card;
      this.lastPlayedMessage =
        payload.source === 'timeout_auto' ? 'Carta giocata automaticamente per timeout' : 'Carta giocata';

      if (payload.nextTurn) {
        this.applyTurnPayload(payload.nextTurn);
      }
    });

    this.socket.on(
      'tressette:trick-ended',
      (payload: { winner?: string; winnerPosition?: TressettePosition; points?: { teamSN: number; teamEO: number } }) => {
        if (payload?.points && this.table) {
          this.table.points = payload.points;
        }

        this.infoMessage = `Trick chiuso: ${payload.winnerPosition ?? payload.winner ?? '-'}`;
      }
    );

    this.socket.on('tressette:error', (payload: { error?: { code?: string; message?: string } }) => {
      this.errorMessage = payload?.error?.message ?? 'Errore socket';
    });
  }

  private applyTurnPayload(payload: TurnEventPayload): void {
    if (payload.tableId && payload.tableId !== this.tableId) {
      return;
    }

    this.turnPlayerUsername = payload.turnPlayerUsername ?? payload.turnPlayer ?? '';
    this.turnPlayerPosition = payload.turnPlayerPosition ?? payload.turnPosition ?? this.resolvePositionByUsername(this.turnPlayerUsername);

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

  private resolvePlayedCardPosition(payload: { position?: TressettePosition; turnPlayerPosition?: TressettePosition; username?: string }): TressettePosition | null {
    if (payload.position) {
      return payload.position;
    }

    if (payload.turnPlayerPosition) {
      return payload.turnPlayerPosition;
    }

    if (payload.username) {
      return this.resolvePositionByUsername(payload.username);
    }

    return null;
  }

  private resolvePositionByUsername(username: string): TressettePosition | null {
    if (!username || !this.table) {
      return null;
    }

    return this.table.players.find((player) => player.username === username)?.position ?? null;
  }
}

