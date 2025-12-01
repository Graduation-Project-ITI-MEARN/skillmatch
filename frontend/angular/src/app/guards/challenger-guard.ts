import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const challengerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);

  if (!auth.isLoggedIn()) {
    window.location.href = 'http://localhost:3000/login';
    return false;
  }

  if (!auth.isChallenger()) {
    window.location.href = '/dashboard';
    return false;
  }

  return true;
};
