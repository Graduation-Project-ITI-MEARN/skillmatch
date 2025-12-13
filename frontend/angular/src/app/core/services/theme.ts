import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'candidate' | 'company' | 'admin' | 'challenger';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setTheme(theme: Theme) {
    if (isPlatformBrowser(this.platformId)) {
      document.body.setAttribute('data-theme', theme);
    }
  }
}
