import { Component, inject, OnInit, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Brain,
  BookOpen,
  ChevronRight,
  BarChart,
  Lightbulb,
  Zap,
  Target,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
} from 'lucide-angular';
import { PricingModal } from '@shared/components/pricing-modal/pricing-modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@/core/services/auth';
import { ToastrService } from 'ngx-toastr';
import { PaymentIframe } from '@shared/components/payment-iframe/payment-iframe';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PricingModal, TranslateModule, MatDialogModule],
  templateUrl: './coach.html',
})
export class Coach implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  showPricingModal = false;
  isLoading = false;
  readonly icons = {
    Brain,
    BookOpen,
    ChevronRight,
    BarChart,
    Lightbulb,
    Zap,
    Target,
    Clock,
    Trophy,
    CheckCircle,
    XCircle,
  };

  dashboardData: any | null = null;
  private destroy$ = new Subject<void>();

  private premiumStatusEffect = effect(() => {
    if (this.isPremium() && !this.dashboardData) {
      this.fetchDashboardData();
    }
  });

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchDashboardData() {
    this.isLoading = true;
    this.http
      .get<any>('http://localhost:5000/api/coach/dashboard')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.dashboardData = res.data;
          } else {
            this.toastr.error(this.translate.instant('DASHBOARD.COACH.DASHBOARD_LOAD_ERROR'));
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching dashboard data:', err);
          this.toastr.error(this.translate.instant('DASHBOARD.COACH.DASHBOARD_LOAD_ERROR'));
          this.isLoading = false;
        },
      });
  }

  handleUpgrade() {
    this.showPricingModal = false;
    this.isLoading = true;

    const role = this.authService.role;
    const planId = role === 'COMPANY' ? 'enterprise' : 'basic';
    const amount = role === 'COMPANY' ? 1000 : 200;

    // Call backend to get REAL Paymob iframe URL
    this.http
      .post<any>(`${environment.apiUrl}/payment/create-intent`, {
        amount: amount,
        currency: 'EGP',
        payment_type: 'SUBSCRIPTION',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          // Open dialog with REAL Paymob iframe URL
          const dialogRef = this.dialog.open(PaymentIframe, {
            data: {
              url: res.data.iframeUrl, // Real Paymob URL
              planId: planId,
            },
            width: '550px',
            maxWidth: '95vw',
            disableClose: true,
          });

          dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
              if (result === 'CHECK_STATUS') {
                this.verifyStatus();
              } else if (result === 'FAILED') {
                this.toastr.error('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
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

  verifyStatus() {
    this.isLoading = true;
    this.toastr.info('جاري التحقق من عملية الدفع...');

    setTimeout(() => {
      this.authService
        .refreshUserProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.isLoading = false;
            if (user?.subscriptionStatus === 'active') {
              this.toastr.success(this.translate.instant('DASHBOARD.COACH.PAYMENT_SUCCESS'));
              this.fetchDashboardData();
            } else {
              this.toastr.warning('الدفع مازال قيد المعالجة. يرجى المحاولة مرة أخرى.');
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Refresh User Profile Error:', err);
            this.toastr.error('حدث خطأ أثناء التحقق من الاشتراك');
          },
        });
    }, 2000);
  }

  isPremium = computed(() => {
    const user = this.authService.currentUser();
    return (
      user?.subscriptionStatus === 'active' &&
      user?.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date()
    );
  });
}
