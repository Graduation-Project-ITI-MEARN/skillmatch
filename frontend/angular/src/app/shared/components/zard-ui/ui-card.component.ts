import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative bg-surface rounded-2xl p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group overflow-hidden cursor-pointer"
    >
      <!-- Gradient Hover Overlay -->
      <div
        class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300"
      ></div>

      <!-- Content -->
      <div class="relative z-10">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class ZardCardComponent {}
