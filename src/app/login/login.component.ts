// src/app/login/login.component.ts
import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
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
  otpArray: string[] = Array(6).fill('');
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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Set isBrowser after component initialization to avoid SSR issues
    this.isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    
    // Only run browser-specific code in browser environment
    if (this.isBrowser) {
      // Start the initial resend countdown
      this.startResendCountdown();
      
      // Set up beforeunload event listener
      window.addEventListener('beforeunload', this.preventUnload.bind(this));
      
      // Set up router events subscription
      this.router.events.pipe(
        takeUntil(this.destroy$)
      ).subscribe(event => {
        if (event instanceof NavigationStart) {
          this.formDirty = false;
        }
      });
    }
    
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
    
    // Clean up timeouts and intervals
    if (this.resendTimeout) {
      clearInterval(this.resendTimeout);
      this.resendTimeout = null;
    }
    
    // Clean up event listeners
    if (this.isBrowser) {
      window.removeEventListener('beforeunload', this.preventUnload);
    }
  }

  onSendOtp(form: NgForm): void {
    if (!this.email) {
      this.messageService.error('Please enter your email');
      return;
    }
    
    // Start the resend countdown
    this.startResendCountdown();
    this.formSubmitted = true;

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

  onVerifyOtp(form?: NgForm): void {
    // Combine the OTP array into a string
    const otp = this.otpArray.join('');
    
    if (form) {
      form.form.markAsPristine();
    }
    
    if (otp.length !== 6) {
      this.messageService.error('Please enter the complete 6-digit code');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyOtp(this.email, otp).pipe(
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
        // Clear OTP on error
        this.otpArray = Array(6).fill('');
        // Focus first OTP input
        setTimeout(() => this.focusInput(0), 100);
      }
    });
  }

  onResendOtp(form?: NgForm): void {
    if (!this.canResend) return;
    
    this.otpArray = Array(6).fill('');
    if (form) {
      form.form.markAsPristine();
      this.onSendOtp(form);
    } else {
      // If no form is provided, just reset the OTP fields
      this.onSendOtp(new NgForm([], []));
    }
    
    // Reset and restart the countdown
    this.startResendCountdown();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right
    if ([8, 9, 13, 27, 35, 36, 37, 39].includes(event.keyCode)) {
      // Handle backspace
      if (event.key === 'Backspace') {
        // If current input is empty, move to previous input
        if (this.otpArray[index] === '' && index > 0) {
          event.preventDefault();
          this.focusInput(index - 1);
        }
        return;
      }
      
      // Handle arrow keys
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        this.focusInput(index - 1);
        return;
      }
      
      if (event.key === 'ArrowRight' && index < 5) {
        event.preventDefault();
        this.focusInput(index + 1);
        return;
      }
      
      return; // Let other special keys work normally
    }

    // Ensure that it is a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
      return;
    }

    // Handle number input
    if (event.key >= '0' && event.key <= '9') {
      event.preventDefault(); // Prevent default to avoid double input in some cases
      
      // Update the current input
      this.otpArray = [...this.otpArray]; // Create new array to trigger change detection
      this.otpArray[index] = event.key;
      
      // Auto move to next input
      if (index < 5) {
        setTimeout(() => this.focusInput(index + 1), 10);
      } else {
        // If this is the last input, blur the current input
        const input = document.getElementById(`otp${index}`) as HTMLInputElement;
        if (input) {
          input.blur();
        }
      }
      
      // Auto submit if all fields are filled
      if (this.otpArray.every(digit => digit !== '')) {
        this.cdr.detectChanges(); // Ensure UI is updated
        setTimeout(() => this.onVerifyOtp(), 100);
      }
    }
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Only keep numbers
    value = value.replace(/\D/g, '');
    
    // If empty, clear the input
    if (!value) {
      this.otpArray[index] = '';
      this.otpArray = [...this.otpArray]; // Trigger change detection
      return;
    }
    
    // Only keep the last character if multiple are entered
    value = value.slice(-1);
    
    // Update the value in the array
    this.otpArray[index] = value;
    this.otpArray = [...this.otpArray]; // Trigger change detection
    
    // Move to next input if not the last one
    if (value && index < 5) {
      setTimeout(() => this.focusInput(index + 1), 10);
    }
    
    // Auto submit if all fields are filled
    if (this.otpArray.every(digit => digit !== '')) {
      this.cdr.detectChanges();
      setTimeout(() => this.onVerifyOtp(), 100);
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    
    if (clipboardData) {
      const pastedText = clipboardData.getData('text/plain').trim();
      const digits = pastedText.replace(/\D/g, '').split('').slice(0, 6);
      
      // Fill the OTP array with the pasted digits
      this.otpArray = [...digits, ...Array(6 - digits.length).fill('')];
      
      // Focus the input after the last pasted digit or the last input
      const focusIndex = Math.min(digits.length, 5);
      this.focusInput(focusIndex);
      
      // Auto submit if all fields are filled
      if (digits.length === 6) {
        setTimeout(() => this.onVerifyOtp(), 100);
      }
    }
  }

  onOtpFocus(event: Event): void {
    // Select the text in the input when focused
    const input = event.target as HTMLInputElement;
    input.select();
  }

  // Check if the code is running in a browser environment
  isBrowser = false;
  private formSubmitted = false;
  private formDirty = false;
  private resendTimeout: any = null;
  resendCountdown = 0;
  canResend = false;

  // Track form changes
  onFormChange(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.formDirty = true;
  }

  // Handle form submission
  onSubmit(form: NgForm): void {
    this.formSubmitted = true;
    this.formDirty = false;
    
    if (this.showOtpField) {
      this.onVerifyOtp();
    } else {
      this.onSendOtp(form);
    }
  }

  // Prevent the browser's default beforeunload behavior
  @HostListener('window:beforeunload', ['$event'])
  private preventUnload(event: BeforeUnloadEvent): void {
    if (!this.isBrowser || !this.formDirty) return;
    
    // This will prevent the browser's default confirmation dialog
    event.preventDefault();
    // Chrome requires returnValue to be set
    event.returnValue = '';
  }
  
  // Handle component cleanup
  @HostListener('window:pagehide')
  private onPageHide(): void {
    // Reset form state when page is being unloaded
    this.formDirty = false;
  }

  private startResendCountdown(): void {
    // Only proceed if we're in a browser environment
    if (!this.isBrowser) return;
    
    this.canResend = false;
    this.resendCountdown = 60; // 60 seconds
    
    // Clear any existing timeout
    this.clearResendTimeout();
    
    // Start countdown
    try {
      this.resendTimeout = setInterval(() => {
        if (this.resendCountdown > 0) {
          this.resendCountdown--;
          
          if (this.resendCountdown <= 0) {
            this.clearResendTimeout();
            this.canResend = true;
          }
          
          // Trigger change detection
          this.cdr.detectChanges();
        }
      }, 1000);
    } catch (error) {
      console.error('Error in resend countdown:', error);
      this.clearResendTimeout();
      this.canResend = true;
      this.cdr.detectChanges();
    }
  }
  
  private clearResendTimeout(): void {
    if (this.resendTimeout) {
      clearInterval(this.resendTimeout);
      this.resendTimeout = null;
    }
  }
  
  get resendButtonText(): string {
    if (this.canResend) {
      return 'Resend Code';
    }
    return `Resend in ${this.resendCountdown}s`;
  }
  
  private focusInput(index: number): void {
    const input = document.getElementById(`otp${index}`) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  }

  onKeyDown(event: KeyboardEvent, form?: NgForm): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.showOtpField) {
        // Only verify if all OTP fields are filled
        if (this.otpArray.every(digit => digit !== '')) {
          this.onVerifyOtp(form);
        }
      } else {
        this.onSendOtp(form || new NgForm([], []));
      }
    }
  }
}