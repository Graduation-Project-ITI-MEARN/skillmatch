import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { Z_MODAL_DATA } from 'src/app/shared/components/zard-ui/dialog/dialog.service'; // Adjust path
import { ZardDialogRef } from '@shared/components/zard-ui/dialog/dialog-ref';

@Component({
  selector: 'app-reject-confirmation',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule], // Add FormsModule
  template: `
    <div class="space-y-4 p-2">
      <p class="text-gray-700">
        {{
          'DASHBOARD.ADMIN.USERS.REJECT_CONFIRMATION_MESSAGE' | translate : { name: data.userName }
        }}
      </p>

      <div class="space-y-2">
        <label for="rejectionReason" class="block text-sm font-medium text-gray-700">
          {{ 'DASHBOARD.ADMIN.USERS.REJECTION_REASON_LABEL' | translate }} ({{
            'DASHBOARD.GENERAL.OPTIONAL' | translate
          }})
        </label>
        <textarea
          id="rejectionReason"
          [(ngModel)]="rejectionReason"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
          rows="3"
          placeholder="{{ 'DASHBOARD.ADMIN.USERS.REJECTION_REASON_PLACEHOLDER' | translate }}"
        ></textarea>
      </div>

      <p class="text-sm text-gray-500 mt-2">
        {{ 'DASHBOARD.ADMIN.USERS.REJECT_CONFIRMATION_SUBMESSAGE' | translate }}
      </p>
    </div>
  `,
})
export class RejectConfirmationComponent {
  data: { userName: string } = inject(Z_MODAL_DATA);
  dialogRef = inject(ZardDialogRef); // Inject dialogRef to pass data back
  rejectionReason = signal('');

  // This method will be called by the ZardDialogRef when "OK" is clicked
  // You need to set this up in the dialog service call, see below
  get rejectionResult() {
    return this.rejectionReason();
  }
}
