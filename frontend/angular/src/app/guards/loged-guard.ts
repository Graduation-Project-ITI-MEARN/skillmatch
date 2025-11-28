import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const logedGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    window.location.href = 'http://localhost:3000/login';
    return false;
  }else {
    return true;
  }
};
