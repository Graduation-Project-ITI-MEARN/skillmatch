import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
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

  // ================== Active Challenges ==================
  getAllChallenges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/challenges`, {
      withCredentials: true,
    });
  }

  // ================== AI Recommendations ==================
  getAiRecommendations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ai/recommendations`, {
      withCredentials: true,
    });
  }

  // ================== Recent Activity ==================
  getActivity(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activity`, {
      withCredentials: true,
    });
  }

  // ================== Portfolio =========================
  getMySubmissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/submissions/mine`, {
      withCredentials: true,
    });
  }

  // ================== Leaderboard ==========================
  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leaderboard`, {
      withCredentials: true,
    });
  }

  // ================== Challenge Details ==================
  getChallengeById(challengeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/challenges/${challengeId}`);
  }

  // ================== Submissions ==================

  startChallenge(challengeId: string): Observable<any> {
    // This assumes your backend has an endpoint like POST /api/challenges/:id/start
    // and that this endpoint is protected by your `requireVerification(['candidate'])` middleware.
    return this.http.post(`${this.apiUrl}/submissions/start`, {
      challengeId,
    });
  }

  submitFinalSolution(submissionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submissions`, submissionData, {
      withCredentials: true,
    });
  }
}
