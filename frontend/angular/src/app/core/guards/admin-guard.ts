import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../services/language';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const languageService = inject(LanguageService);

  const lang = languageService.getLangauge();

  // 1. Wait for Auth Check
  return authService.checkAuth().pipe(
    take(1),
    map((isAuthenticated) => {
      // 2. Check Authentication
      if (!isAuthenticated) {
        console.log(lang);
        window.location.href = `${environment.nextJsUrl}/${lang}/login`;
        return false;
      }

      // 3. Check Role (using the safe getter we made in Step 2)
      if (authService.role === 'admin') {
        return true;
      }

      // 4. Unauthorized Role
      console.warn('Unauthorized access attempt');
      return router.createUrlTree(['/unauthorized']); // Or wherever you want
    })
  );
};
