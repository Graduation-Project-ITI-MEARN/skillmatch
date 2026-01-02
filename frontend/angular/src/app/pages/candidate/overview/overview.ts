import { Component, OnInit, inject, Renderer2 } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common'; // Import DecimalPipe, TitleCasePipe
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

// Lucide Icons
import {
  LucideAngularModule,
  Clock,
  Trophy,
  ChevronRight,
  Brain,
  Filter,
  Activity,
  Calendar,
  Play,
  X,
  Gauge, // Added for AI Score
  Award, // Added for Challenges Won
  BarChart, // Added for Global Rank (or other suitable icon)
  ListChecks,
  ArrowUpWideNarrow, // Added for Amount of Challenges
} from 'lucide-angular';

import { CandidateService } from 'src/app/core/services/candidateService';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LucideAngularModule,
    FormsModule,
    RouterLink,
    DecimalPipe,
    TitleCasePipe,
  ], // Add TitleCasePipe here
  templateUrl: './overview.html',
  providers: [DecimalPipe, TitleCasePipe], // Provide DecimalPipe and TitleCasePipe
})
export class Overview implements OnInit {
  private candidateService = inject(CandidateService);
  private renderer = inject(Renderer2);
  private decimalPipe = inject(DecimalPipe); // Inject DecimalPipe
  private titleCasePipe = inject(TitleCasePipe); // Inject TitleCasePipe

  // Icons - Updated to include new ones for stats
  icons = {
    Clock,
    Trophy,
    ChevronRight,
    Brain,
    Filter,
    Activity,
    Calendar,
    Play,
    X,
    Gauge, // For AI Score
    Award, // For Challenges Won
    BarChart, // For Global Rank
    ListChecks, // For Amount of Challenges
    ArrowUpWideNarrow,
  };

  // Data
  activeChallenges: any[] = [];
  allChallenges: any[] = []; // This will now hold only the *available* challenges
  aiRecommendations: any[] = [];
  recentSubmissions: any[] = [];

  // New property for candidate statistics
  candidateOverviewStats = {
    amountOfChallenges: 0,
    highestAiScore: 0,
    averageAiScore: 0,
    challengesWon: 0,
    globalRank: 0,
  };

  // UI State
  sortOption = 'date_desc';
  isLoading = true;
  showFilterPanel = false;
  selectedField = 'all';

  // الحالة للتحكم في القوائم المنسدلة (بما فيها القائمة الرئيسية main_field)
  activeDropdown: 'cat' | 'diff' | 'time' | 'main_field' | null = null;

  categories = ['Development', 'Design', 'Marketing', 'Writing', 'Translation', 'Data Entry'];
  difficultyLevels = ['easy', 'medium', 'hard'];

  filters = {
    category: 'all',
    difficulty: 'all',
    prizeMin: 0,
    prizeMax: 10000,
    daysLeft: 'all',
    searchTerm: '',
  };

  ngOnInit(): void {
    this.loadRealData();
  }

  loadRealData(): void {
    this.isLoading = true;

    forkJoin({
      // IMPORTANT CHANGE HERE: Use getAvailableChallengesForCandidate()
      challenges: this.candidateService.getAvailableChallengesForCandidate(),
      ai: this.candidateService.getAiRecommendations(),
      submissions: this.candidateService.getMySubmissions(),
      candidateStats: this.candidateService.getCandidateStats(), // Fetch candidate stats
    }).subscribe({
      next: (res: any) => {
        // CORRECTED: Access challenges from res.challenges.data
        const challengesData = Array.isArray(res.challenges?.data) ? res.challenges.data : [];

        this.allChallenges = challengesData.map((c: any) => ({
          ...c,
          // Ensure deadline is a valid Date object for calculateDaysLeft
          deadline: c.deadline ? new Date(c.deadline) : new Date(Date.now() + 86400000 * 5),
          daysLeft: this.calculateDaysLeft(
            c.deadline ? new Date(c.deadline) : new Date(Date.now() + 86400000 * 5)
          ),
          // Use creatorId.name for company, default if not available
          company: c.creatorId?.name || 'Unknown Company',
          // Use salary or prizeAmount for prize, default if not available
          prize: c.salary ?? c.prizeAmount ?? 0,
          category: c.category || 'Development', // Ensure category exists
          levelColor: this.getLevelColor(c.difficulty || c.level),
          // Keep competitors for now, or fetch if available in challenge details
          competitors: c.competitorsCount || Math.floor(Math.random() * 100) + 20,
        }));

        this.activeChallenges = [...this.allChallenges];
        this.applyFilters();

        const subsData = Array.isArray(res.submissions)
          ? res.submissions
          : res.submissions?.data?.activeSubmissions || [];

        this.recentSubmissions = subsData.slice(0, 3);

        // Assign candidate statistics
        if (res.candidateStats && res.candidateStats.data) {
          this.candidateOverviewStats = {
            amountOfChallenges: res.candidateStats.data.amountOfChallenges || 0,
            highestAiScore: res.candidateStats.data.highestAiScore || 0,
            averageAiScore: res.candidateStats.data.averageAiScore || 0,
            challengesWon: res.candidateStats.data.challengesWon || 0,
            globalRank: res.candidateStats.data.globalRank || 0,
          };
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading overview data:', err);
        this.isLoading = false;
        // Optionally, reset stats to 0 or a default state on error
        this.candidateOverviewStats = {
          amountOfChallenges: 0,
          highestAiScore: 0,
          averageAiScore: 0,
          challengesWon: 0,
          globalRank: 0,
        };
      },
    });
  }

  // ... (rest of your component code remains the same)

  // Helper to check if any stat is non-zero for conditional rendering
  hasAnyStats(): boolean {
    return (
      this.candidateOverviewStats.amountOfChallenges > 0 ||
      this.candidateOverviewStats.highestAiScore > 0 ||
      this.candidateOverviewStats.averageAiScore > 0 ||
      this.candidateOverviewStats.challengesWon > 0 ||
      this.candidateOverviewStats.globalRank > 0
    );
  }

  // ---------------- وظائف الفلترة ----------------

  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
    this.activeDropdown = null;
  }

  onFieldChange(field: string): void {
    this.selectedField = field;
    this.filters.category = field;
    this.activeDropdown = null; // يضمن إغلاق القائمة بعد الاختيار
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allChallenges];

    if (this.filters.category !== 'all') {
      filtered = filtered.filter((c) => c.category === this.filters.category);
    }

    if (this.filters.difficulty !== 'all') {
      filtered = filtered.filter(
        (c) => (c.difficulty || '').toLowerCase() === this.filters.difficulty.toLowerCase()
      );
    }

    filtered = filtered.filter(
      (c) => c.prize >= this.filters.prizeMin && c.prize <= this.filters.prizeMax
    );

    if (this.filters.daysLeft !== 'all') {
      const days = parseInt(this.filters.daysLeft, 10); // Use radix 10
      filtered = filtered.filter((c) => c.daysLeft <= days);
    }

    if (this.filters.searchTerm.trim()) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(term) || (c.company || '').toLowerCase().includes(term)
      );
    }

    this.activeChallenges = filtered;
    this.sortChallenges();
  }

  resetFilters(): void {
    this.filters = {
      category: 'all',
      difficulty: 'all',
      prizeMin: 0,
      prizeMax: 10000,
      daysLeft: 'all',
      searchTerm: '',
    };
    this.selectedField = 'all';
    this.activeDropdown = null;
    this.applyFilters();
  }

  // ---------------- وظائف مساعدة ----------------

  sortChallenges(): void {
    this.activeChallenges.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return this.sortOption === 'date_desc' ? dateB - dateA : dateA - dateB;
    });
  }

  getLevelColor(level: string): string {
    const l = (level || '').toLowerCase();
    if (l === 'hard' || l === 'advanced') return 'bg-red-100 text-red-700';
    if (l === 'medium' || l === 'intermediate') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  }

  calculateDaysLeft(date: string | Date): number {
    const deadline = new Date(date);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }
}
