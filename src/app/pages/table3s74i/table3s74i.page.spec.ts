import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
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

  let routeMock: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap> };
  };

  let routerMock: {
    navigate: jasmine.Spy;
  };

  let socketHandlers: Record<string, (...args: any[]) => void>;

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

  beforeEach(async () => {
    socketHandlers = {};
    const socketMock = {
      on: jasmine.createSpy('on').and.callFake((event: string, cb: (...args: any[]) => void) => {
        socketHandlers[event] = cb;
      }),
      emit: jasmine.createSpy('emit'),
      disconnect: jasmine.createSpy('disconnect'),
    };

    serviceMock = {
      getTableRealtime: jasmine.createSpy('getTableRealtime').and.returnValue(of(tableMock)),
      connectSocket: jasmine.createSpy('connectSocket').and.returnValue(socketMock),
    };

    authMock = {
      currentUser: { userId: 'u-luca', username: 'Luca' },
      currentUser$: new BehaviorSubject<MockSessionUser>({ userId: 'u-luca', username: 'Luca' }),
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

  it('rimuove controlli setup dalla view gameplay', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Crea Tavolo');
    expect(text).not.toContain('Username Join');
    expect(text).not.toContain('Posizione');
    expect(text).not.toContain('Start Username');
  });

  it('render connected state quando socket connette', () => {
    socketHandlers['connect']?.();

    expect(component.isSocketConnected).toBeTrue();
    expect(component.connectionBannerVisible).toBeFalse();
    expect(component.socketMessage).toBe('connected');
  });

  it('table status passa a in_game su hand-started', () => {
    expect(component.table?.status).toBe('waiting');

    socketHandlers['tressette:hand-started']?.({ table: { ...tableMock, status: 'in_game' } });

    expect(component.table?.status).toBe('in_game');
  });

  it('timer parte su turn-started con secondsRemaining', fakeAsync(() => {
    socketHandlers['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 3 });

    expect(component.countdownSeconds).toBe(3);
    expect(component.turnStatusText).toBe('Turno: Luca (SUD) - 3s');
    tick(1000);
    expect(component.countdownSeconds).toBe(2);
    tick(2000);
    expect(component.countdownSeconds).toBe(0);
  }));

  it('mostra badge DI TURNO sul seat attivo', () => {
    socketHandlers['tressette:turn-started']?.({ turnPlayer: 'Luca', turnPosition: 'SUD', secondsRemaining: 8 });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('DI TURNO');
    expect(text).toContain('8s');
  });

  it('mostra stato disconnected quando socket cade', () => {
    socketHandlers['disconnect']?.('transport close');

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
    socketHandlers['connect']?.();
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
    socketHandlers['tressette:card-played']?.({
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
