import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { DeckITService } from 'src/app/services/fakes/deck-it.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { CardIT, Suit } from 'src/app/shared/domain/models/cardIT.model';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { Table3s74iPage } from './table3s74i.page';

describe('Table3s74iPage', () => {
  let component: Table3s74iPage;
  let fixture: ComponentFixture<Table3s74iPage>;

  let serviceMock: {
    getTableRealtime: jasmine.Spy;
    connectSocket: jasmine.Spy;
  };

  let authMock: {
    currentUser: MockSessionUser;
    currentUser$: BehaviorSubject<MockSessionUser>;
  };

  let dataModeMock: {
    mode: DataMode;
    mode$: BehaviorSubject<DataMode>;
    setMode: jasmine.Spy;
  };

  let routeMock: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap> };
  };

  let routerMock: {
    navigate: jasmine.Spy;
  };

  let socketHandlersList: Record<string, (...args: any[]) => void>[];

  const tableMock: TressetteTableView = {
    tableId: 'tbl-001',
    owner: 'Luca',
    players: [
      { username: 'Luca', position: 'SUD' },
      { username: 'Marta', position: 'NORD' },
      { username: 'Diego', position: 'EST' },
      { username: 'Sara', position: 'OVEST' },
    ],
    isComplete: true,
    points: { teamSN: 0, teamEO: 0 },
    status: 'waiting',
  };

  const latestSocketHandlers = (): Record<string, (...args: any[]) => void> => {
    return socketHandlersList[socketHandlersList.length - 1] ?? {};
  };

  beforeEach(async () => {
    socketHandlersList = [];

    serviceMock = {
      getTableRealtime: jasmine.createSpy('getTableRealtime').and.returnValue(of(tableMock)),
      connectSocket: jasmine.createSpy('connectSocket').and.callFake(() => {
        const handlers: Record<string, (...args: any[]) => void> = {};
        socketHandlersList.push(handlers);

        return {
          on: jasmine.createSpy('on').and.callFake((event: string, cb: (...args: any[]) => void) => {
            handlers[event] = cb;
          }),
          emit: jasmine.createSpy('emit'),
          disconnect: jasmine.createSpy('disconnect'),
        };
      }),
    };

    authMock = {
      currentUser: { userId: 'u-luca', username: 'Luca' },
      currentUser$: new BehaviorSubject<MockSessionUser>({ userId: 'u-luca', username: 'Luca' }),
    };

    dataModeMock = {
      mode: 'demo',
      mode$: new BehaviorSubject<DataMode>('demo'),
      setMode: jasmine.createSpy('setMode').and.callFake((mode: DataMode) => {
        dataModeMock.mode = mode;
        dataModeMock.mode$.next(mode);
      }),
    };

    routeMock = {
      snapshot: { paramMap: convertToParamMap({ tableId: 'tbl-001' }) },
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [Table3s74iPage],
      providers: [
        { provide: TressetteTableService, useValue: serviceMock },
        { provide: AuthSessionService, useValue: authMock },
        { provide: DataModeService, useValue: dataModeMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: routerMock },
        { provide: DeckITService, useValue: { getPlayerCards: () => [new CardIT(Suit.Bastoni, 3), new CardIT(Suit.Spade, 5)] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Table3s74iPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carica tableId da route e usa backend realtime fetch', () => {
    expect(component.tableId).toBe('tbl-001');
    expect(serviceMock.getTableRealtime).toHaveBeenCalledWith('tbl-001');
    expect(serviceMock.connectSocket).toHaveBeenCalled();
  });

  it('mostra data mode toggle in gameplay', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Data Mode');
    expect(text).toContain('Demo');
    expect(text).toContain('Live');
  });

  it('rimuove controlli setup dalla view gameplay', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Crea Tavolo');
    expect(text).not.toContain('Username Join');
    expect(text).not.toContain('Posizione');
    expect(text).not.toContain('Start Username');
  });

  it('mostra Turno: -- quando non c e ancora un turno', () => {
    expect(component.currentTurnLabel).toBe('--');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Turno: --');
  });

  it('render connected state quando socket connette', () => {
    latestSocketHandlers()['connect']?.();

    expect(component.isSocketConnected).toBeTrue();
    expect(component.connectionBannerVisible).toBeFalse();
    expect(component.socketMessage).toBe('connected');
  });

  it('table status passa a in_game su hand-started', () => {
    expect(component.table?.status).toBe('waiting');

    latestSocketHandlers()['tressette:hand-started']?.({ table: { ...tableMock, status: 'in_game' } });

    expect(component.table?.status).toBe('in_game');
  });

  it('current player text renderizza da payload turno', () => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 20 });

    expect(component.currentTurnLabel).toBe('Luca (SUD)');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Turno: Luca (SUD)');
  });

  it('timer usa secondsRemaining in priorita rispetto a turnDeadlineMs', () => {
    latestSocketHandlers()['tressette:turn-started']?.({
      turnPlayer: 'Luca',
      turnPosition: 'SUD',
      secondsRemaining: 7,
      turnDeadlineMs: Date.now() + 20000,
    });

    expect(component.countdownSeconds).toBe(7);
  });

  it('countdown displayed next to current seat only', () => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 8 });
    fixture.detectChanges();

    expect(component.getSeatCountdown('SUD')).toBe(8);
    expect(component.getSeatCountdown('NORD')).toBeNull();

    const seatCountdowns = fixture.nativeElement.querySelectorAll('.turn-countdown');
    expect(seatCountdowns.length).toBe(1);
    expect((seatCountdowns[0] as HTMLElement).textContent ?? '').toContain('8s');
  });

  it('DI TURNO applied to correct seat only', () => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Marta', turnPosition: 'NORD', secondsRemaining: 8 });
    fixture.detectChanges();

    const activeSeats = fixture.nativeElement.querySelectorAll('.seat.turn');
    expect(activeSeats.length).toBe(1);
    expect((activeSeats[0] as HTMLElement).className).toContain('seat-north');
  });

  it('turn switch moves badge and timer to new seat', () => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Marta', turnPosition: 'NORD', secondsRemaining: 8 });
    latestSocketHandlers()['tressette:turn-updated']?.({ turnPlayer: 'Diego', turnPosition: 'EST', secondsRemaining: 17 });
    fixture.detectChanges();

    expect(component.currentTurnLabel).toBe('Diego (EST)');
    expect(component.getSeatCountdown('NORD')).toBeNull();
    expect(component.getSeatCountdown('EST')).toBe(17);

    const activeSeats = fixture.nativeElement.querySelectorAll('.seat.turn');
    expect(activeSeats.length).toBe(1);
    expect((activeSeats[0] as HTMLElement).className).toContain('seat-east');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('17s');
  });

  it('switching to Demo ricarica tavolo e pulisce errore precedente', () => {
    serviceMock.getTableRealtime.calls.reset();
    serviceMock.getTableRealtime.and.returnValue(of(tableMock));
    component.dataMode = 'live';
    component.errorMessage = 'Tavolo non trovato o backend non raggiungibile.';

    component.onDataModeChange('demo');

    expect(component.dataMode).toBe('demo');
    expect(component.errorMessage).toBe('');
    expect(serviceMock.getTableRealtime).toHaveBeenCalledWith('tbl-001');
  });

  it('switching mode non rimuove rendering turno e countdown', () => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 10 });
    expect(component.currentTurnLabel).toBe('Luca (SUD)');

    component.onDataModeChange('live');

    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Marta', turnPosition: 'NORD', secondsRemaining: 9 });
    expect(component.currentTurnLabel).toBe('Marta (NORD)');
    expect(component.countdownSeconds).toBe(9);
  });

  it('mostra stato disconnected quando socket cade', () => {
    latestSocketHandlers()['disconnect']?.('transport close');

    expect(component.connectionBannerVisible).toBeTrue();
    expect(component.socketMessage).toContain('disconnected');
  });

  it('blocca play-card fuori turno o disconnesso', () => {
    component.turnPlayerUsername = 'Marta';
    component.socketMessage = 'disconnected';

    component.playCard(new CardIT(Suit.Coppe, 1));

    expect(component.infoMessage).toContain('Mossa non disponibile');
  });

  it('emette play-card quando connesso e in turno', () => {
    latestSocketHandlers()['connect']?.();
    component.turnPlayerUsername = 'Luca';
    component.table = { ...tableMock, status: 'in_game' };

    component.playCard(new CardIT(Suit.Coppe, 1));

    const socket = serviceMock.connectSocket.calls.mostRecent().returnValue;
    expect(socket.emit).toHaveBeenCalledWith('tressette:play-card', jasmine.objectContaining({
      tableId: 'tbl-001',
      username: 'Luca',
    }));
  });

  it('renderizza autoplay timeout con messaggio esplicito e aggiorna il turno successivo', () => {
    latestSocketHandlers()['tressette:card-played']?.({
      position: 'NORD',
      username: 'Marta',
      card: new CardIT(Suit.Spade, 7),
      source: 'timeout_auto',
      nextTurn: {
        tableId: 'tbl-001',
        turnPlayerUsername: 'Diego',
        turnPlayerPosition: 'EST',
        secondsRemaining: 20,
      },
    });

    expect(component.lastPlayedMessage).toBe('Carta giocata automaticamente per timeout');
    expect(component.turnPlayerUsername).toBe('Diego');
    expect(component.turnPlayerPosition).toBe('EST');
    expect(component.countdownSeconds).toBe(20);
  });

  it('non naviga quando manca tableId', () => {
    routeMock.snapshot.paramMap = convertToParamMap({});

    const localFixture = TestBed.createComponent(Table3s74iPage);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    expect(localComponent.errorMessage).toContain('TableId mancante');
    expect(serviceMock.getTableRealtime).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('gestisce errore snapshot tavolo', () => {
    serviceMock.getTableRealtime.and.returnValue(throwError(() => new Error('offline')));
    const localFixture = TestBed.createComponent(Table3s74iPage);
    const localComponent = localFixture.componentInstance;

    localFixture.detectChanges();

    expect(localComponent.errorMessage).toContain('Tavolo non trovato');
  });
});
