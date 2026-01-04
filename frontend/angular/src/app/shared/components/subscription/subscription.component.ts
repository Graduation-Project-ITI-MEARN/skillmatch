import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentIframe } from '../payment-iframe/payment-iframe';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentService } from '@/core/services/payment';
import { AuthService } from '@/core/services/auth';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  aiModelAccess: 'free' | 'standard' | 'premium' | 'custom';
  recommended?: boolean;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class SubscriptionComponent implements OnInit {
  private dialog = inject(MatDialog);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser();
  isProcessing = false;
  error = '';
  successMessage = '';

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      duration: 30,
      aiModelAccess: 'free',
      features: [
        'Create unlimited challenges',
        'Basic AI evaluation (Free tier models)',
        'Standard support',
        'Up to 50 submissions per challenge',
        'Basic analytics',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 599,
      duration: 30,
      aiModelAccess: 'premium',
      recommended: true,
      features: [
        'Everything in Basic',
        'Premium AI models (GPT-4, Claude, etc.)',
        'Priority support',
        'Unlimited submissions',
        'Advanced analytics',
        'Custom branding',
        'Bulk challenge creation',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1299,
      duration: 30,
      aiModelAccess: 'custom',
      features: [
        'Everything in Professional',
        'Custom AI model selection',
        'Dedicated account manager',
        'Custom AI model training',
        'API access',
        'White-label solution',
        'SLA guarantee',
        'Custom contract terms',
      ],
    },
  ];

  ngOnInit() {
    // Check if returning from payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('success');

    if (paymentSuccess === 'true') {
      this.handlePaymentReturn(true);
    } else if (paymentSuccess === 'false') {
      this.handlePaymentReturn(false);
    }
  }

  get subscriptionStatus() {
    if (!this.currentUser) return null;

    const status = this.currentUser.subscriptionStatus;
    const expiry = this.currentUser.subscriptionExpiry
      ? new Date(this.currentUser.subscriptionExpiry)
      : null;
    const isActive = status === 'active' && expiry && expiry > new Date();

    return {
      status,
      expiry,
      isActive,
      daysRemaining: expiry
        ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0,
    };
  }

  async subscribe(plan: SubscriptionPlan) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.error = '';
    this.successMessage = '';

    try {
      const response = await this.paymentService
        .initiatePayment(plan.price, 'SUBSCRIPTION', plan.id) // Pass plan.id
        .toPromise();

      if (response?.data?.iframeUrl) {
        const dialogRef = this.dialog.open(PaymentIframe, {
          data: { url: response.data.iframeUrl },
          width: '800px',
          height: '600px',
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'success') {
            this.handlePaymentSuccess();
          } else if (result === 'failure') {
            this.error = 'Payment failed. Please try again.';
          }
          this.isProcessing = false;
        });
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      this.error = error?.error?.message || 'Failed to initiate payment';
      this.isProcessing = false;
    }
  }

  private handlePaymentReturn(success: boolean) {
    if (success) {
      this.handlePaymentSuccess();
    } else {
      this.error = 'Payment was not completed. Please try again.';
    }

    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }

  private async handlePaymentSuccess() {
    this.successMessage = 'Subscription activated successfully!';

    // Refresh user data to get updated subscription status
    await this.authService.refreshUserProfile().toPromise();

    // Navigate after a short delay
    setTimeout(() => {
      this.router.navigate(['/dashboard/company/overview'], {
        queryParams: { subscriptionSuccess: 'true' },
      });
    }, 2000);
  }

  renewSubscription() {
    const professionalPlan = this.subscriptionPlans.find((p) => p.recommended);
    if (professionalPlan) {
      this.subscribe(professionalPlan);
    }
  }

  upgradeSubscription() {
    // Find next tier or recommended plan
    const professionalPlan = this.subscriptionPlans.find((p) => p.recommended);
    if (professionalPlan) {
      this.subscribe(professionalPlan);
    }
  }
}
