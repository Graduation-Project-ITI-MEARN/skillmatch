import { Component, OnInit, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from 'lucide-angular';

import { CandidateService } from 'src/app/core/services/candidateService';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, FormsModule, RouterLink],
  templateUrl: './overview.html',
})
export class Overview implements OnInit {
  private candidateService = inject(CandidateService);
  private renderer = inject(Renderer2);

  // Icons
  icons = { Clock, Trophy, ChevronRight, Brain, Filter, Activity, Calendar, Play, X };

  // Data
  activeChallenges: any[] = [];
  allChallenges: any[] = [];
  aiRecommendations: any[] = [];
  recentSubmissions: any[] = [];

  weeklyStats = {
    started: 0,
    videos: 0,
    avgScore: 0,
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
    searchTerm: ''
  };

  ngOnInit(): void {
    this.loadRealData();
  }

  loadRealData(): void {
    this.isLoading = true;

    forkJoin({
      challenges: this.candidateService.getAllChallenges(),
      ai: this.candidateService.getAiRecommendations(),
      submissions: this.candidateService.getMySubmissions(),
    }).subscribe({
      next: (res: any) => {
        const challengesData = Array.isArray(res.challenges)
          ? res.challenges
          : res.challenges?.data || [];

        this.allChallenges = challengesData.map((c: any) => ({
          ...c,
          daysLeft: this.calculateDaysLeft(
            c.deadline || new Date(Date.now() + 86400000 * 5)
          ),
          category: c.category || 'Development',
          levelColor: this.getLevelColor(c.difficulty || c.level),
          competitors: c.competitorsCount || Math.floor(Math.random() * 100) + 20,
          prize: c.prize || 500,
        }));

        this.activeChallenges = [...this.allChallenges];
        this.applyFilters();

        const subsData = Array.isArray(res.submissions)
          ? res.submissions
          : res.submissions?.data?.activeSubmissions || [];

        this.recentSubmissions = subsData.slice(0, 3);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading overview data:', err);
        this.isLoading = false;
      },
    });
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
      filtered = filtered.filter(c => c.category === this.filters.category);
    }

    if (this.filters.difficulty !== 'all') {
      filtered = filtered.filter(c =>
        (c.difficulty || '').toLowerCase() === this.filters.difficulty.toLowerCase()
      );
    }

    filtered = filtered.filter(c =>
      c.prize >= this.filters.prizeMin && c.prize <= this.filters.prizeMax
    );

    if (this.filters.daysLeft !== 'all') {
      const days = parseInt(this.filters.daysLeft);
      filtered = filtered.filter(c => c.daysLeft <= days);
    }

    if (this.filters.searchTerm.trim()) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        (c.company || '').toLowerCase().includes(term)
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
      searchTerm: ''
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
