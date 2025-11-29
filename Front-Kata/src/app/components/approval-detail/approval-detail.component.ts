import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { RequestsService, UIRequest } from '../../services/requests.service';

@Component({
  selector: 'app-approval-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, NgClass, NgIf],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div class="text-lg font-semibold text-slate-800">{{ request.title }}</div>
            <div class="text-xs text-slate-500">ID {{ request.id }} • {{ request.date }}</div>
          </div>
          <span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="stateStyles[request.status]">{{ statusLabel(request.status) }}</span>
        </div>
        <div class="p-6 space-y-6">
          <div class="flex items-center gap-3">
            <img [src]="request.requester.avatar" alt="" class="h-10 w-10 rounded-full ring-1 ring-white">
            <div>
              <div class="text-sm font-medium text-slate-700">{{ request.requester.name }}</div>
              <div class="text-xs text-slate-500">Solicitante</div>
            </div>
            <span class="ml-auto px-2 py-1 text-xs rounded-md ring-1" [ngClass]="typeStyles[request.type]">{{ request.type }}</span>
          </div>
          <div class="text-slate-700 leading-relaxed">{{ request.description }}</div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Comentarios del aprobador</label>
            <textarea [(ngModel)]="comment" class="w-full min-h-[120px] rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40 transition-shadow duration-150" placeholder="Añade contexto para tu decisión"></textarea>
          </div>
          <div class="flex items-center gap-3">
            <button (click)="setStatus('approved')" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white">Aprobar
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"/></svg>
            </button>
            <button (click)="setStatus('rejected')" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-rose-700 ring-1 ring-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2">Rechazar
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/></svg>
            </button>
            <a routerLink="/" class="ml-auto text-sm text-slate-600 hover:text-slate-800">Volver</a>
          </div>
          <div *ngIf="request.status !== 'pending'" class="text-xs text-slate-500">Esta solicitud ya fue procesada.</div>
        </div>
      </div>
    </div>
  `
})
export class ApprovalDetailComponent {
  readonly stateStyles: Record<'pending' | 'approved' | 'rejected', string> = {
    pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 ring-rose-200'
  };
  readonly typeStyles: Record<string, string> = {
    Despliegue: 'bg-[#e3efff] text-[#0b4dbb] ring-[#c9dbff]',
    Acceso: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
    Cambio: 'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200'
  };

  readonly service = inject(RequestsService);
  request!: UIRequest & { description?: string };
  comment = '';

  constructor(route: ActivatedRoute) {
    const id = route.snapshot.paramMap.get('id') ?? '';
    this.service.getAll().subscribe(list => {
      const found = list.find(r => r.id === id) ?? list[0];
      this.request = found as (UIRequest & { description?: string });
    });
  }

  setStatus(s: 'pending' | 'approved' | 'rejected') {
    if (!this.request?.id) return;
    if (s === 'pending') { this.request = { ...this.request, status: s }; return; }
    this.service.updateStatus(this.request.id, s, this.comment).subscribe(() => {
      this.request = { ...this.request, status: s };
    });
  }
  statusLabel(s: 'pending' | 'approved' | 'rejected') { return s === 'pending' ? 'Pendiente' : s === 'approved' ? 'Aprobado' : 'Rechazado'; }
}
