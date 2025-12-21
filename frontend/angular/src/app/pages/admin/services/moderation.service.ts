import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Report {
  _id: string;
  reporterId: {
    _id: string;
    name: string;
    email: string;
  };
  targetType: 'challenge' | 'submission' | 'user';
  targetId: any;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

// DTO Interface matching your Zod Schema
export interface ResolveReportDTO {
  status: 'resolved' | 'dismissed';
  adminNotes?: string;
  action?: 'hide' | 'ban' | 'delete';
}

@Injectable({ providedIn: 'root' })
export class ModerationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/moderation`;

  getReports(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map((res) => res) // Returns full object { count, data }
    );
  }

  /**
   * Resolve or Dismiss a report
   * PUT /api/moderation/:id/resolve
   */
  resolveReport(id: string, body: ResolveReportDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/resolve`, body);
  }
}
