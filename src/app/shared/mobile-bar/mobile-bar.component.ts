import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoginModalService } from '../login-modal/login-modal.service';
import { AuthService } from '../../services/auth.service';
import { PHONE_TEL, WHATSAPP_URL } from '../site-facts';

/** What the visitor is looking at, used to pre-fill WhatsApp messages. */
const PAGE_TOPICS: Record<string, string> = {
  '/': 'insurance',
  '/health-insurance-plans': 'health insurance',
  '/term-life-insurance': 'term life insurance',
  '/motor-insurance': 'motor insurance',
  '/guaranteed-investment-plans': 'guaranteed savings plans',
  '/market-linked-plans': 'market-linked plans (ULIPs)',
  '/general-insurance': 'travel and home insurance',
  '/critical-illness-plans': 'critical illness plans',
  '/personal-accident-insurance': 'personal accident insurance',
  '/pet-insurance': 'pet insurance',
  '/fire-insurance': 'fire insurance',
  '/corporate-insurance': 'corporate insurance',
  '/employer-employee-insurance': 'group insurance for employees',
  '/insurance-claim-support': 'help with a claim',
  '/service-support': 'help with my policy',
  '/knowledge-base': 'insurance guides',
  '/partner-program': 'becoming a partner',
  '/career-opportunities': 'careers',
  '/branch-locator': 'finding a branch',
};

/**
 * 1. Sticky Call / WhatsApp / Book bar on phones (CSS shows it under 768px).
 * 2. Adds a page-aware message to every WhatsApp link on the site that doesn't
 *    already carry one, so advisors know where the chat started.
 */
@Component({
  selector: 'app-mobile-bar',
  template: `
    <nav class="mbar" aria-label="Contact OneInsure">
      <button type="button" class="mbar__btn mbar__btn--book" (click)="openLogin()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
        </svg>
        {{ isLoggedIn ? 'My Account' : 'Login' }}
      </button> 
      <a class="mbar__btn" href="https://schedule.oneinsure.com/book/get-expert-guidance-web"
        appScheduleLink>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>
        </svg>
        Book a call
      </a>
      <a class="mbar__btn mbar__btn--wa" [href]="waUrl" target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.09-1.4l-.37-.22-3.69.97.99-3.6-.24-.37A9.94 9.94 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.51-7.37c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5a9.14 9.14 0 0 1-1.69-2.1c-.17-.3 0-.45.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57a1.1 1.1 0 0 0-.8.37c-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.1 4.5.7.3 1.27.48 1.7.62.7.22 1.35.2 1.85.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"></path>
        </svg>
        WhatsApp
      </a>
    </nav>`,
  styles: [`
    :host { display: none; }
    @media (max-width: 768px) {
      :host { display: block; }
      .mbar {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 850;
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
        background: rgba(255, 255, 255, .96);
        -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
        border-top: 1px solid var(--line);
        box-shadow: 0 -10px 30px -18px rgba(13, 43, 85, .35);
      }
      .mbar__btn {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        height: 44px; border-radius: 12px;
        border: 1px solid var(--line); background: #fff;
        font: 700 13px/1 var(--display); color: var(--blue-deep); text-decoration: none;
      }
      .mbar__btn--wa { background: #25D366; border-color: #25D366; color: #fff; }
      .mbar__btn--book { background: var(--blue); border-color: var(--blue); color: #fff; }
    }
  `],
})
export class MobileBarComponent {
  readonly phoneTel = PHONE_TEL;
  readonly waUrl = WHATSAPP_URL;

  constructor(
    private router: Router,
    private loginModal: LoginModalService,
    private auth: AuthService
  ) { }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn;
  }

  /** Same as the header's Login button: logged in → My Account, otherwise the login popup. */
  openLogin(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/my-account']);
    } else {
      this.loginModal.open();
    }
  }

  /** Runs before the browser follows the link, so the updated href is the one opened. */
  @HostListener('document:click', ['$event'])
  addWhatsappContext(e: MouseEvent): void {
    const a = (e.target as HTMLElement | null)?.closest?.('a') as HTMLAnchorElement | null;
    if (!a || !a.href.startsWith('https://wa.me/')) { return; }
    // Links that came with their own message (Renew, grievance…) are left alone. For the
    // rest, remember the bare link so header/footer links get a fresh topic on every page.
    let base = a.dataset['waBase'];
    if (!base) {
      if (new URL(a.href).searchParams.has('text')) { return; }
      base = a.dataset['waBase'] = a.href;
    }
    const url = new URL(base);
    const path = this.router.url.split(/[?#]/)[0];
    const topic = PAGE_TOPICS[path] ?? 'insurance';
    url.searchParams.set('text', `Hi, I'm looking at ${topic} on oneinsure.com and need some help.`);
    a.href = url.toString();
  }
}
