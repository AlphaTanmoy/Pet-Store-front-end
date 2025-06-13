import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, finalize } from 'rxjs/operators';

export interface ErrorState {
  show: boolean;
  message?: string;
  code?: number | string;
  retryCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<ErrorState>({ show: false });
  
  // Track active loading operations
  private loadingCount = 0;

  /**
   * Observable that emits the current loading state
   */
  readonly isLoading$: Observable<boolean> = this.loadingSubject.asObservable().pipe(
    distinctUntilChanged()
  );
  
  /**
   * Observable that emits the current error state
   */
  readonly error$: Observable<ErrorState> = this.errorSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => 
      prev.show === curr.show && 
      prev.message === curr.message &&
      prev.code === curr.code
    )
  );

  /**
   * Show loading indicator
   */
  showLoading(): void {
    if (this.loadingCount === 0) {
      this.loadingSubject.next(true);
    }
    this.loadingCount++;
    this.clearError();
  }

  /**
   * Hide loading indicator
   */
  hideLoading(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
      
      if (this.loadingCount === 0) {
        this.loadingSubject.next(false);
      }
    }
  }

  /**
   * Show error message
   * @param message Error message to display
   * @param code Optional error code
   * @param retryCallback Optional callback function to retry the failed operation
   */
  showError(
    message: string = 'An error occurred. Please try again later.',
    code?: number | string,
    retryCallback?: () => void
  ): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
    
    this.errorSubject.next({
      show: true,
      message,
      code,
      retryCallback
    });
  }

  /**
   * Clear any active error state
   */
  clearError(): void {
    if (this.errorSubject.value.show) {
      this.errorSubject.next({ show: false });
    }
  }

  /**
   * Reset both loading and error states
   */
  reset(): void {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
    this.clearError();
  }
  
  /**
   * Check if there's an active error state
   */
  hasError(): boolean {
    return this.errorSubject.value.show;
  }
  
  /**
   * Get the current error state
   */
  getErrorState(): ErrorState {
    return this.errorSubject.value;
  }
  
  /**
   * Execute an observable operation with loading and error handling
   * @param operation The observable operation to execute
   * @param errorMessage Optional custom error message
   * @returns Observable with the operation result
   */
  /**
   * Execute an observable operation with loading and error handling
   * @param operation The observable operation to execute
   * @param errorMessage Optional custom error message
   * @returns Observable with the operation result
   */
  withLoading<T>(operation: Observable<T>, errorMessage?: string): Observable<T> {
    this.showLoading();
    
    return operation.pipe(
      // Handle completion
      finalize(() => this.hideLoading()),
      // Handle errors
      catchError((error: any) => {
        const message = errorMessage || 
          error?.error?.message || 
          error?.message || 
          'An error occurred';
        
        this.showError(
          message,
          error?.status || error?.code,
          () => this.withLoading(operation, errorMessage)
        );
        
        return throwError(() => error);
      })
    );
  }
}
