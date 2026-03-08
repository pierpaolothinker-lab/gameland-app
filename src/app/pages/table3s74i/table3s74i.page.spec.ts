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
    getTable: jasmine.Spy;
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
    status: 'in_game',
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
      getTable: jasmine.createSpy('getTable').and.returnValue(of(tableMock)),
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

  it('carica tableId da route e apre socket', () => {
    expect(component.tableId).toBe('tbl-001');
    expect(serviceMock.getTable).toHaveBeenCalledWith('tbl-001');
    expect(serviceMock.connectSocket).toHaveBeenCalled();
  });

  it('rimuove controlli setup dalla view gameplay', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Crea Tavolo');
    expect(text).not.toContain('Username Join');
    expect(text).not.toContain('Posizione');
    expect(text).not.toContain('Start Username');
  });

  it('mostra stato disconnected quando socket cade', () => {
    socketHandlers['disconnect']?.('transport close');

    expect(component.connectionBannerVisible).toBeTrue();
    expect(component.socketMessage).toContain('disconnected');
  });

  it('countdown parte da evento turno', fakeAsync(() => {

    socketHandlers['tressette:turn-started']?.({ turnPlayer: 'Luca', remainingSeconds: 3 });

    expect(component.countdownSeconds).toBe(3);

    tick(1000);
    expect(component.countdownSeconds).toBe(2);

    tick(2000);
    expect(component.countdownSeconds).toBe(0);
  }));

  it('blocca play-card fuori turno o disconnesso', () => {
    component.turnPlayerUsername = 'Marta';
    component.socketMessage = 'disconnected';

    component.playCard(new CardIT(Suit.Coppe, 1));

    expect(component.infoMessage).toContain('Mossa non disponibile');
  });

  it('emette play-card quando connesso e in turno', () => {
    socketHandlers['connect']?.();
    component.turnPlayerUsername = 'Luca';

    component.playCard(new CardIT(Suit.Coppe, 1));

    const socket = serviceMock.connectSocket.calls.mostRecent().returnValue;
    expect(socket.emit).toHaveBeenCalledWith('tressette:play-card', jasmine.objectContaining({
      tableId: 'tbl-001',
      username: 'Luca',
    }));
  });

  it('non naviga quando manca tableId', async () => {
    routeMock.snapshot.paramMap = convertToParamMap({});

    const localFixture = TestBed.createComponent(Table3s74iPage);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    expect(localComponent.errorMessage).toContain('TableId mancante');
    expect(serviceMock.getTable).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('gestisce errore snapshot tavolo', () => {
    serviceMock.getTable.and.returnValue(throwError(() => new Error('offline')));
    const localFixture = TestBed.createComponent(Table3s74iPage);
    const localComponent = localFixture.componentInstance;

    localFixture.detectChanges();

    expect(localComponent.errorMessage).toContain('Tavolo non trovato');
  });
});
