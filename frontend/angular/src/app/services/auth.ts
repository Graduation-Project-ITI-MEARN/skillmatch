import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cookiesService = inject(CookieService);
  private router = inject(Router);

  currentUser = signal<any>(null);

  // 1. The main verification call
  verifyUser(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        console.log('User verified:', user);
        this.currentUser.set(user);
      }),
      catchError((err) => {
        console.error('Verification failed', err);
        this.currentUser.set(null); // Clear state
        return of(null);
      })
    );
  }

  // 2. NEW Helper for Guards: Waits for verifyUser to complete
  checkAuth(): Observable<boolean> {
    // If we already have a user, return true immediately
    if (this.currentUser()) {
      return of(true);
    }

    // If not, run the verification API call
    return this.verifyUser().pipe(
      map((user) => !!user) // Return true if user exists, false if null
    );
  }

  logout(): void {
    this.cookiesService.delete('user_role');
    this.cookiesService.delete('user_type');
    this.currentUser.set(null);
    // window.location.href = 'http://localhost:3000/login';
  }

  // Helper to safely get properties from Signal OR Cookie
  // This makes it work even if cookies are missing but API succeeded
  get role(): string {
    return this.currentUser()?.role || this.cookiesService.get('user_role') || '';
  }

  get type(): string {
    return this.currentUser()?.type || this.cookiesService.get('user_type') || '';
  }
}
