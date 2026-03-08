import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

import { environment } from 'src/environments/environment';

export interface BackendRequestOptions {
  mode?: 'demo' | 'live';
}

@Injectable({
  providedIn: 'root',
})
export class BackendClientService {
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.backend.apiBaseUrl);
  private readonly socketBaseUrl = this.normalizeBaseUrl(environment.backend.socketUrl);

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, options?: BackendRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildApiUrl(path), {
      params: this.buildParams(options),
    });
  }

  post<T>(path: string, body: unknown, options?: BackendRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildApiUrl(path), body, {
      params: this.buildParams(options),
    });
  }

  connectSocket(options?: BackendRequestOptions): Socket {
    const mode = options?.mode;
    return io(this.socketBaseUrl, {
      transports: ['websocket'],
      query: mode ? { mode } : undefined,
      auth: mode ? { mode } : undefined,
    });
  }

  private buildParams(options?: BackendRequestOptions): HttpParams | undefined {
    if (!options?.mode) {
      return undefined;
    }

    return new HttpParams().set('mode', options.mode);
  }

  private buildApiUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/assets/')) {
      return path;
    }

    return `${this.apiBaseUrl}${this.normalizePath(path)}`;
  }

  private normalizeBaseUrl(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  private normalizePath(path: string): string {
    if (!path) {
      return '';
    }

    return path.startsWith('/') ? path : `/${path}`;
  }
}
