import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me`);
  }

  getCandidateStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/candidate`);
  }
}
