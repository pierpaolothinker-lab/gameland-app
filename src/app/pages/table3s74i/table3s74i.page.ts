import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Socket } from 'socket.io-client';

import { CardIT10Component } from 'src/app/shared/ui/card-it10/card-it10.component';
import { CardNAComponent } from 'src/app/shared/ui/card-na/card-na.component';
import { ICardIT } from 'src/app/shared/domain/models/cardIT.model';
import { CardPlayedAreaComponent } from 'src/app/shared/ui/card-played-area/card-played-area.component';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';

@Component({
  selector: 'app-table3s74i',
  templateUrl: './table3s74i.page.html',
  styleUrls: ['./table3s74i.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, CardIT10Component, CardNAComponent, CardPlayedAreaComponent],
})
export class Table3s74iPage implements OnInit, OnDestroy {
  @ViewChild('playArea', { static: false }) playArea!: ElementRef;

  card?: ICardIT;
  table?: TressetteTableView;
  tableId = '';
  loading = true;
  errorMessage = '';
  socketMessage = 'socket: disconnected';

  private socket?: Socket;

  constructor(private readonly tableService: TressetteTableService) {}

  ngOnInit(): void {
    this.bootstrapVisualFlow();
  }

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

  private bootstrapVisualFlow(): void {
    this.loading = true;
    this.errorMessage = '';

    this.tableService
      .createTable('Pierpaolo')
      .pipe(
        switchMap((table) => {
          this.tableId = table.tableId;

          return forkJoin([
            this.tableService.joinTable(table.tableId, 'Vito', 'NORD'),
            this.tableService.joinTable(table.tableId, 'Tonino', 'EST'),
            this.tableService.joinTable(table.tableId, 'Paolo', 'OVEST'),
          ]).pipe(switchMap(() => this.tableService.getTable(table.tableId)));
        }),
        catchError(() => {
          this.errorMessage = 'Backend non raggiungibile (porta 3500). Controlla gameland-server in esecuzione.';
          this.loading = false;
          return of(undefined);
        })
      )
      .subscribe((table) => {
        if (!table) {
          return;
        }

        this.table = table;
        this.loading = false;
        this.connectSocketAndStart(table.tableId);
      });
  }

  private connectSocketAndStart(tableId: string): void {
    this.socket = this.tableService.connectSocket();

    this.socket.on('connect', () => {
      this.socketMessage = `socket: connected (${this.socket?.id ?? 'n/a'})`;
      this.socket?.emit('tressette:start-game', {
        tableId,
        username: 'Pierpaolo',
      });
    });

    this.socket.on('tressette:table-updated', (table: TressetteTableView) => {
      this.table = table;
    });

    this.socket.on('tressette:hand-started', () => {
      this.socketMessage = 'socket: hand-started received';
    });

    this.socket.on('tressette:error', (payload: { error?: { code?: string; message?: string } }) => {
      const code = payload?.error?.code ?? 'UNKNOWN_ERROR';
      const message = payload?.error?.message ?? 'socket error';
      this.socketMessage = `socket error: ${code}`;
      this.errorMessage = message;
    });

    this.socket.on('disconnect', () => {
      this.socketMessage = 'socket: disconnected';
    });
  }
}
