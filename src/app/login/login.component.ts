// src/app/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faShieldAlt, faPaperPlane, faSignInAlt, faRedo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
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

  // Icons
  faEnvelope = faEnvelope;
  faShieldAlt = faShieldAlt;
  faPaperPlane = faPaperPlane;
  faSignInAlt = faSignInAlt;
  faRedo = faRedo;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    });
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
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.sendOtp(this.email).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        if (response?.status) {
          this.showOtpField = true;
          // Show the success message from the backend
          this.messageService.success(response.message);
        }
      },
      error: () => {
        // No error message displayed to user
      }
    });
  }

  onVerifyOtp(): void {
    if (!this.otp) {
      this.messageService.error('Please enter the verification code');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyOtp(this.email, this.otp).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        // The AuthService already handles token storage via the interceptor
        if (response?.status) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        // No error message displayed to user
      }
    });
  }

  onResendOtp(): void {
    this.otp = '';
    this.onSendOtp();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.showOtpField) {
        this.onVerifyOtp();
      } else {
        this.onSendOtp();
      }
    }
  }
}