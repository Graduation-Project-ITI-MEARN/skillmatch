import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  CircleUserRound,
} from 'lucide-angular';

import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { AuthService } from 'src/app/core/services/auth';
import { NotificationsDropdownComponent } from '@shared/components/notifications-dropdown/notifications-dropdown.component';
import { environment } from 'src/environments/environment';
import { ZardDialogService } from '@shared/components/zard-ui/dialog/dialog.service';
import { checkVerification } from 'src/app/core/guards/verification.guard';

interface CompanyStats {
  totalChallenges: number;
  totalSubmissions: number;
  totalHires: number;
  avgScore: number;
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
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(ZardDialogService);
  private router = inject(Router);

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
    {
      labelKey: 'DASHBOARD.TABS.PROFILE',
      route: '/dashboard/company/profile',
      icon: CircleUserRound,
    },
  ];

  stats: any[] = [];

  async ngOnInit() {
    this.theme.setTheme('company');
    await this.loadUserData();
    await this.loadStats();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  handleCreateChallenge() {
    // Check verification before navigating to create challenge
    if (checkVerification(this.authService.currentUser(), this.dialog)) {
      this.router.navigate(['/dashboard/company/create']);
    }
  }

  private async loadUserData() {
    try {
      const user = this.authService.currentUser();
      console.log(user);
      this.name = user?.name || 'Company';
      this.initials = this.generateInitials(this.name);
    } catch {
      this.name = 'Company';
      this.initials = 'CO';
    }
  }

  private async loadStats() {
    try {
      const statsData = await firstValueFrom(
        this.http.get<CompanyStats>(`${environment.apiUrl}/stats/company`)
      );

      this.stats = [
        {
          labelKey: 'DASHBOARD.STATS.ACTIVE_JOBS',
          value: String(statsData.totalChallenges ?? 0),
          trend: '+2 this month',
          icon: Briefcase,
        },
        {
          labelKey: 'DASHBOARD.STATS.APPLICANTS',
          value: String(statsData.totalSubmissions ?? 0),
          trend: '+5% vs last week',
          icon: FileText,
        },
        {
          labelKey: 'DASHBOARD.STATS.INTERVIEWS',
          value: String(statsData.avgScore ?? 0),
          trend: 'Average Score',
          icon: Users,
        },
        {
          labelKey: 'DASHBOARD.STATS.HIRED',
          value: String(statsData.totalHires ?? 0),
          trend: 'On track',
          icon: BarChart3,
        },
      ];
    } catch (error) {
      console.error('Error loading stats:', error);
      this.setFallbackStats();
    }
  }

  private setFallbackStats() {
    this.stats = [
      { labelKey: 'DASHBOARD.STATS.ACTIVE_JOBS', value: '0', trend: '', icon: Briefcase },
      { labelKey: 'DASHBOARD.STATS.APPLICANTS', value: '0', trend: '', icon: FileText },
      { labelKey: 'DASHBOARD.STATS.INTERVIEWS', value: '0', trend: '', icon: Users },
      { labelKey: 'DASHBOARD.STATS.HIRED', value: '0', trend: '', icon: BarChart3 },
    ];
  }

  private generateInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
}
