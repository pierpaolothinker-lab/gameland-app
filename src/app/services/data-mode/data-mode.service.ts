import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DataMode = 'demo' | 'live';

@Injectable({
  providedIn: 'root',
})
export class DataModeService {
  static readonly STORAGE_KEY = 'gameland.dataMode';

  private readonly modeSubject = new BehaviorSubject<DataMode>(this.readInitialMode());
  readonly mode$ = this.modeSubject.asObservable();

  get mode(): DataMode {
    return this.modeSubject.value;
  }

  setMode(mode: DataMode): void {
    if (mode !== 'demo' && mode !== 'live') {
      return;
    }

    if (mode === this.modeSubject.value) {
      return;
    }

    this.modeSubject.next(mode);
    this.persistMode(mode);
  }

  private readInitialMode(): DataMode {
    if (typeof window === 'undefined') {
      return 'demo';
    }

    const saved = window.localStorage.getItem(DataModeService.STORAGE_KEY);
    return saved === 'live' ? 'live' : 'demo';
  }

  private persistMode(mode: DataMode): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(DataModeService.STORAGE_KEY, mode);
  }
}
