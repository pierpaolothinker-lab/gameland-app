import { TestBed } from '@angular/core/testing';

import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  beforeEach(() => {
    window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
    window.localStorage.removeItem(AuthSessionService.SESSION_STORAGE_KEY);
  });

  it('inizializza senza sessione autenticata', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(service.currentUser.username).toBe('Luca');
    expect(service.hasActiveSession).toBeFalse();
  });

  it('ripristina sessione da localStorage JSON', () => {
    window.localStorage.setItem(
      AuthSessionService.SESSION_STORAGE_KEY,
      JSON.stringify({ userId: 'u-custom-mario', username: 'Mario' })
    );

    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    expect(service.currentUser.username).toBe('Mario');
    expect(service.hasActiveSession).toBeTrue();
  });

  it('setActiveUser aggiorna utente corrente e storage', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    service.setActiveUser('u-paolo');

    expect(service.currentUser.username).toBe('Paolo');
    expect(window.localStorage.getItem(AuthSessionService.STORAGE_KEY)).toBe('u-paolo');
    expect(service.hasActiveSession).toBeTrue();
  });

  it('loginWithUsername fallisce con username vuoto', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    const result = service.loginWithUsername('   ');

    expect(result).toBeFalse();
    expect(service.hasActiveSession).toBeFalse();
  });

  it('loginWithUsername salva sessione custom se user non in lista', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(AuthSessionService);

    const result = service.loginWithUsername('Player X');

    expect(result).toBeTrue();
    expect(service.currentUser.username).toBe('Player X');
    expect(window.localStorage.getItem(AuthSessionService.SESSION_STORAGE_KEY)).toContain('Player X');
    expect(service.hasActiveSession).toBeTrue();
  });
});
