import { TestBed } from '@angular/core/testing';

import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  const clearStorage = (): void => {
    window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
    window.localStorage.removeItem(AuthSessionService.SESSION_STORAGE_KEY);
    window.localStorage.removeItem(AuthSessionService.LEGACY_USERNAME_KEY);
  };

  beforeEach(() => {
    clearStorage();
  });

  it('inizializza senza sessione autenticata', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(service.currentUser.username).toBe('Luca');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('ripristina sessione da localStorage JSON', () => {
    window.localStorage.setItem(
      AuthSessionService.SESSION_STORAGE_KEY,
      JSON.stringify({ userId: 'u-custom-mario', username: 'Mario' })
    );

    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(service.currentUser.username).toBe('Mario');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('login salva sessione e aggiorna utente corrente', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    service.login(' Player X ');

    expect(service.currentUser.username).toBe('Player X');
    expect(window.localStorage.getItem(AuthSessionService.SESSION_STORAGE_KEY)).toContain('Player X');
    expect(window.localStorage.getItem(AuthSessionService.STORAGE_KEY)).toContain('u-custom-player-x');
    expect(window.localStorage.getItem(AuthSessionService.LEGACY_USERNAME_KEY)).toBe('Player X');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('login con username vuoto solleva errore', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(() => service.login('   ')).toThrowError('USERNAME_REQUIRED');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('logout pulisce tutte le chiavi e resetta stato', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    service.login('Luca');
    service.logout();

    expect(window.localStorage.getItem(AuthSessionService.SESSION_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(AuthSessionService.STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(AuthSessionService.LEGACY_USERNAME_KEY)).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser.username).toBe('Luca');
  });
});
