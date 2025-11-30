import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type UserSummary = { username: string };

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly users$ = new BehaviorSubject<UserSummary[]>([]);
  constructor(private readonly http: HttpClient) {}
  getAll(): Observable<UserSummary[]> {
    const cached = this.users$.getValue();
    if (cached.length) return this.users$.asObservable();
    this.http.get<UserSummary[]>(`/api/users`).pipe(
      catchError(() => of([])),
      tap(list => this.users$.next(list))
    ).subscribe();
    return this.users$.asObservable();
  }
}
