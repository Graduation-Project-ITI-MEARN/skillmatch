import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  LucideAngularModule,
  Shield,
  Users,
  Flag,
  DollarSign,
  Activity,
  Settings,
  LayoutGrid,
} from 'lucide-angular';

import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    ZardStatComponent,
    LucideAngularModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './admin-layout.html',
})
export class AdminShellComponent implements OnInit {
  private theme = inject(ThemeService);

  name = 'System Admin';
  initials = 'AD';

  icons = { Users, DollarSign, Flag, Activity };

  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/admin/overview', icon: LayoutGrid },
    { labelKey: 'DASHBOARD.TABS.USERS', route: '/dashboard/admin/users', icon: Users },
    { labelKey: 'DASHBOARD.TABS.MODERATION', route: '/dashboard/admin/moderation', icon: Flag },
    { labelKey: 'DASHBOARD.TABS.SETTINGS', route: '/dashboard/admin/settings', icon: Settings },
  ];

  stats = [
    {
      labelKey: 'DASHBOARD.STATS.TOTAL_USERS',
      value: '12,847',
      trend: '+124 this week',
      icon: Users,
    },
    {
      labelKey: 'DASHBOARD.STATS.REVENUE',
      value: '$47.2K',
      trend: '+18% growth',
      icon: DollarSign,
    },
    { labelKey: 'DASHBOARD.STATS.FLAGS', value: '23', trend: 'Requires attention', icon: Flag },
    { labelKey: 'DASHBOARD.STATS.HEALTH', value: '99.9%', trend: 'Operational', icon: Activity },
  ];

  ngOnInit() {
    this.theme.setTheme('admin');
  }
}
