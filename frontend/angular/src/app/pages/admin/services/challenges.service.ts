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

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'closed';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'job' | 'prize';
  creatorId: {
    _id: string;
    name: string;
    type: string;
  };
  createdAt: string;
  // Optional fields implied by design but not in current DB response
  participantsCount?: number;
  averageAiScore?: number;
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

  getAllChallenges(): Observable<Challenge[]> {
    const data = this.http
      .get<any>(`${this.apiUrl}/challenges/all`)
      .pipe(map((res) => res.data || []));
    return data;
  }
}
