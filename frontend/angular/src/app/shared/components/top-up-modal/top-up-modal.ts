import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PaymentIframe } from '../payment-iframe/payment-iframe';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '@/core/services/payment';
import { AuthService } from '@/core/services/auth';


@Component({
  selector: 'app-top-up-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './top-up-modal.html'
})
export class TopUpModal {
  public dialogRef = inject(MatDialogRef<TopUpModal>);
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  amount: number | null = null;
  isLoading = false;

  pay() {
    if (!this.amount || this.amount <= 0) {
      this.toastr.warning('Please enter a valid amount');
      return;
    }

    this.isLoading = true;

    // طلب رابط الدفع من الباك اند
    this.paymentService.initiatePayment(this.amount, 'TOPUP').subscribe({
      next: (res) => {
        this.isLoading = false;
        
        this.dialogRef.close();

        const iframeRef = this.dialog.open(PaymentIframe, {
          data: { url: res.data.iframeUrl },
          width: '600px',
          disableClose: true
        });

        iframeRef.afterClosed().subscribe(result => {
          if (result === 'CHECK_STATUS') {
            this.verifyTopUp();
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to initiate payment');
      }
    });
  }

  verifyTopUp() {
    this.toastr.info('Verifying balance update...');
    setTimeout(() => {
      this.authService.refreshUserProfile().subscribe(() => {
        this.toastr.success('Balance updated successfully!');
      });
    }, 4000);
  }
}
