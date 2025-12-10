import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { companyGuard } from './core/guards/company-guard';
import { candidateGuard } from './core/guards/candidate-guard';
import { challengerGuard } from './core/guards/challenger-guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/layouts/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    children: [
      // ========== ADMIN ==========
      {
        path: 'admin',
        loadComponent: () => import('./pages/admin/overview/overview').then((m) => m.Overview),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/candidates',
        loadComponent: () =>
          import('./pages/admin/candidates/candidates').then((m) => m.Candidates),
        canActivate: [adminGuard],
      },

      // ========== COMPANY ==========
      {
        path: 'company',
        loadComponent: () => import('./pages/company/overview/overview').then((m) => m.Overview),
        canActivate: [companyGuard],
      },
      {
        path: 'company/create-challenge',
        loadComponent: () =>
          import('./pages/company/create-challenge/create-challenge').then(
            (m) => m.CreateChallenge
          ),
        canActivate: [companyGuard],
      },

      // ========== CANDIDATE ==========
      {
        path: 'candidate',
        loadComponent: () => import('./pages/candidate/overview/overview').then((m) => m.Overview),
        canActivate: [candidateGuard],
      },
      {
        path: 'candidate/browse',
        loadComponent: () => import('./pages/candidate/browse/browse').then((m) => m.Browse),
        canActivate: [candidateGuard],
      },

      // ========== CHALLENGER ==========
      {
        path: 'challenger',
        loadComponent: () => import('./pages/challenger/overview/overview').then((m) => m.Overview),
        canActivate: [challengerGuard],
      },
      {
        path: 'challenger/create-bounty',
        loadComponent: () =>
          import('./pages/challenger/create-bounty/create-bounty').then((m) => m.CreateBounty),
        canActivate: [challengerGuard],
      },
    ],
  },
];
