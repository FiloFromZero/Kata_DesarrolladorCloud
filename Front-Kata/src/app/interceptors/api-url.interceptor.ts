import { HttpInterceptorFn } from '@angular/common/http';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept requests that start with /api
  if (req.url.startsWith('/api')) {
    const apiBaseUrl = getApiBaseUrl();
    const apiReq = req.clone({
      url: `${apiBaseUrl}${req.url}`
    });
    return next(apiReq);
  }
  return next(req);
};

function getApiBaseUrl(): string {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    // SSR: Use localhost or environment variable
    return process.env['API_URL'] || 'http://localhost:8080';
  }
  
  // Client-side: Use AWS ALB URL
  return 'http://back-kata-alb-2058729206.us-east-1.elb.amazonaws.com';
}
