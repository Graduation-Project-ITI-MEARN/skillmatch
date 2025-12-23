import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChallengerService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // --- DASHBOARD DATA ---

  getMyChallenges(status: 'published' | 'closed' | 'draft'): Observable<any> {
    return this.http.get(`${this.apiUrl}/challenges/mine`).pipe(
      map((res: any) => {
        const allChallenges = res.data || [];
        const filtered = allChallenges.filter((c: any) => c.status === status);
        return { success: true, data: filtered };
      }),
      catchError(() => of({ success: false, data: [] }))
    );
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/challenger`).pipe(
      map((res: any) => {
        const data = res.data || res;
        return {
          stats: {
            activeCount: data.totalChallenges || data.activeCount || 0,
            totalSubmissions: data.totalSubmissions || 0,
            totalPrizes: data.totalRevenue || data.totalPrizes || 0,
            averageScore: data.avgScore || 0,
          },
        };
      }),
      catchError(() => {
        return of({
          stats: { activeCount: 0, totalSubmissions: 0, totalPrizes: 0, averageScore: 0 },
        });
      })
    );
  }

  createChallenge(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/challenges`, data);
  }

  getWallet(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/wallet/details`)
      .pipe(catchError(() => of({ data: { balance: 50000, escrow: 0 } })));
  }

  getLeaderboard(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/stats/leaderboard`)
      .pipe(catchError(() => of({ data: [] })));
  }

  // --- TASK 39: NEW METHODS ---

  getChallengeById(id: string): Observable<any> {
    // Fetches all 'mine' and filters, ensuring we get the object even if GET /:id doesn't exist on backend
    return this.http.get(`${this.apiUrl}/challenges/mine`).pipe(
      map((res: any) => {
        const found = (res.data || []).find((c: any) => c._id === id);
        return { success: !!found, data: found };
      }),
      catchError(() => of({ success: false, data: null }))
    );
  }

  updateChallenge(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/challenges/${id}`, data);
  }

  getSubmissionsByChallenge(challengeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/submissions/challenge/${challengeId}`);
  }

  // Used for the Winner Solution page to fetch specific video details
  getSubmission(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/submissions/${id}`);
  }

  // challenger.service.ts

getHiringAnalytics(): Observable<any> {
  return this.http.get(`${this.apiUrl}/stats/hiring-analytics`);
}

getJobPerformance(): Observable<any> {
  return this.http.get(`${this.apiUrl}/stats/job-performance`);
}

}

