import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService, AuthUserResponse } from '../services/auth'; // Import AuthUserResponse
import { environment } from '../../../environments/environment';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { checkVerification } from './verification.guard';
import { LanguageService } from '../services/language';

export const companyGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const dialogService = inject(ZardDialogService);
  const languageService = inject(LanguageService);

  const lang = languageService.getLangauge();

  const user = authService.currentUser(); // Get the current user signal's value

  // 1. Check Authentication
  if (!user) {
    window.location.href = `${environment.nextJsUrl}/${lang}/login`;
    return false;
  }

  // 2. Check Role/Type
  // --- IMPORTANT CHANGE HERE ---
  // Direct access to user.type as per AuthUserResponse interface
  if (user.type !== 'company') {
    console.warn('Unauthorized access attempt: Not a company');
    return router.createUrlTree(['/unauthorized']);
  }

  // 3. Define routes that require verification for companies
  const routesRequiringVerification = [
    '/dashboard/company/create',
    // Add other company-specific routes that require verification here
  ];

  // Check if the current route matches any route requiring verification
  const requiresVerification = routesRequiringVerification.includes(state.url);

  if (requiresVerification) {
    // 4. Check Verification
    // --- IMPORTANT CHANGE HERE ---
    // Pass user directly, which now has the correct isVerified property
    if (!checkVerification(user, dialogService)) {
      console.warn('Company not verified to access this feature.');
      return false; // Prevent navigation, dialog is shown by checkVerification
    }
  }

  return true; // Allow navigation if verified or not a protected route
};
