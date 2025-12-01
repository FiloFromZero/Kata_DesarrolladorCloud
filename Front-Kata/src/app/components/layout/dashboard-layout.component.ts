import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, ViewChild, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RequestsService, UIRequest } from '../../services/requests.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NgClass, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex">
      <aside class="w-64 bg-[#0b4dbb] text-white flex flex-col">
        <div class="h-16 flex items-center px-6 text-lg font-semibold">CoE Development</div>
        <nav class="flex-1 px-2 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-[#093d99]"
             class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#093d99] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b4dbb]">
            <svg class="h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2.5 2 8v9h5v-5h6v5h5V8l-8-5.5Z"/></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/history" routerLinkActive="bg-[#093d99]"
             class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#093d99] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b4dbb]">
            <svg class="h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 0 0-6 6v3l-2 2v2h16v-2l-2-2V8a6 6 0 0 0-6-6Zm0 18a3 3 0 0 0 3-3H7a3 3 0 0 0 3 3Z"/></svg>
            <span>Historial</span>
          </a>
          
        </nav>
      </aside>
      <div class="flex-1 flex flex-col">
        <header class="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
          <div class="text-sm font-medium text-slate-700">Gestión de Aprobaciones</div>
          <div class="flex items-center gap-4">
            <div class="relative" #notificationContainer>
              <button (click)="toggleNotifications()" class="relative p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2 focus-visible:ring-offset-white" aria-label="Notificaciones">
                <svg class="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 0 0-6 6v3L4 13v2h16v-2l-2-2V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"/></svg>
                <span *ngIf="pendingForMeCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-[#ffcc00] text-black text-xs font-semibold">
                  {{ pendingForMeCount }}
                </span>
              </button>
              
              <div *ngIf="showNotifications" class="notification-dropdown absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] flex flex-col">
                <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-slate-800">Solicitudes Pendientes</h3>
                  <button (click)="closeNotifications()" class="text-slate-400 hover:text-slate-600">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/></svg>
                  </button>
                </div>
                
                <div class="overflow-y-auto flex-1">
                  <div *ngIf="pendingRequests.length === 0" class="px-4 py-8 text-center text-sm text-slate-500">
                    No hay solicitudes pendientes
                  </div>
                  
                  <div *ngFor="let request of pendingRequests" 
                       (click)="goToRequest(request.id)"
                       class="px-4 py-3 border-b border-gray-100 hover:bg-slate-50 cursor-pointer transition-colors duration-150">
                    <div class="flex items-start gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-slate-800 truncate">{{ request.title }}</div>
                        <div class="text-xs text-slate-500 mt-1">
                          <span class="font-medium">{{ request.requester.name }}</span>
                          <span class="mx-1">•</span>
                          <span>{{ request.date }}</span>
                        </div>
                        <div class="mt-2">
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200">
                            Pendiente
                          </span>
                          <span *ngIf="request.type" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs ring-1" [ngClass]="getTypeStyle(request.type)">
                            {{ request.type }}
                          </span>
                        </div>
                      </div>
                      <svg class="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4v2h5.59L4 19.59 5.41 21 18 8.41V14h2V4h-8Z"/></svg>
                    </div>
                  </div>
                </div>
                
                <div *ngIf="pendingRequests.length > 0" class="px-4 py-3 border-t border-gray-200">
                  <a routerLink="/dashboard" (click)="closeNotifications()" class="text-sm text-[#0b4dbb] hover:text-[#093d99] font-medium">
                    Ver todas las solicitudes →
                  </a>
                </div>
              </div>
            </div>
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
  @ViewChild('notificationContainer', { static: false }) notificationContainer?: ElementRef;
  private readonly auth = inject(AuthService);
  private readonly requests = inject(RequestsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  pendingForMeCount = 0;
  pendingRequests: UIRequest[] = [];
  showNotifications = false;
  currentUser = '';
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  readonly toastClasses: Record<'success' | 'error' | 'info', string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    error: 'bg-rose-50 text-rose-700 ring-rose-200',
    info: 'bg-[#e3efff] text-[#0b4dbb] ring-[#c9dbff]'
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

  ngOnInit() {
    if (!this.auth.isBrowser()) return;
    const me = this.auth.getUsername();
    this.currentUser = me ?? '';
    if (this.auth.getToken()) {
      let prev = 0;
      this.requests.getAll().subscribe(list => {
        setTimeout(() => {
          const pending = (list ?? []).filter(r => r.status === 'pending' && r.approverName === me);
          const next = pending.length;
          if (next > prev) {
            this.toastMessage = `Tienes ${next} solicitudes pendientes de aprobación`;
            this.toastType = 'info';
            setTimeout(() => this.toastMessage = '', 2500);
          }
          prev = next;
          this.pendingForMeCount = next;
          this.pendingRequests = pending.slice(0, 10);
          this.cdr.markForCheck();
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

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      const me = this.auth.getUsername();
      if (me) {
        this.requests.getAll().subscribe(list => {
          const pending = (list ?? []).filter(r => r.status === 'pending' && r.approverName === me);
          this.pendingRequests = pending.slice(0, 10);
          this.cdr.markForCheck();
        });
      }
    }
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  goToRequest(id: string) {
    this.closeNotifications();
    this.router.navigate(['/request', id]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showNotifications) return;
    
    const target = event.target as HTMLElement;
    const container = this.notificationContainer?.nativeElement;
    
    if (container && !container.contains(target)) {
      this.closeNotifications();
      this.cdr.markForCheck();
    }
  }

  logout() { this.auth.logout(); }
  
}
