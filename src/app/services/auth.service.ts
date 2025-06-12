import { Injectable, OnDestroy, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, filter, finalize, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environment/environment';
import { api, getApiUrl } from '../environment/endpoints';
import { Microservice } from '../environment/constants';
import { MessageService } from './message.service';

export interface LoginResponse {
  jwt: string;
  refreshToken: string;
  status: boolean;
  message: string;
  role: string;
  twoStepVerified: boolean;
  twoStepVerificationEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private static instance: AuthService | null = null;
  // Using microservices configuration from environment
  private authToken: string | null = null;
  private refreshTokenRequest: Observable<string> | null = null;
  private http = inject(HttpClient);
  private baseUrl = environment.microservices[Microservice.AUTH];
  private refreshToken: string | null = null;
  private userRole: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private refreshTokenInProgress = false;
  private router = inject(Router);
  private messageService = inject(MessageService);

  constructor() {
    if (AuthService.instance) {
      return AuthService.instance;
    }
    
    AuthService.instance = this;
    
    this.initializeAuthState();
  }
  
  private initializeAuthState(): void {
    const token = this.getToken();
    if (token) {
      this.setAuthState(true);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  ngOnDestroy(): void {
    if (AuthService.instance === this) {
      AuthService.instance = null;
    }
    this.isAuthenticatedSubject.complete();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  sendOtp(email: string): Observable<{ status: boolean; message: string }> {
    const url = getApiUrl(Microservice.AUTH, 'SEND_OTP');
    return this.http.post<{ status: boolean; message: string }>(
      url,
      { email },
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.body) {
          if (!response.body.status && response.body.message) {
            this.messageService.error(response.body.message);
          } else if (response.body.status) {
            this.messageService.success('OTP sent successfully!');
          }
          return response.body;
        }
        return { status: false, message: 'No response from server' };
      }),
      catchError((error: HttpErrorResponse) => {
        // Extract the error message from the error response
        const errorMessage = error.error?.errorMessage || 
                             error.error?.message || 
                             error.message || 
                             'Failed to send OTP';
        
        // Show the error message using the message service
        this.messageService.error({
          text: errorMessage,
          type: 'error',
          error: error.error // Pass the full error object for detailed handling
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  verifyOtp(email: string, otp: string): Observable<{ status: boolean; message: string }> {
    const url = getApiUrl(Microservice.AUTH, 'SIGN_IN');
    return this.http.post<{ status: boolean; message: string }>(
      url,
      { email, otp },
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.body) {
          if (response.body.status) {
            this.setToken('dummy-jwt-token');
            this.messageService.success('Login successful!');
          } else {
            this.messageService.error({
              text: response.body.message || 'OTP verification failed',
              type: 'error',
              error: response.body
            });
          }
          return response.body;
        }
        return { status: false, message: 'No response from server' };
      }),
      catchError((error: HttpErrorResponse) => {
        // Extract the error message from the error response
        const errorMessage = error.error?.errorMessage || 
                             error.error?.message || 
                             error.message || 
                             'Failed to verify OTP';
        
        // Show the error message using the message service
        this.messageService.error({
          text: errorMessage,
          type: 'error',
          error: error.error // Pass the full error object for detailed handling
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private setAuth(token: string, refreshToken: string, role: string): void {
    console.log('AuthService: Setting auth token and user role:', { hasToken: !!token, role });
    this.authToken = token;
    this.refreshToken = refreshToken;
    this.userRole = role;
    this.setAuthState(true);
  }

  setToken(token: string): void {
    this.authToken = token;
    this.setAuthState(!!token);
  }
  
  private setAuthState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  getToken(): string | null {
    return this.authToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getRole(): string | null {
    return this.userRole;
  }

  refreshAuthToken(): Observable<string | null> {
    if (this.refreshTokenInProgress) {
      return of(null);
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshTokenInProgress = true;

    return of(this.authToken).pipe(
      tap(token => {
        if (token) {
          this.setToken(token);
        }
      }),
      finalize(() => {
        this.refreshTokenInProgress = false;
      })
    );
  }

  logout(): void {
    console.log('AuthService: Logging out user');
    this.authToken = null;
    this.refreshToken = null;
    this.userRole = null;
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
}

