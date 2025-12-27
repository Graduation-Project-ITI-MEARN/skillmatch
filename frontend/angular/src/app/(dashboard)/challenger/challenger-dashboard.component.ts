import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChallengerService } from './challenger.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Trophy, Plus, Bell, Filter, Search, RotateCcw } from 'lucide-angular';
import { NotificationsDropdownComponent } from "@shared/components/notifications-dropdown/notifications-dropdown.component";

@Component({
  selector: 'app-challenger-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    RouterModule,
    TranslateModule,
    NotificationsDropdownComponent
  ],
  templateUrl: './challenger-dashboard.component.html',
  styleUrls: ['./challenger-dashboard.component.scss'],
})
export class ChallengerDashboardComponent implements OnInit {
  private challengerService = inject(ChallengerService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  activeTab: 'active' | 'completed' | 'create' | 'analytics' = 'active';
  isLoading = false;
  isAnalyticsLoading = false;

  showFilterMenu = false;
  isCategoryOpen = false;
  isDifficultyOpen = false;

  readonly icons = {
    Plus,
    Bell,
    Filter,
    Search,
    RotateCcw
  };

  stats: any = {};
  wallet: any = {};
  allChallenges: any[] = [];
  filteredChallenges: any[] = [];
  topCandidates: any[] = [];
  hiringStats: any = {};
  performanceData: any[] = [];

  createForm: FormGroup;

  filterCriteria = {
    category: 'all',
    difficulty: 'all',
    searchQuery: ''
  };

  categories = [
    { key: 'DEVELOPMENT', name: 'Development', icon: 'code' },
    { key: 'DESIGN', name: 'Design', icon: 'pen-tool' },
    { key: 'MARKETING', name: 'Marketing', icon: 'trending-up' },
    { key: 'WRITING', name: 'Writing', icon: 'file-text' },
    { key: 'TRANSLATION', name: 'Translation', icon: 'file-text' },
    { key: 'DATA_ENTRY', name: 'Data Entry', icon: 'file-text' },
  ];

  constructor() {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['Development', Validators.required],
      difficulty: ['medium', Validators.required],
      duration: [7, [Validators.required, Validators.min(1), Validators.max(60)]],
      type: ['prize', Validators.required],
      prizeAmount: [null, [Validators.required, Validators.min(100)]],
      skills: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadWallet();
    this.loadLeaderboard();
    this.loadActiveChallenges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-container')) {
      this.showFilterMenu = false;
    }
  }

  applyFilters() {
    this.filteredChallenges = this.allChallenges.filter(challenge => {
      const matchCategory = this.filterCriteria.category === 'all' ||
                            challenge.category === this.filterCriteria.category;

      const matchDifficulty = this.filterCriteria.difficulty === 'all' ||
                              challenge.difficulty === this.filterCriteria.difficulty;

      const matchSearch = !this.filterCriteria.searchQuery ||
                          challenge.title.toLowerCase().includes(this.filterCriteria.searchQuery.toLowerCase());

      return matchCategory && matchDifficulty && matchSearch;
    });
  }

  resetFilters() {
    this.filterCriteria = {
      category: 'all',
      difficulty: 'all',
      searchQuery: ''
    };
    this.applyFilters();
    this.showFilterMenu = false;
  }

  selectCategory(catName: string) {
    this.filterCriteria.category = catName;
    this.isCategoryOpen = false;
    this.applyFilters();
  }

  selectDifficulty(level: string) {
    this.filterCriteria.difficulty = level;
    this.isDifficultyOpen = false;
    this.applyFilters();
  }

  trackByName(index: number, item: any): string {
    return item.name;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.createForm.get(field);
    return !!(control && control.touched && control.invalid);
  }

  getDaysLeft(deadlineInput: string | Date | undefined): string {
    if (!deadlineInput) return this.translate.instant('CHALLENGER.DASHBOARD.NO_DEADLINE');
    const deadline = new Date(deadlineInput);
    if (isNaN(deadline.getTime())) return this.translate.instant('CHALLENGER.DASHBOARD.INVALID_DATE');
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    if (diffTime < 0) return this.translate.instant('CHALLENGER.DASHBOARD.ENDED');
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return this.translate.instant('CHALLENGER.DASHBOARD.ENDS_TODAY');
    if (diffDays === 1) return `1 ${this.translate.instant('CHALLENGER.DASHBOARD.DAY_LEFT')}`;
    return `${diffDays} ${this.translate.instant('CHALLENGER.DASHBOARD.DAYS_LEFT')}`;
  }

  switchTab(tab: 'active' | 'completed' | 'create' | 'analytics') {
    this.activeTab = tab;
    this.resetFilters();
    if (tab === 'active') this.loadActiveChallenges();
    if (tab === 'completed') this.loadCompletedChallenges();
    if (tab === 'analytics') this.loadAnalyticsData();
  }

  loadStats() {
    this.challengerService.getStats().subscribe({
      next: (res: any) => this.stats = res.stats || {},
      error: (err) => console.error('Failed to load stats', err),
    });
  }

  loadWallet() {
    this.challengerService.getWallet().subscribe({
      next: (res: any) => this.wallet = res.data || {},
      error: (err) => console.error('Failed to load wallet', err),
    });
  }

  loadLeaderboard() {
    this.challengerService.getLeaderboard().subscribe({
      next: (res: any) => this.topCandidates = res.data || [],
      error: (err) => console.error('Failed to load leaderboard', err),
    });
  }

  loadActiveChallenges() {
    this.isLoading = true;
    this.challengerService.getMyChallenges('published').subscribe({
      next: (res: any) => {
        this.allChallenges = res.data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.allChallenges = [];
        this.filteredChallenges = [];
      },
    });
  }

  loadCompletedChallenges() {
    this.isLoading = true;
    this.challengerService.getMyChallenges('closed').subscribe({
      next: (res: any) => {
        this.allChallenges = res.data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.allChallenges = [];
        this.filteredChallenges = [];
      },
    });
  }

  onSubmitChallenge() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toastr.warning(this.translate.instant('CHALLENGER.CREATE.FIX_ERRORS'));
      return;
    }

    this.isLoading = true;
    const formData = this.createForm.value;
    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s: string) => s.trim())
      : [];

    const daysToAdd = Number(formData.duration);
    const safeDays = !isNaN(daysToAdd) && daysToAdd > 0 ? daysToAdd : 7;

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + safeDays);

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      type: formData.type,
      prizeAmount: Number(formData.prizeAmount),
      skills: skillsArray,
      deadline: deadlineDate.toISOString(),
      currency: 'EGP',
      status: 'published',
      tags: skillsArray,
    };

    this.challengerService.createChallenge(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('CHALLENGER.CREATE.SUCCESS'));
        this.createForm.reset({
          category: 'Development',
          difficulty: 'medium',
          type: 'prize',
          duration: 7,
        });
        this.switchTab('active');
        this.loadStats();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || this.translate.instant('CHALLENGER.CREATE.ERROR'));
        this.isLoading = false;
      },
    });
  }

  loadAnalyticsData() {
    this.isAnalyticsLoading = true;
    this.challengerService.getHiringAnalytics().subscribe({
      next: (res) => {
        this.hiringStats = res.data;
      },
      error: (err) => {
        console.error('Failed to load hiring analytics', err);
        this.isAnalyticsLoading = false;
      }
    });
    this.challengerService.getJobPerformance().subscribe({
      next: (res) => {
        this.performanceData = res.data;
        this.isAnalyticsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load job performance', err);
        this.isAnalyticsLoading = false;
      }
    });
  }
}
