import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, Sparkles, X } from 'lucide-angular';
import { TranslateModule as translateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pricing-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, translateModule],
  templateUrl: './pricing-modal.html'
})
export class PricingModal {
  @Output() close = new EventEmitter<void>();
  @Output() upgraded = new EventEmitter<void>();

  readonly icons = { CheckCircle2, Sparkles, X };

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
