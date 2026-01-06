import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentIframe } from '../payment-iframe/payment-iframe';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@/core/services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// Map backend PricingTier enum to subscription plans
enum PricingTier {
  FREE = 'free',
  BUDGET = 'budget',
  BALANCED = 'balanced',
  PREMIUM = 'premium',
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  aiModelAccess: PricingTier;
  recommended?: boolean;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscription.component.html',
})
export class SubscriptionComponent implements OnInit {
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  router = inject(Router);
  private http = inject(HttpClient);

  currentUser = this.authService.currentUser();
  isProcessing = false;
  error = '';
  successMessage = '';

  // Map pricing tiers to subscription plans
  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      duration: 30,
      aiModelAccess: PricingTier.FREE, // Free tier AI models
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
      aiModelAccess: PricingTier.BALANCED, // Balanced tier AI models
      recommended: true,
      features: [
        'Everything in Basic',
        'Premium AI models (GPT-4o-mini, Claude Haiku)',
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
      aiModelAccess: PricingTier.PREMIUM, // Premium tier - custom selection
      features: [
        'Everything in Professional',
        'Premium AI models (GPT-4, Claude Sonnet, etc.)',
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
      // Call backend to get REAL Paymob iframe
      const response = await this.http
        .post<any>(`${environment.apiUrl}/payment/create-intent`, {
          amount: plan.price,
          currency: 'EGP',
          payment_type: 'SUBSCRIPTION',
        })
        .toPromise();

      if (response?.data?.iframeUrl) {
        const dialogRef = this.dialog.open(PaymentIframe, {
          data: {
            url: response.data.iframeUrl,
            planId: plan.id, // Pass plan ID for simulation
          },
          width: '550px',
          maxWidth: '95vw',
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'CHECK_STATUS') {
            this.handlePaymentSuccess();
          } else if (result === 'FAILED') {
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

    window.history.replaceState({}, '', window.location.pathname);
  }

  private async handlePaymentSuccess() {
    this.successMessage = 'Subscription activated successfully!';

    // Refresh user data
    await this.authService.refreshUserProfile().toPromise();

    // Navigate back to where they came from
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
    const professionalPlan = this.subscriptionPlans.find((p) => p.recommended);
    if (professionalPlan) {
      this.subscribe(professionalPlan);
    }
  }
}
