import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
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
import { TranslateService, TranslateModule } from '@ngx-translate/core'; // Import Service
import { DashboardLayoutComponent, DashboardTab } from '@shared/layouts/dashboard/dashboard';
import { ZardStatComponent } from '@shared/components/zard-ui/ui-stats-card.component';
import { ThemeService } from 'src/app/core/services/theme';
import { RouterModule } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  private http = inject(HttpClient); // Inject HTTP
  private translate = inject(TranslateService); // Inject Translate

  // User Data State
  user: any = { name: 'Candidate' }; // Default fallback
  initials = '';

  // Icons
  icons = { Trophy, Target, TrendingUp, Award };

  private langSub: Subscription | undefined;
  private readonly API_URL = environment.apiUrl;

  // Tabs Configuration
  tabs: DashboardTab[] = [
    { labelKey: 'DASHBOARD.TABS.OVERVIEW', route: '/dashboard/candidate/overview', icon: Target },
    { labelKey: 'DASHBOARD.TABS.PORTFOLIO', route: '/dashboard/candidate/portfolio', icon: Star },
    { labelKey: 'DASHBOARD.TABS.COACH', route: '/dashboard/candidate/coach', icon: Brain },
    { labelKey: 'DASHBOARD.TABS.LEADERBOARD', route: '/dashboard/candidate/leaderboard', icon: Trophy },
  ];

  // Stats Array (Initialized with default/loading values)
  // Note: Trends are hardcoded here as requested since API doesn't return them
  stats = [
    { id: 'completed', labelKey: 'DASHBOARD.STATS.COMPLETED', value: '...', trend: '+3 this week', icon: Trophy },
    { id: 'score', labelKey: 'DASHBOARD.STATS.SCORE', value: '...', trend: '+12 points', icon: Target },
    { id: 'rank', labelKey: 'DASHBOARD.STATS.RANK', value: '...', trend: 'Top 5%', icon: TrendingUp },
    { id: 'earnings', labelKey: 'DASHBOARD.STATS.EARNINGS', value: '...', trend: '+$500', icon: Award },
  ];

  ngOnInit() {
    // 1. Set Theme
    this.theme.setTheme('candidate');

    // 2. Fetch Data
    this.loadDashboardData();

    // 3. Setup RTL/Language Listener
    this.setupLanguageListener();
  }

  loadDashboardData() {

    // Using forkJoin to call both endpoints in parallelءء
    forkJoin({
      user: this.http.get<any>(`${this.API_URL}/auth/me`),
      stats: this.http.get<any>(`${this.API_URL}/stats/candidate`)
    }).subscribe({
      next: (response) => {
        // Handle User Data
        this.user = response.user.data;
        console.log('User Data:', this.user);
        console.log('Stats Data:', response.stats);
        this.calculateInitials(this.user.name);

        // Handle Stats Data
        // Mapping API response fields to our UI stats array
        this.updateStatValue('completed', response.stats.mySubmissions?? 0);
        this.updateStatValue('score', response.stats.challengesWon?? 0);
        this.updateStatValue('rank', `#${response.stats.globalRank?? 0}`);
        this.updateStatValue('earnings', `$${response.stats.totalRevenue ?? 0}`);
      },
      error: (err) => console.error('Failed to load dashboard data', err)
    });
  }

  // Helper to update specific stat by ID
  private updateStatValue(id: string, newValue: string) {
    const statIndex = this.stats.findIndex(s => s.id === id);
    if (statIndex !== -1) {
      // Create a new object to trigger change detection if needed
      this.stats[statIndex] = { ...this.stats[statIndex], value: newValue };
    }
  }


  private calculateInitials(name: string) {
    if (!name) return;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      this.initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      this.initials = name.slice(0, 2).toUpperCase();
    }
  }

  // RTL Setup
  private setupLanguageListener() {
    // Check initial language
    this.updateDirection(this.translate.currentLang);

    // Listen for changes
    this.langSub = this.translate.onLangChange.subscribe((event) => {
      this.updateDirection(event.lang);
    });
  }

  private updateDirection(lang: string) {
    const isRtl = lang === 'ar';
    document.body.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    if (isRtl) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }
  }

  ngOnDestroy() {
    if (this.langSub) this.langSub.unsubscribe();
  }
}
