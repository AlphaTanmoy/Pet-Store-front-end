import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpErrorResponse, 
  HttpStatusCode,
  HttpEventType
} from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError, switchMap, of, finalize, tap, filter, take } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`AuthInterceptor: Intercepting ${request.method} request to ${request.url}`);
    
    // Skip adding token for auth endpoints
    if (this.isAuthRequest(request)) {
      console.log('AuthInterceptor: Skipping auth for auth endpoint');
      return next.handle(request);
    }

    // Add auth token to request
    const authReq = this.addAuthHeader(request);

    // Send the request and handle errors
    return next.handle(authReq).pipe(
      tap(event => {
        if (event.type === HttpEventType.Response) {
          console.log('AuthInterceptor: Received response with status', event.status);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('AuthInterceptor: HTTP error:', {
          url: error.url,
          status: error.status,
          statusText: error.statusText,
          message: error.message
        });
        
        // Handle 401 Unauthorized errors
        if (error.status === HttpStatusCode.Unauthorized) {
          console.log('AuthInterceptor: Handling 401 Unauthorized error');
          return this.handle401Error(authReq, next);
        }
        
        // For other errors, just pass them through
        return throwError(() => error);
      })
    );
  }

  private isAuthRequest(request: HttpRequest<any>): boolean {
    // Add paths that don't need the auth token
    const authPaths = [
      '/sent/otp', 
      '/signIn',
      '/assets/',
      '.json',
      'i18n/'
    ];
    
    const isAuthRequest = authPaths.some(path => 
      request.url.includes(path) || 
      request.url.endsWith(path) ||
      request.url.startsWith(path)
    );
    
    console.log(`AuthInterceptor: isAuthRequest for ${request.url}: ${isAuthRequest}`);
    return isAuthRequest;
  }

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    
    if (!token) {
      console.log('AuthInterceptor: No auth token available');
      return request;
    }
    
    console.log('AuthInterceptor: Adding auth token to request');
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('AuthInterceptor: Handling 401 error');
    
    // If we're already refreshing the token, wait for it to complete
    if (this.isRefreshing) {
      console.log('AuthInterceptor: Already refreshing token, waiting...');
      return this.refreshTokenSubject.pipe(
        filter((token: string | null): token is string => token !== null),
        take(1),
        switchMap(() => next.handle(this.addAuthHeader(request)))
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
    
    const refreshToken = this.authService.getRefreshToken();
    
    if (!refreshToken) {
      console.log('AuthInterceptor: No refresh token available, logging out');
      this.logoutAndRedirect();
      return throwError(() => new Error('No refresh token available'));
    }
    
    // Try to refresh the token
    return this.authService.refreshAuthToken().pipe(
      switchMap((token: string | null) => {
        if (!token) {
          console.log('AuthInterceptor: Token refresh failed, logging out');
          this.logoutAndRedirect();
          return throwError(() => new Error('Token refresh failed'));
        }
        
        console.log('AuthInterceptor: Token refreshed successfully');
        this.refreshTokenSubject.next(token);
        
        // Retry the original request with the new token
        return next.handle(this.addAuthHeader(request));
      }),
      catchError((error) => {
        console.error('AuthInterceptor: Error during token refresh:', error);
        this.logoutAndRedirect();
        return throwError(() => error);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }
  
  private logoutAndRedirect(): void {
    console.log('AuthInterceptor: Logging out and redirecting to login');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
