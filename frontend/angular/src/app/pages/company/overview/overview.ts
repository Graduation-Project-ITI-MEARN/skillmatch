import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Eye,
  Clock,
  Users,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  UserCheck,
  Search,
  Filter,
  X,
} from 'lucide-angular';

import { environment } from 'src/environments/environment';

interface Challenge {
  id: string;
  title: string;
  category: string;
  level: string;
  status: 'Active' | 'Draft' | 'Closed' | 'Evaluating';
  applications: number;
  topScore: number;
  qualified: number;
  daysRemaining: number;
  budget: number;
}

interface Activity {
  id: string;
  type: 'application' | 'shortlist' | 'completed' | 'closed';
  challengeTitle: string;
  candidateName?: string;
  timestamp: string;
}

interface FilterOptions {
  jobTypes: { label: string; count: number; value: string }[];
  statuses: { label: string; count: number; value: string }[];
  budgets: { label: string; count: number; value: string }[];
}

@Component({
  selector: 'app-company-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, FormsModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
})
export class Overview implements OnInit {
  private http = inject(HttpClient);

  // Icons
  icons = {
    Eye,
    Clock,
    Users,
    Target,
    TrendingUp,
    Calendar,
    FileText,
    UserCheck,
    Search,
    Filter,
    X,
  };

  // Loading states
  isLoadingChallenges = true;
  isLoadingActivity = true;

  // Data
  allChallenges: Challenge[] = [];
  challenges: Challenge[] = [];
  activities: Activity[] = [];

  // Search & Filter
  searchQuery: string = '';
  isFilterOpen: boolean = false;
  selectedJobTypes: string[] = [];
  selectedStatuses: string[] = [];
  selectedBudgets: string[] = [];

  filterOptions: FilterOptions = {
  jobTypes: [
    { label: 'DASHBOARD.FILTERS.CODING', count: 0, value: 'coding' },
    { label: 'DASHBOARD.FILTERS.DESIGN', count: 0, value: 'design' },
    { label: 'DASHBOARD.FILTERS.MARKETING', count: 0, value: 'marketing' },
  ],
  statuses: [
    { label: 'DASHBOARD.FILTERS.ACTIVE', count: 0, value: 'active' },
    { label: 'DASHBOARD.FILTERS.EVALUATING', count: 0, value: 'evaluating' },
    { label: 'DASHBOARD.FILTERS.CLOSED', count: 0, value: 'closed' },
  ],
  budgets: [
    { label: 'DASHBOARD.FILTERS.BUDGET_0_500', count: 0, value: '0-500' },
    { label: 'DASHBOARD.FILTERS.BUDGET_500_1000', count: 0, value: '500-1000' },
    { label: 'DASHBOARD.FILTERS.BUDGET_1000_PLUS', count: 0, value: '1000+' },
  ],
};


  // Dummy Hiring Insights ONLY (as per requirements)
  hiringInsights = {
    highQualityCandidates: 3,
    avgEvaluationTime: '24 hours',
    isPowered: true,
  };

  async ngOnInit() {
    await Promise.all([this.loadChallenges(), this.loadActivity()]);
  }

  private async loadChallenges() {
    try {
      const response: any = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/challenges/mine`)
      );

      let data = response.challenges || response;
      if (!Array.isArray(data)) {
        data = [];
      }

      this.allChallenges = data.map((c: any) => ({
        id: c.id || c._id,
        title: c.title || 'Untitled Challenge',
        category: c.category || 'General',
        level: c.level || c.difficulty || 'Intermediate',
        status: this.mapStatus(c.status),
        applications: c.applications || c.submissions?.length || 0,
        topScore: c.topScore || c.maxScore || 0,
        qualified: c.qualified || c.qualifiedCount || 0,
        daysRemaining: this.calculateDaysRemaining(c.deadline || c.endDate),
        budget: c.budget || c.prize || 0,
      }));

      this.challenges = [...this.allChallenges];
      this.updateFilterCounts();
      this.isLoadingChallenges = false;
    } catch (error) {
      console.error('Error loading challenges:', error);
      this.allChallenges = [];
      this.challenges = [];
      this.isLoadingChallenges = false;
    }
  }

  private async loadActivity() {
    try {
      const response: any = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/activity`)
      );

      let data = response.activities || response;
      if (!Array.isArray(data)) {
        data = [];
      }

      this.activities = data.slice(0, 5).map((a: any) => ({
        id: a.id || a._id,
        type: this.mapActivityType(a.type || a.action),
        challengeTitle: a.challengeTitle || a.challenge?.title || 'Unknown Challenge',
        candidateName: a.candidateName || a.candidate?.name,
        timestamp: this.formatTimestamp(a.timestamp || a.createdAt),
      }));

      this.isLoadingActivity = false;
    } catch (error) {
      console.error('Error loading activity:', error);
      this.activities = [];
      this.isLoadingActivity = false;
    }
  }

  // Search functionality
  onSearch() {
    this.applyFilters();
  }

  onSearchBlur() {
    this.applyFilters();
  }

  // Filter functionality
  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  closeFilter() {
    this.isFilterOpen = false;
  }

  toggleJobType(value: string) {
    const index = this.selectedJobTypes.indexOf(value);
    if (index > -1) {
      this.selectedJobTypes.splice(index, 1);
    } else {
      this.selectedJobTypes.push(value);
    }
  }

  toggleStatus(value: string) {
    const index = this.selectedStatuses.indexOf(value);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      this.selectedStatuses.push(value);
    }
  }

  toggleBudget(value: string) {
    const index = this.selectedBudgets.indexOf(value);
    if (index > -1) {
      this.selectedBudgets.splice(index, 1);
    } else {
      this.selectedBudgets.push(value);
    }
  }

  clearAllFilters() {
    this.selectedJobTypes = [];
    this.selectedStatuses = [];
    this.selectedBudgets = [];
    this.searchQuery = '';
    this.applyFilters();
  }

  applyFiltersAndClose() {
    this.applyFilters();
    this.closeFilter();
  }

  private applyFilters() {
    let filtered = [...this.allChallenges];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    // Job type filter
    if (this.selectedJobTypes.length > 0) {
      filtered = filtered.filter((c) =>
        this.selectedJobTypes.includes(c.category.toLowerCase())
      );
    }

    // Status filter
    if (this.selectedStatuses.length > 0) {
      filtered = filtered.filter((c) =>
        this.selectedStatuses.includes(c.status.toLowerCase())
      );
    }

    // Budget filter
    if (this.selectedBudgets.length > 0) {
      filtered = filtered.filter((c) => {
        for (const range of this.selectedBudgets) {
          if (this.matchesBudgetRange(c.budget, range)) {
            return true;
          }
        }
        return false;
      });
    }

    this.challenges = filtered;
  }

  private matchesBudgetRange(budget: number, range: string): boolean {
    if (range === '0-500') return budget >= 0 && budget <= 500;
    if (range === '500-1000') return budget > 500 && budget <= 1000;
    if (range === '1000+') return budget > 1000;
    return false;
  }

  private updateFilterCounts() {
    // Job types
    this.filterOptions.jobTypes.forEach((jt) => {
      jt.count = this.allChallenges.filter(
        (c) => c.category.toLowerCase() === jt.value
      ).length;
    });

    // Statuses
    this.filterOptions.statuses.forEach((s) => {
      s.count = this.allChallenges.filter(
        (c) => c.status.toLowerCase() === s.value
      ).length;
    });

    // Budgets
    this.filterOptions.budgets.forEach((b) => {
      b.count = this.allChallenges.filter((c) => this.matchesBudgetRange(c.budget, b.value))
        .length;
    });
  }

  get activeFiltersCount(): number {
    return (
      this.selectedJobTypes.length + this.selectedStatuses.length + this.selectedBudgets.length
    );
  }

  // Helper functions
  private mapStatus(status: string): 'Active' | 'Draft' | 'Closed' | 'Evaluating' {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'published') return 'Active';
    if (s === 'draft') return 'Draft';
    if (s === 'evaluating' || s === 'evaluation') return 'Evaluating';
    return 'Closed';
  }

  private mapActivityType(type: string): 'application' | 'shortlist' | 'completed' | 'closed' {
    const t = (type || '').toLowerCase();
    if (t.includes('application') || t.includes('submit')) return 'application';
    if (t.includes('shortlist') || t.includes('qualified')) return 'shortlist';
    if (t.includes('complete')) return 'completed';
    return 'closed';
  }

  private calculateDaysRemaining(deadline: string | Date): number {
    if (!deadline) return 0;
    const end = new Date(deadline);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  private formatTimestamp(timestamp: string | Date): string {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }

  getActivityIcon(type: string) {
    switch (type) {
      case 'application':
        return FileText;
      case 'shortlist':
        return UserCheck;
      case 'completed':
        return Target;
      case 'closed':
        return Clock;
      default:
        return FileText;
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'application':
        return 'text-blue-600';
      case 'shortlist':
        return 'text-green-600';
      case 'completed':
        return 'text-purple-600';
      case 'closed':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Evaluating':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}
