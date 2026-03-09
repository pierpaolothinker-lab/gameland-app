import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
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
    status: 'in_game',
    myHand: [new CardIT(Suit.Bastoni, 3), new CardIT(Suit.Spade, 5)],
    currentTrick: [],
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

  it('emette watch-table con tableId mode e username su connect', () => {
    latestSocketHandlers()['connect']?.();

    const socket = serviceMock.connectSocket.calls.mostRecent().returnValue;
    expect(socket.emit).toHaveBeenCalledWith('tressette:watch-table', {
      tableId: 'tbl-001',
      mode: 'demo',
      username: 'Luca',
    });
  });

  it('emette watch-table con username anche dopo reconnect da cambio mode', () => {
    latestSocketHandlers()['connect']?.();

    component.onDataModeChange('live');
    latestSocketHandlers()['connect']?.();

    const socket = serviceMock.connectSocket.calls.mostRecent().returnValue;
    expect(socket.emit).toHaveBeenCalledWith('tressette:watch-table', {
      tableId: 'tbl-001',
      mode: 'live',
      username: 'Luca',
    });
  });

  it('usa solo myHand backend per render mano', () => {
    component.table = {
      ...tableMock,
      myHand: [new CardIT(Suit.Coppe, 1), new CardIT(Suit.Denari, 10), new CardIT(Suit.Spade, 7)],
    };
    fixture.detectChanges();

    expect(component.effectiveHandCards.length).toBe(3);
    const handCards = fixture.nativeElement.querySelectorAll('.hand-card');
    expect(handCards.length).toBe(3);
  });

  it('turn-bootstrap idrata hand/trick e aggiorna turno/timer', () => {
    latestSocketHandlers()['tressette:turn-bootstrap']?.({
      currentPlayer: { username: 'Diego', position: 'EST' },
      secondsRemaining: 18,
      myHand: [new CardIT(Suit.Coppe, 7)],
      currentTrick: [{ position: 'NORD', username: 'Marta', card: new CardIT(Suit.Bastoni, 1) }],
    });

    expect(component.currentTurnLabel).toBe('Diego (EST)');
    expect(component.countdownSeconds).toBe(18);
    expect(component.effectiveHandCards.length).toBe(1);
    expect(component.getTrickCard('NORD')?.value).toBe(1);
  });

  it('player-state aggiorna hand/trick autoritativi dopo una giocata', () => {
    latestSocketHandlers()['tressette:player-state']?.({
      myHand: [new CardIT(Suit.Denari, 9)],
      currentTrick: [{ position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 2) }],
    });

    expect(component.effectiveHandCards.length).toBe(1);
    expect(component.effectiveHandCards[0].value).toBe(9);
    expect(component.getTrickCard('SUD')?.value).toBe(2);
  });

  it('renderizza trick dal payload backend currentTrick', () => {
    latestSocketHandlers()['tressette:card-played']?.({
      card: new CardIT(Suit.Denari, 4),
      source: 'manual',
      currentTrick: [{ position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) }],
    });

    expect(component.getTrickCard('EST')?.value).toBe(4);
    expect(component.getTrickCard('NORD')).toBeNull();
  });

  it('svuota trick quando backend invia currentTrick vuoto su trick-ended', () => {
    component.table = {
      ...tableMock,
      currentTrick: [
        { position: 'NORD', username: 'Marta', card: new CardIT(Suit.Coppe, 3) },
        { position: 'EST', username: 'Diego', card: new CardIT(Suit.Denari, 4) },
        { position: 'SUD', username: 'Luca', card: new CardIT(Suit.Spade, 5) },
        { position: 'OVEST', username: 'Sara', card: new CardIT(Suit.Bastoni, 6) },
      ],
    };

    latestSocketHandlers()['tressette:trick-ended']?.({
      winnerPosition: 'NORD',
      currentTrick: [],
      points: { teamSN: 1, teamEO: 0 },
    });

    expect(component.table?.currentTrick?.length).toBe(0);
    expect(component.table?.points.teamSN).toBe(1);
  });

  it('renderizza turno da payload canonico currentPlayer', () => {
    latestSocketHandlers()['tressette:turn-updated']?.({
      currentPlayer: { username: 'Diego', position: 'EST' },
      secondsRemaining: 17,
    });
    fixture.detectChanges();

    expect(component.currentTurnLabel).toBe('Diego (EST)');
    const activeSeats = fixture.nativeElement.querySelectorAll('.seat.turn');
    expect(activeSeats.length).toBe(1);
    expect((activeSeats[0] as HTMLElement).className).toContain('seat-east');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('17s');
  });

  it('timer parte e decrementa da secondsRemaining', fakeAsync(() => {
    latestSocketHandlers()['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 2 });

    expect(component.countdownSeconds).toBe(2);
    tick(1000);
    expect(component.countdownSeconds).toBe(1);
    tick(1000);
    expect(component.countdownSeconds).toBe(0);
  }));

  it('play-card emette payload carta esatta', () => {
    latestSocketHandlers()['connect']?.();
    component.table = { ...tableMock, status: 'in_game' };
    component.turnPlayerUsername = 'Luca';
    const card = new CardIT(Suit.Bastoni, 4);

    component.playCard(card);

    const socket = serviceMock.connectSocket.calls.mostRecent().returnValue;
    expect(socket.emit).toHaveBeenCalledWith(
      'tressette:play-card',
      jasmine.objectContaining({
        tableId: 'tbl-001',
        username: 'Luca',
        card,
      })
    );
  });

  it('render connected state quando socket connette', () => {
    latestSocketHandlers()['connect']?.();

    expect(component.isSocketConnected).toBeTrue();
    expect(component.connectionBannerVisible).toBeFalse();
    expect(component.socketMessage).toBe('connected');
  });

  it('gestisce errore snapshot tavolo', () => {
    serviceMock.getTableRealtime.and.returnValue(throwError(() => new Error('offline')));
    const localFixture = TestBed.createComponent(Table3s74iPage);
    const localComponent = localFixture.componentInstance;

    localFixture.detectChanges();

    expect(localComponent.errorMessage).toContain('Tavolo non trovato');
  });
});
