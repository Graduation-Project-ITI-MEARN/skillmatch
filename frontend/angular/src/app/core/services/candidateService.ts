import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  // ================== Auth / Profile ==================
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`, {
      withCredentials: true,
    });
  }

  // ================== Stats ==================
  getCandidateStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/candidate`, {
      withCredentials: true,
    });
  }

  // ================== Active Applications ==================
  getMyChallenges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/challenges/mine`, {
      withCredentials: true,
    });
  }

  // ================== AI Recommendations ==================
  getRecommendations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai/recommendations`, {
      withCredentials: true,
    });
  }

  // ================== Recent Activity ==================
  getRecentActivity(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity`, {
      withCredentials: true,
    });
  }
}
