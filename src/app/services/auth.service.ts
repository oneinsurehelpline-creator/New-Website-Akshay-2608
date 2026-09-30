import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';

const STORAGE_KEY = 'oi_user_mobile';
const PROFILE_KEY = 'oi_user_profile';

export interface UserProfile {
  name: string;
  email: string;
  dob: string;
  gender: string;
  city: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private jsonUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.jsonUrl = this.configService.baseUrl;
  }

  /**
   * Sends an OTP to the given 10-digit mobile number.
   * TODO: replace the mock with the real endpoint, e.g.
   *   return this.http.post(this.jsonUrl + 'OneinsureApi/sendOtp', { mobile });
   */
  sendOtp(mobile: string): Observable<any> {
    return of({ success: true, mobile }).pipe(delay(600));
  }

  /**
   * Verifies the OTP for the given mobile number.
   * TODO: replace the mock with the real endpoint, e.g.
   *   return this.http.post(this.jsonUrl + 'OneinsureApi/verifyOtp', { mobile, otp });
   * The mock accepts any 6-digit OTP.
   */
  verifyOtp(mobile: string, otp: string): Observable<any> {
    return of({ success: /^\d{6}$/.test(otp), mobile }).pipe(
      delay(600),
      tap((res) => {
        if (res.success) {
          this.setUser(mobile);
        }
      })
    );
  }

  get mobile(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.mobile;
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch { }
  }

  /**
   * Profile details for the logged-in user.
   * TODO: load from / save to the backend once the customer API is available.
   */
  getProfile(): UserProfile {
    const empty: UserProfile = { name: '', email: '', dob: '', gender: '', city: '' };
    if (!isPlatformBrowser(this.platformId)) {
      return empty;
    }
    try {
      return { ...empty, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') };
    } catch {
      return empty;
    }
  }

  saveProfile(profile: UserProfile): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch { }
  }

  private setUser(mobile: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, mobile);
    } catch { }
  }
}
