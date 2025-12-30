import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// Define the expected structure from your /auth/me endpoint
interface AuthUserResponse {
  id: string; // The user's ID string
  name: string;
  email: string;
  role: 'user' | 'admin';
  type?: 'candidate' | 'company' | 'challenger';
  isVerified?: boolean;
  subscriptionStatus?: string; // If this comes from /auth/me
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private cookiesService = inject(CookieService);
  private router = inject(Router);

  // currentUser signal now holds the AuthUserResponse or null
  currentUser = signal<AuthUserResponse | null>(null);

  // Constructor: Initiate verification on service creation
  // This is crucial for guards and other components to have user data ready
  constructor() {
    console.log('AuthService constructor: Initiating initial user verification.');
    this.verifyUser().subscribe(); // Kick off the verification process
  }

  // 1. The main verification call (GET /auth/me)
  // This updates the currentUser signal
  verifyUser(): Observable<AuthUserResponse | null> {
    // If we've already tried to verify and have a user or confirmed no user,
    // and it's not a forced refresh, return the current state.
    if (this.currentUser() !== null) {
      return of(this.currentUser());
    }

    return this.http
      .get<{ success: boolean; data: AuthUserResponse }>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            console.log('AuthService: User verified and signal updated:', response.data);
            this.currentUser.set(response.data);
            // Update cookies as well, for initial page load or if server needs them
            this.cookiesService.set('user_type', response.data.type || '');
            this.cookiesService.set('user_role', response.data.role || '');
          } else {
            console.log('AuthService: Verification response not successful, clearing user.');
            this.clearUserAndCookies();
          }
        }),
        map((response) => (response.success ? response.data : null)),
        catchError((err) => {
          console.error('AuthService: Verification failed via API:', err);
          this.clearUserAndCookies(); // Clear state on API error
          return of(null);
        })
      );
  }

  // Helper to clear user state and cookies
  private clearUserAndCookies(): void {
    this.currentUser.set(null);
    this.cookiesService.delete('user_role');
    this.cookiesService.delete('user_type');
    this.cookiesService.delete('JSESSIONID'); // Clear any other relevant auth cookies
    // Optionally, clear local storage items related to user if you use them
  }

  // 2. Helper for Guards: Waits for verifyUser to complete
  checkAuth(): Observable<boolean> {
    // If we already have a user in the signal, return true immediately
    if (this.currentUser()) {
      return of(true);
    }
    // If not, run the verification API call (which will update currentUser signal)
    // and then map the signal's value to boolean
    return this.verifyUser().pipe(map((user) => !!user));
  }

  logout(): void {
    // This should probably hit your backend's logout endpoint first
    this.http.get(`${environment.apiUrl}/auth/logout`).subscribe({
      next: () => console.log('Backend logout successful'),
      error: (err) => console.error('Backend logout failed', err),
      complete: () => {
        this.clearUserAndCookies();
        window.location.href = `${environment.nextJsUrl}/login`; // Full page reload
      },
    });
  }

  // Helpers to safely get properties from Signal (now the primary source)
  get role(): string {
    return this.currentUser()?.role || this.cookiesService.get('user_role') || '';
  }

  // Explicitly type the return for 'type'
  get type(): 'candidate' | 'company' | 'challenger' | null {
    const typeFromSignal = this.currentUser()?.type;
    // Fallback to cookie only if signal is null for initial load (less reliable)
    const typeFromCookie = this.cookiesService.get('user_type');

    if (typeFromSignal) {
      return typeFromSignal;
    }
    if (
      typeFromCookie === 'candidate' ||
      typeFromCookie === 'company' ||
      typeFromCookie === 'challenger'
    ) {
      return typeFromCookie;
    }
    return null;
  }

  get currentUserId(): string | null {
    return this.currentUser()?.id || null;
  }

  // Method to force a refresh (e.g., after profile update)
  refreshUserProfile(): Observable<AuthUserResponse | null> {
    console.log('AuthService: Refreshing user profile.', this.currentUser());
    this.currentUser.set(null); // Clear signal to force new API call in verifyUser
    return this.verifyUser();
  }

  get isSubscribed(): boolean {
    return this.currentUser()?.subscriptionStatus === 'active';
  }
}
