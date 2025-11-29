import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'front-kata.auth.token';
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<boolean> {
    const isValid = username.trim().length > 0 && password.trim().length > 0;
    if (!isValid) return of(false);

    return this.http.post<{ token: string }>(`/api/auth/login`, { username, password }).pipe(
      tap(res => {
        if (res?.token && this.isBrowser()) {
          localStorage.setItem(this.storageKey, res.token);
          this._isAuthenticated$.next(true);
        }
      }),
      map(res => !!res?.token),
      catchError(() => of(false))
    );
  }

  logout(): void {
    if (this.isBrowser()) localStorage.removeItem(this.storageKey);
    this._isAuthenticated$.next(false);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.storageKey) : null;
  }

  private hasToken(): boolean {
    return this.isBrowser() ? !!localStorage.getItem(this.storageKey) : false;
  }

  private isBrowser(): boolean { return typeof window !== 'undefined' && typeof localStorage !== 'undefined'; }
}
