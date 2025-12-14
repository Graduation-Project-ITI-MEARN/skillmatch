import { HttpInterceptorFn } from '@angular/common/http';
import { CookieService } from '../services/cookie';
import { inject } from '@angular/core';

export const CredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('auth_token');

  // 1. Configure the request
  let requestConfig: any = {
    withCredentials: true, // Always send cookies (HttpOnly or not)
  };

  // 2. ONLY add the Bearer header if Angular can actually read the token
  // (i.e., it's NOT HttpOnly).
  if (token) {
    requestConfig.setHeaders = {
      Authorization: `Bearer ${token}`,
    };
  }

  // 3. Clone and pass
  const authReq = req.clone(requestConfig);
  return next(authReq);
};
