import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterLink],
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
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 transition-shadow duration-200 hover:shadow-md">
          <div class="h-10 w-10 rounded-lg bg-[#e3efff] text-[#0b4dbb] flex items-center justify-center">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8v5h5v-2h-3V8h-2ZM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/></svg>
          </div>
          <div>
            <div class="text-sm text-slate-500">Tiempo promedio</div>
            <div class="text-2xl font-semibold text-slate-800">{{ avgTime }}</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Solicitudes</div>
          <div class="text-xs text-slate-500">Actualizado ahora</div>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50 text-slate-600 text-xs">
              <tr>
                <th class="px-6 py-3 text-left font-medium">ID</th>
                <th class="px-6 py-3 text-left font-medium">Título</th>
                <th class="px-6 py-3 text-left font-medium">Solicitante</th>
                <th class="px-6 py-3 text-left font-medium">Tipo</th>
                <th class="px-6 py-3 text-left font-medium">Fecha</th>
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
                    <div class="flex items-center gap-3">
                      <img [src]="item.requester.avatar" alt="" class="h-8 w-8 rounded-full ring-1 ring-white">
                      <span class="text-slate-700">{{ item.requester.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-3">
                    <span class="px-2 py-1 text-xs rounded-md ring-1" [ngClass]="typeStyles[item.type]">{{ item.type }}</span>
                  </td>
                  <td class="px-6 py-3 text-slate-600">{{ item.date }}</td>
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
  </div>
  `
})
export class DashboardComponent {
  readonly requests: Array<{
    id: string;
    title: string;
    requester: { name: string; avatar: string };
    type: 'Despliegue' | 'Acceso' | 'Cambio';
    date: string;
    status: 'pending' | 'approved' | 'rejected';
  }> = [
    { id: '7F3A9', title: 'Despliegue v1.2.3', requester: { name: 'María López', avatar: 'https://i.pravatar.cc/48?img=5' }, type: 'Despliegue', date: '2025-11-20', status: 'pending' },
    { id: '9B2C1', title: 'Acceso a S3 bucket', requester: { name: 'Carlos Ruiz', avatar: 'https://i.pravatar.cc/48?img=12' }, type: 'Acceso', date: '2025-11-19', status: 'approved' },
    { id: '2D8E7', title: 'Cambio variable entorno', requester: { name: 'Ana Pérez', avatar: 'https://i.pravatar.cc/48?img=22' }, type: 'Cambio', date: '2025-11-18', status: 'rejected' },
    { id: '6C1B4', title: 'Despliegue hotfix', requester: { name: 'Luis García', avatar: 'https://i.pravatar.cc/48?img=28' }, type: 'Despliegue', date: '2025-11-18', status: 'pending' },
    { id: '5A7D3', title: 'Acceso VPN corporativa', requester: { name: 'Jorge Díaz', avatar: 'https://i.pravatar.cc/48?img=36' }, type: 'Acceso', date: '2025-11-17', status: 'approved' },
    { id: '3E9H0', title: 'Cambio límite CPU', requester: { name: 'Sofía Gómez', avatar: 'https://i.pravatar.cc/48?img=44' }, type: 'Cambio', date: '2025-11-16', status: 'pending' }
  ];

  readonly stateStyles: Record<'pending' | 'approved' | 'rejected', string> = {
    pending: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 ring-rose-200'
  };

  readonly typeStyles: Record<'Despliegue' | 'Acceso' | 'Cambio', string> = {
    Despliegue: 'bg-[#e3efff] text-[#0b4dbb] ring-[#c9dbff]',
    Acceso: 'bg-cyan-100 text-cyan-700 ring-cyan-200',
    Cambio: 'bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200'
  };

  get pendingCount() { return this.requests.filter(r => r.status === 'pending').length; }
  get processedCount() { return this.requests.filter(r => r.status !== 'pending').length; }
  readonly avgTime = '2.3 días';

  statusLabel(s: 'pending' | 'approved' | 'rejected') { return s === 'pending' ? 'Pendiente' : s === 'approved' ? 'Aprobado' : 'Rechazado'; }
}
