import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    private readonly cookiesService = inject(CookieService);

    getToken(): string {
        return this.cookiesService.get('auth_token');
    }

    isLoggedIn(): boolean {
      if (this.getToken()) {
        return true;
      }else {
        return false;
      }
    }

    logout(): void {
        this.cookiesService.delete('auth_token' , '/');
         window.location.href = 'http://localhost:3000/login';
    }
}
