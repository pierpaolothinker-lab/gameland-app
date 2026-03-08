import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TressetteLobbyPage } from './tressette-lobby.page';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';

describe('TressetteLobbyPage', () => {
  let component: TressetteLobbyPage;
  let fixture: ComponentFixture<TressetteLobbyPage>;
  let serviceMock: {
    listTables: jasmine.Spy;
    createTable: jasmine.Spy;
    joinTable: jasmine.Spy;
  };

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

    await TestBed.configureTestingModule({
      imports: [TressetteLobbyPage],
      providers: [{ provide: TressetteTableService, useValue: serviceMock }],
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

  it('create success', () => {
    component.ownerUsername = 'new-owner';

    component.createTable();

    expect(serviceMock.createTable).toHaveBeenCalledWith('new-owner');
    expect(serviceMock.listTables).toHaveBeenCalledTimes(2);
  });

  it('join success', () => {
    component.joinUsernameByTable['table-1'] = 'vito';

    component.joinSeat('table-1', 'NORD');

    expect(serviceMock.joinTable).toHaveBeenCalledWith('table-1', 'vito', 'NORD');
    expect(serviceMock.listTables).toHaveBeenCalledTimes(2);
  });

  it('gestione errore API', () => {
    serviceMock.listTables.and.returnValue(throwError(() => new Error('offline')));

    component.refreshTables();

    expect(component.errorBanner).toContain('Errore caricamento lobby');
    expect(component.loading).toBeFalse();
  });
});
