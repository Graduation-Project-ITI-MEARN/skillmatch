import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { candidateGuard } from './core/guards/candidate-guard';
import { companyGuard } from './core/guards/company-guard'; // Ensure you import this!
// import { adminGuard } from './core/guards/admin-guard'; // You need to create/import this
// import { challengerGuard } from './core/guards/challenger-guard'; // You need to create/import this

export const routes: Routes = [
  {
    // Fix: Add the missing route so the app doesn't crash on redirect
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./shared/layouts/dashboard/dashboard-root').then((m) => m.DashboardRootComponent),
    canActivate: [authGuard],
    children: [
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
              import('./pages/candidate/portfolio/portfolio').then((m) => m.PortfolioComponent),
          },
             {
            path: 'mysubmissions',
            loadComponent: () =>
              import('./pages/candidate/my-submissions/my-submissions').then((m) => m.MySubmissions),
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

      {
        path: 'challenger',
        loadComponent: () =>
          import('./pages/challenger/layout/challenger-layout').then(
            (m) => m.ChallengerShellComponent
          ),
        canActivate: [authGuard],

        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () =>
              import('./pages/challenger/overview/overview').then((m) => m.Overview),
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/challenger/new/new').then((m) => m.New),
          },
          {
            path: 'completed',
            loadComponent: () =>
              import('./pages/challenger/completed/completed').then((m) => m.Completed),
          },
          {
            path: 'submissions',
            loadComponent: () =>
              import('./pages/challenger/submissions/submissions').then((m) => m.Submissions),
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('./pages/challenger/analytics/analytics').then((m) => m.Analytics),
          },
        ],
      },
    ],
  },
];
