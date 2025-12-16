import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { CandidateService } from 'src/app/core/services/candidateService';
import {
  LucideAngularModule,
  Clock,
  Trophy,
  ChevronRight,
  Brain,
  Filter,
  Activity,
  Calendar,
} from 'lucide-angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LucideAngularModule,
    FormsModule,
  ],
  templateUrl: './overview.html',
})
export class Overview implements OnInit {
  private candidateService = inject(CandidateService);

  // Icons
  icons = { Clock, Trophy, ChevronRight, Brain, Filter, Activity, Calendar };

  // Data
  activeChallenges: any[] = [];
  aiRecommendations: any[] = [];
  recentActivities: any[] = [];

  // UI
  sortOption = 'date_desc';
  isLoading = true;

  ngOnInit(): void {
    this.loadRealData();
  }

  loadRealData(): void {
    this.isLoading = true;

    forkJoin({
      challenges: this.candidateService.getMyChallenges(),
      ai: this.candidateService.getAiRecommendations(),
      activity: this.candidateService.getActivity(),
    }).subscribe({
      next: (res: any) => {
        // --- 1. Active Applications ---
        // التعامل مع البيانات سواء كانت array مباشرة أو داخل object
        const challengesData = Array.isArray(res.challenges) ? res.challenges : (res.challenges?.data || []);

        this.activeChallenges = challengesData.map((c: any) => ({
          ...c,
          // حساب الأيام المتبقية أو وضع قيمة افتراضية
          daysLeft: this.calculateDaysLeft(c.deadline || new Date(Date.now() + 86400000 * 3)),
          category: c.category || 'Development',
          levelColor: this.getLevelColor(c.level),
          competitors: c.competitorsCount || Math.floor(Math.random() * 50) + 10,
        }));

        this.sortChallenges();

        // --- 2. AI Recommendations ---
        this.aiRecommendations = Array.isArray(res.ai) ? res.ai : (res.ai?.data || []);

        // --- 3. Recent Activity ---
        this.recentActivities = Array.isArray(res.activity) ? res.activity : (res.activity?.data || []);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading overview data:', err);
        this.isLoading = false;
      },
    });
  }

  // ---------------- Logic ----------------

  sortChallenges(): void {
    if (this.sortOption === 'date_desc') {
      this.activeChallenges.sort(
        (a, b) =>
          new Date(b.createdAt || b.startDate || Date.now()).getTime() -
          new Date(a.createdAt || a.startDate || Date.now()).getTime()
      );
    } else {
      this.activeChallenges.sort(
        (a, b) =>
          new Date(a.createdAt || a.startDate || Date.now()).getTime() -
          new Date(b.createdAt || b.startDate || Date.now()).getTime()
      );
    }
  }

  getLevelColor(level: string): string {
    switch ((level || '').toLowerCase()) {
      case 'advanced':
        return 'bg-red-100 text-red-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'beginner':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  calculateDaysLeft(date: string | Date): number {
    const deadline = new Date(date);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }
}
