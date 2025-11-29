import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
          <a routerLink="/my-requests" routerLinkActive="bg-[#093d99]"
             class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#093d99] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b4dbb]">
            <svg class="h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-6 1.34-6 3v2h12v-2c0-1.66-2.67-3-6-3Z"/></svg>
            <span>Mis Solicitudes</span>
          </a>
          <a routerLink="/history" routerLinkActive="bg-[#093d99]"
             class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#093d99] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b4dbb]">
            <svg class="h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8v5l4 2 .75-1.86-2.75-1.38V8Zm0-6a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/></svg>
            <span>Historial</span>
          </a>
        </nav>
      </aside>
      <div class="flex-1 flex flex-col">
        <header class="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
          <div class="text-sm font-medium text-slate-700">Gestión de Aprobaciones</div>
          <div class="flex items-center gap-4">
            <button class="relative p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2 focus-visible:ring-offset-white" aria-label="Notificaciones">
              <svg class="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 0 0-6 6v3L4 13v2h16v-2l-2-2V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"/></svg>
              <span class="absolute -top-0.5 -right-0.5 inline-flex h-2 w-2 rounded-full bg-[#ffcc00]"></span>
            </button>
            <div class="flex items-center gap-3">
              <img src="https://i.pravatar.cc/40?img=12" alt="avatar" class="h-9 w-9 rounded-full ring-1 ring-white">
              <div class="hidden md:block">
                <div class="text-sm font-medium text-slate-800">Alex Doe</div>
                <div class="text-xs text-slate-500">Product Owner</div>
              </div>
            </div>
            <button (click)="logout()" class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-slate-700 ring-1 ring-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2">
              Cerrar sesión
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17 15 12 10 7V10H3v4h7v3Z M19 3h-6v2h6v14h-6v2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/></svg>
            </button>
          </div>
        </header>
        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  constructor(private readonly auth: AuthService) {}
  logout() { this.auth.logout(); }
}

