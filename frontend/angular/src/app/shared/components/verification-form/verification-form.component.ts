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
      }

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">National ID / Tax ID</label>
          <input
            type="text"
            [(ngModel)]="nationalId"
            class="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-primary"
            placeholder="Enter ID number"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Upload ID Document</label>
          <input
            type="file"
            (change)="onFileSelected($event)"
            class="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
        </div>

        <button
          (click)="submit()"
          [disabled]="loading() || !nationalId || !documentUrl"
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

  user = this.authService.currentUser;
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
    this.userService
      .requestVerification({
        nationalId: this.nationalId,
        documentUrl: this.documentUrl,
      })
      .subscribe({
        next: (res) => {
          this.toast.success('Verification submitted!');
          this.authService.verifyUser().subscribe(); // Refresh user state
        },
        error: (err) => this.toast.error(err.error?.message || 'Submission failed'),
      });
  }
}
