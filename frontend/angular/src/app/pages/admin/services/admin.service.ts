import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdminStats {
  totalUsers: number;
  activeChallenges: number;
  revenue: number;
  pendingReviews: number;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  // Using localhost based on task description, replace with environment.apiUrl if available
  private apiUrl = `${environment.apiUrl}`;

  // --- Header & Stats ---
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`);
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats/admin`);
  }

  // --- Notifications ---
  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`);
  }

  markRead(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/:${id}/read`, { id });
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all`, {});
  }

  // --- Tab 1: Overview Data ---
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard`);
  }
}
