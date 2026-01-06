// src/environments/environment.ts
import { isDevMode } from '@angular/core';

export const environment = {
  production: !isDevMode(),
  apiUrl: !isDevMode()
    ? 'https://skillmatch-backend-production-be8a.up.railway.app/api'
    : 'http://localhost:5000/api',
  nextJsUrl: !isDevMode()
    ? 'https://skillmatch-production-545e.up.railway.app/'
    : 'http://localhost:3000/',
};
