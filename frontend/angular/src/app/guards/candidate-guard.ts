import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';

export const candidateGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);

  if (!auth.isLoggedIn()) {
    window.location.href = 'http://localhost:3000/login';
    return false;
  }

  if (!auth.isCandidate()) {
    window.location.href = '/dashboard';
    return false;
  }

  return true;
};
