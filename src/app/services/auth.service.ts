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
  private userRole: string | null = null; // Keep as string | null for consistency with sessionStorage
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
    // Get tokens and role from sessionStorage
    const token = sessionStorage.getItem('jwt');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const role = sessionStorage.getItem('role');
    
    if (token) {
      this.authToken = token;
      this.refreshToken = refreshToken;
      this.userRole = role; // Keep as string | null
      this.setAuthState(true);
    } else {
      this.clearAuth();
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
    try {
      const url = getApiUrl(Microservice.AUTH, 'SEND_OTP');
      console.log('Sending OTP request to:', url);
      
      return this.http.post<{ status: boolean; message: string }>(
        url,
        { email },
        { 
          observe: 'response',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).pipe(
        tap(response => {
          console.log('OTP response:', response);
        }),
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
      catchError((error: HttpErrorResponse | Error) => {
        if (error instanceof HttpErrorResponse) {
          console.error('OTP request failed:', {
            url,
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
          
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
          } else {
            // Handle non-HTTP errors (like getApiUrl errors)
            console.error('Error before HTTP request:', error);
            this.messageService.error({
              text: error.message || 'Failed to prepare OTP request',
              type: 'error'
            });
            return throwError(() => error);
          }
        })
      );
    } catch (error) {
      console.error('Error in sendOtp:', error);
      this.messageService.error({
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error'
      });
      return throwError(() => error);
    }
  }

  verifyOtp(email: string, otp: string): Observable<{ status: boolean; message: string; jwt?: string; refreshToken?: string; role?: string | null }> {
    const url = getApiUrl(Microservice.AUTH, 'SIGN_IN');
    return this.http.post<{
      status: boolean;
      message: string;
      jwt?: string;
      refreshToken?: string;
      role?: string;
      twoStepVerificationEnabled?: boolean;
      twoStepVerified?: boolean;
    }>(
      url,
      { email, otp },
      { observe: 'response' }
    ).pipe(
      map(response => {
        if (response.body) {
          const { jwt, refreshToken, role, status, message } = response.body;
          if (status && jwt) {
            this.setAuth(jwt, refreshToken || '', role || null);
            this.messageService.success(message || 'Login successful!');
          } else {
            this.messageService.error({
              text: message || 'OTP verification failed',
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

  private setAuth(jwt: string, refreshToken: string, role: string | null): void {
    console.log('AuthService: Setting auth token and user role:', { hasToken: !!jwt, role });
    this.authToken = jwt;
    this.refreshToken = refreshToken || null;
    this.userRole = role;
    
    // Store tokens and role in sessionStorage
    sessionStorage.setItem('jwt', jwt);
    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken);
    }
    if (role) {
      sessionStorage.setItem('role', role);
    } else {
      sessionStorage.removeItem('role');
    }
    
    this.setAuthState(true);
  }

  setToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      sessionStorage.setItem('jwt', token);
      this.setAuthState(true);
    } else {
      this.clearAuth();
    }
  }
  
  private setAuthState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  getToken(): string | null {
    if (!this.authToken) {
      this.authToken = sessionStorage.getItem('jwt');
    }
    return this.authToken;
  }

  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = sessionStorage.getItem('refreshToken');
    }
    return this.refreshToken;
  }

  getRole(): string | null {
    if (!this.userRole) {
      this.userRole = sessionStorage.getItem('role');
    }
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

  clearAuth(): void {
    this.authToken = null;
    this.refreshToken = null;
    this.userRole = null;
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
    this.setAuthState(false);
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

