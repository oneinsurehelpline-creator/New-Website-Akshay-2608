import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginModalService } from './login-modal.service';

const RESEND_SECONDS = 30;

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnDestroy {
  @ViewChild('otpInput') otpInput?: ElementRef<HTMLInputElement>;

  isOpen = false;
  step: 'mobile' | 'otp' = 'mobile';
  mobile = '';
  otp = '';
  loading = false;
  error = '';
  resendIn = 0;

  private sub: Subscription;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private svc: LoginModalService,
    private auth: AuthService,
    private router: Router
  ) {
    this.sub = this.svc.open$.subscribe((open) => {
      this.isOpen = open;
      if (open) {
        this.reset();
      }
    });
  }

  get mobileValid(): boolean {
    return /^[6-9]\d{9}$/.test(this.mobile);
  }

  get otpValid(): boolean {
    return /^\d{6}$/.test(this.otp);
  }

  /** Keep only digits as the user types. */
  onDigits(field: 'mobile' | 'otp', value: string): void {
    const max = field === 'mobile' ? 10 : 6;
    this[field] = (value || '').replace(/\D/g, '').slice(0, max);
    this.error = '';
  }

  sendOtp(): void {
    if (this.loading) {
      return;
    }
    if (!this.mobileValid) {
      this.error = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.sendOtp(this.mobile).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success) {
          this.step = 'otp';
          this.otp = '';
          this.startResendTimer();
          setTimeout(() => this.otpInput?.nativeElement.focus());
        } else {
          this.error = res?.message || 'Could not send OTP. Please try again.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not send OTP. Please try again.';
      },
    });
  }

  verifyOtp(): void {
    if (this.loading) {
      return;
    }
    if (!this.otpValid) {
      this.error = 'Please enter the 6-digit OTP.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.verifyOtp(this.mobile, this.otp).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.success) {
          this.close();
          this.router.navigate(['/my-account']);
        } else {
          this.error = res?.message || 'Invalid OTP. Please try again.';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid OTP. Please try again.';
      },
    });
  }

  resendOtp(): void {
    if (this.resendIn > 0) {
      return;
    }
    this.sendOtp();
  }

  changeNumber(): void {
    this.step = 'mobile';
    this.otp = '';
    this.error = '';
    this.stopResendTimer();
  }

  close(): void {
    this.stopResendTimer();
    this.svc.close();
  }

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('lmodal')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.stopResendTimer();
  }

  private reset(): void {
    this.step = 'mobile';
    this.mobile = '';
    this.otp = '';
    this.error = '';
    this.loading = false;
    this.stopResendTimer();
  }

  private startResendTimer(): void {
    this.stopResendTimer();
    this.resendIn = RESEND_SECONDS;
    this.timer = setInterval(() => {
      this.resendIn--;
      if (this.resendIn <= 0) {
        this.stopResendTimer();
      }
    }, 1000);
  }

  private stopResendTimer(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    this.resendIn = 0;
  }
}
