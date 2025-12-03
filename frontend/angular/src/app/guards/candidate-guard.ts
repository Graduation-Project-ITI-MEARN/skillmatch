import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, switchMap, take } from 'rxjs';

export const candidateGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Wait for Auth Check
  return authService.checkAuth().pipe(
    take(1),
    map((isAuthenticated) => {
      // 2. Check Authentication
      if (!isAuthenticated) {
        // window.location.href = 'http://localhost:3000/login';
        return false;
      }

      // 3. Check Role (using the safe getter we made in Step 2)
      if (authService.type === 'candidate') {
        return true;
      }

      // 4. Unauthorized Role
      console.warn('Unauthorized access attempt: Not a candidate');
      return router.createUrlTree(['/unauthorized']); // Or wherever you want
    })
  );
};
