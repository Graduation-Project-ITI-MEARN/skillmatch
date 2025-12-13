import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  LucideAngularModule,
  Zap,
  Users,
  DollarSign,
  Star,
  PlusCircle,
  CheckCircle,
} from 'lucide-angular';

import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';

@Component({
  selector: 'app-challenger-shell',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    ZardStatComponent,
    LucideAngularModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './challenger-layout.html',
})
export class ChallengerShellComponent implements OnInit {
  private theme = inject(ThemeService);

  name = 'Community Lead';
  initials = 'CL';

  icons = { Zap, Users, DollarSign, Star };

  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/challenger/overview', icon: Zap },
    { labelKey: 'DASHBOARD.TABS.NEW_BOUNTY', route: '/dashboard/challenger/new', icon: PlusCircle },
    {
      labelKey: 'DASHBOARD.TABS.SUBMISSIONS',
      route: '/dashboard/challenger/submissions',
      icon: Users,
    },
    {
      labelKey: 'DASHBOARD.TABS.COMPLETED',
      route: '/dashboard/challenger/completed',
      icon: CheckCircle,
    },
  ];

  stats = [
    { labelKey: 'DASHBOARD.STATS.BOUNTIES', value: '5', trend: 'Active now', icon: Zap },
    { labelKey: 'DASHBOARD.STATS.PARTICIPANTS', value: '890', trend: '+45 this week', icon: Users },
    {
      labelKey: 'DASHBOARD.STATS.PAID_OUT',
      value: '$12.5K',
      trend: 'Total Rewards',
      icon: DollarSign,
    },
    { labelKey: 'DASHBOARD.STATS.REPUTATION', value: '4.9', trend: 'Top Creator', icon: Star },
  ];

  ngOnInit() {
    this.theme.setTheme('challenger');
  }
}
