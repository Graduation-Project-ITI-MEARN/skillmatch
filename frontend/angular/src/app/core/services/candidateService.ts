import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
   providedIn: 'root'
  })
export class CandidateService {
  private apiUrl = environment.apiUrl;

   private http = inject(HttpClient);

  // 1. User Data
  getMe(): Observable<any> {
   return this.http.get(`${this.apiUrl}/auth/me`, { withCredentials: true });
 }

getCandidateStats(): Observable<any> {
  return this.http.get(`${this.apiUrl}/stats/candidate`, { withCredentials: true });
}

getMyChallenges(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/challenges/mine`, { withCredentials: true });
}

getAiRecommendations(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/ai/recommendations`, { withCredentials: true });
}

getActivity(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/activity`, { withCredentials: true });
}
}
