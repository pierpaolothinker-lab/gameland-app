import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';

import { BackendClientService } from '../backend/backend-client.service';
import { TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TressetteTableService {
  private readonly tableBasePath = environment.backend.tressetteTableBasePath;

  constructor(private readonly backendClient: BackendClientService) {}

  createTable(owner: string): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(this.tableBasePath, { owner });
  }

  getTable(tableId: string): Observable<TressetteTableView> {
    return this.backendClient.get<TressetteTableView>(`${this.tableBasePath}/${tableId}`);
  }

  joinTable(tableId: string, username: string, position: TressettePosition): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/join`, {
      username,
      position,
    });
  }

  leaveTable(tableId: string, username: string): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/leave`, { username });
  }

  startTable(tableId: string, username: string): Observable<TressetteTableView> {
    return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/start`, { username });
  }

  connectSocket(): Socket {
    return this.backendClient.connectSocket();
  }
}
