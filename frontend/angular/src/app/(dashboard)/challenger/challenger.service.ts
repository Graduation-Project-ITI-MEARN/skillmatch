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
    return this.http.get(`${this.apiUrl}/challenges/mine`).pipe(
      map((res: any) => {
        const challenges = res.data || [];
        const activeCount = challenges.filter((c: any) => c.status === 'published').length;
        const totalSubmissions = challenges.reduce(
          (acc: number, c: any) => acc + (c.submissionCount || 0),
          0
        );

        return {
          stats: {
            activeCount: activeCount,
            totalSubmissions: totalSubmissions,
            totalPrizes: 0,
            averageScore: 0,
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
}
