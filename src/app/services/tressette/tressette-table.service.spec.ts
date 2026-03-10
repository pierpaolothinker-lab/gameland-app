import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TressetteTableService } from './tressette-table.service';
import { BackendClientService } from '../backend/backend-client.service';
import { DataModeService } from '../data-mode/data-mode.service';

describe('TressetteTableService', () => {
  let service: TressetteTableService;

  const backendMock = {
    get: jasmine.createSpy('get').and.returnValue(of([])),
    post: jasmine.createSpy('post').and.returnValue(of({})),
    connectSocket: jasmine.createSpy('connectSocket'),
  };

  const dataModeMock = {
    mode: 'demo' as 'demo' | 'live',
  };

  beforeEach(() => {
    backendMock.get.calls.reset();
    backendMock.post.calls.reset();
    backendMock.connectSocket.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        TressetteTableService,
        { provide: BackendClientService, useValue: backendMock },
        { provide: DataModeService, useValue: dataModeMock },
      ],
    });
    service = TestBed.inject(TressetteTableService);
  });

  it('listTables usa endpoint corretto', () => {
    dataModeMock.mode = 'demo';
    service.listTables().subscribe();

    expect(backendMock.get).toHaveBeenCalledWith('/api/tressette/tables', { mode: 'demo' });
  });

  it('createTable usa endpoint e payload corretti', () => {
    dataModeMock.mode = 'demo';
    service.createTable('owner').subscribe();

    expect(backendMock.post).toHaveBeenCalledWith('/api/tressette/tables', { owner: 'owner' }, { mode: 'demo' });
  });

  it('joinTable usa endpoint e payload corretti', () => {
    dataModeMock.mode = 'demo';
    service.joinTable('table-1', 'vito', 'NORD').subscribe();

    expect(backendMock.post).toHaveBeenCalledWith('/api/tressette/tables/table-1/join', {
      username: 'vito',
      position: 'NORD',
    }, { mode: 'demo' });
  });
  it('addBot usa endpoint e payload corretti', () => {
    dataModeMock.mode = 'demo';
    service.addBot('table-1', 'owner', 'OVEST').subscribe();

    expect(backendMock.post).toHaveBeenCalledWith('/api/tressette/tables/table-1/add-bot', {
      username: 'owner',
      position: 'OVEST',
    }, { mode: 'demo' });
  });

  it('getTableRealtime usa backend con mode selezionato', () => {
    dataModeMock.mode = 'live';

    service.getTableRealtime('tbl-55').subscribe();

    expect(backendMock.get).toHaveBeenCalledWith('/api/tressette/tables/tbl-55', { mode: 'live' });
  });

  it('connectSocket passa mode al backend client', () => {
    dataModeMock.mode = 'live';

    service.connectSocket();

    expect(backendMock.connectSocket).toHaveBeenCalledWith({ mode: 'live' });
  });
});

