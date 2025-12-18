import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChallengerService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // 1. Stats Grid
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/challenger`);
  }

  // 2. Challenges List (Filtered)
  getMyChallenges(status: 'published' | 'closed' | 'draft'): Observable<any> {
    return this.http.get(`${this.apiUrl}/challenges/mine?status=${status}`);
  }

  // 3. Create Challenge
  createChallenge(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/challenges`, data);
  }

  // 4. Sidebar Data
  getWallet(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/details`);
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/leaderboard`);
  }
}
