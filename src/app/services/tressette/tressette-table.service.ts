import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';

import { BackendClientService } from '../backend/backend-client.service';
import { DataModeService } from '../data-mode/data-mode.service';
import { TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TressetteTableService {
  private readonly tableBasePath = environment.backend.tressetteTableBasePath;

  constructor(
    private readonly backendClient: BackendClientService,
    private readonly dataModeService: DataModeService
  ) {}

  listTables(): Observable<TressetteTableView[]> {
    return this.backendClient.get<TressetteTableView[]>(this.tableBasePath, this.requestOptions);
  }

  createTable(owner: string): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(this.tableBasePath, { owner }, this.requestOptions);
  }

  getTable(tableId: string): Observable<TressetteTableView> {
    return this.backendClient.get<TressetteTableView>(`${this.tableBasePath}/${tableId}`, this.requestOptions);
  }

  getTableRealtime(tableId: string): Observable<TressetteTableView> {
    return this.backendClient.get<TressetteTableView>(`${this.tableBasePath}/${tableId}`, this.requestOptions);
  }

  joinTable(tableId: string, username: string, position: TressettePosition): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(
      `${this.tableBasePath}/${tableId}/join`,
      {
        username,
        position,
      },
      this.requestOptions
    );
  }

  addBot(tableId: string, username: string, position: TressettePosition): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(
      `${this.tableBasePath}/${tableId}/add-bot`,
      {
        username,
        position,
      },
      this.requestOptions
    );
  }

  leaveTable(tableId: string, username: string): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/leave`, { username }, this.requestOptions);
  }

  startTable(tableId: string, username: string): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/start`, { username }, this.requestOptions);
  }

  connectSocket(): Socket {
    return this.backendClient.connectSocket(this.requestOptions);
  }

  private get requestOptions(): { mode: 'demo' | 'live' } {
    return { mode: this.dataModeService.mode };
  }
}
