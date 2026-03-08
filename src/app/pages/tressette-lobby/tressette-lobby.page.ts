import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToast,
} from '@ionic/angular/standalone';

import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressettePlayer, TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';

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
    IonInput,
    IonItem,
    IonLabel,
    IonSpinner,
    IonToast,
    CommonModule,
    FormsModule,
  ],
})
export class TressetteLobbyPage implements OnInit {
  readonly positions: TressettePosition[] = ['SUD', 'NORD', 'EST', 'OVEST'];

  tables: TressetteTableView[] = [];
  loading = false;
  ownerUsername = '';
  joinUsernameByTable: Record<string, string> = {};

  errorBanner = '';
  toastOpen = false;
  toastMessage = '';

  constructor(private readonly tableService: TressetteTableService) {}

  ngOnInit(): void {
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

  createTable(): void {
    const owner = this.ownerUsername.trim();
    if (!owner) {
      this.openToast('Inserisci username owner');
      return;
    }

    this.loading = true;
    this.errorBanner = '';

    this.tableService.createTable(owner).subscribe({
      next: () => {
        this.ownerUsername = '';
        this.openToast('Tavolo creato');
        this.refreshTables();
      },
      error: () => {
        this.loading = false;
        this.errorBanner = 'Creazione tavolo fallita';
      },
    });
  }

  joinSeat(tableId: string, position: TressettePosition): void {
    const username = (this.joinUsernameByTable[tableId] ?? '').trim();

    if (!username) {
      this.openToast('Inserisci username per sederti');
      return;
    }

    this.loading = true;
    this.errorBanner = '';

    this.tableService.joinTable(tableId, username, position).subscribe({
      next: () => {
        this.openToast(`${username} seduto su ${position}`);
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
