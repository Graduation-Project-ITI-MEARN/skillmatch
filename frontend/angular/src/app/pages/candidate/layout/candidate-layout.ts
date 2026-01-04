import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // Import DecimalPipe
import {
  LucideAngularModule,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  Brain,
  Medal,
  CircleUserRound,
  Gauge, // New icon for highest AI score
  BarChart, // New icon for global rank
  ListChecks, // New icon for amount of challenges
  Activity, // Re-use Activity for average score
} from 'lucide-angular';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CandidateService } from 'src/app/core/services/candidateService';
import { NotificationsDropdownComponent } from '@shared/components/notifications-dropdown/notifications-dropdown.component';

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
    NotificationsDropdownComponent,
    DecimalPipe, // Add DecimalPipe to imports
  ],
  templateUrl: './candidate-layout.html',
  providers: [DecimalPipe], // Provide DecimalPipe for local component usage
})
export class CandidateShellComponent implements OnInit, OnDestroy {
  private theme = inject(ThemeService);
  private candidateService = inject(CandidateService);
  private translate = inject(TranslateService);
  private decimalPipe = inject(DecimalPipe); // Inject DecimalPipe

  user: any = { name: 'Candidate' };
  initials = '';

  // Updated icons to include new ones for stats
  icons = {
    Trophy,
    Target,
    TrendingUp,
    Award,
    Brain,
    Medal,
    CircleUserRound,
    Gauge,
    BarChart,
    ListChecks,
    Star,
    Activity,
  };

  private langSub: Subscription | undefined;
  private readonly API_URL = environment.apiUrl;

  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/candidate/overview', icon: Target },
    { labelKey: 'DASHBOARD.TABS.PORTFOLIO', route: '/dashboard/candidate/portfolio', icon: Star },
    { labelKey: 'DASHBOARD.TABS.COACH', route: '/dashboard/candidate/coach', icon: Brain },
    {
      labelKey: 'DASHBOARD.TABS.LEADERBOARD',
      route: '/dashboard/candidate/leaderboard',
      icon: Trophy,
    },
    {
      labelKey: 'DASHBOARD.TABS.SUBMISSIONS',
      route: '/dashboard/candidate/mysubmissions',
      icon: ListChecks, // Changed icon for submissions
    },
    {
      labelKey: 'DASHBOARD.TABS.PROFILE',
      route: '/dashboard/candidate/profile',
      icon: CircleUserRound,
    },
  ];

  // Updated stats array for new data
  stats = [
    {
      id: 'amountOfChallenges',
      labelKey: 'DASHBOARD.STATS.CHALLENGES_COMPLETED', // New label key
      value: '...',
      trend: '', // Can remove or set dynamically if you have this data
      icon: ListChecks, // New icon
    },
    {
      id: 'challengesWon',
      labelKey: 'DASHBOARD.STATS.CHALLENGES_WON', // New label key
      value: '...',
      trend: '',
      icon: Award, // Reusing Award icon
    },
    {
      id: 'highestAiScore',
      labelKey: 'DASHBOARD.STATS.HIGHEST_AI_SCORE', // New label key
      value: '...',
      trend: '',
      icon: Gauge, // New icon
    },
    {
      id: 'averageAiScore',
      labelKey: 'DASHBOARD.STATS.AVERAGE_AI_SCORE', // New label key
      value: '...',
      trend: '',
      icon: Activity, // Reusing Activity icon
    },
    {
      id: 'globalRank',
      labelKey: 'DASHBOARD.STATS.GLOBAL_RANK', // New label key
      value: '...',
      trend: '',
      icon: BarChart, // New icon
    },
  ];

  ngOnInit() {
    this.theme.setTheme('candidate');
    this.loadDashboardData();
    this.setupLanguageListener();
  }

  loadDashboardData() {
    forkJoin({
      user: this.candidateService.getMe(),
      stats: this.candidateService.getCandidateStats(), // This fetches the new stats
    }).subscribe({
      next: (response) => {
        // Adjust user data access based on your actual API response structure
        this.user = response.user?.data?.user || response.user?.data || {};
        console.log('User Data:', this.user);
        console.log('Stats Data:', response.stats);

        this.calculateInitials(this.user.name);

        const candidateStats = response.stats?.data || {}; // Access the 'data' property of the stats response

        // Update the stats array with real data, applying formatting and handling null/undefined
        this.updateStatValue(
          'amountOfChallenges',
          candidateStats.amountOfChallenges?.toString() ?? '0'
        );
        this.updateStatValue('challengesWon', candidateStats.challengesWon?.toString() ?? '0');
        this.updateStatValue(
          'highestAiScore',
          `${this.decimalPipe.transform(candidateStats.highestAiScore, '1.0-0') ?? '0'}%`
        ); // Formatted as X%
        this.updateStatValue(
          'averageAiScore',
          `${this.decimalPipe.transform(candidateStats.averageAiScore, '1.1-1') ?? '0.0'}%`
        ); // Formatted as X.Y%
        this.updateStatValue('globalRank', `#${candidateStats.globalRank?.toString() ?? '0'}`);
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        // Optionally, reset stats to '0' or default loading state on error
        this.stats.forEach((stat) => (stat.value = '0'));
      },
    });
  }

  private updateStatValue(id: string, newValue: string) {
    const statIndex = this.stats.findIndex((s) => s.id === id);
    if (statIndex !== -1) {
      this.stats[statIndex] = { ...this.stats[statIndex], value: newValue };
    }
  }

  private calculateInitials(name: string) {
    if (!name) return;
    const parts = name.split(' ');
    this.initials =
      parts.length >= 2
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
