import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Brain, BookOpen, ChevronRight } from 'lucide-angular';
import { PricingModal } from '@shared/components/pricing-modal/pricing-modal';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@/core/services/auth';
import { PaymentService } from '@/core/services/payment';
import { ToastrService } from 'ngx-toastr';
import { PaymentIframe } from '@shared/components/payment-iframe/payment-iframe';

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PricingModal, TranslateModule, MatDialogModule],
  templateUrl: './coach.html',
})
export class Coach implements OnInit {
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  showPricingModal = false;
  isLoading = false;
  readonly icons = { Brain, BookOpen, ChevronRight };

  ngOnInit() {}

  handleUpgrade() {
    this.showPricingModal = false;
    this.isLoading = true;

    // Determine plan based on user role or selection
    const role = this.authService.role;
    const planId = role === 'COMPANY' ? 'enterprise' : 'basic'; // Or get from modal selection
    const amount = role === 'COMPANY' ? 1000 : 200;

    // NOW we pass the plan_id
    this.paymentService.initiatePayment(amount, 'SUBSCRIPTION', planId).subscribe({
      next: (res) => {
        this.isLoading = false;
        const dialogRef = this.dialog.open(PaymentIframe, {
          data: { url: res.data.iframeUrl },
          width: '550px',
          maxWidth: '95vw',
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'CHECK_STATUS') {
            this.verifyStatus();
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Payment Error:', err);
        this.toastr.error('تعذر جلب بيانات الدفع');
      },
    });
  }

  isPremium = computed(() => {
    const user = this.authService.currentUser();
    return (
      user?.subscriptionStatus === 'active' &&
      user?.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date()
    );
  });

  verifyStatus() {
    this.isLoading = true;
    this.toastr.info('جاري التحقق من عملية الدفع...');

    setTimeout(() => {
      this.authService.refreshUserProfile().subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user?.subscriptionStatus === 'active') {
            this.toastr.success('مبروك! تم تفعيل اشتراك برو بنجاح.');
          } else {
            this.toastr.warning('الدفع مازال قيد المعالجة، يرجى المحاولة بعد لحظات.');
          }
        },
      });
    }, 4000);
  }
}
