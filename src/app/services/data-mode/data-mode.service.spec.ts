import { TestBed } from '@angular/core/testing';

import { DataModeService } from './data-mode.service';

describe('DataModeService', () => {
  let service: DataModeService;

  beforeEach(() => {
    localStorage.removeItem(DataModeService.STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [DataModeService],
    });

    service = TestBed.inject(DataModeService);
  });

  it('default mode e demo', () => {
    expect(service.mode).toBe('demo');
  });

  it('ripristina live da localStorage', () => {
    localStorage.setItem(DataModeService.STORAGE_KEY, 'live');
    const localService = new DataModeService();

    expect(localService.mode).toBe('live');
  });

  it('persiste mode su setMode', () => {
    service.setMode('live');

    expect(service.mode).toBe('live');
    expect(localStorage.getItem(DataModeService.STORAGE_KEY)).toBe('live');
  });
});
