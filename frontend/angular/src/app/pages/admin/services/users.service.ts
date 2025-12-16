import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface UserDistribution {
  label: string; // "Candidates"
  value: number; // 13
  percentage: number; // 42
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  /**
   * Get User Distribution
   * API Returns: { success: true, data: [{ type: 'candidate', count: 13 }, ...] }
   */
  getUserDistribution(): Observable<UserDistribution[]> {
    return this.http.get<any>(`${this.apiUrl}/stats/distribution`).pipe(
      map((res) => {
        const rawData = res.data || [];

        // 1. Calculate Total to derive percentages
        const total = rawData.reduce((acc: number, curr: any) => acc + curr.count, 0);

        // 2. Map API format to UI format
        return rawData.map((item: any) => ({
          label:
            item.type === 'challenger'
              ? 'DASHBOARD.GENERAL.CHALLENGERS'
              : item.type === 'company'
              ? 'DASHBOARD.GENERAL.COMPANIES'
              : 'DASHBOARD.GENERAL.CANDIDATES',
          value: item.count,
          percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        }));
      })
    );
  }

  getRecentUsers(): Observable<any[]> {
    return this.http
      .get<any>(`${this.apiUrl}/users?sort=-createdAt&limit=5`)
      .pipe(map((res) => res.data || []));
  }
}
