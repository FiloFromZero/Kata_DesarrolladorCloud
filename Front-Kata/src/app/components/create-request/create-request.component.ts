import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { RequestsService } from '../../services/requests.service';
import { AuthService } from '../../services/auth.service';
import { UsersService, UserSummary } from '../../services/users.service';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div class="text-sm font-medium text-slate-700">Nueva Solicitud</div>
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
              <input formControlName="requesterName" type="text" class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3" [disabled]="true" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Aprobador</label>
              <select formControlName="approverName" class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3">
                <option value="" disabled>Selecciona un aprobador</option>
                @for (u of users; track u.username) {
                  <option [value]="u.username">{{ u.username }}</option>
                }
              </select>
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
            <button type="submit" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0b4dbb] text-white hover:bg-[#093d99]">Crear</button>
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

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    requesterName: [this.auth.getUsername() ?? '', [Validators.required]],
    approverName: ['', [Validators.required]],
    type: ['deployment', [Validators.required]]
  });

  onSubmit() {
    if (this.form.invalid) { this.error = 'Completa los campos obligatorios'; return; }
    const dto = this.form.getRawValue();
    this.service.create({
      title: dto.title ?? '',
      description: dto.description ?? '',
      requesterName: dto.requesterName ?? '',
      approverName: dto.approverName ?? '',
      type: dto.type ?? 'deployment'
    }).subscribe({
      next: () => {
        this.error = '';
        this.success = 'Solicitud creada exitosamente';
        this.auth.success('Solicitud creada exitosamente');
        setTimeout(() => this.router.navigateByUrl('/dashboard'), 800);
      },
      error: () => { this.error = 'No se pudo crear la solicitud'; }
    });
  }

  ngOnInit() {
    if (this.auth.isBrowser() && this.auth.getToken()) {
      this.usersService.getAll().subscribe(list => { this.users = list; });
    }
    this.auth.isAuthenticated$.subscribe(() => {
      const me = this.auth.getUsername() ?? '';
      this.form.patchValue({ requesterName: me });
    });
  }
}
