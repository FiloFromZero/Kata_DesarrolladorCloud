import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RequestsService, UIRequest } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgClass, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Mis solicitudes creadas</div>
        </div>
        @defer (on idle) {
          {{ triggerLoad() }}
          <div class="overflow-x-auto">
            <div class="min-w-full">
              <div class="grid grid-cols-[160px_1fr_1fr_120px_120px_120px_1fr] bg-slate-50 text-slate-600 text-xs">
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">ID</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Título</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Aprobador</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Tipo</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap hidden sm:block">Fecha</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Estado</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Comentarios</div>
              </div>
              <cdk-virtual-scroll-viewport [itemSize]="rowHeight" class="h-[600px]" (scrolledIndexChange)="onScrolled($event)">
                <div class="grid grid-cols-[160px_1fr_1fr_120px_120px_120px_1fr] divide-y divide-gray-100 text-sm" *cdkVirtualFor="let item of requestsCreated; trackBy: trackById">
                  <div class="px-6 py-3 font-mono text-xs text-slate-700 min-w-0"><span class="break-all whitespace-normal leading-5">{{ item.id }}</span></div>
                  <div class="px-6 py-3 text-slate-800 min-w-0"><span class="break-words whitespace-normal leading-5" [title]="item.title">{{ item.title }}</span></div>
                  <div class="px-6 py-3 min-w-0"><span class="text-slate-700 break-all whitespace-normal leading-5" [title]="item.approverName">{{ item.approverName }}</span></div>
                  <div class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="getTypeStyle(item.type)">{{ item.type }}</span></div>
                  <div class="px-6 py-3 text-slate-600 hidden sm:block min-w-0 whitespace-nowrap"><span class="truncate" [title]="item.date">{{ item.date }}</span></div>
                  <div class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="stateStyles[item.status]">{{ statusLabel(item.status) }}</span></div>
                  <div class="px-6 py-3 min-w-0">
                    @if (item.comments) {
                      <span class="text-slate-600 italic text-xs line-clamp-2" [title]="item.comments">{{ item.comments }}</span>
                    } @else {
                      <span class="text-slate-400 text-xs">Sin comentarios</span>
                    }
                  </div>
                </div>
              </cdk-virtual-scroll-viewport>
            </div>
          </div>
        } @placeholder {
          <div class="p-6 text-sm text-slate-500">Cargando mis solicitudes…</div>
        } @loading {
          <div class="p-6 animate-pulse space-y-3">
            <div class="h-4 w-1/3 bg-slate-200 rounded"></div>
            <div class="h-4 w-2/3 bg-slate-200 rounded"></div>
            <div class="h-4 w-1/2 bg-slate-200 rounded"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class HistoryComponent {
  readonly service = inject(RequestsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  requestsCreated: UIRequest[] = [];
  rowHeight = 72;
  private loaded = false;
  private page = 0;
  private totalPages = 1;
  private loading = false;

  trackById(index: number, item: UIRequest) { return item.id; }

  triggerLoad() {
    if (this.loaded) return '';
    this.loaded = true;
    if (!this.auth.isBrowser()) return '';
    const me = this.auth.getUsername();
    this.service.getBase().subscribe(base => {
      const list = base ?? [];
      this.requestsCreated = me ? list.filter(i => i.requester.name === me) : [];
      this.cdr.markForCheck();
    });
    this.loadMore(true);
    return '';
  }

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

  statusLabel(s: 'pending' | 'approved' | 'rejected') { 
    return s === 'pending' ? 'Pendiente' : s === 'approved' ? 'Aprobado' : 'Rechazado'; 
  }

  onScrolled(index: number) {
    const threshold = this.requestsCreated.length - 10;
    if (index >= threshold) this.loadMore();
  }

  private loadMore(initial = false) {
    if (this.loading) return;
    if (!initial && this.page >= this.totalPages) return;
    this.loading = true;
    this.service.getCreatedByMePaged(initial ? 0 : this.page, 50).subscribe(res => {
      this.requestsCreated = initial ? res.content : [...this.requestsCreated, ...res.content];
      this.page = (initial ? 0 : this.page) + 1;
      this.totalPages = res.totalPages;
      this.loading = false;
      this.cdr.markForCheck();
    }, () => { this.loading = false; });
  }
}
