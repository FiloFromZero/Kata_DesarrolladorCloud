import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
                   [disabled]="loading"
                   class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="tu@correo.com" />
            <div *ngIf="submitted && form.controls.email.invalid" class="mt-1 text-xs text-rose-600">Correo inválido</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
            <input formControlName="password" type="password" autocomplete="new-password"
                   [disabled]="loading"
                   class="w-full rounded-lg border border-gray-200 bg-slate-50 text-slate-800 p-3 disabled:opacity-50 disabled:cursor-not-allowed" placeholder="••••••" />
            <div *ngIf="submitted && form.controls.password.invalid" class="mt-1 text-xs text-rose-600">La contraseña es obligatoria</div>
          </div>
          <button type="submit" [disabled]="loading || form.invalid" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0b4dbb] text-white hover:bg-[#093d99] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            @if (loading) {
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creando cuenta...</span>
            } @else {
              <span>Crear cuenta</span>
            }
          </button>
          <div *ngIf="error" class="text-sm text-rose-700 bg-rose-50 ring-1 ring-rose-200 rounded-md p-3">{{ error }}</div>
          <div *ngIf="success" class="text-sm text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-md p-3">{{ success }}</div>
          @if (loading) {
            <div class="text-xs text-slate-500 text-center bg-blue-50 ring-1 ring-blue-200 rounded-md p-2">
              <svg class="inline h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
              </svg>
              Procesando de forma segura... Esto puede tomar unos segundos.
            </div>
          }
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
  private readonly cdr = inject(ChangeDetectorRef);

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
    this.error = '';
    this.success = '';
    this.cdr.markForCheck(); 
    
    const { email, password } = this.form.getRawValue();
    this.auth.register(email ?? '', password ?? '').subscribe({
      next: (ok) => {
        if (!ok) {
          this.error = 'No se pudo registrar';
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }
        this.error = '';
        this.success = 'Cuenta creada exitosamente';
        this.auth.success('Cuenta creada exitosamente');
        this.cdr.markForCheck();
        setTimeout(() => {
          this.loading = false;
          this.router.navigateByUrl('/dashboard');
        }, 600);
      },
      error: () => {
        this.error = 'No se pudo registrar. Intenta nuevamente.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
