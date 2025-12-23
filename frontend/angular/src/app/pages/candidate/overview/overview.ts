import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

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
} from 'lucide-angular';
import { CandidateService } from 'src/app/core/services/candidateService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, FormsModule, RouterLink],
  templateUrl: './overview.html',
})
export class Overview implements OnInit {
  private candidateService = inject(CandidateService);

  // Icons
  icons = { Clock, Trophy, ChevronRight, Brain, Filter, Activity, Calendar, Play };

  // Data
  activeChallenges: any[] = [];
  aiRecommendations: any[] = [];
  recentSubmissions: any[] = [];

  weeklyStats = {
    started: 0,
    videos: 0,
    avgScore: 0,
  };

  // UI
  sortOption = 'date_desc';
  isLoading = true;

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
        /* -------- 1. Active Challenges -------- */
        const challengesData = Array.isArray(res.challenges)
          ? res.challenges
          : res.challenges?.data;

        this.activeChallenges = challengesData.map((c: any) => ({
          ...c,
          daysLeft: this.calculateDaysLeft(
            c.deadline || new Date(Date.now() + 86400000 * (Math.floor(Math.random() * 10) + 1))
          ),
          // Fallbacks for UI
          category: c.category || 'Development',
          levelColor: this.getLevelColor(c.difficulty || c.level),
          competitors: c.competitorsCount || Math.floor(Math.random() * 100) + 20,
          prize: c.prize || (Math.floor(Math.random() * 5) + 1) * 100, // Mock prize if missing
          techStack: ['React', 'Node.js', 'Figma'].slice(0, 3), // Mock tech stack
        }));

        this.sortChallenges();

        /* -------- 2. AI Recommendations -------- */
        this.aiRecommendations = Array.isArray(res.ai) ? res.ai : res.ai?.data || [];

        /* -------- 3. Recent Submissions (Moved from Portfolio) -------- */
        const subsData = Array.isArray(res.submissions)
          ? res.submissions
          : res.submissions?.data.activeSubmissions || [];

        this.recentSubmissions = subsData.slice(0, 3);

        /* -------- 4. Calculate Stats (Mock Calculation) -------- */
        this.weeklyStats = {
          started: this.activeChallenges.length,
          videos: this.recentSubmissions.filter((s) => s.videoExplanationUrl).length,
          avgScore: Math.round(
            this.recentSubmissions.reduce((acc, curr) => acc + (curr.aiScore || 0), 0) /
              (this.recentSubmissions.length || 1)
          ),
        };

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
          new Date(b.createdAt || Date.now()).getTime() -
          new Date(a.createdAt || Date.now()).getTime()
      );
    } else {
      this.activeChallenges.sort(
        (a, b) =>
          new Date(a.createdAt || Date.now()).getTime() -
          new Date(b.createdAt || Date.now()).getTime()
      );
    }
  }

  getLevelColor(level: string): string {
    const l = (level || '').toLowerCase();
    if (l === 'advanced' || l === 'hard') return 'bg-red-100 text-red-700';
    if (l === 'intermediate' || l === 'medium') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700'; // Beginner
  }

  calculateDaysLeft(date: string | Date): number {
    const deadline = new Date(date);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }
}
