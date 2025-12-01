import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Only intercept requests that start with /api
  if (req.url.startsWith('/api')) {
    // Check if we're in browser (not SSR)
    if (isPlatformBrowser(platformId)) {
      // Always use AWS backend URL in production
      const apiReq = req.clone({
        url: `http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com${req.url}`,
        withCredentials: true // Important for CORS with credentials
      });
      return next(apiReq);
    }
  }
  return next(req);
};