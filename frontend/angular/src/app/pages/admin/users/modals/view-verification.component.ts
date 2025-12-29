import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Z_MODAL_DATA } from 'src/app/shared/components/zard-ui/dialog/dialog.service'; // Adjust path
import { LucideAngularModule, ExternalLink, Image, FileText, Eye } from 'lucide-angular'; // Add Image and FileText icons

export interface UserVerificationDetails {
  userName: string;
  userType?: 'candidate' | 'company' | 'challenger';
  nationalId?: string;
  taxIdCard?: string;
  verificationDocument: string;
}

@Component({
  selector: 'app-view-verification-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule],
  template: `
    <div class="space-y-4 p-2">
      <!-- ... existing code ... -->

      @if (data.nationalId) {
      <div class="bg-gray-50 p-3 rounded-md border border-gray-200">
        <p class="text-xs font-medium text-gray-500">
          {{ 'DASHBOARD.ADMIN.USERS.NATIONAL_ID_NUMBER' | translate }}
        </p>
        <p class="text-gray-800 font-semibold">{{ data.nationalId }}</p>
      </div>
      } @if (data.taxIdCard) {
      <div class="bg-gray-50 p-3 rounded-md border border-gray-200">
        <p class="text-xs font-medium text-gray-500">
          {{ 'DASHBOARD.ADMIN.USERS.TAX_ID_NUMBER' | translate }}
        </p>
        <p class="text-gray-800 font-semibold">{{ data.taxIdCard }}</p>
      </div>
      } @if (data.verificationDocument) {
      <div class="space-y-4">
        <p class="text-sm font-medium text-gray-700">
          {{ 'DASHBOARD.ADMIN.USERS.VERIFICATION_DOCUMENT' | translate }}
        </p>
        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            @if (isImageUrl(data.verificationDocument)) {
            <a [href]="data.verificationDocument" target="_blank" class="block group relative">
              <img
                [src]="data.verificationDocument"
                alt="Verification Document"
                class="w-full h-48 object-cover group-hover:opacity-75 transition-opacity"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <lucide-icon [img]="icons.Eye" class="w-8 h-8 text-white"></lucide-icon>
              </div>
            </a>
            <div class="p-3 text-sm text-gray-700 flex justify-between items-center">
              <span>{{ 'DASHBOARD.ADMIN.USERS.DOCUMENT' | translate }}</span>
              <lucide-icon [img]="icons.Image" class="w-4 h-4 text-blue-500"></lucide-icon>
            </div>
            } @else if (isPdfUrl(data.verificationDocument)) {
            <div class="w-full h-48 bg-gray-100 flex flex-col items-center justify-center p-4">
              <lucide-icon
                [img]="icons.FileText"
                class="w-12 h-12 text-gray-400 mb-2"
              ></lucide-icon>
              <p class="text-sm text-gray-600 text-center">
                {{ 'DASHBOARD.ADMIN.USERS.PDF_DOCUMENT' | translate }}
              </p>
            </div>
            <div class="p-3 flex justify-between items-center">
              <a
                [href]="data.verificationDocument"
                target="_blank"
                class="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors text-sm"
              >
                <lucide-icon [img]="icons.ExternalLink" class="w-4 h-4"></lucide-icon>
                <span>{{ 'DASHBOARD.ADMIN.USERS.OPEN_PDF' | translate }}</span>
              </a>
              <lucide-icon [img]="icons.FileText" class="w-4 h-4 text-red-500"></lucide-icon>
            </div>
            } @else {
            <div class="w-full h-48 bg-gray-100 flex flex-col items-center justify-center p-4">
              <lucide-icon
                [img]="icons.ExternalLink"
                class="w-12 h-12 text-gray-400 mb-2"
              ></lucide-icon>
              <p class="text-sm text-gray-600 text-center">
                {{ 'DASHBOARD.ADMIN.USERS.OTHER_DOCUMENT_TYPE' | translate }}
              </p>
            </div>
            <div class="p-3 flex justify-between items-center">
              <a
                [href]="data.verificationDocument"
                target="_blank"
                class="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors text-sm"
              >
                <lucide-icon [img]="icons.ExternalLink" class="w-4 h-4"></lucide-icon>
                <span>{{ 'DASHBOARD.ADMIN.USERS.VIEW_DOCUMENT' | translate }}</span>
              </a>
              <lucide-icon [img]="icons.FileText" class="w-4 h-4 text-gray-500"></lucide-icon>
            </div>
            }
          </div>
        </div>
      </div>
      } @else {
      <div class="text-sm text-gray-500">
        {{ 'DASHBOARD.ADMIN.USERS.NO_DOCUMENTS_UPLOADED' | translate }}
      </div>
      }
    </div>
  `,
})
export class ViewVerificationDetailsComponent {
  data: UserVerificationDetails = inject(Z_MODAL_DATA);

  icons = { ExternalLink, Image, FileText, Eye }; // Add Image, FileText, Eye

  isImageUrl(url: string): boolean {
    return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
  }

  isPdfUrl(url: string): boolean {
    return /\.pdf$/i.test(url);
  }
}
