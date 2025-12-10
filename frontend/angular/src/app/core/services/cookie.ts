import { Injectable } from '@angular/core';
import Cookies from 'js-cookie';

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  get(name: string): string | undefined {
    return Cookies.get(name);
  }

  set(name: string, value: string, days: number = 7): void {
    Cookies.set(name, value, { expires: days, path: '/' });
  }

  delete(name: string): void {
    Cookies.remove(name, { path: '/' });
  }
}
