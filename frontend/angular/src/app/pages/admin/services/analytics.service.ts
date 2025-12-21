import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PlatformAnalytics {
  userGrowth: {
    last30Days: number;
    previous30Days: number;
  };
  revenue: number;
  engagementLast7Days: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  // GET /api/stats/platform-analytics
  getPlatformAnalytics(): Observable<PlatformAnalytics> {
    return this.http.get<any>(`${this.apiUrl}/platform-analytics`).pipe(map((res) => res.data));
  }
}
