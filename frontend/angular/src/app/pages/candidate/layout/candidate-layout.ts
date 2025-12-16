import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CandidateService } from 'src/app/core/services/candidateService';

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
export class CandidateShellComponent implements OnInit, OnDestroy {
  private theme = inject(ThemeService);
  private candidateService = inject(CandidateService);
  private translate = inject(TranslateService);

  user: any = { name: 'Candidate' };
  initials = '';

  icons = { Trophy, Target, TrendingUp, Award };

  private langSub: Subscription | undefined;
  private readonly API_URL = environment.apiUrl;

  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/candidate/overview', icon: Target },
    { labelKey: 'DASHBOARD.TABS.PORTFOLIO', route: '/dashboard/candidate/portfolio', icon: Star },
    { labelKey: 'DASHBOARD.TABS.COACH', route: '/dashboard/candidate/coach', icon: Brain },
    { labelKey: 'DASHBOARD.TABS.LEADERBOARD', route: '/dashboard/candidate/leaderboard', icon: Trophy },
  ];

  stats = [
    { id: 'completed', labelKey: 'DASHBOARD.STATS.COMPLETED', value: '...', trend: '+3 this week', icon: Trophy },
    { id: 'score', labelKey: 'DASHBOARD.STATS.SCORE', value: '...', trend: '+12 points', icon: Target },
    { id: 'rank', labelKey: 'DASHBOARD.STATS.RANK', value: '...', trend: 'Top 5%', icon: TrendingUp },
    { id: 'earnings', labelKey: 'DASHBOARD.STATS.EARNINGS', value: '...', trend: '+$500', icon: Award },
  ];

  ngOnInit() {
    this.theme.setTheme('candidate');
    this.loadDashboardData();
    this.setupLanguageListener();
  }

  loadDashboardData() {
    forkJoin({
      user: this.candidateService.getMe(),
      stats: this.candidateService.getCandidateStats()
    }).subscribe({
      next: (response) => {

        this.user = response.user?.data || response.user?.data || {};
        console.log('User Data:', this.user);
        console.log('Stats Data:', response.stats);

        this.calculateInitials(this.user.name);

        // Mapping stats
        this.updateStatValue('completed', response.stats?.mySubmissions ?? 0);
        this.updateStatValue('score', response.stats?.challengesWon ?? 0);
        this.updateStatValue('rank', `#${response.stats?.globalRank ?? 0}`);
        this.updateStatValue('earnings', `$${response.stats?.totalRevenue ?? 0}`);
      },
      error: (err) => console.error('Failed to load dashboard data', err)
    });
  }

  private updateStatValue(id: string, newValue: string) {
    const statIndex = this.stats.findIndex(s => s.id === id);
    if (statIndex !== -1) {
      this.stats[statIndex] = { ...this.stats[statIndex], value: newValue };
    }
  }

  private calculateInitials(name: string) {
    if (!name) return;
    const parts = name.split(' ');
    this.initials = parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  private setupLanguageListener() {
    this.updateDirection(this.translate.currentLang);

    this.langSub = this.translate.onLangChange.subscribe((event) => {
      this.updateDirection(event.lang);
    });
  }

  private updateDirection(lang: string) {
    const isRtl = lang === 'ar';
    document.body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.body.classList.toggle('rtl-mode', isRtl);
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}
