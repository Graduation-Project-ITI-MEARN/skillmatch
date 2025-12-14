import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'z-stat',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  template: `
    <div
      class="relative bg-surface rounded-2xl p-6 border border-gray-200 group overflow-hidden transition-all duration-300 bg-white"
    >
      <!-- Subtle Background Gradient -->
      <div
        class="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-10 transition-opacity"
      ></div>

      <div class="relative flex items-center justify-between mb-4">
        <!-- Icon Wrapper -->
        <div class="text-gray-400 group-hover:text-primary transition-colors">
          <ng-content select="[icon]"></ng-content>
        </div>
        <!-- Trend -->
        <span
          class="text-xs font-semibold px-2 py-1 rounded-full"
          [ngClass]="{
            'bg-green-50 text-green-600': trendColor === 'success',
            'bg-red-50 text-red-600': trendColor === 'danger',
            'bg-yellow-50 text-yellow-600': trendColor === 'warning',
            'bg-blue-50 text-blue-600': trendColor === 'info'
          }"
        >
          {{ trend | translate }}
        </span>
      </div>

      <div class="relative">
        <div class="text-3xl font-bold text-gray-900 mb-1">{{ value }}</div>
        <div class="text-sm text-gray-500 font-medium">{{ labelKey | translate }}</div>
      </div>
    </div>
  `,
})
export class ZardStatComponent {
  @Input() labelKey: string = '';
  @Input() value: string = '';
  @Input() trend: string = '';
  @Input() trendColor: string = '';

  constructor() {
    console.log(this.trend);
  }
}
