import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
} from 'lucide-angular';
import { AnalyticsService, PlatformAnalytics } from '../services/analytics.service';
import { UiCard } from '@shared/components/ui/ui-card/ui-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, UiCard, TranslateModule],
  templateUrl: './analytics.html',
})
export class Analytics implements OnInit {
  private analyticsService = inject(AnalyticsService);

  data = signal<PlatformAnalytics | null>(null);
  loading = signal(true);

  icons = { TrendingUp, Users, DollarSign, Activity, BarChart3 };

  // Computed Metrics
  userGrowthPct = computed(() => {
    const d = this.data();
    if (!d || d.userGrowth.previous30Days === 0) return 0;
    const diff = d.userGrowth.last30Days - d.userGrowth.previous30Days;
    return Math.round((diff / d.userGrowth.previous30Days) * 100);
  });

  ngOnInit() {
    this.analyticsService.getPlatformAnalytics().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
