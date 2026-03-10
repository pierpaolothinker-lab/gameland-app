import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
import { DataMode, DataModeService } from 'src/app/services/data-mode/data-mode.service';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';
import { TressetteLobbyPage } from './tressette-lobby.page';

describe('TressetteLobbyPage', () => {
  let component: TressetteLobbyPage;
  let fixture: ComponentFixture<TressetteLobbyPage>;
  let serviceMock: {
    listTables: jasmine.Spy;
    createTable: jasmine.Spy;
    joinTable: jasmine.Spy;
    addBot: jasmine.Spy;
    startTable: jasmine.Spy;
  };
  let authMock: {
    availableUsers: MockSessionUser[];
    currentUser: MockSessionUser;
    currentUser$: BehaviorSubject<MockSessionUser>;
    setActiveUser: jasmine.Spy;
  };
  let dataModeMock: {
    mode: DataMode;
    mode$: BehaviorSubject<DataMode>;
    setMode: jasmine.Spy;
  };
  let routerMock: {
    navigate: jasmine.Spy;
  };

  const activeUser: MockSessionUser = { userId: 'u-luca', username: 'Luca' };

  const makeTable = (
    tableId: string,
    owner: string,
    status: 'waiting' | 'in_game' | 'ended',
    players: TressetteTableView['players'],
    isComplete = false
  ): TressetteTableView => ({
    tableId,
    owner,
    players,
    isComplete,
    points: { teamSN: 0, teamEO: 0 },
    status,
  });

  beforeEach(async () => {
    const baseTable = makeTable('table-1', 'owner-a', 'waiting', [{ username: 'owner-a', position: 'SUD' }]);
    serviceMock = {
      listTables: jasmine.createSpy('listTables').and.returnValue(of([baseTable])),
      createTable: jasmine.createSpy('createTable').and.returnValue(of(baseTable)),
      joinTable: jasmine.createSpy('joinTable').and.returnValue(of(baseTable)),
      addBot: jasmine.createSpy('addBot').and.returnValue(of(baseTable)),
      startTable: jasmine.createSpy('startTable').and.returnValue(of(baseTable)),
    };

    authMock = {
      availableUsers: [activeUser, { userId: 'u-marta', username: 'Marta' }],
      currentUser: activeUser,
      currentUser$: new BehaviorSubject<MockSessionUser>(activeUser),
      setActiveUser: jasmine.createSpy('setActiveUser'),
    };

    dataModeMock = {
      mode: 'demo',
      mode$: new BehaviorSubject<DataMode>('demo'),
      setMode: jasmine.createSpy('setMode').and.callFake((mode: DataMode) => {
        dataModeMock.mode = mode;
        dataModeMock.mode$.next(mode);
      }),
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [TressetteLobbyPage],
      providers: [
        { provide: TressetteTableService, useValue: serviceMock },
        { provide: AuthSessionService, useValue: authMock },
        { provide: DataModeService, useValue: dataModeMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TressetteLobbyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('render lista tavoli', () => {
    expect(serviceMock.listTables).toHaveBeenCalledTimes(1);
    expect(component.tables.length).toBe(1);
  });

  it('click seat vuoto -> join quando utente non e seduto in nessun tavolo', () => {
    component.tables = [
      makeTable('table-join', 'Marta', 'waiting', [{ username: 'Marta', position: 'SUD' }]),
    ];

    component.onEmptySeatClick(component.tables[0], 'NORD');

    expect(serviceMock.joinTable).toHaveBeenCalledWith('table-join', 'Luca', 'NORD');
    expect(serviceMock.addBot).not.toHaveBeenCalled();
  });

  it('click seat vuoto -> add bot quando owner e gia seduto sullo stesso tavolo', () => {
    component.tables = [
      makeTable('table-owner', 'Luca', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Marta', position: 'NORD' },
      ]),
    ];

    component.onEmptySeatClick(component.tables[0], 'EST');

    expect(serviceMock.addBot).toHaveBeenCalledWith('table-owner', 'Luca', 'EST');
    expect(serviceMock.joinTable).not.toHaveBeenCalled();
  });

  it('click seat vuoto su tavolo diverso quando utente e gia seduto altrove -> no-op', () => {
    component.tables = [
      makeTable('table-a', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
      makeTable('table-b', 'Marta', 'waiting', [{ username: 'Marta', position: 'SUD' }]),
    ];

    component.onEmptySeatClick(component.tables[1], 'EST');

    expect(serviceMock.addBot).not.toHaveBeenCalled();
    expect(serviceMock.joinTable).not.toHaveBeenCalled();
  });

  it('click seat vuoto same table ma non owner -> no-op', () => {
    component.tables = [
      makeTable('table-a', 'Marta', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Marta', position: 'NORD' },
      ]),
    ];

    component.onEmptySeatClick(component.tables[0], 'EST');

    expect(serviceMock.addBot).not.toHaveBeenCalled();
    expect(serviceMock.joinTable).not.toHaveBeenCalled();
  });

  it('nessun bottone esplicito Siediti/Aggiungi Bot nel markup seat', () => {
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).not.toContain('Siediti');
    expect(text).not.toContain('Aggiungi Bot');
  });

  it('mostra BOT badge senza username bot', () => {
    component.tables = [
      makeTable('tbl-bot', 'Luca', 'waiting', [
        { username: 'Luca', position: 'SUD' },
        { username: 'Bot-1', position: 'NORD', isBot: true },
      ]),
    ];

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('BOT');
    expect(text).not.toContain('Bot-1');
  });

  it('gestione errore API', () => {
    serviceMock.listTables.and.returnValue(throwError(() => new Error('offline')));

    component.refreshTables();

    expect(component.errorBanner).toContain('Errore caricamento lobby');
    expect(component.loading).toBeFalse();
  });

  it('start success -> navigation a gameplay con tableId', () => {
    component.tables = [
      makeTable('tbl-owner-not-ready', 'Luca', 'waiting', [{ username: 'Luca', position: 'SUD' }]),
      makeTable(
        'tbl-owner-ready',
        'Luca',
        'waiting',
        [
          { username: 'Luca', position: 'SUD' },
          { username: 'Marta', position: 'NORD' },
          { username: 'Diego', position: 'EST' },
          { username: 'Sara', position: 'OVEST' },
        ],
        true
      ),
    ];

    component.startMyGame();

    expect(serviceMock.startTable).toHaveBeenCalledWith('tbl-owner-ready', 'Luca');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/table3s74i', 'tbl-owner-ready']);
  });
});
