import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestsService, UIRequest } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink],
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
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50 text-slate-600 text-xs">
              <tr>
                <th class="px-6 py-3 text-left font-medium">ID</th>
                <th class="px-6 py-3 text-left font-medium">Título</th>
                <th class="px-6 py-3 text-left font-medium">Solicitante</th>
                <th class="px-6 py-3 text-left font-medium">Aprobador</th>
                <th class="px-6 py-3 text-left font-medium">Tipo</th>
                <th class="px-6 py-3 text-left font-medium hidden sm:table-cell">Fecha</th>
                <th class="px-6 py-3 text-left font-medium">Estado</th>
                <th class="px-6 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (item of requests; track item.id) {
                <tr class="hover:bg-slate-50 transition-colors duration-150">
                  <td class="px-6 py-3 font-mono text-xs text-slate-700">{{ item.id }}</td>
                  <td class="px-6 py-3 text-slate-800">{{ item.title }}</td>
                  <td class="px-6 py-3">
                    <span class="text-slate-700">{{ item.requester.name }}</span>
                  </td>
                  <td class="px-6 py-3">
                    <span class="text-slate-700 break-all">{{ item.approverName }}</span>
                  </td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="typeStyles[item.type]">{{ item.type }}</span>
                  </td>
                  <td class="px-6 py-3 text-slate-600 hidden sm:table-cell">{{ item.date }}</td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="stateStyles[item.status]">{{ statusLabel(item.status) }}</span>
                  </td>
                  <td class="px-6 py-3 text-right">
                    <a [routerLink]="['/request', item.id]" class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-[#0b4dbb] text-white hover:bg-[#093d99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2 focus-visible:ring-offset-white">Ver Detalle
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4v2h5.59L4 19.59 5.41 21 18 8.41V14h2V4h-8Z"/></svg>
                    </a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div class="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Mis solicitudes creadas</div>
          <div class="text-xs text-slate-500">Solo las que yo creé</div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50 text-slate-600 text-xs">
              <tr>
                <th class="px-6 py-3 text-left font-medium">ID</th>
                <th class="px-6 py-3 text-left font-medium">Título</th>
                <th class="px-6 py-3 text-left font-medium">Aprobador</th>
                <th class="px-6 py-3 text-left font-medium">Tipo</th>
                <th class="px-6 py-3 text-left font-medium hidden sm:table-cell">Fecha</th>
                <th class="px-6 py-3 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              @for (item of requestsCreated; track item.id) {
                <tr class="hover:bg-slate-50 transition-colors duration-150">
                  <td class="px-6 py-3 font-mono text-xs text-slate-700">{{ item.id }}</td>
                  <td class="px-6 py-3 text-slate-800">{{ item.title }}</td>
                  <td class="px-6 py-3"><span class="text-slate-700 break-all">{{ item.approverName }}</span></td>
                  <td class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="typeStyles[item.type]">{{ item.type }}</span></td>
                  <td class="px-6 py-3 text-slate-600 hidden sm:table-cell">{{ item.date }}</td>
                  <td class="px-6 py-3"><span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="stateStyles[item.status]">{{ statusLabel(item.status) }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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

  constructor() {
    if (this.auth.isBrowser() && this.auth.getToken()) {
      this.service.getAll().subscribe(data => {
        this.requests = data ?? [];
        const list = this.requests;
        this.pendingCount = list.filter(r => r.status === 'pending').length;
        this.processedCount = list.filter(r => r.status !== 'pending').length;
        this.cdr.markForCheck();
      });
      this.service.getCreatedByMe().subscribe(data => { this.requestsCreated = data ?? []; this.cdr.markForCheck(); });
    } else {
      this.requests = [];
      this.requestsCreated = [];
    }
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
  
}
