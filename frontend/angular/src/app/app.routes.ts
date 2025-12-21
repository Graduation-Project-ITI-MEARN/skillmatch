import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { candidateGuard } from './core/guards/candidate-guard';
import { companyGuard } from './core/guards/company-guard';

export const routes: Routes = [
  // 1. Default Redirect
  { path: '', redirectTo: 'dashboard/challenger', pathMatch: 'full' },

  // 2. Unauthorized Page
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // 3. ⭐ CHALLENGER ROUTE (Moved OUTSIDE the main Dashboard Shell)
  // This must come BEFORE the generic 'dashboard' path so it matches first.
  // It loads the component directly, so NO ugly header, NO sidebar from the parent.
  {
    path: 'dashboard/challenger',
    loadComponent: () =>
      import('./(dashboard)/challenger/challenger-dashboard.component').then(
        (m) => m.ChallengerDashboardComponent
      ),
    canActivate: [authGuard],
  },

  // 4. STANDARD DASHBOARD SHELL (For Admin, Company, Candidate)
  // This loads the Layout (Header + Sidebar) that you didn't want for Challenger.
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/layouts/dashboard/dashboard-root').then((m) => m.DashboardRootComponent),
    canActivate: [authGuard],
    children: [
      // Candidate
      {
        path: 'candidate',
        loadComponent: () =>
          import('./pages/candidate/layout/candidate-layout').then(
            (m) => m.CandidateShellComponent
          ),
        canActivate: [candidateGuard],
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () =>
              import('./pages/candidate/overview/overview').then((m) => m.Overview),
          },
          {
            path: 'portfolio',
            loadComponent: () =>
              import('./pages/candidate/portfolio/portfolio').then((m) => m.Portfolio),
          },
          {
            path: 'coach',
            loadComponent: () => import('./pages/candidate/coach/coach').then((m) => m.Coach),
          },
          {
            path: 'leaderboard',
            loadComponent: () =>
              import('./pages/candidate/leaderboard/leaderboard').then((m) => m.Leaderboard),
          },
          {
           path: 'challenge/:id',
          loadComponent: () =>
         import('./pages/candidate/challenge-details/challenge-details').then(
          (m) => m.ChallengeDetails
      ),
      },
        ],
      },

      // Company
      {
        path: 'company',
        loadComponent: () =>
          import('./pages/company/layout/company-layout').then((m) => m.CompanyShellComponent),
        canActivate: [companyGuard],
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () =>
              import('./pages/company/overview/overview').then((m) => m.Overview),
          },
          {
            path: 'submissions',
            loadComponent: () =>
              import('./pages/company/submissions/submissions').then((m) => m.Submissions),
          },
          {
            path: 'talent',
            loadComponent: () => import('./pages/company/talent/talent').then((m) => m.Talent),
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('./pages/company/analytics/analytics').then((m) => m.Analytics),
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/company/new/new').then((m) => m.New),
          },
        ],
      },

      // Admin
      {
        path: 'admin',
        loadComponent: () =>
          import('./pages/admin/layout/admin-layout').then((m) => m.AdminShellComponent),
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () => import('./pages/admin/overview/overview').then((m) => m.Overview),
          },
          {
            path: 'users',
            loadComponent: () => import('./pages/admin/users/users').then((m) => m.Users),
          },
          {
            path: 'moderation',
            loadComponent: () =>
              import('./pages/admin/moderation/moderation').then((m) => m.Moderation),
          },
          {
            path: 'challenges',
            loadComponent: () =>
              import('./pages/admin/challenges/challenges').then((m) => m.Challenges),
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('./pages/admin/analytics/analytics').then((m) => m.Analytics),
          },
          {
            path: 'settings',
            loadComponent: () => import('./pages/admin/settings/settings').then((m) => m.Settings),
          },
        ],
      },
    ],
  },
];
