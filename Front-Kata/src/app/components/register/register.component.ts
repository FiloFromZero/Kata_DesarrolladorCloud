import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div class="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 pt-6">
          <div class="text-lg font-semibold text-slate-800">Registro</div>
          <div class="text-xs text-slate-500">Usa tu correo electrónico</div>
        </div>
        <form class="p-6 space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
            <input formControlName="email" type="email" autocomplete="email"
                   class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3" placeholder="tu@correo.com" />
            <div *ngIf="submitted && form.controls.email.invalid" class="mt-1 text-xs text-rose-600">Correo inválido</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
            <input formControlName="password" type="password" autocomplete="new-password"
                   class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3" placeholder="••••••" />
            <div *ngIf="submitted && form.controls.password.invalid" class="mt-1 text-xs text-rose-600">La contraseña es obligatoria</div>
          </div>
          <button type="submit" [disabled]="loading || form.invalid" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0b4dbb] text-white hover:bg-[#093d99] disabled:opacity-50 disabled:cursor-not-allowed">Crear cuenta</button>
          <div *ngIf="error" class="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md p-3">{{ error }}</div>
          <div *ngIf="success" class="text-sm text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-md p-3">{{ success }}</div>
          <a routerLink="/login" class="block text-center text-sm text-slate-600 hover:text-slate-800 mt-3">Volver al login</a>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  submitted = false;
  error = '';
  success = '';
  loading = false;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password } = this.form.getRawValue();
    this.auth.register(email ?? '', password ?? '').subscribe(ok => {
      if (!ok) { this.error = 'No se pudo registrar'; this.loading = false; return; }
      this.error = '';
      this.success = 'Cuenta creada exitosamente';
      this.auth.success('Cuenta creada exitosamente');
      setTimeout(() => { this.loading = false; this.router.navigateByUrl('/dashboard'); }, 600);
    });
  }
}
