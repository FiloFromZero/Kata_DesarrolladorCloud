import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApprovalDetailComponent } from './components/approval-detail/approval-detail.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      { path: 'my-requests', component: DashboardComponent },
      { path: 'history', component: DashboardComponent },
      { path: 'request/:id', component: ApprovalDetailComponent }
    ]
  },
  { path: 'login', component: LoginComponent }
];
