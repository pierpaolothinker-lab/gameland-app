import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MockSessionUser {
  userId: string;
  username: string;
  displayName?: string;
}

interface StoredMockSession {
  userId: string;
  username: string;
  displayName?: string;
}

const DEFAULT_MOCK_USERS: MockSessionUser[] = [
  { userId: 'u-luca', username: 'Luca', displayName: 'Luca Bianchi' },
  { userId: 'u-marta', username: 'Marta', displayName: 'Marta Rossi' },
  { userId: 'u-sofia', username: 'Sofia', displayName: 'Sofia Verdi' },
  { userId: 'u-paolo', username: 'Paolo', displayName: 'Paolo Neri' },
];

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  static readonly STORAGE_KEY = 'gameland.mockAuthSession.userId';
  static readonly SESSION_STORAGE_KEY = 'gameland.mockAuthSession.session';
  static readonly LEGACY_USERNAME_KEY = 'gameland.mockAuthSession.username';

  private static readonly SESSION_KEYS = [
    AuthSessionService.SESSION_STORAGE_KEY,
    AuthSessionService.STORAGE_KEY,
    AuthSessionService.LEGACY_USERNAME_KEY,
  ];

  readonly availableUsers: MockSessionUser[] = DEFAULT_MOCK_USERS;

  private readonly currentUserSubject = new BehaviorSubject<MockSessionUser>(this.resolveInitialUser());
  private readonly authenticatedSubject = new BehaviorSubject<boolean>(this.resolveIsAuthenticated());

  readonly currentUser$: Observable<MockSessionUser> = this.currentUserSubject.asObservable();

  get currentUser(): MockSessionUser {
    return this.currentUserSubject.value;
  }

  setActiveUser(userId: string): void {
    const selectedUser = this.availableUsers.find((user) => user.userId === userId);
    if (!selectedUser) {
      return;
    }

    this.persistSession(selectedUser);
  }

  login(username: string, password?: string): void {
    const normalized = username.trim();
    if (!normalized) {
      throw new Error('USERNAME_REQUIRED');
    }

    void password;

    const matched = this.availableUsers.find((user) => user.username.toLowerCase() === normalized.toLowerCase());
    const sessionUser: MockSessionUser =
      matched ?? {
        userId: this.buildCustomUserId(normalized),
        username: normalized,
      };

    this.persistSession(sessionUser);
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      for (const key of AuthSessionService.SESSION_KEYS) {
        window.localStorage.removeItem(key);
      }
    }

    this.currentUserSubject.next(this.defaultUser());
    this.authenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }

  private resolveInitialUser(): MockSessionUser {
    const fallback = this.defaultUser();

    if (typeof window === 'undefined') {
      return fallback;
    }

    const storedSessionRaw = window.localStorage.getItem(AuthSessionService.SESSION_STORAGE_KEY);
    if (storedSessionRaw) {
      const parsed = this.parseStoredSession(storedSessionRaw);
      if (parsed) {
        return parsed;
      }
    }

    const storedUserId = window.localStorage.getItem(AuthSessionService.STORAGE_KEY);
    if (storedUserId) {
      return this.availableUsers.find((user) => user.userId === storedUserId) ?? fallback;
    }

    const legacyUsername = window.localStorage.getItem(AuthSessionService.LEGACY_USERNAME_KEY)?.trim();
    if (!legacyUsername) {
      return fallback;
    }

    const matched = this.availableUsers.find((user) => user.username.toLowerCase() === legacyUsername.toLowerCase());
    return (
      matched ?? {
        userId: this.buildCustomUserId(legacyUsername),
        username: legacyUsername,
      }
    );
  }

  private resolveIsAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return AuthSessionService.SESSION_KEYS.some((key) => !!window.localStorage.getItem(key));
  }

  private parseStoredSession(raw: string): MockSessionUser | null {
    try {
      const parsed = JSON.parse(raw) as Partial<StoredMockSession>;
      const username = parsed.username?.trim();
      const userId = parsed.userId?.trim();

      if (!username || !userId) {
        return null;
      }

      return {
        userId,
        username,
        displayName: parsed.displayName,
      };
    } catch {
      return null;
    }
  }

  private persistSession(user: MockSessionUser): void {
    this.currentUserSubject.next(user);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AuthSessionService.STORAGE_KEY, user.userId);
      window.localStorage.setItem(AuthSessionService.LEGACY_USERNAME_KEY, user.username);
      window.localStorage.setItem(
        AuthSessionService.SESSION_STORAGE_KEY,
        JSON.stringify({
          userId: user.userId,
          username: user.username,
          displayName: user.displayName,
        } satisfies StoredMockSession)
      );
    }

    this.authenticatedSubject.next(true);
  }

  private defaultUser(): MockSessionUser {
    return this.availableUsers[0];
  }

  private buildCustomUserId(username: string): string {
    const base = username
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `u-custom-${base || 'player'}`;
  }
}
