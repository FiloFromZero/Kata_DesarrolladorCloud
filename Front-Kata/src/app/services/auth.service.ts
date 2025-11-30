import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'front-kata.auth.token';
  private readonly expiresKey = 'front-kata.auth.expires';
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());
  private readonly _toast$ = new BehaviorSubject<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();
  readonly toast$ = this._toast$.asObservable();

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<boolean> {
    const isValid = username.trim().length > 0 && password.trim().length > 0;
    if (!isValid) return of(false);

    return this.http.post<{ token: string }>(`/api/auth/login`, { username, password }).pipe(
      tap(res => {
        if (res?.token && this.isBrowser()) {
          localStorage.setItem(this.storageKey, res.token);
          localStorage.setItem(this.expiresKey, String(Date.now() + 30 * 60 * 1000));
          this._isAuthenticated$.next(true);
        }
      }),
      map(res => !!res?.token),
      catchError(() => of(false))
    );
  }

  register(email: string, password: string): Observable<boolean> {
    const isValid = email.trim().length > 0 && password.trim().length > 0;
    if (!isValid) return of(false);
    return this.http.post<{ token: string }>(`/api/auth/register`, { username: email, password, role: 'USER' }).pipe(
      tap(res => {
        if (res?.token && this.isBrowser()) {
          localStorage.setItem(this.storageKey, res.token);
          localStorage.setItem(this.expiresKey, String(Date.now() + 30 * 60 * 1000));
          this._isAuthenticated$.next(true);
        }
      }),
      map(res => !!res?.token),
      catchError(() => of(false))
    );
  }

  logout(): void {
    if (this.isBrowser()) { localStorage.removeItem(this.storageKey); localStorage.removeItem(this.expiresKey); }
    this._isAuthenticated$.next(false);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    const exp = this.getExpiry();
    if (exp && Date.now() > exp) { this.logout(); return null; }
    return localStorage.getItem(this.storageKey);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const json = atob(padded);
      const payload = JSON.parse(json);
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  }

  private hasToken(): boolean {
    if (!this.isBrowser()) return false;
    const token = localStorage.getItem(this.storageKey);
    const exp = this.getExpiry();
    return !!token && !!exp && Date.now() < exp;
  }

  isBrowser(): boolean { return typeof window !== 'undefined' && typeof localStorage !== 'undefined'; }

  private getExpiry(): number | null {
    if (!this.isBrowser()) return null;
    const raw = localStorage.getItem(this.expiresKey);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }

  success(message: string) { this._toast$.next({ type: 'success', message }); }
  error(message: string) { this._toast$.next({ type: 'error', message }); }
  info(message: string) { this._toast$.next({ type: 'info', message }); }
}
