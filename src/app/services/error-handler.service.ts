import { Injectable, ErrorHandler, inject, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private loadingService = inject(LoadingService);
  
  handleError(error: unknown) {
    if (!(error instanceof Error)) {
      console.error('An unknown error occurred:', error);
      return;
    }
    
  
    const errorMessage = error.message || 'Server Is Down!';
    
    this.loadingService.showError(errorMessage);
  }
}
