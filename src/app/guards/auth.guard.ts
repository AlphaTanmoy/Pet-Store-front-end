import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('AuthGuard: Checking access for', state.url);
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const isLoginPage = state.url.includes('/login');
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated: boolean) => {
      if (isAuthenticated && isLoginPage) {
        return router.createUrlTree(['/dashboard']);
      }
      
      if (!isAuthenticated && !isLoginPage) {
        return router.createUrlTree(['/login']);
      }
      
      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};

export const canActivate = [authGuard];
