import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  Brain,
  Medal,
} from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-candidate-shell',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    ZardStatComponent,
    LucideAngularModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './candidate-layout.html',
})
export class CandidateShellComponent implements OnInit {
  private theme = inject(ThemeService);
  name = 'Henksh';
  initials = 'HS';

  icons = { Trophy, Target, TrendingUp, Award };

  // Define tabs with their routes
  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/candidate/overview', icon: Target },
    { labelKey: 'DASHBOARD.TABS.PORTFOLIO', route: '/dashboard/candidate/portfolio', icon: Star },
    { labelKey: 'DASHBOARD.TABS.COACH', route: '/dashboard/candidate/coach', icon: Brain },
    {
      labelKey: 'DASHBOARD.TABS.LEADERBOARD',
      route: '/dashboard/candidate/leaderboard',
      icon: Trophy,
    },
  ];

  stats = [
    { labelKey: 'DASHBOARD.STATS.COMPLETED', value: '24', trend: '+3 this week', icon: Trophy },
    { labelKey: 'DASHBOARD.STATS.SCORE', value: '87', trend: '+12 points', icon: Target },
    { labelKey: 'DASHBOARD.STATS.RANK', value: '#1,247', trend: 'Top 5%', icon: TrendingUp },
    { labelKey: 'DASHBOARD.STATS.EARNINGS', value: '$2,450', trend: '+$500', icon: Award },
  ];

  ngOnInit() {
    // Force candidate theme for this layout
    this.theme.setTheme('candidate');
  }
}
