import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';

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
  };
  let authMock: {
    availableUsers: MockSessionUser[];
    currentUser: MockSessionUser;
    currentUser$: BehaviorSubject<MockSessionUser>;
    setActiveUser: jasmine.Spy;
  };

  const activeUser: MockSessionUser = { userId: 'u-luca', username: 'Luca' };

  const tablesMock: TressetteTableView[] = [
    {
      tableId: 'table-1',
      owner: 'owner-a',
      players: [{ username: 'user-sud', position: 'SUD' }],
      isComplete: false,
      points: { teamSN: 0, teamEO: 0 },
      status: 'waiting',
    },
  ];

  beforeEach(async () => {
    serviceMock = {
      listTables: jasmine.createSpy('listTables').and.returnValue(of(tablesMock)),
      createTable: jasmine.createSpy('createTable').and.returnValue(of(tablesMock[0])),
      joinTable: jasmine.createSpy('joinTable').and.returnValue(of(tablesMock[0])),
    };

    authMock = {
      availableUsers: [activeUser, { userId: 'u-marta', username: 'Marta' }],
      currentUser: activeUser,
      currentUser$: new BehaviorSubject<MockSessionUser>(activeUser),
      setActiveUser: jasmine.createSpy('setActiveUser'),
    };

    await TestBed.configureTestingModule({
      imports: [TressetteLobbyPage],
      providers: [
        { provide: TressetteTableService, useValue: serviceMock },
        { provide: AuthSessionService, useValue: authMock },
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

  it('empty state', () => {
    serviceMock.listTables.and.returnValue(of([]));

    component.refreshTables();

    expect(component.loading).toBeFalse();
    expect(component.tables.length).toBe(0);
  });

  it('non mostra input username manuali', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain('Username owner');
    expect(compiled.textContent).not.toContain('Username per join');
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
