import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

type BackendRequest = {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  approverName: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  comments?: string;
  updatedAt?: string;
  updatedBy?: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type UIRequest = {
  id: string;
  title: string;
  description?: string;
  requester: { name: string; avatar: string };
  approverName?: string;
  comments?: string;
  updatedAt?: string;
  updatedBy?: string;
  type: 'Despliegue' | 'Acceso' | 'Cambio' | string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type BackendHistory = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  actor: string;
  timestamp: string;
};

export type UIHistory = {
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  actor: string;
  timestamp: string;
};

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly baseSubject = new BehaviorSubject<UIRequest[]>([]);
  private readonly allSubject = new BehaviorSubject<UIRequest[]>([]);
  private readonly createdSubject = new BehaviorSubject<UIRequest[]>([]);
  private readonly auth = inject(AuthService);
  private load$?: Observable<UIRequest[]>;
  private loading = false;
  constructor(private readonly http: HttpClient) {
    this.auth.isAuthenticated$.subscribe(() => {
      this.baseSubject.next([]);
      this.allSubject.next([]);
      this.createdSubject.next([]);
      this.load$ = undefined;
      this.loading = false;
    });
  }

  private emojiFor(name: string): string {
    const icons = ['👤','🔧','🔑','🛡️','📁','🧩','⚙️','🪪'];
    const n = name?.length ? Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
    return icons[n % icons.length];
  }

  private ensureLoaded(): void {
    const base = this.baseSubject.getValue();
    if (base.length || this.loading) return;
    this.loading = true;
    if (!this.load$) {
      this.load$ = this.http.get<BackendRequest[]>(`/api/requests`).pipe(
        map((list) => list.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          requester: { name: r.requesterName, avatar: this.emojiFor(r.requesterName) },
          approverName: r.approverName,
          type: this.mapType(r.type),
          date: (r.createdAt ?? '').slice(0, 10),
          status: this.mapStatus(r.status),
          comments: r.comments,
          updatedAt: r.updatedAt,
          updatedBy: r.updatedBy
        }))),
        catchError((err) => {
          try {
            if (err && typeof err === 'object' && 'status' in err) {
              const status = (err as any).status as number;
              if (status === 401) {
                this.auth.error('Sesión expirada');
                this.auth.logout();
              } else {
                this.auth.error('No se pudo cargar solicitudes');
              }
            } else {
              this.auth.error('No se pudo cargar solicitudes');
            }
          } catch {}
          return of([] as UIRequest[]);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    this.load$.subscribe((uiList) => {
      const me = this.auth.getUsername();
      this.baseSubject.next(uiList);
      this.allSubject.next(me ? uiList.filter(i => i.approverName === me) : []);
      this.createdSubject.next(me ? uiList.filter(i => i.requester.name === me) : []);
      this.loading = false;
    });
  }

  getAll(): Observable<UIRequest[]> {
    if (!this.allSubject.getValue().length) this.ensureLoaded();
    return this.allSubject.asObservable();
  }

  getCreatedByMe(): Observable<UIRequest[]> {
    if (!this.createdSubject.getValue().length) this.ensureLoaded();
    return this.createdSubject.asObservable();
  }

  getBase(): Observable<UIRequest[]> {
    if (!this.baseSubject.getValue().length) this.ensureLoaded();
    return this.baseSubject.asObservable();
  }

  getAssignedToMePaged(page: number, size: number): Observable<{ content: UIRequest[]; page: number; totalPages: number; totalElements: number; size: number; }> {
    return this.http.get<Page<BackendRequest>>(`/api/requests/assigned`, { params: { page, size } }).pipe(
      map(res => ({
        content: (res.content ?? []).map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          requester: { name: r.requesterName, avatar: this.emojiFor(r.requesterName) },
          approverName: r.approverName,
          type: this.mapType(r.type),
          date: (r.createdAt ?? '').slice(0, 10),
          status: this.mapStatus(r.status),
          comments: r.comments,
          updatedAt: r.updatedAt,
          updatedBy: r.updatedBy
        })),
        page: res.number ?? page,
        totalPages: res.totalPages ?? 1,
        totalElements: res.totalElements ?? 0,
        size: res.size ?? size
      })),
      catchError((err) => {
        try {
          if (err && typeof err === 'object' && 'status' in err && (err as any).status === 401) {
            this.auth.error('Sesión expirada');
            this.auth.logout();
          } else {
            this.auth.error('No se pudieron cargar solicitudes asignadas');
          }
        } catch {}
        return of({ content: [], page, totalPages: 1, totalElements: 0, size });
      })
    );
  }

  getCreatedByMePaged(page: number, size: number): Observable<{ content: UIRequest[]; page: number; totalPages: number; totalElements: number; size: number; }> {
    return this.http.get<Page<BackendRequest>>(`/api/requests/created`, { params: { page, size } }).pipe(
      map(res => ({
        content: (res.content ?? []).map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          requester: { name: r.requesterName, avatar: this.emojiFor(r.requesterName) },
          approverName: r.approverName,
          type: this.mapType(r.type),
          date: (r.createdAt ?? '').slice(0, 10),
          status: this.mapStatus(r.status),
          comments: r.comments,
          updatedAt: r.updatedAt,
          updatedBy: r.updatedBy
        })),
        page: res.number ?? page,
        totalPages: res.totalPages ?? 1,
        totalElements: res.totalElements ?? 0,
        size: res.size ?? size
      })),
      catchError((err) => {
        try {
          if (err && typeof err === 'object' && 'status' in err && (err as any).status === 401) {
            this.auth.error('Sesión expirada');
            this.auth.logout();
          } else {
            this.auth.error('No se pudieron cargar mis solicitudes');
          }
        } catch {}
        return of({ content: [], page, totalPages: 1, totalElements: 0, size });
      })
    );
  }

  getKpis(): Observable<{ pending: number; processed: number }> {
    return this.http.get<{ pending: number; processed: number }>(`/api/requests/kpis`).pipe(
      catchError((err) => {
        try {
          if (err && typeof err === 'object' && 'status' in err && (err as any).status === 401) {
            this.auth.error('Sesión expirada');
            this.auth.logout();
          }
        } catch {}
        return of({ pending: 0, processed: 0 });
      })
    );
  }

  updateStatus(id: string, status: 'approved' | 'rejected', comments?: string): Observable<BackendRequest> {
    const body = { status: status.toUpperCase(), comments } as { status: 'APPROVED' | 'REJECTED'; comments?: string };
    return this.http.patch<BackendRequest>(`/api/requests/${id}`, body).pipe(
      map(r => {
        const base = this.baseSubject.getValue();
        const baseUpdated = base.map(item => item.id === r.id ? {
          ...item,
          status: this.mapStatus(r.status),
          comments: r.comments,
          updatedAt: r.updatedAt,
          updatedBy: r.updatedBy
        } : item);
        this.baseSubject.next(baseUpdated);
        const me = this.auth.getUsername();
        this.allSubject.next(me ? baseUpdated.filter(i => i.approverName === me) : []);
        this.createdSubject.next(me ? baseUpdated.filter(i => i.requester.name === me) : []);
        return r;
      })
    );
  }

  private mapStatus(s: BackendRequest['status']): 'pending' | 'approved' | 'rejected' {
    return s === 'APPROVED' ? 'approved' : s === 'REJECTED' ? 'rejected' : 'pending';
  }

  private mapType(t: string): UIRequest['type'] {
    const v = (t ?? '').trim().toLowerCase();
    if (!v) return 'Cambio';
    if (v === 'deployment' || v === 'despliegue') return 'Despliegue';
    if (v === 'microservice_publish' || v === 'publicación de microservicio' || v === 'publicacion de microservicio' || v === 'microservicio' || v === 'microservice') return 'Publicación Microservicio';
    if (v === 'internal_tools_access' || v === 'herramientas internas' || v === 'internal tools' || v === 'internal_tools') return 'Acceso Herramientas';
    if (v === 'ci_cd_change' || v === 'ci/cd' || v === 'pipeline' || v === 'pipelines' || v === 'cicd' || v === 'devops') return 'Cambios CI/CD';
    if (v === 'tool_catalog_add' || v === 'catalogo' || v === 'catálogo' || v === 'tool catalog' || v === 'nueva herramienta') return 'Nueva Herramienta';
    if (v === 'database' || v === 'db' || v === 'base de datos' || v === 'bd' || v === 'data') return 'Base de Datos';
    if (v === 'security' || v === 'seguridad' || v === 'secops' || v === 'iam') return 'Seguridad';
    if (v === 'infrastructure' || v === 'infraestructura' || v === 'infra' || v === 'platform' || v === 'plataforma') return 'Infraestructura';
    if (v === 'api_gateway' || v === 'api gateway' || v === 'gateway' || v === 'api') return 'API Gateway';
    if (v === 'access' || v === 'acceso') return 'Acceso';
    if (v === 'change' || v === 'cambio') return 'Cambio';
    if (v === 'support' || v === 'soporte' || v === 'ayuda') return 'Soporte';
    // Si no se encuentra mapeo, devolver el tipo original capitalizado
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }

  create(dto: { title: string; description?: string; requesterName: string; approverName: string; type: 'deployment' | 'access' | 'change' | string }): Observable<BackendRequest> {
    return this.http.post<BackendRequest>(`/api/requests`, dto).pipe(
      map(r => {
        const ui: UIRequest = {
          id: r.id,
          title: r.title,
          description: r.description,
          requester: { name: r.requesterName, avatar: this.emojiFor(r.requesterName) },
          approverName: r.approverName,
          type: this.mapType(r.type),
          date: (r.createdAt ?? '').slice(0, 10),
          status: this.mapStatus(r.status),
          comments: r.comments,
          updatedAt: r.updatedAt,
          updatedBy: r.updatedBy
        };
        const me = this.auth.getUsername();
        const base = this.baseSubject.getValue();
        const nextBase = [ui, ...base];
        this.baseSubject.next(nextBase);
        this.allSubject.next(me ? nextBase.filter(i => i.approverName === me) : []);
        this.createdSubject.next(me ? nextBase.filter(i => i.requester.name === me) : []);
        return r;
      })
    );
  }

  getHistory(id: string): Observable<UIHistory[]> {
    return this.http.get<BackendHistory[]>(`/api/requests/${id}/history`).pipe(
      map(list => list.map(h => ({
        status: this.mapStatus(h.status),
        comments: h.comments,
        actor: h.actor,
        timestamp: h.timestamp
      }))),
      catchError((err) => {
        try {
          if (err && typeof err === 'object' && 'status' in err && (err as any).status === 401) {
            this.auth.error('Sesión expirada');
            this.auth.logout();
          } else {
            this.auth.error('No se pudo cargar histórico');
          }
        } catch {}
        return of([] as UIHistory[]);
      })
    );
  }

  getHistoryPaged(id: string, page: number, size: number): Observable<{ content: UIHistory[]; page: number; totalPages: number; }> {
    return this.http.get<Page<BackendHistory>>(`/api/requests/${id}/history/paged`, { params: { page, size } }).pipe(
      map(res => ({
        content: (res.content ?? []).map(h => ({
          status: this.mapStatus(h.status),
          comments: h.comments,
          actor: h.actor,
          timestamp: h.timestamp
        })),
        page: res.number ?? page,
        totalPages: res.totalPages ?? 1
      })),
      catchError((err) => {
        try {
          if (err && typeof err === 'object' && 'status' in err && (err as any).status === 401) {
            this.auth.error('Sesión expirada');
            this.auth.logout();
          } else {
            this.auth.error('No se pudo cargar más histórico');
          }
        } catch {}
        return of({ content: [], page, totalPages: 1 });
      })
    );
  }
}
