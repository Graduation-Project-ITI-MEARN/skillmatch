import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  LucideAngularModule,
  Download,
  Layout,
  Send,
  TrendingUp,
  Users,
  Award,
  Clock
} from 'lucide-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-company-analytics',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LucideAngularModule
  ],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class Analytics implements OnInit {
  private http = inject(HttpClient);

  // تعريف الأيقونات المستخدمة في التصميم الجديد
  readonly icons = {
    Download,
    Layout,
    Send,
    TrendingUp,
    Users,
    Award,
    Clock
  };

  // متغيرات البيانات
  isLoading = true;
  hiringAnalytics: any = null;
  jobPerformance: any[] = [];

  async ngOnInit() {
    await this.fetchAnalyticsData();
  }

  /**
   * جلب البيانات من الـ API الحقيقي
   * يتم جلب بيانات الإحصائيات العامة وبيانات أداء الوظائف في وقت واحد
   */
  async fetchAnalyticsData() {
    try {
      this.isLoading = true;

      // تنفيذ الطلبين بالتوازي لسرعة الأداء
      const [hiringRes, performanceRes] = await Promise.all([
        firstValueFrom(this.http.get<any>(`${environment.apiUrl}/stats/hiring-analytics`)),
        firstValueFrom(this.http.get<any>(`${environment.apiUrl}/stats/job-performance`))
      ]);

      // ربط البيانات من داخل كائن الـ data القادم من السيرفر
      if (hiringRes?.success) {
        this.hiringAnalytics = hiringRes.data;
      }

      if (performanceRes?.success) {
        this.jobPerformance = performanceRes.data;
      }

      console.log('Analytics Loaded Successfully:', {
        stats: this.hiringAnalytics,
        performance: this.jobPerformance
      });

    } catch (error) {
      console.error('Error fetching analytics data from server:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * وظيفة زر تحميل التقارير
   */
  downloadReport() {
    // هنا يمكن إضافة منطق تحميل ملف PDF أو Excel لاحقاً
    console.log('Initiating report download for:', this.hiringAnalytics);
    alert('Preparing your detailed report for download...');
  }
}
