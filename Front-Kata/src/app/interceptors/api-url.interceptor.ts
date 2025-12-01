import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  if (req.url.startsWith('/api')) {
    if (isPlatformBrowser(platformId)) {
      const apiReq = req.clone({
        url: `http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com${req.url}`,
        withCredentials: true
      });
      return next(apiReq);
    }
  }
  return next(req);
};