import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { Router } from '@angular/router';
import { AuthSessionService, MockSessionUser } from 'src/app/services/auth/auth-session.service';
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
    startTable: jasmine.Spy;
  };
  let authMock: {
    availableUsers: MockSessionUser[];
    currentUser: MockSessionUser;
    currentUser$: BehaviorSubject<MockSessionUser>;
    setActiveUser: jasmine.Spy;
  };
  let routerMock: { navigate: jasmine.Spy };

  const activeUser: MockSessionUser = { userId: 'u-luca', username: 'Luca' };

  const ownerStartReadyTable: TressetteTableView = {
    tableId: 'table-1',
    owner: 'Luca',
    players: [
      { username: 'Luca', position: 'SUD' },
      { username: 'Marta', position: 'NORD' },
      { username: 'Sofia', position: 'EST' },
      { username: 'Paolo', position: 'OVEST' },
    ],
    isComplete: true,
    points: { teamSN: 0, teamEO: 0 },
    status: 'waiting',
  };

  beforeEach(async () => {
    serviceMock = {
      listTables: jasmine.createSpy('listTables').and.returnValue(of([ownerStartReadyTable])),
      createTable: jasmine.createSpy('createTable').and.returnValue(of(ownerStartReadyTable)),
      joinTable: jasmine.createSpy('joinTable').and.returnValue(of(ownerStartReadyTable)),
      startTable: jasmine.createSpy('startTable').and.returnValue(of({ ...ownerStartReadyTable, status: 'in_game' })),
    };

    authMock = {
      availableUsers: [activeUser, { userId: 'u-marta', username: 'Marta' }],
      currentUser: activeUser,
      currentUser$: new BehaviorSubject<MockSessionUser>(activeUser),
      setActiveUser: jasmine.createSpy('setActiveUser'),
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    };

    await TestBed.configureTestingModule({
      imports: [TressetteLobbyPage],
      providers: [
        { provide: TressetteTableService, useValue: serviceMock },
        { provide: AuthSessionService, useValue: authMock },
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

  it('owner con tavolo avviabile -> bottone globale abilitato', () => {
    expect(component.ownerTable?.tableId).toBe('table-1');
    expect(component.canStartOwnerTable).toBeTrue();
    expect(component.startDisabledReason).toContain('Pronto per avvio');
  });

  it('owner senza tavolo -> bottone globale disabilitato', () => {
    component.tables = [{ ...ownerStartReadyTable, owner: 'Marta' }];

    expect(component.ownerTable).toBeNull();
    expect(component.canStartOwnerTable).toBeFalse();
    expect(component.startDisabledReason).toContain('Nessun tavolo owner');
  });

  it('owner con tavolo non completo -> bottone globale disabilitato', () => {
    component.tables = [
      {
        ...ownerStartReadyTable,
        isComplete: false,
        players: ownerStartReadyTable.players.slice(0, 2),
      },
    ];

    expect(component.canStartOwnerTable).toBeFalse();
    expect(component.startDisabledReason).toContain('non e completo');
  });

  it('start success -> navigation a gameplay', () => {
    component.startMyGame();

    expect(serviceMock.startTable).toHaveBeenCalledWith('table-1', 'Luca');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/table3s74i']);
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

  it('gestione errore API', () => {
    serviceMock.listTables.and.returnValue(throwError(() => new Error('offline')));

    component.refreshTables();

    expect(component.errorBanner).toContain('Errore caricamento lobby');
    expect(component.loading).toBeFalse();
  });
});
