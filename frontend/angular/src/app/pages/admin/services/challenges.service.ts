import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TopChallenge {
  _id: string;
  title: string;
  participants: number;
  quality: number; // This maps to 'aiScore' from the backend
}

@Injectable({ providedIn: 'root' })
export class ChallengesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

  getTopChallenges(): Observable<TopChallenge[]> {
    return this.http
      .get<any>(`${this.apiUrl}/stats/top-challenges`)
      .pipe(map((res) => res.data || []));
  }
}
