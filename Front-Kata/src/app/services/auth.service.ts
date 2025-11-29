import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'front-kata.auth.token';
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());

  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  private readonly router = inject(Router);

  login(username: string, password: string): boolean {
    const isValid = username.trim().length > 0 && password.trim().length > 0;
    if (!isValid) return false;

    const fakeToken = btoa(`${username}:${Date.now()}`);
    if (this.isBrowser()) localStorage.setItem(this.storageKey, fakeToken);
    this._isAuthenticated$.next(true);
    return true;
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
