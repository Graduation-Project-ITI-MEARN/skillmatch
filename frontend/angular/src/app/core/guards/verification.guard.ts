import { inject } from '@angular/core';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { VerificationFormComponent } from 'src/app/shared/components/verification-form/verification-form.component';

export function checkVerification(user: any, dialog: ZardDialogService): boolean {
  console.log('Checking verification for user:', user);

  if (!user?.data?.isVerified) {
    dialog.create({
      zTitle: 'Identity Verification Required',
      zDescription: 'Please verify your ID to access this feature.',
      zContent: VerificationFormComponent,
      zWidth: '500px',
      zHideFooter: true, // Form has its own submit
    });

    return false;
  }

  return true;
}
