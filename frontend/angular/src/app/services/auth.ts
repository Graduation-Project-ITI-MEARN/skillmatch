import { inject, Injectable } from '@angular/core';
import { CookieService } from './cookie';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly cookiesService = inject(CookieService);

  getToken(): string {
    return this.cookiesService.get('auth_token') ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.cookiesService.delete('auth_token');
    this.cookiesService.delete('user_role');
    this.cookiesService.delete('user_type');
    window.location.href = 'http://localhost:3000/login';
  }

    // ===== User Role & Type =====
  getUserRole(): string {
    return this.cookiesService.get('user_role') ?? '';
  }

  getUserType(): string {
    return this.cookiesService.get('user_type') ?? '';
  }



 isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isCompany(): boolean {
    return this.getUserType() === 'company';
  }

  isCandidate(): boolean {
    return this.getUserType() === 'candidate';
  }

  isChallenger(): boolean {
    return this.getUserType() === 'challenger';
  }

}
