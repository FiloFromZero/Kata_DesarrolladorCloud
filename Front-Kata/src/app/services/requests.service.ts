import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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
  constructor(private readonly http: HttpClient) {
    this.auth.isAuthenticated$.subscribe(() => {
      this.baseSubject.next([]);
      this.allSubject.next([]);
      this.createdSubject.next([]);
    });
  }

  private emojiFor(name: string): string {
    const icons = ['👤','🔧','🔑','🛡️','📁','🧩','⚙️','🪪'];
    const n = name?.length ? Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
    return icons[n % icons.length];
  }

  private ensureLoaded(): void {
    const base = this.baseSubject.getValue();
    if (base.length) return;
    this.http.get<BackendRequest[]>(`/api/requests`).pipe(
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
      catchError(() => of([] as UIRequest[]))
    ).subscribe((uiList) => {
      const me = this.auth.getUsername();
      this.baseSubject.next(uiList);
      this.allSubject.next(me ? uiList.filter(i => i.approverName === me) : []);
      this.createdSubject.next(me ? uiList.filter(i => i.requester.name === me) : []);
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
    return t;
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
      })))
    );
  }
}
