// core/guards/candidate-guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';
// Removed: import { checkVerification } from '../../shared/utils/verification-check';
// Removed: import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';

export const candidateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // Removed: const dialogService = inject(ZardDialogService);

  const user = authService.currentUser(); // Get the current user signal's value

  // 1. Check Authentication
  if (!user) {
    window.location.href = `${environment.nextJsUrl}/login`;
    return false;
  }

  // 2. Check Role/Type
  if (user.type !== 'candidate') {
    // Direct access to user.type
    console.warn('Unauthorized access attempt: Not a candidate');
    return router.createUrlTree(['/unauthorized']);
  }

  // --- IMPORTANT CHANGE HERE ---
  // The `candidateGuard` will no longer enforce verification for viewing challenge details.
  // Candidates can always view the details. The verification check will be moved
  // to the `ChallengeDetails` component when the user tries to *start* the challenge.

  return true; // Allow navigation if authenticated and is a candidate
};
