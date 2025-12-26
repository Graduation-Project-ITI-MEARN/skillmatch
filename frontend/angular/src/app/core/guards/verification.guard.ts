import { inject } from '@angular/core';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { VerificationFormComponent } from 'src/app/shared/components/verification-form/verification-form.component';

export function checkVerification(user: any, dialog: ZardDialogService): boolean {
  if (user?.isVerified) {
    return true;
  }

  dialog.create({
    zTitle: 'Identity Verification Required',
    zDescription: 'Please verify your ID to access this feature.',
    zContent: VerificationFormComponent,
    zWidth: '500px',
    zHideFooter: true, // Form has its own submit
  });

  return false;
}
