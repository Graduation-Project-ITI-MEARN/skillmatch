import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';


import { routes } from './app.routes';
import { CredentialsInterceptor } from './core/interceptors/credentials.interceptor';

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Router
    provideRouter(routes),

    // HttpClient
    provideHttpClient(
      withFetch(),
      withInterceptors([CredentialsInterceptor])
    ),

    // Animations (required for ngx-toastr)
    provideAnimations(),

    // ngx-toastr
   provideToastr({
  positionClass: 'toast-bottom-right',
  timeOut: 3000,
  preventDuplicates: true,
}),

    // ngx-translate
    provideTranslateService({
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
};
