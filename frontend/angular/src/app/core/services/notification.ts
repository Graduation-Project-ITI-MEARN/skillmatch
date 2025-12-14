import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Matches your MongoDB Model + UI needs
export interface Notification {
  _id: string; // MongoDB uses _id
  userId: string;
  title: string; // Ensure your DB has this, or map it in the UI
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error'; // Optional, defaults to info
  isRead: boolean; // Backend uses isRead
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  count?: number;
  data: Notification[];
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  // Adjust URL based on where you mounted the router (e.g. /api/notifications)
  private apiUrl = `${environment.apiUrl}/notifications`;

  // GET /api/notifications
  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(map((response) => response.data || []));
  }

  // PUT /api/notifications/:id/read
  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  // PUT /api/notifications/read-all
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }
}
