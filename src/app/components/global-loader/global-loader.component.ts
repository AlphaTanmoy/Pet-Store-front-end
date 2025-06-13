import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { LoaderComponent } from '../../common-components/loader/loader.component';
import { LoadingService, ErrorState } from '../../services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LoaderComponent
  ],
  template: `
    @if (isLoading) {
      <div class="global-loader-overlay">
        <div class="global-loader-content">
          <app-loader 
            [size]="'lg'"
            [color]="'var(--loading-color)'"
            [errorMessage]="'Loading...'"
          ></app-loader>
        </div>
      </div>
    }
    
    @if (errorState.show) {
      <div class="global-error-overlay">
        <div class="global-error-content">
          <div class="error-icon">
            <mat-icon>error_outline</mat-icon>
          </div>
          <div class="error-message">
            {{ errorState.message || 'An error occurred. Please try again later.' }}
            @if (errorState.code) {
              <div class="error-code">Error code: {{ errorState.code }}</div>
            }
          </div>
          <button 
            mat-raised-button 
            color="primary" 
            (click)="onRetry()"
            class="retry-button"
            *ngIf="errorState.retryCallback"
          >
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .global-loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .global-loader-content {
      text-align: center;
      padding: 2rem;
      border-radius: 8px;
      background-color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .global-error-overlay {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      max-width: 90%;
      width: 500px;
    }

    .global-error-content {
      background-color: #fef2f2;
      color: #b91c1c;
      padding: 1rem;
      border-radius: 0.375rem;
      border-left: 4px solid #dc2626;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .error-icon {
      font-size: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-message {
      flex: 1;
      text-align: left;
    }

    .error-code {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-top: 0.25rem;
    }

    .retry-button {
      margin-left: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Dark mode support */
    :host-context(.dark) .global-loader-content {
      background-color: #1f2937;
    }

    :host-context(.dark) .global-error-content {
      background-color: #1f1b1b;
      color: #fecaca;
    }
  `]
})
export class GlobalLoaderComponent implements OnDestroy {
  isLoading = false;
  errorState: ErrorState = { show: false };
  private loadingSubscription: Subscription;
  private errorSubscription: Subscription;
  private loadingService = inject(LoadingService);

  constructor() {
    // Subscribe to loading state changes
    this.loadingSubscription = this.loadingService.isLoading$
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Subscribe to error state changes
    this.errorSubscription = this.loadingService.error$
      .subscribe(errorState => {
        this.errorState = errorState;
      });
  }
  
  /**
   * Handle retry button click
   */
  onRetry(): void {
    if (this.errorState.retryCallback) {
      // If there's a retry callback, execute it
      this.errorState.retryCallback();
    }
    // Clear the error state
    this.loadingService.clearError();
  }
  
  ngOnDestroy() {
    this.loadingSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
  }
}
