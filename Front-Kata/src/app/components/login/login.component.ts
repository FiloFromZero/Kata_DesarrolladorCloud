import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div class="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 pt-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-[#e3efff] text-[#0b4dbb] flex items-center justify-center">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6Z"/></svg>
            </div>
            <div>
              <div class="text-lg font-semibold text-slate-800">CoE Development</div>
              <div class="text-xs text-slate-500">Gestión de Aprobaciones</div>
            </div>
          </div>
        </div>
        <form class="p-6 space-y-4" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
            <input formControlName="username" type="text" autocomplete="username"
                   class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40"
                   placeholder="Tu usuario" />
            <div *ngIf="submitted && form.controls.username.invalid" class="mt-1 text-xs text-rose-600">El usuario es obligatorio</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
            <input formControlName="password" type="password" autocomplete="current-password"
                   class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 outline-none focus:ring-2 focus:ring-[#0b4dbb] focus:border-[#0b4dbb]/40"
                   placeholder="Tu contraseña" />
            <div *ngIf="submitted && form.controls.password.invalid" class="mt-1 text-xs text-rose-600">La contraseña es obligatoria</div>
          </div>
          <button type="submit" [disabled]="loading || form.invalid"
                  class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0b4dbb] text-white hover:bg-[#093d99] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4dbb] focus-visible:ring-offset-2">
            Iniciar sesión
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17 15 12 10 7V10H3v4h7v3Z M19 3h-6v2h6v14h-6v2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/></svg>
          </button>
          <a routerLink="/register" class="block text-center text-sm text-slate-600 hover:text-slate-800 mt-3">Crear cuenta</a>
          <div *ngIf="error" class="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md p-3">{{ error }}</div>
          <div *ngIf="success" class="text-sm text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-md p-3">{{ success }}</div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });
  submitted = false;
  error = '';
  success = '';
  loading = false;

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;
    const { username, password } = this.form.getRawValue();
    this.auth.login(username ?? '', password ?? '').subscribe(ok => {
      if (!ok) {
        this.error = 'Credenciales inválidas';
        this.loading = false;
        this.auth.error('Credenciales inválidas');
        this.cdr.markForCheck();
        return;
      }
      this.error = '';
      this.success = 'Inicio de sesión exitoso';
      this.auth.success('Inicio de sesión exitoso');
      setTimeout(() => { this.loading = false; this.router.navigateByUrl('/dashboard'); }, 400);
      this.cdr.markForCheck();
    });
  }
}
