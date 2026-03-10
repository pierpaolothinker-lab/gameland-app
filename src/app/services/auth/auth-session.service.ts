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

  readonly availableUsers: MockSessionUser[] = DEFAULT_MOCK_USERS;

  private readonly currentUserSubject = new BehaviorSubject<MockSessionUser>(this.resolveInitialUser());
  private readonly authenticatedSubject = new BehaviorSubject<boolean>(this.resolveIsAuthenticated());

  readonly currentUser$: Observable<MockSessionUser> = this.currentUserSubject.asObservable();

  get currentUser(): MockSessionUser {
    return this.currentUserSubject.value;
  }

  get hasActiveSession(): boolean {
    return this.authenticatedSubject.value;
  }

  setActiveUser(userId: string): void {
    const selectedUser = this.availableUsers.find((user) => user.userId === userId);
    if (!selectedUser) {
      return;
    }

    this.currentUserSubject.next(selectedUser);
    this.persistSession(selectedUser);
  }

  loginWithUsername(username: string): boolean {
    const normalized = username.trim();
    if (!normalized) {
      return false;
    }

    const matched = this.availableUsers.find((user) => user.username.toLowerCase() === normalized.toLowerCase());
    const sessionUser: MockSessionUser =
      matched ?? {
        userId: this.buildCustomUserId(normalized),
        username: normalized,
      };

    this.currentUserSubject.next(sessionUser);
    this.persistSession(sessionUser);
    return true;
  }

  logout(): void {
    if (typeof window === 'undefined') {
      this.authenticatedSubject.next(false);
      return;
    }

    window.localStorage.removeItem(AuthSessionService.STORAGE_KEY);
    window.localStorage.removeItem(AuthSessionService.SESSION_STORAGE_KEY);
    this.authenticatedSubject.next(false);
  }

  private resolveInitialUser(): MockSessionUser {
    const fallback = this.availableUsers[0];

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
    if (!storedUserId) {
      return fallback;
    }

    return this.availableUsers.find((user) => user.userId === storedUserId) ?? fallback;
  }

  private resolveIsAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      !!window.localStorage.getItem(AuthSessionService.SESSION_STORAGE_KEY) ||
      !!window.localStorage.getItem(AuthSessionService.STORAGE_KEY)
    );
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
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(AuthSessionService.STORAGE_KEY, user.userId);
    window.localStorage.setItem(
      AuthSessionService.SESSION_STORAGE_KEY,
      JSON.stringify({
        userId: user.userId,
        username: user.username,
        displayName: user.displayName,
      } satisfies StoredMockSession)
    );
    this.authenticatedSubject.next(true);
  }

  private buildCustomUserId(username: string): string {
    const base = username
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `u-custom-${base || 'player'}`;
  }
}
