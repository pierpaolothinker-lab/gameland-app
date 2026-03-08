import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MockSessionUser {
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

  readonly availableUsers: MockSessionUser[] = DEFAULT_MOCK_USERS;

  private readonly currentUserSubject = new BehaviorSubject<MockSessionUser>(this.resolveInitialUser());

  readonly currentUser$: Observable<MockSessionUser> = this.currentUserSubject.asObservable();

  get currentUser(): MockSessionUser {
    return this.currentUserSubject.value;
  }

  setActiveUser(userId: string): void {
    const selectedUser = this.availableUsers.find((user) => user.userId === userId);
    if (!selectedUser) {
      return;
    }

    this.currentUserSubject.next(selectedUser);
    this.persistUserId(selectedUser.userId);
  }

  private resolveInitialUser(): MockSessionUser {
    const fallback = this.availableUsers[0];

    if (typeof window === 'undefined') {
      return fallback;
    }

    const storedUserId = window.localStorage.getItem(AuthSessionService.STORAGE_KEY);
    if (!storedUserId) {
      return fallback;
    }

    return this.availableUsers.find((user) => user.userId === storedUserId) ?? fallback;
  }

  private persistUserId(userId: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(AuthSessionService.STORAGE_KEY, userId);
  }
}
