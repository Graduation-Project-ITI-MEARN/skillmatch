import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, Sparkles, X } from 'lucide-angular';
import { TranslateModule as translateModule } from '@ngx-translate/core';
import { AuthService } from '@/core/services/auth';

@Component({
  selector: 'app-pricing-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, translateModule],
  templateUrl: './pricing-modal.html'
})
export class PricingModal {
  @Output() close = new EventEmitter<void>();
  @Output() upgraded = new EventEmitter<void>();

  private authService = inject(AuthService);
  readonly icons = { CheckCircle2, Sparkles, X };

  // تحديد السعر بناءً على نوع المستخدم
  getPrice(): string {
    const role = this.authService.role; // بنجيب الرول من الـ AuthService اللي عندك
    return role === 'COMPANY' ? '1000' : '200';
  }

  features = [
   'DASHBOARD.PRICING.FEATURES.UNLIMITED_COACHING',
    'DASHBOARD.PRICING.FEATURES.PORTFOLIO_ANALYSIS',
    'DASHBOARD.PRICING.FEATURES.PRIORITY_APPS',
    'DASHBOARD.PRICING.FEATURES.SKILL_ANALYTICS',
    'DASHBOARD.PRICING.FEATURES.MOCK_INTERVIEWS'
  ];

  onUpgrade() {
    this.upgraded.emit();
  }
}