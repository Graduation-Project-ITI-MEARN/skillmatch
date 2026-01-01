// src/app/services/challenge.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  IAiModelsResponse,
  IAiModel,
  IPricingTierDetails,
} from '../../shared/models/challenge.model';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class ChallengeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  authService = inject(AuthService);

  getCategories(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(
      `${this.apiUrl}/metadata/categories`
    );
  }

  getSkills(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/metadata/skills`);
  }

  getAiModels(): Observable<IAiModelsResponse> {
    return this.http.get<IAiModelsResponse>(`${this.apiUrl}/ai/models`);
  }

  canUseCustomAIModels(): boolean {
    const plan = this.authService.subscriptionPlan;
    return plan === 'basic' || plan === 'professional' || plan === 'enterprise';
  }
}
