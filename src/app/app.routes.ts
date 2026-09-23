import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // User Public Routes
  {
    path: '',
    loadComponent: () => import('./features/user/home/home.component').then(m => m.HomeComponent),
    title: 'Roamly — Modern Travel Planner & Budget Estimator'
  },
  {
    path: 'destinations',
    loadComponent: () => import('./features/user/destinations/destinations.component').then(m => m.DestinationsComponent),
    title: 'Handpicked Destinations — Roamly'
  },
  {
    path: 'planner',
    loadComponent: () => import('./features/user/planner/planner.component').then(m => m.PlannerComponent),
    title: 'Trip Planner & Budget Estimator — Roamly'
  },
  {
    path: 'ai-advisor',
    loadComponent: () => import('./features/user/ai-advisor/ai-advisor.component').then(m => m.AiAdvisorComponent),
    title: 'AI Travel Advisor (RAG Grounded) — Roamly'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/user/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact & Support — Roamly'
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'My Profile & Saved Plans — Roamly'
  },

  // Auth Routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In — Roamly'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Register — Roamly'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Access Restricted (403) — Roamly'
  },

  // Protected Admin Portal
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Admin Dashboard — Roamly'
      },
      {
        path: 'destinations',
        loadComponent: () => import('./features/admin/destinations-admin/destinations-admin.component').then(m => m.DestinationsAdminComponent),
        title: 'Manage Destinations — Roamly Admin'
      },
      {
        path: 'trips',
        loadComponent: () => import('./features/admin/trips-admin/trips-admin.component').then(m => m.TripsAdminComponent),
        title: 'Manage Planned Trips — Roamly Admin'
      },
      {
        path: 'inquiries',
        loadComponent: () => import('./features/admin/inquiries-admin/inquiries-admin.component').then(m => m.InquiriesAdminComponent),
        title: 'Customer Inquiries — Roamly Admin'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users-admin/users-admin.component').then(m => m.UsersAdminComponent),
        title: 'Users & Roles — Roamly Admin'
      }
    ]
  },

  // 404 Fallback
  {
    path: 'not-found',
    loadComponent: () => import('./features/auth/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found — Roamly'
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];
