import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { ReportsComponent } from './reports/reports.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { AuthenticatedLayoutComponent } from './layout/authenticated-layout/authenticated-layout.component';
import { authGuard } from './guards/auth.guard';

// Public routes that don't require authentication
const publicRoutes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    // No auth guard here
  },
  // Redirect root to login
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' as const 
  }
];

// Protected routes that require authentication
const protectedRoutes: Routes = [
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard], // Only protect the authenticated routes
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const }
    ]
  }
];

// Combine all routes
export const routes: Routes = [
  ...publicRoutes,
  ...protectedRoutes,
  // Redirect any unknown paths to login
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];
