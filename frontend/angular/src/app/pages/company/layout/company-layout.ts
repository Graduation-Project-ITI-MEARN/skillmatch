import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Eye,
} from 'lucide-angular';

import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { AuthService } from 'src/app/core/services/auth';
import { NotificationsDropdownComponent } from '@shared/components/notifications-dropdown/notifications-dropdown.component';
import { environment } from 'src/environments/environment';

interface CompanyStats {
  activeJobs?: number;
  totalSubmissions?: number;
  scheduledInterviews?: number;
  hiresMade?: number;
}

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
    NotificationsDropdownComponent,
  ],
  templateUrl: './company-layout.html',
})
export class CompanyShellComponent implements OnInit {
  private theme = inject(ThemeService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  name = '';
  initials = '';
  isLoading = true;

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

  stats: Array<{
    labelKey: string;
    value: string;
    trend: string;
    icon: any;
  }> = [];

  async ngOnInit() {
    this.theme.setTheme('company');
    await this.loadUserData();
    await this.loadStats();
    this.isLoading = false;
  }

  private async loadUserData() {
    try {
      const user = this.authService.currentUser();

      if (user) {
        // Get company name from user data
        this.name = user.companyName || user.name || 'Company';
        this.initials = this.generateInitials(this.name);
      } else {
        // Fallback: fetch from API
        const response = await firstValueFrom(
          this.http.get<any>(`${environment.apiUrl}/auth/me`)
        );

        this.name = response.companyName || response.name || 'Company';
        this.initials = this.generateInitials(this.name);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.name = 'Company';
      this.initials = 'CO';
    }
  }

  private async loadStats() {
    try {
      const statsData = await firstValueFrom(
        this.http.get<CompanyStats>(`${environment.apiUrl}/stats/company`)
      );

      // Build stats array with real data
      this.stats = [
        {
          labelKey: 'DASHBOARD.STATS.ACTIVE_JOBS',
          value: String(statsData.activeJobs || 0),
          trend: this.calculateTrend(statsData.activeJobs, 'month'), // Hardcoded trend
          icon: Briefcase,
        },
        {
          labelKey: 'DASHBOARD.STATS.APPLICANTS',
          value: String(statsData.totalSubmissions || 0),
          trend: this.calculateTrend(statsData.totalSubmissions, 'week'), // Hardcoded trend
          icon: FileText,
        },
        {
          labelKey: 'DASHBOARD.STATS.INTERVIEWS',
          value: String(statsData.scheduledInterviews || 0),
          trend: this.getTodayInterviews(statsData.scheduledInterviews), // Hardcoded
          icon: Users,
        },
        {
          labelKey: 'DASHBOARD.STATS.HIRED',
          value: String(statsData.hiresMade || 0),
          trend: 'On track', // Hardcoded
          icon: BarChart3,
        },
      ];
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to empty stats
      this.stats = [
        { labelKey: 'DASHBOARD.STATS.ACTIVE_JOBS', value: '-', trend: '', icon: Briefcase },
        { labelKey: 'DASHBOARD.STATS.APPLICANTS', value: '-', trend: '', icon: FileText },
        { labelKey: 'DASHBOARD.STATS.INTERVIEWS', value: '-', trend: '', icon: Users },
        { labelKey: 'DASHBOARD.STATS.HIRED', value: '-', trend: '', icon: BarChart3 },
      ];
    }
  }

  private generateInitials(name: string): string {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Hardcoded trend calculations (as per requirements)
  private calculateTrend(value: number | undefined, period: 'month' | 'week'): string {
    if (!value) return '';

    // Simple logic: if value > 5, show positive trend
    const percentage = value > 5 ? Math.floor(Math.random() * 20) + 10 : 0;

    if (period === 'month') {
      return value > 5 ? `+${Math.floor(value * 0.25)} this month` : 'New';
    } else {
      return value > 10 ? `+${percentage}% vs last week` : 'Growing';
    }
  }

  private getTodayInterviews(total: number | undefined): string {
    if (!total) return '';
    const today = Math.floor((total || 0) * 0.33); // Assume 33% are today
    return today > 0 ? `${today} today` : 'None today';
  }
}
