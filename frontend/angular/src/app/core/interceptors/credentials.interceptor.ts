import { HttpInterceptorFn } from '@angular/common/http';

export const CredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const authReq = req.clone({
    withCredentials: true // <--- THIS is the magic key. It sends the HttpOnly cookie.
  });
  return next(authReq);
};