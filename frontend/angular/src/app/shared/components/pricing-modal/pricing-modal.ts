import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, Sparkles, X } from 'lucide-angular';
import { AuthService } from '@/core/services/auth';

@Component({
  selector: 'app-pricing-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
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