import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Table3s74iPage } from './table3s74i.page';
import { TressetteTableService } from 'src/app/services/tressette/tressette-table.service';
import { TressetteTableView } from 'src/app/shared/domain/models/tressette-table.model';

describe('Table3s74iPage', () => {
  let component: Table3s74iPage;
  let fixture: ComponentFixture<Table3s74iPage>;
  let serviceMock: {
    createTable: jasmine.Spy;
    getTable: jasmine.Spy;
    joinTable: jasmine.Spy;
    leaveTable: jasmine.Spy;
    startTable: jasmine.Spy;
    connectSocket: jasmine.Spy;
  };

  const tableMock: TressetteTableView = {
    tableId: 'table-1',
    owner: 'Pierpaolo',
    players: [{ username: 'Pierpaolo', position: 'SUD' }],
    isComplete: false,
    points: { teamSN: 0, teamEO: 0 },
    status: 'waiting',
  };

  let socketMock: {
    id: string;
    on: jasmine.Spy;
    emit: jasmine.Spy;
    disconnect: jasmine.Spy;
  };

  beforeEach(async () => {
    socketMock = {
      id: 'socket-1',
      on: jasmine.createSpy('on'),
      emit: jasmine.createSpy('emit'),
      disconnect: jasmine.createSpy('disconnect'),
    };

    serviceMock = {
      createTable: jasmine.createSpy('createTable').and.returnValue(of(tableMock)),
      getTable: jasmine.createSpy('getTable').and.returnValue(of(tableMock)),
      joinTable: jasmine.createSpy('joinTable').and.returnValue(of(tableMock)),
      leaveTable: jasmine.createSpy('leaveTable').and.returnValue(of(tableMock)),
      startTable: jasmine.createSpy('startTable').and.returnValue(of(tableMock)),
      connectSocket: jasmine.createSpy('connectSocket').and.returnValue(socketMock),
    };

    await TestBed.configureTestingModule({
      imports: [Table3s74iPage],
      providers: [{ provide: TressetteTableService, useValue: serviceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Table3s74iPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('createTable should set table and tableId', () => {
    component.ownerName = 'Pierpaolo';

    component.createTable();

    expect(serviceMock.createTable).toHaveBeenCalledWith('Pierpaolo');
    expect(component.tableId).toBe('table-1');
    expect(component.table?.owner).toBe('Pierpaolo');
  });

  it('createTable should handle api error', () => {
    serviceMock.createTable.and.returnValue(throwError(() => new Error('offline')));

    component.createTable();

    expect(component.errorMessage).toContain('Backend non raggiungibile');
  });

  it('startGame should emit socket event', () => {
    component.tableId = 'table-1';
    component.startUsername = 'Pierpaolo';

    component.startGame();

    expect(serviceMock.connectSocket).toHaveBeenCalled();
    expect(socketMock.emit).toHaveBeenCalledWith('tressette:start-game', {
      tableId: 'table-1',
      username: 'Pierpaolo',
    });
  });
});
