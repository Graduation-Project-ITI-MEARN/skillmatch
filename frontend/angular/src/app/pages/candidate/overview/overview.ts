import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  LucideAngularModule,
  Clock,
  Trophy,
  ChevronRight,
  Brain,
  Filter,
  Activity,
  Calendar
} from 'lucide-angular';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LucideAngularModule,
    FormsModule
  ],
  templateUrl: './overview.html',
})
export class Overview implements OnInit {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Icons registry
  icons = { Clock, Trophy, ChevronRight, Brain, Filter, Activity, Calendar };

  // Data State
  activeChallenges: any[] = [];
  aiRecommendations: any[] = [];
  recentActivities: any[] = [];

  // UI State
  sortOption: string = 'date_desc';
  isLoading = true;

  ngOnInit() {
    this.loadRealData();
  }

  loadRealData() {
    this.isLoading = true;

    forkJoin({
      challenges: this.http.get<any[]>(`${this.API_URL}/challenges/mine`),
      ai: this.http.get<any[]>(`${this.API_URL}/ai/recommendations`),
      activity: this.http.get<any[]>(`${this.API_URL}/activity`)
    }).subscribe({
      next: (res) => {
        // 1. Process Challenges
        this.activeChallenges = (res.challenges || []).map(c => ({
          ...c,
          // Default logic if API data is missing
          daysLeft: this.calculateDaysLeft(c.deadline || new Date(Date.now() + 86400000 * 3)),
          category: c.category || 'Development',
          levelColor: this.getLevelColor(c.level),
          competitors: c.competitorsCount || Math.floor(Math.random() * 50) + 10
        }));

        this.sortChallenges(); // Apply initial sort

        // 2. Process AI & Activity
        this.aiRecommendations = res.ai || [];
        this.recentActivities = res.activity || [];

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading overview data:', err);
        this.isLoading = false;
        // Optional: Set dummy data here if API fails during dev
      }
    });
  }

  // --- Logic ---

  sortChallenges() {
    if (this.sortOption === 'date_desc') {
      // Newest first
      this.activeChallenges.sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime());
    } else if (this.sortOption === 'date_asc') {
      // Oldest first
      this.activeChallenges.sort((a, b) => new Date(a.createdAt || a.startDate).getTime() - new Date(b.createdAt || b.startDate).getTime());
    }
  }

  getLevelColor(level: string): string {
    switch ((level || '').toLowerCase()) {
      case 'advanced': return 'bg-red-100 text-red-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'beginner': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  calculateDaysLeft(dateString: string | Date): number {
    const deadline = new Date(dateString);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }
}
