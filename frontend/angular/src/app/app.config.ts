import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { routes } from './app.routes';
import { CredentialsInterceptor } from './core/interceptors/credentials.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Enable fetch and ensure interceptors run
    provideHttpClient(withFetch(), withInterceptors([CredentialsInterceptor])),
  ],
};
