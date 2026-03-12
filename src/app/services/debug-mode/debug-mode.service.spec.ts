import { TestBed } from '@angular/core/testing';

import { DebugModeService } from './debug-mode.service';

describe('DebugModeService', () => {
  let service: DebugModeService;

  beforeEach(() => {
    localStorage.removeItem(DebugModeService.STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [DebugModeService],
    });

    service = TestBed.inject(DebugModeService);
  });

  it('default mode e disattivato', () => {
    expect(service.enabled).toBeFalse();
  });

  it('ripristina stato attivo da localStorage', () => {
    localStorage.setItem(DebugModeService.STORAGE_KEY, 'true');
    const localService = new DebugModeService();

    expect(localService.enabled).toBeTrue();
  });

  it('persiste toggle su setEnabled', () => {
    service.setEnabled(true);

    expect(service.enabled).toBeTrue();
    expect(localStorage.getItem(DebugModeService.STORAGE_KEY)).toBe('true');
  });
});
