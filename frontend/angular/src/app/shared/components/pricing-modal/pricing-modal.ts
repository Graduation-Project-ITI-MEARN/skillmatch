import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, Sparkles, X } from 'lucide-angular';

@Component({
  selector: 'app-pricing-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pricing-modal.html'
})
export class PricingModal {
  @Output() close = new EventEmitter<void>();
  @Output() upgraded = new EventEmitter<void>();

  readonly icons = { CheckCircle2, Sparkles, X };

  features = [
    'Unlimited AI Career Coaching',
    'Detailed CV & Portfolio Analysis',
    'Priority Job Applications',
    'Advanced Skill Gap Analytics',
    'Mock Interview Simulations'
  ];

  onUpgrade() {
    this.upgraded.emit();
  }
}
