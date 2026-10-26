import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginModalService } from './login-modal.service';
import { LeadService } from 'src/app/services/lead.service';

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
  otpData: any;
  private sub: Subscription;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private svc: LoginModalService,
    private auth: AuthService,
    private router: Router,
    private leadService: LeadService,
    private authService: AuthService
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




  resendOtp(): void {
    if (this.resendIn > 0) {
      return;
    }
    this.generateOtp();
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

  generateOtp(): void {
    if (this.loading) {
      return;
    }
    if (!this.mobileValid) {
      this.error = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    this.loading = true;
    this.error = '';
    var cdto = {
      "MobileNo": this.mobile,
      "APPSIGNID": ""
    }
    this.leadService.generateOtp(cdto).subscribe({
      next: (res) => {
        this.loading = false;
        this.step = 'otp';
        this.otpData = res;
        this.otp = '';
        this.startResendTimer();
        setTimeout(() => this.otpInput?.nativeElement.focus());

      },
      error: () => {
        this.loading = false;
        this.error = 'Could not send OTP. Please try again.';
      },
    });
  }
  verifyOtpnew(): void {
    if (this.loading) {
      return;
    }
    if (!this.otpValid) {
      this.error = 'Please enter the 6-digit OTP.';
      return;
    }
    this.loading = true;
    this.error = '';
    var cdto = {
      "mobileno": this.mobile,
      "otpstr": this.otp,
      "OTPidkey": this.otpData?.Otpidkey || ''
    }
    this.leadService.verifyOtp(cdto).subscribe({
      next: (res) => {
        this.loading = false;
        if (Number(res?.response) === 1) {
          console.log('OTP verified successfully:', res);

          this.authService.setAuthenticatedUser(this.mobile);

          this.close();

          this.router.navigate(['/my-account']).then((navigated) => {
            console.log('Navigation successful:', navigated);
          }); 
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


 
}
