import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // هام للـ Dropdown
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
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-candidate-overview',
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
  private readonly API_URL = 'http://localhost:3000'; // تأكد من الرابط

  // Icons
  icons = { Clock, Trophy, ChevronRight, Brain, Filter, Activity, Calendar };

  // Data State
  activeChallenges: any[] = [];
  aiRecommendations: any[] = [];
  recentActivities: any[] = [];

  // Sorting State
  sortOption: string = 'date_desc'; // القيمة الافتراضية
  isLoading = true;

  ngOnInit() {
    this.loadRealData();
  }

  loadRealData() {
    this.isLoading = true;

    // استخدام forkJoin لجلب كل البيانات مرة واحدة
    forkJoin({
      challenges: this.http.get<any[]>(`${this.API_URL}/challenges/mine`),
      ai: this.http.get<any[]>(`${this.API_URL}/ai/recommendations`),
      activity: this.http.get<any[]>(`${this.API_URL}/activity`)
    }).subscribe({
      next: (res) => {
        // 1. Active Applications
        this.activeChallenges = res.challenges.map(c => ({
          ...c,
          // إضافة بيانات للعرض إذا كانت ناقصة من الـ API
          daysLeft: this.calculateDaysLeft(c.deadline || new Date(Date.now() + 86400000 * 3)),
          category: c.category || 'Development',
          levelColor: this.getLevelColor(c.level),
          competitors: c.competitorsCount || Math.floor(Math.random() * 100)
        }));

        // تطبيق الترتيب الأولي
        this.sortChallenges();

        // 2. AI Recommendations
        this.aiRecommendations = res.ai;

        // 3. Recent Activity
        this.recentActivities = res.activity;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
      }
    });
  }

  // منطق الترتيب (Sorting Logic)
  sortChallenges() {
    if (this.sortOption === 'date_desc') {
      // الأحدث أولاً
      this.activeChallenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortOption === 'date_asc') {
      // الأقدم أولاً
      this.activeChallenges.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  // Helper: تحديد لون الليفل بناء على النص
  getLevelColor(level: string): string {
    switch ((level || '').toLowerCase()) {
      case 'advanced': return 'bg-red-100 text-red-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      default: return 'bg-green-100 text-green-700';
    }
  }

  // Helper: حساب الأيام المتبقية
  calculateDaysLeft(dateString: string | Date): number {
    const deadline = new Date(dateString);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  }
}
