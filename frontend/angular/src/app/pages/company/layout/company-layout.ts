import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  LucideAngularModule,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Plus,
  Eye,
} from 'lucide-angular';

import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';

@Component({
  selector: 'app-company-shell',
  standalone: true,
  imports: [
    CommonModule,
    DashboardLayoutComponent,
    ZardStatComponent,
    LucideAngularModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './company-layout.html',
})
export class CompanyShellComponent implements OnInit {
  private theme = inject(ThemeService);

  name = 'TechCorp Inc.';
  initials = 'TC';

  icons = { Briefcase, Users, FileText, BarChart3 };

  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/company/overview', icon: BarChart3 },
    {
      labelKey: 'DASHBOARD.TABS.SUBMISSIONS',
      route: '/dashboard/company/submissions',
      icon: FileText,
    },
    { labelKey: 'DASHBOARD.TABS.TALENT', route: '/dashboard/company/talent', icon: Users },
    { labelKey: 'DASHBOARD.TABS.ANALYTICS', route: '/dashboard/company/analytics', icon: Eye },
  ];

  stats = [
    {
      labelKey: 'DASHBOARD.STATS.ACTIVE_JOBS',
      value: '8',
      trend: '+2 this month',
      icon: Briefcase,
    },
    {
      labelKey: 'DASHBOARD.STATS.APPLICANTS',
      value: '142',
      trend: '+18% vs last week',
      icon: FileText,
    },
    { labelKey: 'DASHBOARD.STATS.INTERVIEWS', value: '12', trend: '4 today', icon: Users },
    { labelKey: 'DASHBOARD.STATS.HIRED', value: '3', trend: 'On track', icon: BarChart3 },
  ];

  ngOnInit() {
    this.theme.setTheme('company');
  }
}
