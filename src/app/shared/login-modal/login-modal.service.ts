import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginModalService {
  private readonly openSubject = new BehaviorSubject<boolean>(false);
  readonly open$ = this.openSubject.asObservable();

  /** Where to land after a successful login; defaults to the dashboard. */
  redirectTo: string[] = ['/my-account'];

  open(redirectTo: string[] = ['/my-account']): void {
    this.redirectTo = redirectTo;
    this.openSubject.next(true);
  }

  close(): void {
    this.openSubject.next(false);
  }
}
