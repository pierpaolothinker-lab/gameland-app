import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Socket } from 'socket.io-client';

import { BackendClientService } from '../backend/backend-client.service';
import { TressettePosition, TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TressetteTableService {
  private static readonly MOCK_QUERY_PARAM = 'mock';
  private static readonly MOCK_STORAGE_KEY = 'tressette.mock';

  private readonly tableBasePath = environment.backend.tressetteTableBasePath;
  private readonly mockAssetsBasePath = environment.backend.tressetteMockAssetsBasePath;
  private readonly useMockDataEnabled: boolean;

  private mockTablesState: TressetteTableView[] | null = null;

  constructor(private readonly backendClient: BackendClientService) {
    this.useMockDataEnabled = this.resolveMockMode();
  }

  listTables(): Observable<TressetteTableView[]> {
    if (!this.useMockDataEnabled) {
      return this.backendClient.get<TressetteTableView[]>(this.tableBasePath);
    }

    return this.ensureMockTablesLoaded();
  }

  createTable(owner: string): Observable<TressetteTableView> {
    if (!this.useMockDataEnabled) {
      return this.backendClient.post<TressetteTableView>(this.tableBasePath, { owner });
    }

    return this.ensureMockTablesLoaded().pipe(
      map((tables) => {
        const newTable: TressetteTableView = {
          tableId: `tbl-mock-${Date.now()}`,
          owner,
          players: [{ username: owner, position: 'SUD' }],
          isComplete: false,
          points: { teamSN: 0, teamEO: 0 },
          status: 'waiting',
        };

        this.mockTablesState = [newTable, ...tables];
        return this.clone(newTable);
      })
    );
  }

  getTable(tableId: string): Observable<TressetteTableView> {
    if (!this.useMockDataEnabled) {
      return this.backendClient.get<TressetteTableView>(`${this.tableBasePath}/${tableId}`);
    }

    return this.ensureMockTablesLoaded().pipe(
      switchMap((tables) => {
        const table = tables.find((entry) => entry.tableId === tableId);
        if (!table) {
          return throwError(() => new Error('Tavolo mock non trovato'));
        }

        return of(this.clone(table));
      })
    );
  }

  // Gameplay must always use backend realtime state, independent of lobby/mock toggle.
  getTableRealtime(tableId: string): Observable<TressetteTableView> {
    return this.backendClient.get<TressetteTableView>(`${this.tableBasePath}/${tableId}`);
  }

  joinTable(tableId: string, username: string, position: TressettePosition): Observable<TressetteTableView> {
    if (!this.useMockDataEnabled) {
      return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/join`, {
        username,
        position,
      });
    }

    return this.ensureMockTablesLoaded().pipe(
      switchMap((tables) => {
        const table = tables.find((entry) => entry.tableId === tableId);
        if (!table) {
          return throwError(() => new Error('Tavolo mock non trovato'));
        }

        if (table.players.some((player) => player.position === position)) {
          return throwError(() => new Error(`Posizione ${position} gia occupata`));
        }

        if (table.players.some((player) => player.username === username)) {
          return throwError(() => new Error(`Username ${username} gia presente al tavolo`));
        }

        table.players = [...table.players, { username, position }];
        table.isComplete = table.players.length >= 4;

        this.mockTablesState = tables;
        return of(this.clone(table));
      })
    );
  }

  leaveTable(tableId: string, username: string): Observable<TressetteTableView> {
    if (!this.useMockDataEnabled) {
      return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/leave`, { username });
    }

    return this.ensureMockTablesLoaded().pipe(
      switchMap((tables) => {
        const table = tables.find((entry) => entry.tableId === tableId);
        if (!table) {
          return throwError(() => new Error('Tavolo mock non trovato'));
        }

        table.players = table.players.filter((player) => player.username !== username);
        table.isComplete = table.players.length >= 4;
        if (table.status !== 'ended') {
          table.status = 'waiting';
        }

        this.mockTablesState = tables;
        return of(this.clone(table));
      })
    );
  }

  startTable(tableId: string, username: string): Observable<TressetteTableView> {
    if (!this.useMockDataEnabled) {
      return this.backendClient.post<TressetteTableView>(`${this.tableBasePath}/${tableId}/start`, { username });
    }

    return this.ensureMockTablesLoaded().pipe(
      switchMap((tables) => {
        const table = tables.find((entry) => entry.tableId === tableId);
        if (!table) {
          return throwError(() => new Error('Tavolo mock non trovato'));
        }

        if (table.owner !== username) {
          return throwError(() => new Error('Solo owner puo avviare il tavolo'));
        }

        if (table.players.length < 4) {
          return throwError(() => new Error('Servono 4 giocatori per avviare'));
        }

        table.status = 'in_game';
        table.isComplete = true;

        this.mockTablesState = tables;
        return of(this.clone(table));
      })
    );
  }

  connectSocket(): Socket {
    return this.backendClient.connectSocket();
  }

  private ensureMockTablesLoaded(): Observable<TressetteTableView[]> {
    if (this.mockTablesState) {
      return of(this.clone(this.mockTablesState));
    }

    return this.backendClient.get<TressetteTableView[]>(`${this.mockAssetsBasePath}/tables.list.json`).pipe(
      tap((tables) => {
        this.mockTablesState = this.clone(tables);
      }),
      map((tables) => this.clone(tables))
    );
  }

  private resolveMockMode(): boolean {
    if (typeof window === 'undefined') {
      return environment.backend.useTressetteMockData;
    }

    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get(TressetteTableService.MOCK_QUERY_PARAM);

    if (queryValue === '1' || queryValue === 'true') {
      window.localStorage.setItem(TressetteTableService.MOCK_STORAGE_KEY, '1');
      return true;
    }

    if (queryValue === '0' || queryValue === 'false') {
      window.localStorage.setItem(TressetteTableService.MOCK_STORAGE_KEY, '0');
      return false;
    }

    const stored = window.localStorage.getItem(TressetteTableService.MOCK_STORAGE_KEY);
    if (stored === '1') {
      return true;
    }

    if (stored === '0') {
      return false;
    }

    return environment.backend.useTressetteMockData;
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
