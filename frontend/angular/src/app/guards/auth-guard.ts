import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Return an Observable! Angular will wait for it to complete.
  return authService.checkAuth().pipe(
    take(1), // Ensure it completes
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      } else {
        // Redirect to login if auth fails
        window.location.href = 'http://localhost:3000/login';
        return false;
      }
    })
  );
};
