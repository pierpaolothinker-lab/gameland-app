import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackendClientService {
  private readonly apiBaseUrl = this.normalizeBaseUrl(environment.backend.apiBaseUrl);
  private readonly socketBaseUrl = this.normalizeBaseUrl(environment.backend.socketUrl);

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.buildApiUrl(path));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.buildApiUrl(path), body);
  }

  connectSocket(): Socket {
    return io(this.socketBaseUrl, {
      transports: ['websocket'],
    });
  }

  private buildApiUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Frontend static assets must stay on app origin (localhost:4400),
    // and must not be prefixed by backend base URL.
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
