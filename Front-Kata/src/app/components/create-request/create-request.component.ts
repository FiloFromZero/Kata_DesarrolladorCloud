import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { RequestsService } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';
import { UsersService, UserSummary } from '../../services/users.service';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Nueva Solicitud</div>
          <a [routerLink]="['/dashboard']" class="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
            </svg>
            Volver al Dashboard
          </a>
        </div>
        <form class="p-6 space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Título</label>
            <input formControlName="title" type="text" class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <textarea formControlName="description" class="w-full min-h-[120px] rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Solicitante</label>
              <input formControlName="requesterName" type="text" class="w-full rounded-lg border border-gray-200 bg-slate-100 text-slate-600 p-3 cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Aprobador</label>
              <div class="relative">
                <select 
                  formControlName="approverName" 
                  class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 pr-10 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40 appearance-none cursor-pointer transition-all" 
                  (change)="checkLoadMore($event)"
                >
                  <option value="" disabled>Selecciona un aprobador</option>
                  @if (loading) {
                    <option disabled>Cargando usuarios...</option>
                  }
                  @for (u of users; track u.username) {
                    <option [value]="u.username">{{ u.username }}</option>
                  }
                  @if (page < totalPages - 1 && !loading) {
                    <option value="__LOAD_MORE__" class="font-semibold">── Cargar más resultados ──</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-600">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Tipo de solicitud</label>
            <select formControlName="type" class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3">
              <option value="deployment">Despliegue</option>
              <option value="microservice_publish">Publicación de Microservicio</option>
              <option value="internal_tools_access">Acceso a Herramientas Internas</option>
              <option value="ci_cd_change">Cambios en CI/CD</option>
              <option value="tool_catalog_add">Nueva Herramienta en Catálogo</option>
              <option value="database">Base de Datos</option>
              <option value="security">Seguridad</option>
              <option value="infrastructure">Infraestructura</option>
              <option value="api_gateway">API Gateway</option>
              <option value="access">Acceso</option>
              <option value="change">Cambio técnico</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <button type="submit" [disabled]="submitting" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b4dbb] text-white hover:bg-[#093d99] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
              @if (submitting) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              {{ submitting ? 'Creando...' : 'Crear' }}
            </button>
            <span *ngIf="error" class="text-sm text-rose-700">{{ error }}</span>
            <span *ngIf="success" class="text-sm text-emerald-700">{{ success }}</span>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateRequestComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RequestsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);

  error = '';
  success = '';
  users: UserSummary[] = [];
  loading = false;
  submitting = false;
  page = 0;
  totalPages = 1;
  private size = 20;
  private me = this.auth.getUsername() ?? '';
  private lastValidApprover = '';

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    requesterName: [{ value: this.auth.getUsername() ?? '', disabled: true }, [Validators.required]],
    approverName: ['', [Validators.required]],
    type: ['deployment', [Validators.required]]
  }, { validators: [this.selfApproverValidator.bind(this)] });

  private selfApproverValidator(ctrl: AbstractControl): ValidationErrors | null {
    const requester = (ctrl.get('requesterName')?.value ?? '').trim().toLowerCase();
    const approver = (ctrl.get('approverName')?.value ?? '').trim().toLowerCase();
    if (requester && approver && requester === approver) return { selfApprover: true };
    return null;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.error = this.form.hasError('selfApprover') ? 'No puedes seleccionarte como aprobador' : 'Completa los campos obligatorios';
      return;
    }
    
    if (this.submitting) return;
    
    this.submitting = true;
    this.error = '';
    const dto = this.form.getRawValue();
    
    this.service.create({
      title: dto.title ?? '',
      description: dto.description ?? '',
      requesterName: dto.requesterName ?? '',
      approverName: dto.approverName ?? '',
      type: dto.type ?? 'deployment'
    }).subscribe({
      next: () => {
        this.auth.success('Solicitud creada exitosamente');
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.error = 'No se pudo crear la solicitud';
        this.submitting = false;
      }
    });
  }

  ngOnInit() {
    const currentUser = this.auth.getUsername() ?? '';
    if (currentUser) {
      this.form.patchValue({ requesterName: currentUser });
    }
    
    if (this.auth.isBrowser() && this.auth.getToken()) {
      this.searchUsers('');
    }
    
    this.auth.isAuthenticated$.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      const me = this.auth.getUsername() ?? '';
      this.form.patchValue({ requesterName: me });
      this.me = me;
      
      if (this.users?.length) {
        this.users = this.users.filter(u => u.username.trim().toLowerCase() !== me.trim().toLowerCase());
      }
    });
    
    this.form.get('approverName')?.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(val => {
      if (val && val !== '__LOAD_MORE__') {
        this.lastValidApprover = val;
      }
    });
  }

  ensureUsersLoaded() {
    if (this.users.length === 0) { this.searchUsers(''); }
  }

  checkLoadMore(e: Event) {
    const select = e.target as HTMLSelectElement;
    if (select.value === '__LOAD_MORE__') {
      this.form.patchValue({ approverName: this.lastValidApprover });
      this.loadMore();
    }
  }

  private searchUsers(q: string) {
    const me = this.auth.getUsername() ?? '';
    this.loading = true;
    this.usersService.search(q, this.page, this.size).subscribe(res => {
      this.totalPages = res.totalPages;
      this.users = (res.content ?? []).filter(u => u.username.trim().toLowerCase() !== me.trim().toLowerCase());
      this.loading = false;
    }, () => { this.loading = false; });
  }

  loadMore() {
    if (this.loading) return;
    if (this.page >= this.totalPages) return;
    this.page = this.page + 1;
    const me = this.auth.getUsername() ?? '';
    this.loading = true;
    this.usersService.search('', this.page, this.size).subscribe(res => {
      const extra = (res.content ?? []).filter(u => u.username.trim().toLowerCase() !== me.trim().toLowerCase());
      this.users = [...this.users, ...extra];
      this.totalPages = res.totalPages;
      this.loading = false;
    }, () => { this.loading = false; });
  }
}
