// src/app/shared/components/verification-form/verification-form.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from '@/core/services/upload.service';
import { UserService } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth';

@Component({
  selector: 'app-verification-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 class="text-lg font-bold mb-4">Identity Verification</h3>

      <!-- Status Badge -->
      @if (user()?.verificationStatus === 'pending') {
      <div
        class="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 flex items-center gap-2"
      >
        <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
        Verification Pending
      </div>
      } @else if (user()?.verificationStatus === 'rejected') {
      <div
        class="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2"
      >
        <span class="w-2 h-2 rounded-full bg-red-500"></span>
        Verification Rejected. Please resubmit or contact support.
      </div>
      } @else if (user()?.isVerified) {
      <div
        class="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2"
      >
        <span class="w-2 h-2 rounded-full bg-green-500"></span>
        Verified
      </div>
      } @else {
      <!-- Initial state if no status or 'none' -->
      <div
        class="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-2"
      >
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        Submit your documents for verification.
      </div>
      }

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">National ID / Tax ID</label>
          <input
            type="text"
            [(ngModel)]="nationalId"
            class="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-primary"
            placeholder="Enter ID number"
            [disabled]="user()?.verificationStatus === 'pending' || user()?.isVerified || ''"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Upload ID Document</label>
          <input
            type="file"
            (change)="onFileSelected($event)"
            class="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            [disabled]="loading() || user()?.verificationStatus === 'pending' || user()?.isVerified"
          />
        </div>

        <button
          (click)="submit()"
          [disabled]="
            loading() ||
            !nationalId ||
            !documentUrl ||
            user()?.verificationStatus === 'pending' ||
            user()?.isVerified
          "
          class="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {{ loading() ? 'Uploading...' : 'Submit for Verification' }}
        </button>
      </div>
    </div>
  `,
})
export class VerificationFormComponent {
  private uploadService = inject(UploadService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toast = inject(ToastrService);

  user = this.authService.currentUser; // Directly uses the signal
  nationalId = '';
  documentUrl = '';
  loading = signal(false);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loading.set(true);
      this.uploadService.uploadFile(file).subscribe({
        next: (res) => {
          this.documentUrl = res.url;
          this.loading.set(false);
          this.toast.success('Document uploaded successfully');
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Upload failed');
        },
      });
    }
  }

  submit() {
    this.loading.set(true); // Disable button to prevent double submission
    this.userService
      .requestVerification({
        nationalId: this.nationalId,
        documentUrl: this.documentUrl,
      })
      .subscribe({
        next: (res) => {
          this.toast.success('Verification submitted!');
          // --- IMPORTANT CHANGE HERE ---
          // Call refreshUserProfile after successful submission to update the signal
          // with the new `verificationStatus: 'pending'`.
          this.authService.refreshUserProfile().subscribe({
            next: () => {
              console.log('User profile refreshed after verification submission');
              this.loading.set(false); // Re-enable button
              // Potentially close the dialog here if desired
            },
            error: (err) => {
              console.error('Failed to refresh user profile after submission:', err);
              this.loading.set(false); // Re-enable button
            },
          });
        },
        error: (err) => {
          this.loading.set(false); // Re-enable button on error
          this.toast.error(err.error?.message || 'Submission failed');
        },
      });
  }
}
