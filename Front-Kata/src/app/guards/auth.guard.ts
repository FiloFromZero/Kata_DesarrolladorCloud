import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!isPlatformBrowser(platformId)) return true;
  const token = auth.getToken();
  if (token) return true;
  router.navigateByUrl('/login');
  return false;
};
