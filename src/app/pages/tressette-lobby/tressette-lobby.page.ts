import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressettePlayer, TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
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

  errorBanner = '';
  toastOpen = false;
  toastMessage = '';

  activeUser: MockSessionUser;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly tableService: TressetteTableService,
    private readonly authSessionService: AuthSessionService
  ) {
    this.activeUser = this.authSessionService.currentUser;
  }

  ngOnInit(): void {
    this.authSessionService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.activeUser = user;
      });

    this.refreshTables();
  }

  refreshTables(): void {
    this.loading = true;
    this.errorBanner = '';

    this.tableService.listTables().subscribe({
      next: (tables) => {
        this.tables = tables;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.tables = [];
        this.errorBanner = 'Errore caricamento lobby tavoli. Verifica backend locale :3500';
      },
    });
  }

  onSwitchUser(userId: string): void {
    this.authSessionService.setActiveUser(userId);
    this.openToast(`Utente attivo: ${this.activeUser.username}`);
  }

  createTable(): void {
    this.loading = true;
    this.errorBanner = '';

    this.tableService.createTable(this.activeUser.username).subscribe({
      next: () => {
        this.openToast(`Tavolo creato come ${this.activeUser.username}`);
        this.refreshTables();
      },
      error: () => {
        this.loading = false;
        this.errorBanner = 'Creazione tavolo fallita';
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
      error: () => {
        this.loading = false;
        this.errorBanner = `Join fallita su ${position}`;
      },
    });
  }

  seatOccupied(table: TressetteTableView, position: TressettePosition): boolean {
    return table.players.some((player) => player.position === position);
  }

  seatLabel(table: TressetteTableView, position: TressettePosition): string {
    const player = this.playerAt(table, position);
    return player ? `${position}: ${player.username}` : `${position}: libero`;
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
    if (this.isTableFull(table)) {
      return 'COMPLETO';
    }

    return 'IN ATTESA';
  }

  onToastDismiss(): void {
    this.toastOpen = false;
  }

  private openToast(message: string): void {
    this.toastMessage = message;
    this.toastOpen = true;
  }
}
