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

// --- NEW INTERFACES FOR HIRING INSIGHTS DATA (Optional but good practice) ---
interface InsightsData {
  mostPopularSkill: string;
  highQualityCandidates: number;
  recommendedAction: string;
}

interface HiringInsights {
  totalChallenges: number;
  totalSubmissions?: number;
  averageScore?: number;
  insights: InsightsData | null; // Can be null if no challenges
  // You can add other fields like topCandidates, skillDistribution, challengePerformance if you need them elsewhere
}

// Optional: Interface for the Challenge data received from the backend
interface ChallengeBackendData {
  _id: string;
  title: string;
  category: string;
  status: string;
  deadline: string;
  prizeAmount?: number;
  salary?: number;
  submissionsCount?: number; // Added from backend
  avgAiScore?: number; // Added from backend
  topScore?: number; // Added from backend (replaces highestScore)
  participants?: any[]; // Added from backend
  // ... other properties from IChallenge interface
}

// Optional: Interface for the Challenge data used in the frontend
interface ChallengeFrontendData {
  _id: string;
  title: string;
  category: string;
  status: string;
  applications: number;
  topScore: number;
  avgAiScore: number; // Added for frontend
  qualified: number;
  daysRemaining: number;
  budget: number;
  // ... other properties you might want to map
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

  isLoadingChallenges = true;
  isLoadingActivity = true;
  isLoadingHiringInsights = true;

  // Use the new interface for better type safety
  allChallenges: ChallengeFrontendData[] = [];
  challenges: ChallengeFrontendData[] = [];
  activities: any[] = [];
  hiringInsights: HiringInsights | null = null;

  searchQuery: string = '';
  isFilterOpen: boolean = false;
  selectedStatuses: string[] = [];
  selectedBudgets: string[] = [];
  selectedJobTypes: string[] = [];

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
    await Promise.all([this.loadChallenges(), this.loadActivity(), this.loadHiringInsights()]);
  }

  canModifyChallenge(challenge: ChallengeFrontendData): boolean {
    // Allowed if status is 'evaluating' (which maps to 'draft' on backend)
    // OR if there are 0 applications
    return challenge.status === 'evaluating' || challenge.applications === 0;
  }

  // NEW: Method to handle challenge deletion
  async deleteChallenge(challengeId: string) {
    if (!confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }

    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/challenges/${challengeId}`));
      // Remove the deleted challenge from the arrays
      this.allChallenges = this.allChallenges.filter((c) => c._id !== challengeId);
      this.challenges = this.challenges.filter((c) => c._id !== challengeId); // Update filtered list
      this.updateFilterCounts(); // Re-calculate filter counts
      console.log(`Challenge ${challengeId} deleted successfully.`);
      // Optionally, show a success toast/notification
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge. Please try again.');
    }
  }

  private async loadHiringInsights() {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/ai/hiring-insights`)
      );
      this.hiringInsights = response.data;
      console.log('Hiring Insights:', this.hiringInsights);
    } catch (error) {
      console.error('Error loading hiring insights:', error);
    } finally {
      this.isLoadingHiringInsights = false;
    }
  }

  private async loadChallenges() {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/challenges/mine`)
      );
      const data = response.data || response;

      // Ensure data is an array before mapping
      const challengesData: ChallengeBackendData[] = Array.isArray(data)
        ? data
        : Object.values(data);

      this.allChallenges = challengesData.map((c: ChallengeBackendData) => ({
        _id: c._id,
        title: c.title,
        category: this.translateCategory(c.category),
        status: this.mapStatus(c.status),
        applications: c.submissionsCount || 0, // Use submissionsCount from backend
        topScore: c.topScore || 0, // Use topScore from backend
        avgAiScore: c.avgAiScore || 0, // NEW: Add avgAiScore from backend
        // If you need participants, you could add it here: participants: c.participants || [],
        qualified: Math.floor((c.submissionsCount || 0) * 0.8), // 'qualified' calculation updated to use submissionsCount
        daysRemaining: this.calculateDaysRemaining(c.deadline),
        budget: c.prizeAmount || c.salary || 0, // Use prizeAmount or salary for budget
      }));

      this.challenges = [...this.allChallenges];
      this.updateFilterCounts();
      this.isLoadingChallenges = false;
      console.log(
        'Challenges loaded:',
        this.allChallenges.map((c) => ({
          id: c._id,
          applications: c.applications,
          topScore: c.topScore,
          avgAiScore: c.avgAiScore,
        }))
      );
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
    console.log('الزر ضُغط!');
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
      development: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.CODING', // Assuming 'Development' maps to 'Coding'
      design: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.DESIGN',
      marketing: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.MARKETING',
      writing: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.WRITING', // Example for other categories
      translation: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.TRANSLATION',
      data_entry: 'DASHBOARD.CO-OVERVIEW.CATEGORIES.DATA_ENTRY',
      // ... add other categories from your backend as needed
    };
    return map[cat?.toLowerCase()] || cat || 'General';
  }

  private mapStatus(s: string): string {
    s = (s || '').toLowerCase();
    if (s === 'published' || s === 'active') return 'active'; // Your backend returns 'published'
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

  createNewJob() {
    this.router.navigate(['/dashboard/company/challenge/create']);
  }
}
