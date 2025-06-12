import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  email: string = '';
  otp: string = '';
  showOtpField: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  private destroy$ = new Subject<void>();
  private messageService = inject(MessageService);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if already authenticated
    const token = this.authService.getToken();
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendOtp(): void {
    if (!this.email) {
      this.messageService.error('Please enter your email');
      return;
    }

    this.isLoading = true;
    this.authService.sendOtp(this.email).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.status) {
          this.showOtpField = true;
          this.messageService.success('OTP sent successfully');
        }
      },
      error: (error) => {
        console.error('Error sending OTP:', error);
        // The error message is already handled and shown by the AuthService
      }
    });
  }

  onVerifyOtp(): void {
    if (!this.otp) {
      this.messageService.error('Please enter the OTP');
      return;
    }

    this.isLoading = true;
    this.authService.verifyOtp(this.email, this.otp).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.status) {
          // The success message is already shown by the AuthService
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error verifying OTP:', error);
        // The error message is already handled and shown by the AuthService
      }
    });
  }
}
