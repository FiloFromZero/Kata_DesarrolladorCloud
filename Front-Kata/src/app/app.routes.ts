import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { path: 'my-requests', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'history', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'request/new', loadComponent: () => import('./components/create-request/create-request.component').then(m => m.CreateRequestComponent) },
      { path: 'request/:id', loadComponent: () => import('./components/approval-detail/approval-detail.component').then(m => m.ApprovalDetailComponent) }
    ]
  },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) }
  ,{ path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) }
];
