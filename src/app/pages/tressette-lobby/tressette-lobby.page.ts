import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonToast,
} from '@ionic/angular/standalone';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressettePlayer, TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { resolveBotAvatarVariantClass } from 'src/app/shared/utils/bot-avatar-variant.util';
import { resolveDefaultPlayerAvatar } from 'src/app/shared/utils/player-avatar.util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tressette-lobby',
  templateUrl: './tressette-lobby.page.html',
  styleUrls: ['./tressette-lobby.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonToast,
    CommonModule,
  ],
})
export class TressetteLobbyPage implements OnInit {
  readonly positions: TressettePosition[] = ['SUD', 'NORD', 'EST', 'OVEST'];
  readonly availableUsers = this.authSessionService.availableUsers;
  readonly showDevAuthPanel = !environment.production;

  tables: TressetteTableView[] = [];
  loading = false;
  starting = false;
  addingBot = false;

  errorBanner = '';
  toastOpen = false;
  toastMessage = '';

  activeUser: MockSessionUser;
  dataMode: DataMode;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly tableService: TressetteTableService,
    private readonly authSessionService: AuthSessionService,
    private readonly dataModeService: DataModeService,
    private readonly router: Router
  ) {
    this.activeUser = this.authSessionService.currentUser;
    this.dataMode = this.dataModeService.mode;
  }

  ngOnInit(): void {
    this.authSessionService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.activeUser = user;
      });

    this.dataModeService.mode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => {
        const changed = mode !== this.dataMode;
        this.dataMode = mode;
        if (changed) {
          this.openToast(`Data mode: ${mode.toUpperCase()}`);
        }
        this.refreshTables();
      });
  }

  onDataModeChange(mode: DataMode): void {
    this.dataModeService.setMode(mode);
  }

  refreshTables(): void {
    this.loading = true;
    this.errorBanner = '';

    this.tableService.listTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.tables = [];
        this.errorBanner = this.normalizeErrorMessage(error, 'Errore caricamento lobby tavoli. Verifica backend locale :3500');
      },
    });
  }

  onSwitchUser(userId: string): void {
    this.authSessionService.setActiveUser(userId);
    this.openToast(`Utente attivo: ${this.activeUser.username}`);
  }

  createTable(): void {
    if (!this.canCreateTable) {
      return;
    }

    this.loading = true;
    this.errorBanner = '';

    this.tableService.createTable(this.activeUser.username).subscribe({
      next: () => {
        this.openToast(`Tavolo creato come ${this.activeUser.username}`);
        this.refreshTables();
      },
      error: (error) => {
        this.loading = false;
        this.errorBanner = this.normalizeErrorMessage(error, 'Creazione tavolo fallita');
      },
    });
  }

  joinSeat(tableId: string, position: TressettePosition): void {
    this.loading = true;
    this.errorBanner = '';

    this.tableService.joinTable(tableId, this.activeUser.username, position).subscribe({
      next: () => {
        this.openToast(`${this.activeUser.username} seduto su ${position}`);
        this.refreshTables();
      },
      error: (error) => {
        this.loading = false;
        this.errorBanner = this.normalizeErrorMessage(error, `Join fallita su ${position}`);
      },
    });
  }

  addBot(tableId: string, position: TressettePosition): void {
    const table = this.tables.find((entry) => entry.tableId === tableId);
    if (!table || this.emptySeatActionFor(table, position) !== 'add_bot') {
      return;
    }

    this.addingBot = true;
    this.errorBanner = '';

    this.tableService.addBot(tableId, this.activeUser.username, position).subscribe({
      next: () => {
        this.addingBot = false;
        this.openToast(`Bot aggiunto su ${position}`);
        this.refreshTables();
      },
      error: (error) => {
        this.addingBot = false;
        this.errorBanner = this.normalizeErrorMessage(error, `Aggiunta bot fallita su ${position}`);
      },
    });
  }

  onEmptySeatClick(table: TressetteTableView, position: TressettePosition): void {
    const action = this.emptySeatActionFor(table, position);
    if (action === 'join') {
      this.joinSeat(table.tableId, position);
      return;
    }

    if (action === 'add_bot') {
      this.addBot(table.tableId, position);
    }
  }

  get selectedOwnerTable(): TressetteTableView | null {
    const ownerTables = this.tables.filter((table) => table.owner === this.activeUser.username);
    if (ownerTables.length === 0) {
      return null;
    }

    const ready = ownerTables.find((table) => table.status === 'waiting' && this.isTableFull(table));
    if (ready) {
      return ready;
    }

    const waiting = ownerTables.find((table) => table.status === 'waiting');
    if (waiting) {
      return waiting;
    }

    return ownerTables[0];
  }

  get ownerTargetTableId(): string {
    return this.selectedOwnerTable?.tableId ?? '-';
  }

  get canStartOwnerTable(): boolean {
    const ownerTable = this.selectedOwnerTable;
    if (!ownerTable || this.starting) {
      return false;
    }

    return ownerTable.status === 'waiting' && this.isTableFull(ownerTable);
  }

  get startDisabledReason(): string {
    const ownerTable = this.selectedOwnerTable;
    if (!ownerTable) {
      return 'Nessun tavolo owner';
    }

    if (ownerTable.status !== 'waiting') {
      return 'Il tuo tavolo non e in stato waiting';
    }

    if (!this.isTableFull(ownerTable)) {
      return 'Il tuo tavolo non e completo (servono 4/4)';
    }

    if (this.starting) {
      return 'Avvio partita in corso...';
    }

    return '';
  }

  get canCreateTable(): boolean {
    return !this.activeUserSeatedTable() && !this.loading;
  }

  get activeSeatTableId(): string | null {
    return this.activeUserSeatedTable()?.tableId ?? null;
  }

  startMyGame(): void {
    const ownerTable = this.selectedOwnerTable;
    if (!ownerTable || !this.canStartOwnerTable) {
      return;
    }

    this.starting = true;
    this.errorBanner = '';

    this.tableService.startTable(ownerTable.tableId, this.activeUser.username).subscribe({
      next: () => {
        this.starting = false;
        this.openToast('Partita avviata su ' + ownerTable.tableId);
        this.refreshTables();
        void this.router.navigate(['/table3s74i', ownerTable.tableId]);
      },
      error: (error) => {
        this.starting = false;
        this.errorBanner = this.normalizeErrorMessage(error, 'Avvio partita fallito');
      },
    });
  }

  seatOccupied(table: TressetteTableView, position: TressettePosition): boolean {
    return !!this.playerAt(table, position);
  }

  canInteractEmptySeat(table: TressetteTableView, position: TressettePosition): boolean {
    return this.emptySeatActionFor(table, position) !== 'none';
  }

  displayHumanSeatName(table: TressetteTableView, position: TressettePosition): string {
    const player = this.playerAt(table, position);
    if (!player || player.isBot) {
      return '';
    }

    return player.username;
  }

  isBotSeat(table: TressetteTableView, position: TressettePosition): boolean {
    return !!this.playerAt(table, position)?.isBot;
  }

  seatAvatarSrc(table: TressetteTableView, position: TressettePosition): string {
    const player = this.playerAt(table, position);
    if (player?.isBot) {
      return 'assets/avatar-bot.svg';
    }

    return resolveDefaultPlayerAvatar(player?.username);
  }

  seatAvatarClass(table: TressetteTableView, position: TressettePosition): string {
    const player = this.playerAt(table, position);
    if (!player?.isBot) {
      return 'human-avatar';
    }

    return `bot-avatar ${this.botAvatarVariantClass(table.tableId, player.username, position)}`;
  }

  playerAt(table: TressetteTableView, position: TressettePosition): TressettePlayer | undefined {
    return table.players.find((entry) => entry.position === position);
  }

  occupiedSeats(table: TressetteTableView): number {
    return table.players.length;
  }

  isTableFull(table: TressetteTableView): boolean {
    return this.occupiedSeats(table) >= 4 || table.isComplete;
  }

  statusLabel(table: TressetteTableView): string {
    if (table.status === 'in_game') {
      return 'IN GAME';
    }

    if (table.status === 'ended') {
      return 'ENDED';
    }

    return this.isTableFull(table) ? 'COMPLETO' : 'IN ATTESA';
  }

  onToastDismiss(): void {
    this.toastOpen = false;
  }

  private activeUserSeatedTable(): TressetteTableView | null {
    return this.tables.find((table) => table.players.some((player) => player.username === this.activeUser.username)) ?? null;
  }

  private emptySeatActionFor(table: TressetteTableView, position: TressettePosition): 'join' | 'add_bot' | 'none' {
    if (this.loading || this.addingBot || this.seatOccupied(table, position) || table.status !== 'waiting') {
      return 'none';
    }

    const activeSeatTable = this.activeUserSeatedTable();
    if (!activeSeatTable) {
      return 'join';
    }

    if (activeSeatTable.tableId !== table.tableId) {
      return 'none';
    }

    const ownerContextTableId = this.selectedOwnerTable?.tableId;
    if (ownerContextTableId === table.tableId && table.owner === this.activeUser.username && !this.isTableFull(table)) {
      return 'add_bot';
    }

    return 'none';
  }

  
  private botAvatarVariantClass(tableId: string, username?: string, position?: TressettePosition): string {
    return resolveBotAvatarVariantClass([tableId, position, username]);
  }

  private openToast(message: string): void {
    this.toastMessage = message;
    this.toastOpen = true;
  }

  private normalizeErrorMessage(error: unknown, fallback: string): string {
    const apiMessage =
      (error as { error?: { error?: { message?: string }; message?: string } })?.error?.error?.message ||
      (error as { error?: { message?: string } })?.error?.message;

    return apiMessage ? `${fallback}: ${apiMessage}` : fallback;
  }
}


