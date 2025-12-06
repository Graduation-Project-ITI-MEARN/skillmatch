import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  readonly supportedLangs = ['en', 'ar'];
  readonly defaultLang = 'en';

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.translate.addLangs(this.supportedLangs);
    this.translate.setDefaultLang(this.defaultLang);
    this.initializeLanguage();
  }

  private initializeLanguage() {
    if (isPlatformBrowser(this.platformId)) {
      let targetLang = this.defaultLang;

      // PRIORITY 1: Check the Cookie set by Next.js
      const cookieLang = this.getCookie('app_lang');

      // PRIORITY 2: Check LocalStorage (if they used Angular before)
      const storageLang = localStorage.getItem('lang');

      // PRIORITY 3: Browser Default (Navigator)
      const browserLang = navigator.language.split('-')[0];

      // Logic Flow
      if (cookieLang && this.supportedLangs.includes(cookieLang)) {
        console.log('LanguageService: Found Cookie from Next.js ->', cookieLang);
        targetLang = cookieLang;
      } else if (storageLang && this.supportedLangs.includes(storageLang)) {
        targetLang = storageLang;
      } else if (this.supportedLangs.includes(browserLang)) {
        targetLang = browserLang;
      }

      this.setLanguage(targetLang);
    }
  }

  // Helper to read cookies in Client Side JS
  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  }

  setLanguage(lang: string) {
    this.translate.use(lang);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', lang); // Sync to local storage

      // Update HTML
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      this.document.documentElement.setAttribute('lang', lang);
      this.document.documentElement.setAttribute('dir', dir);

      // Update Body Classes
      if (dir === 'rtl') {
        this.document.body.classList.add('rtl', 'font-arabic');
        this.document.body.classList.remove('ltr', 'font-english');
      } else {
        this.document.body.classList.add('ltr', 'font-english');
        this.document.body.classList.remove('rtl', 'font-arabic');
      }
    }
  }
}
