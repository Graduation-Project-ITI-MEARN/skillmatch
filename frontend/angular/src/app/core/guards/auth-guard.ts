import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../services/language';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const languageService = inject(LanguageService);

  const lang = languageService.getLangauge();

  // Return an Observable! Angular will wait for it to complete.
  return authService.checkAuth().pipe(
    take(1), // Ensure it completes
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true;
      } else {
        // Redirect to login if auth fails
        window.location.href = `${environment.nextJsUrl}/${lang}/login`;
        return false;
      }
    })
  );
};
