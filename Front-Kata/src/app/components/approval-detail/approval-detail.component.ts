import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { RequestsService, UIRequest } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-approval-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, NgClass, NgIf, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @defer (on viewport) {
      {{ triggerLoad() }}
      <div *ngIf="request" class="max-w-4xl mx-auto">
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
              <div>
                <div class="text-sm font-medium text-slate-700">{{ request.requester.name }}</div>
                <div class="text-xs text-slate-500">Solicitante</div>
              </div>
              <span class="ml-auto px-2 py-1 text-xs rounded-md ring-1" [ngClass]="getTypeStyle(request.type)">{{ request.type }}</span>
            </div>
            <div class="text-slate-700 leading-relaxed">{{ request.description }}</div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Comentarios del aprobador</label>
              <textarea [(ngModel)]="comment" [disabled]="request.status !== 'pending'" class="w-full min-h-[120px] rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40 transition-shadow duration-150" placeholder="Añade contexto para tu decisión"></textarea>
            </div>
            <div class="flex items-center gap-3">
              <button (click)="setStatus('approved')" [disabled]="request.status !== 'pending'" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white">Aprobar
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"/></svg>
              </button>
              <button (click)="setStatus('rejected')" [disabled]="request.status !== 'pending'" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-rose-700 ring-1 ring-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2">Rechazar
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/></svg>
              </button>
              <a routerLink="/dashboard" class="ml-auto text-sm text-slate-600 hover:text-slate-800">Volver</a>
            </div>
            <div *ngIf="request.status !== 'pending'" class="text-xs text-slate-500">Esta solicitud ya fue procesada.</div>

            <div class="space-y-3">
              <div class="text-sm font-medium text-slate-700">Histórico</div>
              <div class="min-w-full">
                <div class="grid grid-cols-4 bg-slate-50 text-slate-600 text-xs">
                  <div class="px-3 py-2 text-left font-medium">Fecha</div>
                  <div class="px-3 py-2 text-left font-medium">Usuario</div>
                  <div class="px-3 py-2 text-left font-medium">Estado</div>
                  <div class="px-3 py-2 text-left font-medium">Comentarios</div>
                </div>
                <cdk-virtual-scroll-viewport [itemSize]="historyRowHeight" class="h-[480px]" (scrolledIndexChange)="onScrolled($event)">
                  <div class="grid grid-cols-4 divide-y divide-gray-100 text-sm" *cdkVirtualFor="let h of history; trackBy: trackByTime">
                    <div class="px-3 py-2 text-slate-600">{{ h.timestamp }}</div>
                    <div class="px-3 py-2 text-slate-700">{{ h.actor }}</div>
                    <div class="px-3 py-2"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="stateStyles[h.status]">{{ statusLabel(h.status) }}</span></div>
                    <div class="px-3 py-2 text-slate-700">{{ h.comments || '-' }}</div>
                  </div>
                </cdk-virtual-scroll-viewport>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @placeholder {
      <div class="p-6 text-sm text-slate-500">Cargando detalle…</div>
    } @loading {
      <div class="p-6 animate-pulse space-y-3">
        <div class="h-4 w-1/3 bg-slate-200 rounded"></div>
        <div class="h-4 w-2/3 bg-slate-200 rounded"></div>
        <div class="h-4 w-1/2 bg-slate-200 rounded"></div>
      </div>
    }
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
    Cambio: 'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200',
    'Publicación Microservicio': 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    'Acceso Herramientas': 'bg-amber-100 text-amber-700 ring-amber-200',
    'Cambios CI/CD': 'bg-sky-100 text-sky-700 ring-sky-200',
    'Nueva Herramienta': 'bg-violet-100 text-violet-700 ring-violet-200',
    'Base de Datos': 'bg-teal-100 text-teal-700 ring-teal-200',
    Seguridad: 'bg-rose-100 text-rose-700 ring-rose-200',
    Infraestructura: 'bg-stone-100 text-stone-700 ring-stone-200',
    'API Gateway': 'bg-lime-100 text-lime-700 ring-lime-200',
    Soporte: 'bg-slate-100 text-slate-700 ring-slate-200'
  };

  getTypeStyle(type: string): string {
    return this.typeStyles[type] || 'bg-gray-100 text-gray-700 ring-gray-200';
  }

  readonly service = inject(RequestsService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  request!: UIRequest & { description?: string };
  comment = '';
  history: Array<{ status: 'pending' | 'approved' | 'rejected'; actor: string; timestamp: string; comments?: string }> = [];
  private loaded = false;
  historyRowHeight = 48;
  private page = 0;
  private size = 50;
  private totalPages = 1;
  private loadingHistory = false;

  constructor() {}

  triggerLoad() {
    if (this.loaded) return '';
    this.loaded = true;
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.auth.isBrowser()) return '';
    this.service.getBase().subscribe(base => {
      if (!base || base.length === 0) {
        this.auth.info('No hay solicitudes disponibles');
        this.cdr.markForCheck();
        this.router.navigateByUrl('/');
        return;
      }
      const found = base.find(r => r.id === id) ?? null;
      if (!found) {
        this.auth.info('Solicitud no encontrada');
        this.cdr.markForCheck();
        this.router.navigateByUrl('/');
        return;
      }
      this.request = found as (UIRequest & { description?: string });
      this.comment = (found as any)?.comments ?? '';
      if (this.request.id) {
        this.loadMoreHistory();
      }
      this.cdr.markForCheck();
    });
    return '';
  }

  setStatus(s: 'pending' | 'approved' | 'rejected') {
    if (!this.request?.id) return;
    if (this.request.status !== 'pending') return;
    if (s === 'pending') { this.request = { ...this.request, status: s }; return; }
    this.service.updateStatus(this.request.id, s, this.comment).subscribe(() => {
      this.request = { ...this.request, status: s };
      this.auth.success(s === 'approved' ? 'Solicitud aprobada' : 'Solicitud rechazada');
      this.service.getHistory(this.request.id).subscribe(h => { this.history = h; this.cdr.markForCheck(); });
      this.cdr.markForCheck();
    });
  }
  statusLabel(s: 'pending' | 'approved' | 'rejected') { return s === 'pending' ? 'Pendiente' : s === 'approved' ? 'Aprobado' : 'Rechazado'; }
  trackByTime(index: number, h: { timestamp: string }) { return h.timestamp; }
  onScrolled(index: number) {
    const threshold = this.history.length - 10;
    if (index >= threshold) this.loadMoreHistory();
  }
  private loadMoreHistory() {
    if (this.loadingHistory) return;
    if (this.page >= this.totalPages) return;
    this.loadingHistory = true;
    this.service.getHistoryPaged(this.request.id, this.page, this.size).subscribe(res => {
      this.history = [...this.history, ...res.content];
      this.totalPages = res.totalPages;
      this.page = this.page + 1;
      this.loadingHistory = false;
      this.cdr.markForCheck();
    }, () => { this.loadingHistory = false; });
  }
}
