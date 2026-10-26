import { consentRecord } from '../consent/consent.component';
import { Component, ElementRef, HostListener, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, finalize, timeout } from 'rxjs/operators';
import { ScheduleModalService } from '../schedule-modal/schedule-modal.service';
import { LeadService } from '../../services/lead.service';

/**
 * "Get a free financial plan" corner card with a 3-question quiz.
 *
 * Kept deliberately polite:
 *  - appears only after the visitor scrolls halfway or spends 40s on a page
 *  - at most once per visit (sessionStorage); "Maybe later" hides it for 7 days
 *  - never again once they open the booking modal or request a callback
 *  - never on pages where people aren't shopping (claims, careers, legal…)
 *  - no overlay, never blocks the page
 */

type Step = 'intro' | 'q' | 'done' | 'callback' | 'sent';

interface Question {
  key: 'age' | 'family' | 'goal';
  title: string;
  options: string[];
}

interface PageCopy {
  title: string;
  sub: string;
}

const SHOWN_KEY = 'oi_plan_nudge_shown';          // sessionStorage: shown this visit
const SNOOZE_KEY = 'oi_plan_nudge_snooze_until';  // localStorage: epoch ms
const BOOKED_KEY = 'oi_plan_nudge_booked';        // localStorage: booked / requested a call
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const DELAY_MS = 40_000;
const SCROLL_RATIO = 0.5;

/** Routes where a sales prompt would be unwelcome. */
const EXCLUDED = [
  '/insurance-claim-support',
  '/service-support',
  '/career-opportunities',
  '/partner-program',
  '/privacy-policy',
  '/terms-conditions',
  '/regulatory-disclosures',
];

const DEFAULT_COPY: PageCopy = {
  title: 'Get your free financial plan',
  sub: 'A 30-minute call with an advisor. No sales pitch.',
};

const PAGE_COPY: Record<string, PageCopy> = {
  '/health-insurance-plans': {
    title: 'Free health cover check',
    sub: 'Find out if your family is covered enough. 30 minutes, no sales pitch.',
  },
  '/term-life-insurance': {
    title: 'How much term cover do you actually need?',
    sub: 'An advisor works it out with you, free. No sales pitch.',
  },
  '/guaranteed-investment-plans': {
    title: 'Free savings plan for your goals',
    sub: 'See which guaranteed plans fit what you are saving for.',
  },
  '/market-linked-plans': {
    title: 'Free investment plan review',
    sub: 'An advisor maps market-linked options to your goals.',
  },
  '/motor-insurance': {
    title: 'Paying too much for car insurance?',
    sub: 'A quick free review of your cover and renewal.',
  },
};

@Component({
  selector: 'app-plan-nudge',
  templateUrl: './plan-nudge.component.html',
  styleUrls: ['./plan-nudge.component.scss'],
})
export class PlanNudgeComponent implements OnInit, OnDestroy {
  visible = false;
  /** Mobile: collapsed to a slim bar until tapped. */
  expanded = false;
  step: Step = 'intro';
  qIndex = 0;
  copy: PageCopy = DEFAULT_COPY;

  readonly questions: Question[] = [
    { key: 'age', title: 'How old are you?', options: ['Under 30', '30 to 40', '40 to 50', 'Over 50'] },
    {
      key: 'family', title: 'Who depends on you?',
      options: ['Just me', 'My partner', 'Partner and kids', 'Kids and parents too'],
    },
    {
      key: 'goal', title: 'What matters most right now?',
      options: ['Protect my family', 'Better health cover', 'Grow my savings', 'Save tax', 'Retire early'],
    },
  ];
  answers: Partial<Record<Question['key'], string>> = {};

  // callback form
  name = '';
  consent = false;
  consentTried = false;
  phone = '';
  phoneError = '';
  sending = false;
  sendError = '';

  private isBrowser: boolean;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private armed = false;
  private subs: Subscription[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private router: Router,
    private zone: NgZone,
    private schedule: ScheduleModalService,
    private leads: LeadService,
    private host: ElementRef<HTMLElement>,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) { return; }

    // Any booking-modal open (from anywhere on the site) counts as "booked".
    this.subs.push(this.schedule.open$.pipe(filter(Boolean)).subscribe(() => {
      this.store('local', BOOKED_KEY, '1');
      this.visible = false;
    }));

    this.subs.push(this.router.events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.onRoute()));
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.liftAboveStrip, { passive: true });
    });
    this.onRoute();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.disarm();
    if (this.isBrowser) {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.liftAboveStrip);
    }
  }

  get question(): Question { return this.questions[this.qIndex]; }

  get answerList(): string[] {
    return this.questions.map((q) => this.answers[q.key]).filter((a): a is string => !!a);
  }

  // ---------- triggers ----------

  private onRoute(): void {
    this.disarm();
    setTimeout(this.liftAboveStrip, 50);
    const path = this.router.url.split(/[?#]/)[0];
    this.copy = PAGE_COPY[path] ?? DEFAULT_COPY;

    // Hide the idle card when leaving for an excluded page, but keep an
    // in-progress quiz open so nobody loses their answers.
    if (this.visible && this.step === 'intro' && !this.expanded && EXCLUDED.includes(path)) {
      this.visible = false;
    }
    // Preview for the team: any URL with ?plan-preview shows the card straight
    // away and wipes the "already shown / snoozed / booked" memory.
    if (/[?&]plan-preview\b/.test(this.router.url)) {
      [SHOWN_KEY].forEach((k) => { try { sessionStorage.removeItem(k); } catch { /* ignore */ } });
      [SNOOZE_KEY, BOOKED_KEY].forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
      this.step = 'intro';
      this.expanded = false;
      this.visible = true;
      this.chime();
      setTimeout(this.liftAboveStrip);
      return;
    }

    if (this.visible || !this.eligible(path)) { return; }

    this.armed = true;
    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(() => this.zone.run(() => this.trigger()), DELAY_MS);
    });
  }

  private eligible(path: string): boolean {
    if (EXCLUDED.includes(path)) { return false; }
    if (this.read('local', BOOKED_KEY)) { return false; }
    if (this.read('session', SHOWN_KEY)) { return false; }
    const snooze = Number(this.read('local', SNOOZE_KEY) || 0);
    return !snooze || Date.now() > snooze;
  }


  /**
   * The homepage hero has a stats strip pinned to the bottom of the first screen.
   * While it's on screen, lift the pill above it (sets a CSS variable directly,
   * no change detection).
   */
  private readonly liftAboveStrip = (): void => {
    const strip = document.querySelector('.deck__strip');
    let lift = 0;
    if (strip) {
      const { top, bottom, height } = strip.getBoundingClientRect();
      const pill = this.host.nativeElement.querySelector('.pn');
      // top edge of the zone the pill occupies at its normal spot
      const zoneTop = window.innerHeight - 24 - (pill ? pill.getBoundingClientRect().height : 60) - 12;
      // height 0 = strip hidden (it's display:none on phones)
      if (height > 0 && top < window.innerHeight && bottom > zoneTop) {
        lift = Math.min(200, Math.max(0, window.innerHeight - top));
      }
    }
    this.host.nativeElement.style.setProperty('--pn-lift', `${Math.round(lift)}px`);
  };
  /** Runs outside Angular so scrolling doesn't trigger change detection. */
  private readonly onScroll = (): void => {
    this.liftAboveStrip();
    if (!this.armed) { return; }
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_RATIO) {
      this.zone.run(() => this.trigger());
    }
  };

  private trigger(): void {
    if (!this.armed) { return; }
    // Don't pop up over an open calculator or other overlay; try again shortly.
    if (document.body.style.overflow === 'hidden') {
      this.disarm();
      this.armed = true;
      this.timer = setTimeout(() => this.trigger(), 5000);
      return;
    }
    this.disarm();
    this.store('session', SHOWN_KEY, '1');
    this.visible = true;
    this.chime();
    setTimeout(this.liftAboveStrip);
  }

  /**
   * Soft two-note chime as the pill appears. Browsers only allow sound after the
   * visitor has clicked/tapped the page, so for anyone who hasn't, this stays silent.
   */
  private chime(): void {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) { return; }
      const ctx = new Ctx();
      if (ctx.state !== 'running') { void ctx.close(); return; }
      const now = ctx.currentTime;
      [659.25, 880].forEach((freq, i) => {   // E5 then A5
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.12;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.55);
      });
      setTimeout(() => { void ctx.close(); }, 1000);
    } catch { /* sound is optional */ }
  }

  private disarm(): void {
    this.armed = false;
    if (this.timer) { clearTimeout(this.timer); this.timer = undefined; }
  }

  // ---------- actions ----------

  expand(): void { this.expanded = true; }

  startQuiz(): void {
    this.expanded = true;
    this.step = 'q';
    this.qIndex = 0;
  }

  pick(option: string): void {
    this.answers[this.question.key] = option;
    if (this.qIndex < this.questions.length - 1) {
      this.qIndex++;
    } else {
      this.step = 'done';
    }
  }

  back(): void {
    if (this.step === 'callback') { this.step = 'done'; return; }
    if (this.step === 'done') { this.step = 'q'; this.qIndex = this.questions.length - 1; return; }
    if (this.qIndex > 0) { this.qIndex--; } else { this.step = 'intro'; }
  }

  book(): void {
    // Opening the modal marks the visitor as booked (see ngOnInit) and hides the card.
    this.schedule.open();
  }

  showCallback(): void {
    this.step = 'callback';
    this.consentTried = false;
    this.phoneError = '';
    this.sendError = '';
  }

  sendCallback(): void {
    const phone = this.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      this.phoneError = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    this.phoneError = '';
    this.consentTried = true;
    if (!this.consent) { return; }
    this.sendError = '';

    const remarks = this.questions
      .map((q) => `${q.title} ${this.answers[q.key] ?? 'Skipped'}`)
      .join(' | ');
    const pageData = [
      `Contact No : ${phone}`,
      `Name : ${this.name.trim()}`,
      `City : `,
      `Mail : `,
      `Insurance : ${this.answers.goal ?? ''}`,
      `Remarks : Free financial plan quiz. ${remarks}. ${consentRecord()}`,
      `Mode : Plan Nudge - Callback`,
      `Type : Website Lead`,
    ].join(', ');

    this.sending = true;
    this.leads.CustomerDetails({
      Id: 0,
      PageName: 'Free Financial Plan - Callback',
      PageUrl: window.location.href,
      PageData: pageData,
    }).pipe(
      timeout(15000),
      finalize(() => { this.sending = false; }),
    ).subscribe({
      next: () => {
        this.store('local', BOOKED_KEY, '1');
        this.step = 'sent';
      },
      error: () => {
        this.sendError = 'That didn\'t go through. Please try again, or book a time instead.';
      },
    });
  }

  /** "Maybe later" or the close button. */
  dismiss(): void {
    if (this.step !== 'sent') {
      this.store('local', SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    }
    this.visible = false;
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.visible && this.expanded) { this.dismiss(); }
  }

  // ---------- storage (can throw in private mode) ----------

  private read(kind: 'local' | 'session', key: string): string | null {
    try { return (kind === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; }
  }

  private store(kind: 'local' | 'session', key: string, value: string): void {
    try { (kind === 'local' ? localStorage : sessionStorage).setItem(key, value); } catch { /* ignore */ }
  }
}
