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
    playersCount: number,
    isComplete = false
  ): TressetteTableView => ({
    tableId,
    owner,
    players: [
      { username: 'p1', position: 'SUD' as const },
      { username: 'p2', position: 'NORD' as const },
      { username: 'p3', position: 'EST' as const },
      { username: 'p4', position: 'OVEST' as const },
    ].slice(0, playersCount),
    isComplete,
    points: { teamSN: 0, teamEO: 0 },
    status,
  });

  const tablesMock: TressetteTableView[] = [makeTable('table-1', 'owner-a', 'waiting', 1)];

  beforeEach(async () => {
    serviceMock = {
      listTables: jasmine.createSpy('listTables').and.returnValue(of(tablesMock)),
      createTable: jasmine.createSpy('createTable').and.returnValue(of(tablesMock[0])),
      joinTable: jasmine.createSpy('joinTable').and.returnValue(of(tablesMock[0])),
      addBot: jasmine.createSpy('addBot').and.returnValue(of(tablesMock[0])),
      startTable: jasmine.createSpy('startTable').and.returnValue(of(tablesMock[0])),
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
    expect(component.tables[0].tableId).toBe('table-1');
  });

  it('create success usa username da sessione', () => {
    component.createTable();

    expect(serviceMock.createTable).toHaveBeenCalledWith('Luca');
    expect(serviceMock.listTables).toHaveBeenCalledTimes(2);
  });

  it('join success usa username da sessione', () => {
    component.joinSeat('table-1', 'NORD');

    expect(serviceMock.joinTable).toHaveBeenCalledWith('table-1', 'Luca', 'NORD');
    expect(serviceMock.listTables).toHaveBeenCalledTimes(2);
  });

  it('add bot usa username da sessione', () => {
    component.addBot('table-1', 'OVEST');

    expect(serviceMock.addBot).toHaveBeenCalledWith('table-1', 'Luca', 'OVEST');
    expect(serviceMock.listTables).toHaveBeenCalledTimes(2);
  });

  it('azione add bot solo su tavolo owner waiting e posto libero', () => {
    const ownerTable = makeTable('tbl-owner', 'Luca', 'waiting', 2);
    const nonOwnerTable = makeTable('tbl-other', 'Marta', 'waiting', 2);

    expect(component.canAddBotToSeat(ownerTable, 'EST')).toBeTrue();
    expect(component.canAddBotToSeat(ownerTable, 'SUD')).toBeFalse();
    expect(component.canAddBotToSeat(nonOwnerTable, 'EST')).toBeFalse();
  });

  it('mostra badge BOT in seat lobby', () => {
    component.tables = [
      {
        ...makeTable('tbl-bot', 'Luca', 'waiting', 2),
        players: [
          { username: 'Luca', position: 'SUD' },
          { username: 'BOT_1', position: 'NORD', isBot: true },
        ],
      },
    ];

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('BOT');
  });

  it('gestione errore API', () => {
    serviceMock.listTables.and.returnValue(throwError(() => new Error('offline')));

    component.refreshTables();

    expect(component.errorBanner).toContain('Errore caricamento lobby');
    expect(component.loading).toBeFalse();
  });

  it('multiple owner tables, one start-ready -> button enabled', () => {
    component.tables = [
      makeTable('tbl-owner-wait-2of4', 'Luca', 'waiting', 2),
      makeTable('tbl-owner-ready', 'Luca', 'waiting', 4, true),
      makeTable('tbl-other', 'Marta', 'waiting', 4, true),
    ];

    expect(component.ownerTargetTableId).toBe('tbl-owner-ready');
    expect(component.canStartOwnerTable).toBeTrue();
    expect(component.startDisabledReason).toBe('');
  });

  it('multiple owner tables, none start-ready -> disabled with correct reason', () => {
    component.tables = [
      makeTable('tbl-owner-wait-2of4', 'Luca', 'waiting', 2),
      makeTable('tbl-owner-ended', 'Luca', 'ended', 4, true),
    ];

    expect(component.ownerTargetTableId).toBe('tbl-owner-wait-2of4');
    expect(component.canStartOwnerTable).toBeFalse();
    expect(component.startDisabledReason).toBe('Il tuo tavolo non e completo (servono 4/4)');
  });

  it('start success -> navigation a gameplay con tableId', () => {
    component.tables = [
      makeTable('tbl-owner-not-ready', 'Luca', 'waiting', 1),
      makeTable('tbl-owner-ready', 'Luca', 'waiting', 4, true),
    ];

    component.startMyGame();

    expect(serviceMock.startTable).toHaveBeenCalledWith('tbl-owner-ready', 'Luca');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/table3s74i', 'tbl-owner-ready']);
  });

  it('start error -> nessuna navigazione', () => {
    serviceMock.startTable.and.returnValue(throwError(() => new Error('start failed')));
    component.tables = [makeTable('tbl-owner-ready', 'Luca', 'waiting', 4, true)];

    component.startMyGame();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
