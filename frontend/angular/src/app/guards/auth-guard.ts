import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';



export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    return true;
  }else {
    window.location.href = 'http://localhost:3000/login';
    return false;
  }
};
