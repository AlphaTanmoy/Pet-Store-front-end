import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpStatusCode,
  HttpEventType
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor to handle HTTP errors and display user-friendly error messages.
 * Also manages error states in the LoadingService.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly skipErrorHeader = 'X-Skip-Error';
  
  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip error handling for requests with X-Skip-Error header
    if (request.headers.has(this.skipErrorHeader)) {
      const headers = request.headers.delete(this.skipErrorHeader);
      return next.handle(request.clone({ headers }));
    }

    return next.handle(request).pipe(
      // Log successful responses (optional)
      tap((event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.Response) {
          // You could log successful responses here if needed
        }
      }),
      // Handle errors
      catchError((error: unknown) => {
        // Skip if it's not an HTTP error
        if (!(error instanceof HttpErrorResponse)) {
          return throwError(() => error);
        }

        // We can safely use the error as HttpErrorResponse here
        const httpError = error;
        const errorMessage = this.getErrorMessage(httpError);
        const statusCode = httpError.status || 'UNKNOWN_ERROR';
        // Handle specific HTTP status codes
        switch (httpError.status) {
          case HttpStatusCode.Unauthorized:
            // For unauthorized, redirect to login and show error
            this.router.navigate(['/login']);
            this.loadingService.showErrorWithTitle(
              'Session Expired',
              'Your session has expired. Please log in again.',
              () => this.router.navigate(['/login'])
            );
            break;

          case HttpStatusCode.Forbidden:
            this.loadingService.showErrorWithTitle(
              'Access Denied',
              'You do not have permission to access this resource.'
            );
            break;

          case HttpStatusCode.NotFound:
            this.loadingService.showErrorWithTitle(
              'Not Found',
              'The requested resource was not found.'
            );
            break;

          case 0:
            // Network or CORS error
            this.loadingService.showErrorWithTitle(
              'Connection Error',
              'Unable to connect to the server. Please check your internet connection and try again.',
              () => window.location.reload()
            );
            break;

          case HttpStatusCode.InternalServerError:
            this.loadingService.showErrorWithTitle(
              'Server Error',
              'An unexpected server error occurred. Please try again later.'
            );
            break;

          case HttpStatusCode.GatewayTimeout:
            this.loadingService.showErrorWithTitle(
              'Request Timeout',
              'The server is taking too long to respond. Please try again later.',
              () => window.location.reload()
            );
            break;

          case HttpStatusCode.ServiceUnavailable:
            this.loadingService.showErrorWithTitle(
              'Service Unavailable',
              'The service is currently unavailable. Please try again later.',
              () => window.location.reload()
            );
            break;

          default:
            // For other errors, show a generic error with retry for GET requests
            const canRetry = request.method === 'GET';
            this.loadingService.showErrorWithTitle(
              `Error ${statusCode}`,
              errorMessage,
              canRetry ? () => window.location.reload() : undefined
            );
        }

        // Log the error for debugging
        console.error(`[HTTP Error ${statusCode}] ${errorMessage}`, httpError);

        // Re-throw the error to be handled by the ErrorHandler
        return throwError(() => httpError);
      })
    );
  }

  /**
   * Extracts a user-friendly error message from an HTTP error response
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    // Handle client-side or network errors
    if (error.error instanceof ErrorEvent) {
      return `A client-side error occurred: ${error.error.message}`;
    }

    // Handle server-side errors
    if (typeof error.error === 'string') {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}
