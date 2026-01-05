import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Eye,
  Users,
  TrendingUp,
  Search,
  Filter,
  X,
  Plus,
  Edit,
  Trash2,
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

interface InsightsData {
  mostPopularSkill: string;
  highQualityCandidates: number;
  recommendedAction: string;
}

interface HiringInsights {
  totalChallenges: number;
  totalSubmissions?: number;
  averageScore?: number;
  insights: InsightsData | null;
}

interface ChallengeBackendData {
  _id: string;
  title: string;
  category: string;
  status: string;
  deadline: string;
  prizeAmount?: number;
  salary?: number;
  submissionsCount?: number;
  avgAiScore?: number;
  topScore?: number;
}

interface ChallengeFrontendData {
  _id: string;
  title: string;
  category: string;
  status: string;
  applications: number;
  topScore: number;
  avgAiScore: number;
  qualified: number;
  daysRemaining: number;
  budget: number;
}

@Component({
  selector: 'app-company-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, FormsModule, RouterModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
})
export class Overview implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  icons = { Eye, Users, TrendingUp, Search, Filter, X, Plus, Edit, Trash2 };

  challengerStats = {
    totalChallenges: 0,
    totalSubmissions: 0,
    averageAiScore: 0,
    averagePrizeAmount: 0,
  };
  isLoadingChallenges = true;
  isLoadingHiringInsights = true;
  allChallenges: ChallengeFrontendData[] = [];
  challenges: ChallengeFrontendData[] = [];
  hiringInsights: HiringInsights | null = null;

  searchQuery = '';
  isFilterOpen = false;
  selectedStatuses: string[] = [];
  selectedBudgets: string[] = [];
  selectedJobTypes: string[] = [];
  activeFiltersCount = 0;

  filterOptions = {
    jobTypes: [
      { label: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.CODING', count: 0, value: 'coding' },
      { label: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.DESIGN', count: 0, value: 'design' },
      { label: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.MARKETING', count: 0, value: 'marketing' },
    ],
    statuses: [
      { label: 'DASHBOARD.CO-OVERVIEW.FILTERS.ACTIVE', count: 0, value: 'active' },
      { label: 'DASHBOARD.CO-OVERVIEW.FILTERS.EVALUATING', count: 0, value: 'evaluating' },
      { label: 'DASHBOARD.CO-OVERVIEW.FILTERS.CLOSED', count: 0, value: 'closed' },
    ],
    budgets: [
      { label: 'DASHBOARD.CO-OVERVIEW.FILTERS.BUDGET_0_500', count: 0, value: '0-500' },
      { label: 'DASHBOARD.CO-OVERVIEW.FILTERS.BUDGET_500_1000', count: 0, value: '500-1000' },
      { label: 'DASHBOARD.CO-OVERVIEW.FILTERS.BUDGET_1000_PLUS', count: 0, value: '1000+' },
    ],
  };

  async ngOnInit() {
    await Promise.all([
      this.loadChallengerStats(),
      this.loadChallenges(),
      this.loadHiringInsights(),
    ]);
  }

  async loadChallengerStats() {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/stats/challenger`)
      );
      if (response.success || response.data) {
        this.challengerStats = response.data || response;
      }
    } catch (error) {
      console.error('Error loading challenger stats:', error);
    }
  }

  private async loadChallenges() {
    try {
      const res: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/challenges/mine`));
      const data: ChallengeBackendData[] = res.data || res;

      this.allChallenges = data.map((c) => ({
        _id: c._id,
        title: c.title,
        category: this.translateCategory(c.category),
        status: this.mapStatus(c.status),
        applications: c.submissionsCount || 0,
        topScore: c.topScore || 0,
        avgAiScore: c.avgAiScore || 0,
        qualified: Math.floor((c.submissionsCount || 0) * 0.8),
        daysRemaining: this.calculateDaysRemaining(c.deadline),
        budget: c.prizeAmount || c.salary || 0,
      }));

      this.challenges = [...this.allChallenges];
    } finally {
      this.isLoadingChallenges = false;
    }
  }

  private async loadHiringInsights() {
    try {
      const res: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/ai/hiring-insights`)
      );
      this.hiringInsights = res.data ?? null;
    } finally {
      this.isLoadingHiringInsights = false;
    }
  }

  private translateCategory(cat: string) {
    const map: any = {
      development: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.CODING',
      design: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.DESIGN',
      marketing: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.MARKETING',
    };
    return map[cat?.toLowerCase()] || cat;
  }

  private mapStatus(s: string) {
    if (s === 'published') return 'active';
    if (s === 'draft') return 'evaluating';
    return 'closed';
  }

  private calculateDaysRemaining(d: string) {
    return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  trackById(index: number, item: any) {
    return item._id;
  }

  createNewJob() {
    this.router.navigate(['/dashboard/company/challenge/create']);
  }

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  closeFilter() {
    this.isFilterOpen = false;
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase();
    this.challenges = this.allChallenges.filter((c) => c.title.toLowerCase().includes(q));
  }

  toggleJobType(value: string) {
    /* logic */
  }
  toggleStatus(value: string) {
    /* logic */
  }
  toggleBudget(value: string) {
    /* logic */
  }
  clearAllFilters() {
    /* logic */
  }
  applyFiltersAndClose() {
    /* logic */
  }
  viewApplications(id: string) {
    this.router.navigate([`/dashboard/company/challenge/${id}/applications`]);
  }
}
