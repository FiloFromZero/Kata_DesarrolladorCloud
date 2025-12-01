import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export type UserSummary = { username: string };

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly users$ = new BehaviorSubject<UserSummary[]>([]);
  
  // Cache for search results with TTL
  private searchCache = new Map<string, {
    result: { content: UserSummary[]; page: number; totalPages: number },
    timestamp: number
  }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
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

  search(q: string, page: number, size: number): Observable<{ content: UserSummary[]; page: number; totalPages: number; }> {
    const cacheKey = `${q}|${page}|${size}`;
    const cached = this.searchCache.get(cacheKey);
    
    // Return cached result if valid
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return of(cached.result);
    }
    
    return this.http.get<{ content: UserSummary[]; number: number; totalPages: number }>(`/api/users/search`, { params: { q, page, size } }).pipe(
      map(res => ({ content: res.content ?? [], page: res.number ?? page, totalPages: res.totalPages ?? 1 })),
      tap(result => {
        // Store in cache
        this.searchCache.set(cacheKey, { result, timestamp: Date.now() });
      }),
      catchError(() => of({ content: [], page, totalPages: 1 }))
    );
  }
  
  // Method to clear cache if needed
  clearCache(): void {
    this.searchCache.clear();
  }
}
