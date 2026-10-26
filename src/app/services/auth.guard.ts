import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginModalService } from '../shared/login-modal/login-modal.service';

/**
 * Protects the My Account pages. Logged-out visitors are sent to the home page
 * and the login popup is opened for them.
 * On the server there is no localStorage, so the check is left to the browser.
 */
export const authGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }
  if (inject(AuthService).isLoggedIn) {
    return true;
  }
  inject(LoginModalService).open();
  return inject(Router).createUrlTree(['/']);
};
