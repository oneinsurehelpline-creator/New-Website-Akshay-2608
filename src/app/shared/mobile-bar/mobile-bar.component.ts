import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
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
      <a class="mbar__btn" [href]="phoneTel">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        Call
      </a>
      <a class="mbar__btn mbar__btn--wa" [href]="waUrl" target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.22-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.09-1.4l-.37-.22-3.69.97.99-3.6-.24-.37A9.94 9.94 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"></path>
        </svg>
        WhatsApp
      </a>
      <a class="mbar__btn mbar__btn--book" href="https://schedule.oneinsure.com/book/get-expert-guidance-web"
        appScheduleLink>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>
        </svg>
        Book a call
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

  constructor(private router: Router) { }

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
