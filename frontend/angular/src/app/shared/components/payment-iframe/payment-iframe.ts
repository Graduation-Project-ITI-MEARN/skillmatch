import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment-iframe',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './payment-iframe.html',
})
export class PaymentIframe implements OnInit, OnDestroy {
  safeUrl: SafeResourceUrl;
  paymentCompleted = false;
  isProcessing = false;

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<PaymentIframe>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: { url: string; planId?: string }
  ) {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
  }

  ngOnInit() {
    window.addEventListener('message', this.handlePaymobMessage);
    this.startPolling();
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.handlePaymobMessage);
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private pollingInterval: any;

  private startPolling() {
    this.pollingInterval = setInterval(() => {
      try {
        const iframe = document.querySelector('iframe');
        if (iframe?.contentWindow?.location.href.includes('success')) {
          console.log('✅ Payment success detected via URL change');
          this.paymentCompleted = true;
          clearInterval(this.pollingInterval);
          setTimeout(() => this.close('CHECK_STATUS'), 3000);
        }
      } catch (e) {
        // Cross-origin restriction - this is normal
      }
    }, 5000);
  }

  private handlePaymobMessage = (event: MessageEvent) => {
    if (!event.origin.includes('paymob.com') && !event.origin.includes('accept.paymob.com')) {
      return;
    }

    console.log('🔔 Received message from Paymob:', event.data);

    const data = event.data;

    if (
      data === 'payment_success' ||
      data?.success === true ||
      data?.type === 'transaction.success' ||
      data?.status === 'success' ||
      (typeof data === 'string' && data.toLowerCase().includes('success'))
    ) {
      console.log('✅ Payment detected as successful!');
      this.paymentCompleted = true;
      setTimeout(() => {
        this.close('CHECK_STATUS');
      }, 3000);
    }

    if (
      data === 'payment_failed' ||
      data?.success === false ||
      data?.type === 'transaction.failed' ||
      data?.status === 'failed' ||
      (typeof data === 'string' && data.toLowerCase().includes('fail'))
    ) {
      console.log('❌ Payment detected as failed!');
      setTimeout(() => {
        this.close('FAILED');
      }, 1000);
    }
  };

  /**
   * Simulate payment completion when button is clicked
   */
  simulatePayment() {
    if (this.isProcessing || this.paymentCompleted) return;

    this.isProcessing = true;
    this.paymentCompleted = true;

    // Call backend to activate subscription
    const planId = this.data.planId || 'basic';

    this.http
      .post<any>(`${environment.apiUrl}/payment/demo/simulate`, {
        plan_id: planId,
      })
      .subscribe({
        next: (response) => {
          console.log('✅ Subscription activated:', response);
          // Close dialog and trigger status check
          setTimeout(() => {
            this.close('CHECK_STATUS');
          }, 2000);
        },
        error: (err) => {
          console.error('Simulation error:', err);
          this.paymentCompleted = false;
          this.isProcessing = false;
          this.close('FAILED');
        },
      });
  }

  close(status?: string) {
    this.dialogRef.close(status);
  }
}
