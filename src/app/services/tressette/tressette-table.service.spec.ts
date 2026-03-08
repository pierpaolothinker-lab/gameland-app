import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TressetteTableService } from './tressette-table.service';
import { BackendClientService } from '../backend/backend-client.service';

describe('TressetteTableService', () => {
  let service: TressetteTableService;

  const backendMock = {
    get: jasmine.createSpy('get').and.returnValue(of([])),
    post: jasmine.createSpy('post').and.returnValue(of({})),
    connectSocket: jasmine.createSpy('connectSocket'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TressetteTableService,
        { provide: BackendClientService, useValue: backendMock },
      ],
    });
    service = TestBed.inject(TressetteTableService);
  });

  it('listTables usa endpoint corretto', () => {
    service.listTables().subscribe();

    expect(backendMock.get).toHaveBeenCalledWith('/api/tressette/tables');
  });

  it('createTable usa endpoint e payload corretti', () => {
    service.createTable('owner').subscribe();

    expect(backendMock.post).toHaveBeenCalledWith('/api/tressette/tables', { owner: 'owner' });
  });

  it('joinTable usa endpoint e payload corretti', () => {
    service.joinTable('table-1', 'vito', 'NORD').subscribe();

    expect(backendMock.post).toHaveBeenCalledWith('/api/tressette/tables/table-1/join', {
      username: 'vito',
      position: 'NORD',
    });
  });
});
