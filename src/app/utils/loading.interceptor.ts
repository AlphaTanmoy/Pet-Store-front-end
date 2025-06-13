import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpEventType
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;
  private loadingService = inject(LoadingService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip loading for specific requests if needed
    if (request.headers.has('X-Skip-Loading')) {
      return next.handle(request);
    }

    this.totalRequests++;
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.totalRequests > 0) {
        this.loadingService.showLoading();
      }
    });

    return next.handle(request).pipe(
      tap(event => {
        // Handle response started event if needed
        if (event.type === HttpEventType.Response) {
          // Response received, but we'll still wait for finalize
        }
      }),
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loadingService.hideLoading();
        }
      })
    );
  }
}
