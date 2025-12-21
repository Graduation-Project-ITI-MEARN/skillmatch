import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Brain, BookOpen, ChevronRight } from 'lucide-angular';
import { PricingModal } from '@shared/components/pricing-modal/pricing-modal';

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PricingModal],
  templateUrl: './coach.html'
})
export class Coach {
  isPremium = false;
  showPricingModal = false;

  readonly icons = { Brain, BookOpen, ChevronRight };

  checkAccess() {
    if (!this.isPremium) {
      this.showPricingModal = true;
    }
  }

  handleUpgrade() {
    // Mocking the upgrade process
    this.isPremium = true;
    this.showPricingModal = false;
    // هنا ممكن تظهر Toast success
    alert('Welcome to Pro! You now have full access.');
  }
}
