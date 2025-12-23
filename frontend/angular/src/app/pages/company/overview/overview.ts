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
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-company-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, FormsModule,RouterModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css'],
})
export class Overview implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);


  icons = { Eye, Users, TrendingUp, Search, Filter, X, Plus, Edit };

  isLoadingChallenges = true;
  isLoadingActivity = true;
  allChallenges: any[] = [];
  challenges: any[] = [];
  activities: any[] = [];

  searchQuery: string = '';
  isFilterOpen: boolean = false;
  selectedStatuses: string[] = [];
  selectedBudgets: string[] = [];

  // Add missing methods for job types
  selectedJobTypes: string[] = [];

  filterOptions = {
    jobTypes: [
      { label: 'DASHBOARD.OVERVIEW.CATEGORIES.CODING', count: 0, value: 'coding' },
      { label: 'DASHBOARD.OVERVIEW.CATEGORIES.DESIGN', count: 0, value: 'design' },
      { label: 'DASHBOARD.OVERVIEW.CATEGORIES.MARKETING', count: 0, value: 'marketing' },
    ],
    statuses: [
      { label: 'DASHBOARD.OVERVIEW.FILTERS.ACTIVE', count: 0, value: 'active' },
      { label: 'DASHBOARD.OVERVIEW.FILTERS.EVALUATING', count: 0, value: 'evaluating' },
      { label: 'DASHBOARD.OVERVIEW.FILTERS.CLOSED', count: 0, value: 'closed' },
    ],
    budgets: [
      { label: 'DASHBOARD.OVERVIEW.FILTERS.BUDGET_0_500', count: 0, value: '0-500' },
      { label: 'DASHBOARD.OVERVIEW.FILTERS.BUDGET_500_1000', count: 0, value: '500-1000' },
      { label: 'DASHBOARD.OVERVIEW.FILTERS.BUDGET_1000_PLUS', count: 0, value: '1000+' },
    ],
  };

  async ngOnInit() {
    await Promise.all([this.loadChallenges(), this.loadActivity()]);
  }

  private async loadChallenges() {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/challenges/mine`)
      );
      const data = response.data || response;

      this.allChallenges = (Array.isArray(data) ? data : Object.values(data)).map((c: any) => ({
        id: c._id,
        title: c.title,
        category: this.translateCategory(c.category),
        status: this.mapStatus(c.status),
        applications: c.submissionsCount || 0,
        topScore: c.highestScore || 0,
        qualified: Math.floor((c.submissionsCount || 0) * 0.8),
        daysRemaining: this.calculateDaysRemaining(c.deadline),
        budget: c.prizeAmount || 0,
      }));

      this.challenges = [...this.allChallenges];
      this.updateFilterCounts();
      this.isLoadingChallenges = false;
      console.log('Challenge IDs:', this.allChallenges.map(c => c.id));
    } catch (error) {
      console.error('Error loading challenges:', error);
      this.isLoadingChallenges = false;
    }
  }

  private async loadActivity() {
    try {
      const response: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/activity`));
      const data = response.data || response || [];
      this.activities = data.slice(0, 5).map((a: any) => ({
        id: a._id,
        type: this.mapActivityType(a.type),
        challengeTitle: a.challengeId?.title || 'Update',
        timestamp: this.formatTimestamp(a.createdAt),
      }));
      this.isLoadingActivity = false;
    } catch (error) {
      console.error('Error loading activity:', error);
      this.isLoadingActivity = false;
    }
  }

  // Filter Logic
  toggleFilter() {
  console.log('الزر ضُغط!'); // سيظهر في الـ Console عند الضغط
  this.isFilterOpen = !this.isFilterOpen;
  console.log('حالة الفلتر الآن:', this.isFilterOpen);
}

clearAllFilters() {
    this.selectedStatuses = [];
    this.selectedBudgets = [];
    this.searchQuery = '';
    this.applyFilters();
  }


  closeFilter() {
    this.isFilterOpen = false;
  }

  toggleStatus(v: string) {
    this.toggleInArray(this.selectedStatuses, v);
  }

  toggleBudget(v: string) {
    this.toggleInArray(this.selectedBudgets, v);
  }

  toggleJobType(v: string) {
    this.toggleInArray(this.selectedJobTypes, v);
  }

  private toggleInArray(arr: string[], v: string) {
    const i = arr.indexOf(v);
    i > -1 ? arr.splice(i, 1) : arr.push(v);
  }


  applyFiltersAndClose() {
    this.applyFilters();
    this.closeFilter();
  }

  applyFilters() {
    let filtered = [...this.allChallenges];

    // Search filter
    if (this.searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Job Type filter
    if (this.selectedJobTypes.length > 0) {
      filtered = filtered.filter((c) =>
        this.selectedJobTypes.some((type) => c.category.toLowerCase().includes(type.toLowerCase()))
      );
    }

    // Status filter
    if (this.selectedStatuses.length > 0) {
      filtered = filtered.filter((c) => this.selectedStatuses.includes(c.status.toLowerCase()));
    }

    // Budget filter
    if (this.selectedBudgets.length > 0) {
      filtered = filtered.filter((c) =>
        this.selectedBudgets.some((range) => this.matchesBudgetRange(c.budget, range))
      );
    }

    this.challenges = filtered;
  }

  private matchesBudgetRange(budget: number, range: string): boolean {
    if (range === '0-500') return budget <= 500;
    if (range === '500-1000') return budget > 500 && budget <= 1000;
    if (range === '1000+') return budget > 1000;
    return false;
  }

  private updateFilterCounts() {
    this.filterOptions.jobTypes.forEach(
      (jt) =>
        (jt.count = this.allChallenges.filter((c) =>
          c.category.toLowerCase().includes(jt.value.toLowerCase())
        ).length)
    );
    this.filterOptions.statuses.forEach(
      (s) => (s.count = this.allChallenges.filter((c) => c.status.toLowerCase() === s.value).length)
    );
    this.filterOptions.budgets.forEach(
      (b) =>
        (b.count = this.allChallenges.filter((c) =>
          this.matchesBudgetRange(c.budget, b.value)
        ).length)
    );
  }

  get activeFiltersCount(): number {
    return (
      this.selectedJobTypes.length + this.selectedStatuses.length + this.selectedBudgets.length
    );
  }

  // Helpers
  private translateCategory(cat: string): string {
    const map: any = {
      coding: 'DASHBOARD.OVERVIEW.CATEGORIES.CODING',
      design: 'DASHBOARD.OVERVIEW.CATEGORIES.DESIGN',
      marketing: 'DASHBOARD.OVERVIEW.CATEGORIES.MARKETING',
      data_science: 'OVERVIEW.CATEGORIES.DATA_SCIENCE',
      product_management: 'OVERVIEW.CATEGORIES.PRODUCT_MANAGEMENT',
    };
    return map[cat?.toLowerCase()] || cat || 'General';
  }

  private mapStatus(s: string): string {
    s = (s || '').toLowerCase();
    if (s === 'published' || s === 'active') return 'active';
    if (s === 'draft') return 'evaluating';
    return 'closed';
  }

  private mapActivityType(t: string): string {
    return t?.includes('app') || t?.includes('submit') ? 'application' : 'closed';
  }

  private calculateDaysRemaining(d: any): number {
    if (!d) return 0;
    const diff = new Date(d).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  private formatTimestamp(t: any): string {
    if (!t) return 'Just now';
    const diff = Date.now() - new Date(t).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  onSearch() {
    this.applyFilters();
  }

  getStatusClass(s: string): string {
    if (s === 'active') return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'evaluating') return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  }

  viewApplications(challengeId: string) {
    this.router.navigate(['/dashboard/company/submissions'], {
      queryParams: { challenge: challengeId },
    });
  }

//  editJob(id: string) {
//   if (!id) return;
//   // الـ / في البداية هي أهم جزء هنا
//   this.router.navigateByUrl(`/company/challenge/${id}/edit`);
// }


  createNewJob() {
    this.router.navigate(['/dashboard/company/challenge/create']);
  }
}
