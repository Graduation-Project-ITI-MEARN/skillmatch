import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Z_MODAL_DATA } from 'src/app/shared/components/zard-ui/dialog/dialog.service'; // Adjust path

@Component({
  selector: 'app-verify-confirmation',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="p-2">
      <p class="text-gray-700">
        {{
          'DASHBOARD.ADMIN.USERS.VERIFY_CONFIRMATION_MESSAGE' | translate : { name: data.userName }
        }}
      </p>
      <p class="text-sm text-gray-500 mt-2">
        {{ 'DASHBOARD.ADMIN.USERS.VERIFY_CONFIRMATION_SUBMESSAGE' | translate }}
      </p>
    </div>
  `,
})
export class VerifyConfirmationComponent {
  data: { userName: string } = inject(Z_MODAL_DATA);
}
