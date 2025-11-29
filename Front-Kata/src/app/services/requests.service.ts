import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
};

export type UIRequest = {
  id: string;
  title: string;
  requester: { name: string; avatar: string };
  type: 'Despliegue' | 'Acceso' | 'Cambio' | string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

@Injectable({ providedIn: 'root' })
export class RequestsService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<UIRequest[]> {
    return this.http.get<BackendRequest[]>(`/api/requests`).pipe(
      map(list => list.map(r => ({
        id: r.id,
        title: r.title,
        requester: {
          name: r.requesterName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.requesterName)}&background=e3efff&color=0b4dbb`
        },
        type: this.mapType(r.type),
        date: (r.createdAt ?? '').slice(0, 10),
        status: this.mapStatus(r.status)
      })))
    );
  }

  updateStatus(id: string, status: 'approved' | 'rejected', comments?: string): Observable<BackendRequest> {
    const body = { status: status.toUpperCase(), comments } as { status: 'APPROVED' | 'REJECTED'; comments?: string };
    return this.http.patch<BackendRequest>(`/api/requests/${id}`, body);
  }

  private mapStatus(s: BackendRequest['status']): 'pending' | 'approved' | 'rejected' {
    return s === 'APPROVED' ? 'approved' : s === 'REJECTED' ? 'rejected' : 'pending';
  }

  private mapType(t: string): UIRequest['type'] {
    const v = t?.toLowerCase();
    return v === 'deployment' ? 'Despliegue' : v === 'access' ? 'Acceso' : v === 'change' ? 'Cambio' : t;
  }
}
