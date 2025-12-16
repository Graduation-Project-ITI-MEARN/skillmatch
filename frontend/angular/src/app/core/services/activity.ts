import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ActivityLog {
  _id: string;
  action: string;
  type: 'success' | 'info' | 'warning' | 'error';
  createdAt: string;
  details: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activity`;

  getRecentActivity(): Observable<ActivityLog[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res) => {
        // Handle both simple array or { data: [] } structure
        return Array.isArray(res) ? res : res.data || [];
      })
    );
  }
}
