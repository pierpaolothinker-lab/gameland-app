import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Socket } from 'socket.io-client';

import { CardIT10Component } from 'src/app/shared/ui/card-it10/card-it10.component';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { ICardIT } from 'src/app/shared/domain/models/cardIT.model';
import { CardPlayedAreaComponent } from 'src/app/shared/ui/card-played-area/card-played-area.component';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';

@Component({
  selector: 'app-table3s74i',
  templateUrl: './table3s74i.page.html',
  styleUrls: ['./table3s74i.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    FormsModule,
    CommonModule,
    CardIT10Component,
    CardNAComponent,
    CardPlayedAreaComponent,
  ],
})
export class Table3s74iPage implements OnDestroy {
  @ViewChild('playArea', { static: false }) playArea!: ElementRef;

  card?: ICardIT;
  table?: TressetteTableView;
  tableId = '';
  loading = false;
  errorMessage = '';
  infoMessage = 'Crea un tavolo per iniziare';
  socketMessage = 'disconnected';

  ownerName = 'Pierpaolo';
  joinUsername = 'Vito';
  joinPosition: TressettePosition = 'NORD';
  startUsername = 'Pierpaolo';

  private socket?: Socket;

  constructor(private readonly tableService: TressetteTableService) {}

  ngOnDestroy(): void {
    this.socket?.disconnect();
  }

  calculateOffset(cardElement: HTMLElement): { deltaX: number; deltaY: number } {
    const playAreaRect = this.playArea.nativeElement.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    const deltaX = playAreaRect.left + playAreaRect.width / 2 - (cardRect.left + cardRect.width / 2);
    const deltaY = playAreaRect.top + playAreaRect.height / 2 - (cardRect.top + cardRect.height / 2);
    return { deltaX, deltaY };
  }

  createTable(): void {
    const owner = this.ownerName.trim();
    if (!owner) {
      this.errorMessage = 'Inserisci il nome owner';
      return;
    }

    this.setBusyState('Creazione tavolo in corso...');

    this.tableService.createTable(owner).subscribe({
      next: (table) => {
        this.table = table;
        this.tableId = table.tableId;
        this.startUsername = table.owner;
        this.infoMessage = `Tavolo creato: ${table.tableId}`;
        this.loading = false;
        this.ensureSocketConnected();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Backend non raggiungibile (porta 3500).';
      },
    });
  }

  joinTable(): void {
    const tableId = this.tableId.trim();
    const username = this.joinUsername.trim();

    if (!tableId || !username) {
      this.errorMessage = 'Inserisci tableId e username per join';
      return;
    }

    this.setBusyState('Join al tavolo in corso...');

    this.tableService.joinTable(tableId, username, this.joinPosition).subscribe({
      next: (table) => {
        this.table = table;
        this.infoMessage = `${username} si e' unito in posizione ${this.joinPosition}`;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Join fallita. Controlla posizione/username.';
      },
    });
  }

  refreshTable(): void {
    const tableId = this.tableId.trim();
    if (!tableId) {
      this.errorMessage = 'Inserisci un tableId valido';
      return;
    }

    this.setBusyState('Aggiornamento tavolo...');

    this.tableService.getTable(tableId).subscribe({
      next: (table) => {
        this.table = table;
        this.loading = false;
        this.infoMessage = 'Snapshot tavolo aggiornato';
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Tavolo non trovato o backend non raggiungibile.';
      },
    });
  }

  startGame(): void {
    const tableId = this.tableId.trim();
    const username = this.startUsername.trim();

    if (!tableId || !username) {
      this.errorMessage = 'Inserisci tableId e username owner per start';
      return;
    }

    this.setBusyState('Avvio partita...');
    this.ensureSocketConnected();

    this.socket?.emit('tressette:start-game', {
      tableId,
      username,
    });
  }

  private ensureSocketConnected(): void {
    if (this.socket) {
      return;
    }

    this.socket = this.tableService.connectSocket();

    this.socket.on('connect', () => {
      this.socketMessage = 'connected';
    });

    this.socket.on('tressette:table-updated', (table: TressetteTableView) => {
      this.table = table;
      this.loading = false;
      this.errorMessage = '';
      this.infoMessage = 'Tavolo aggiornato realtime';
    });

    this.socket.on('tressette:hand-started', () => {
      this.loading = false;
      this.errorMessage = '';
      this.infoMessage = 'Partita avviata';
      this.socketMessage = 'hand-started received';
    });

    this.socket.on('tressette:error', (payload: { error?: { code?: string; message?: string } }) => {
      this.loading = false;
      this.errorMessage = payload?.error?.message ?? 'Errore socket';
      this.socketMessage = `error: ${payload?.error?.code ?? 'UNKNOWN_ERROR'}`;
    });

    this.socket.on('disconnect', () => {
      this.socketMessage = 'disconnected';
    });
  }

  private setBusyState(message: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = message;
  }
}
