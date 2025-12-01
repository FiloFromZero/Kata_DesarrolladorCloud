import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterLink } from '@angular/router';
import { RequestsService, UIRequest } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 transition-shadow duration-200 hover:shadow-md">
          <div class="h-10 w-10 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"/></svg>
          </div>
          <div>
            <div class="text-sm text-slate-500">Pendientes de mi aprobación</div>
            <div class="text-2xl font-semibold text-slate-800">{{ pendingCount }}</div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 transition-shadow duration-200 hover:shadow-md">
          <div class="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z"/></svg>
          </div>
          <div>
            <div class="text-sm text-slate-500">Total procesadas</div>
            <div class="text-2xl font-semibold text-slate-800">{{ processedCount }}</div>
          </div>
        </div>
        
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Solicitudes</div>
          <div class="flex items-center gap-3">
            <a [routerLink]="['/request/new']" class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-slate-700 ring-1 ring-gray-300 hover:bg-slate-50">Nueva Solicitud
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"/></svg>
            </a>
            <div class="text-xs text-slate-500">Actualizado ahora</div>
          </div>
        </div>
        @defer (on viewport) {
          {{ triggerMain() }}
          <div class="overflow-x-auto">
            <div class="min-w-full">
              <div class="grid grid-cols-[160px_1fr_1fr_1fr_120px_120px_120px_140px] bg-slate-50 text-slate-600 text-xs">
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">ID</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Título</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Solicitante</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Aprobador</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Tipo</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap hidden sm:block">Fecha</div>
                <div class="px-6 py-3 text-left font-medium whitespace-nowrap">Estado</div>
                <div class="px-6 py-3 text-right font-medium whitespace-nowrap">Acciones</div>
              </div>
              <cdk-virtual-scroll-viewport [itemSize]="rowHeight" class="h-[600px]" (scrolledIndexChange)="onMainScrolled($event)">
                <div class="grid grid-cols-[160px_1fr_1fr_1fr_120px_120px_120px_140px] divide-y divide-gray-100 text-sm" *cdkVirtualFor="let item of requests; trackBy: trackById">
                  <div class="px-6 py-3 font-mono text-xs text-slate-700 min-w-0"><span class="break-all whitespace-normal leading-5">{{ item.id }}</span></div>
                  <div class="px-6 py-3 text-slate-800 min-w-0"><span class="break-words whitespace-normal leading-5" [title]="item.title">{{ item.title }}</span></div>
                  <div class="px-6 py-3 min-w-0"><span class="text-slate-700 break-all whitespace-normal leading-5" [title]="item.requester.name">{{ item.requester.name }}</span></div>
                  <div class="px-6 py-3 min-w-0"><span class="text-slate-700 break-all whitespace-normal leading-5" [title]="item.approverName">{{ item.approverName }}</span></div>
                  <div class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="typeStyles[item.type]">{{ item.type }}</span></div>
                  <div class="px-6 py-3 text-slate-600 hidden sm:block min-w-0 whitespace-nowrap"><span class="truncate" [title]="item.date">{{ item.date }}</span></div>
                  <div class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="stateStyles[item.status]">{{ statusLabel(item.status) }}</span></div>
                  <div class="px-6 py-3 text-right">
                    <a [routerLink]="['/request', item.id]" class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-[#0b4dbb] text-white hover:bg-[#093d99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2 focus-visible:ring-offset-white">Ver Detalle
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4v2h5.59L4 19.59 5.41 21 18 8.41V14h2V4h-8Z"/></svg>
                    </a>
                  </div>
                </div>
              </cdk-virtual-scroll-viewport>
            </div>
          </div>
        } @placeholder {
          <div class="p-6 text-sm text-slate-500">Cargando solicitudes…</div>
        } @loading {
          <div class="p-6 animate-pulse space-y-3">
            <div class="h-4 w-1/3 bg-slate-200 rounded"></div>
            <div class="h-4 w-2/3 bg-slate-200 rounded"></div>
            <div class="h-4 w-1/2 bg-slate-200 rounded"></div>
          </div>
        }
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div class="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Mis solicitudes creadas</div>
          <div class="text-xs text-slate-500">Solo las que yo creé</div>
        </div>
        @defer (on idle) {
          {{ triggerCreated() }}
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
              <cdk-virtual-scroll-viewport [itemSize]="rowHeight" class="h-[600px]" (scrolledIndexChange)="onCreatedScrolled($event)">
                <div class="grid grid-cols-[160px_1fr_1fr_120px_120px_120px_1fr] divide-y divide-gray-100 text-sm" *cdkVirtualFor="let item of requestsCreated; trackBy: trackById">
                  <div class="px-6 py-3 font-mono text-xs text-slate-700 min-w-0"><span class="break-all whitespace-normal leading-5">{{ item.id }}</span></div>
                  <div class="px-6 py-3 text-slate-800 min-w-0"><span class="break-words whitespace-normal leading-5" [title]="item.title">{{ item.title }}</span></div>
                  <div class="px-6 py-3 min-w-0"><span class="text-slate-700 break-all whitespace-normal leading-5" [title]="item.approverName">{{ item.approverName }}</span></div>
                  <div class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="typeStyles[item.type]">{{ item.type }}</span></div>
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
export class DashboardComponent {
  readonly service = inject(RequestsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  requests: UIRequest[] = [];
  requestsCreated: UIRequest[] = [];
  pendingCount = 0;
  processedCount = 0;
  rowHeight = 72;
  private mainLoaded = false;
  private createdLoaded = false;
  private pageMain = 0;
  private totalPagesMain = 1;
  private loadingMain = false;
  private pageCreated = 0;
  private totalPagesCreated = 1;
  private loadingCreated = false;

  constructor() {}

  trackById(index: number, item: UIRequest) { return item.id; }

  triggerMain() {
    if (this.mainLoaded) return '';
    this.mainLoaded = true;
    if (!this.auth.isBrowser()) return '';
    this.service.getKpis().subscribe(k => {
      this.pendingCount = k.pending ?? 0;
      this.processedCount = k.processed ?? 0;
      this.cdr.markForCheck();
    });
    const me = this.auth.getUsername();
    this.service.getBase().subscribe(base => {
      const list = base ?? [];
      this.requests = me ? list.filter(i => i.approverName === me) : [];
      if (!this.pendingCount && !this.processedCount) {
        this.pendingCount = list.filter(r => r.status === 'pending' && r.approverName === me).length;
        this.processedCount = list.filter(r => r.status !== 'pending' && r.approverName === me).length;
      }
      this.cdr.markForCheck();
    });
    this.loadMoreMain(true);
    return '';
  }

  triggerCreated() {
    if (this.createdLoaded) return '';
    this.createdLoaded = true;
    if (!this.auth.isBrowser()) return '';
    const me = this.auth.getUsername();
    this.service.getBase().subscribe(base => {
      const list = base ?? [];
      this.requestsCreated = me ? list.filter(i => i.requester.name === me) : [];
      this.cdr.markForCheck();
    });
    this.loadMoreCreated(true);
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
    'API Gateway': 'bg-lime-100 text-lime-700 ring-lime-200'
  };

  
  

  statusLabel(s: 'pending' | 'approved' | 'rejected') { return s === 'pending' ? 'Pendiente' : s === 'approved' ? 'Aprobado' : 'Rechazado'; }
  onMainScrolled(index: number) {
    const threshold = this.requests.length - 10;
    if (index >= threshold) this.loadMoreMain();
  }
  onCreatedScrolled(index: number) {
    const threshold = this.requestsCreated.length - 10;
    if (index >= threshold) this.loadMoreCreated();
  }
  private loadMoreMain(initial = false) {
    if (this.loadingMain) return;
    if (!initial && this.pageMain >= this.totalPagesMain) return;
    this.loadingMain = true;
    this.service.getAssignedToMePaged(initial ? 0 : this.pageMain, 50).subscribe(res => {
      this.requests = initial ? res.content : [...this.requests, ...res.content];
      this.pageMain = (initial ? 0 : this.pageMain) + 1;
      this.totalPagesMain = res.totalPages;
      this.loadingMain = false;
      this.cdr.markForCheck();
    }, () => { this.loadingMain = false; });
  }
  private loadMoreCreated(initial = false) {
    if (this.loadingCreated) return;
    if (!initial && this.pageCreated >= this.totalPagesCreated) return;
    this.loadingCreated = true;
    this.service.getCreatedByMePaged(initial ? 0 : this.pageCreated, 50).subscribe(res => {
      this.requestsCreated = initial ? res.content : [...this.requestsCreated, ...res.content];
      this.pageCreated = (initial ? 0 : this.pageCreated) + 1;
      this.totalPagesCreated = res.totalPages;
      this.loadingCreated = false;
      this.cdr.markForCheck();
    }, () => { this.loadingCreated = false; });
  }
  
}
