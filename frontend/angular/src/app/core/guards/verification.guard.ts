// src/app/shared/utils/verification-check.ts
import { inject } from '@angular/core';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { VerificationFormComponent } from 'src/app/shared/components/verification-form/verification-form.component';
import { AuthUserResponse } from '../services/auth'; // Import the interface for typing

export function checkVerification(
  user: AuthUserResponse | null,
  dialog: ZardDialogService
): boolean {
  console.log('Checking verification for user:', user);
  console.log('User isVerified status (inside checkVerification):', user?.isVerified); // Log the actual status

  // --- IMPORTANT CHANGE HERE ---
  // Changed from user?.data?.isVerified to user?.isVerified
  if (!user?.isVerified) {
    dialog.create({
      zTitle: 'Identity Verification Required',
      zDescription: 'Please verify your ID to access this feature.',
      zContent: VerificationFormComponent,
      zWidth: '500px',
      zHideFooter: true,
    });
    return false;
  }
  return true;
}
