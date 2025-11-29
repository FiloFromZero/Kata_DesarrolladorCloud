import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ApprovalDetailComponent } from './components/approval-detail/approval-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
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
  }
];
