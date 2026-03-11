import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebugModeService {
  static readonly STORAGE_KEY = 'gameland.debugMode';

  private readonly enabledSubject = new BehaviorSubject<boolean>(this.readInitialValue());
  readonly enabled$ = this.enabledSubject.asObservable();

  get enabled(): boolean {
    return this.enabledSubject.value;
  }

  setEnabled(enabled: boolean): void {
    if (enabled === this.enabledSubject.value) {
      return;
    }

    this.enabledSubject.next(enabled);
    this.persistEnabled(enabled);
  }

  toggle(): void {
    this.setEnabled(!this.enabled);
  }

  private readInitialValue(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(DebugModeService.STORAGE_KEY) === 'true';
  }

  private persistEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(DebugModeService.STORAGE_KEY, String(enabled));
  }
}
