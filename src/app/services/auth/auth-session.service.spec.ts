import { TestBed } from '@angular/core/testing';

import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  beforeEach(() => {
    window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
  });

  it('inizializza utente di default se storage vuoto', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(service.currentUser.username).toBe('Luca');
  });

  it('ripristina utente da localStorage', () => {
    window.localStorage.setItem(AuthSessionService.STORAGE_KEY, 'u-sofia');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(service.currentUser.username).toBe('Sofia');
  });

  it('setActiveUser aggiorna utente corrente e storage', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    service.setActiveUser('u-paolo');

    expect(service.currentUser.username).toBe('Paolo');
    expect(window.localStorage.getItem(AuthSessionService.STORAGE_KEY)).toBe('u-paolo');
  });
});
