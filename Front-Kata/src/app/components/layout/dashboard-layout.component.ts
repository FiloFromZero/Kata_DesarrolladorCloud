import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RequestsService, UIRequest } from '../../services/requests.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NgClass],
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <aside class="w-64 bg-[#0b4dbb] text-white flex flex-col">
        <div class="h-16 flex items-center px-6 text-lg font-semibold">CoE Development</div>
        <nav class="flex-1 px-2 space-y-1">
          <a routerLink="/" routerLinkActive="bg-[#093d99]"
             class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#093d99] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b4dbb]">
            <svg class="h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2.5 2 8v9h5v-5h6v5h5V8l-8-5.5Z"/></svg>
            <span>Dashboard</span>
          </a>
          
        </nav>
      </aside>
      <div class="flex-1 flex flex-col">
        <header class="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
          <div class="text-sm font-medium text-slate-700">Gestión de Aprobaciones</div>
          <div class="flex items-center gap-4">
            <button class="relative p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2 focus-visible:ring-offset-white" aria-label="Notificaciones">
              <svg class="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 0 0-6 6v3L4 13v2h16v-2l-2-2V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"/></svg>
              <span *ngIf="pendingForMeCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[#ffcc00] text-black text-xs">
                {{ pendingForMeCount }}
              </span>
            </button>
            <div class="hidden md:block">
              <div class="text-sm font-medium text-slate-800">{{ currentUser }}</div>
              <div class="text-xs text-slate-500">Usuario</div>
            </div>
            <button (click)="logout()" class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg_white text-slate-700 ring-1 ring-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2">
              Cerrar sesión
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17 15 12 10 7V10H3v4h7v3Z M19 3h-6v2h6v14h-6v2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/></svg>
            </button>
          </div>
        </header>
        <div *ngIf="toastMessage" class="mx-6 mt-3 mb-0 p-3 rounded-md text-sm ring-1"
             [ngClass]="toastClasses[toastType]">
          {{ toastMessage }}
        </div>
        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly requests = inject(RequestsService);
  pendingForMeCount = 0;
  currentUser = '';
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  readonly toastClasses: Record<'success' | 'error' | 'info', string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    error: 'bg-rose-50 text-rose-700 ring-rose-200',
    info: 'bg-[#e3efff] text-[#0b4dbb] ring-[#c9dbff]'
  };

  ngOnInit() {
    if (!this.auth.isBrowser()) return;
    const me = this.auth.getUsername();
    this.currentUser = me ?? '';
    if (this.auth.getToken()) {
      let prev = 0;
      this.requests.getAll().subscribe(list => {
        setTimeout(() => {
          const next = (list ?? []).filter(r => r.status === 'pending' && r.approverName === me).length;
          if (next > prev) {
            this.toastMessage = `Tienes ${next} solicitudes pendientes de aprobación`;
            this.toastType = 'info';
            setTimeout(() => this.toastMessage = '', 2500);
          }
          prev = next;
          this.pendingForMeCount = next;
        }, 0);
      });
    }

    this.auth.toast$.subscribe(t => {
      if (!t) return;
      setTimeout(() => {
        this.toastMessage = t.message;
        this.toastType = t.type;
        setTimeout(() => this.toastMessage = '', 2500);
      }, 0);
    });
  }

  logout() { this.auth.logout(); }
  
}
