import { isPlatformBrowser } from '@angular/common';
import {
  Component, AfterViewInit, OnDestroy, OnInit, ElementRef, ViewChild, HostListener, Inject, PLATFORM_ID,
} from '@angular/core';
import { LeadService } from 'src/app/services/lead.service';

interface HeroTab {
  label: string;
}

@Component({
  selector: 'app-carousel-header',
  templateUrl: './carousel-header.component.html',
  styleUrls: ['./carousel-header.component.scss']
})
export class CarouselHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('deckEl') deckEl!: ElementRef<HTMLElement>;

  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private leadService: LeadService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Hero deck carousel state */
  readonly TOTAL = 4;
  readonly tabs: HeroTab[] = [
    { label: 'Who we are' },
    { label: 'Saarth' },
    { label: 'Community' },
    { label: 'Claims' },
  ];

  private readonly AUTO_MS = 6000;
  current = 0;
  progress = 0;                 // bound to the progress bar width (%)
  companyAge = 0;

  /** Trusted-count stats — seeded with fallbacks, overwritten by companyDetails() */
  Policy_Issued = 0;
  Managers = 0;
  Branches = 0;
  Employees = 0;

  private timer: ReturnType<typeof setInterval> | undefined;
  private progStart = Date.now();
  private paused = false;
  /** Once true (any manual nav — arrows/dots/keyboard/swipe), autoplay never restarts. */
  private autoplayStopped = false;
  private touchX: number | null = null;
  private touchY: number | null = null;
  private io?: IntersectionObserver;
  private revealIo?: IntersectionObserver;
  private countIo?: IntersectionObserver;

  ngOnInit() {
    if (this.isBrowser) {
      this.companyDetails();
    }
    const startDate = new Date('2008-03-27');
    const today = new Date();

    this.companyAge = today.getFullYear() - startDate.getFullYear();

    if (today < new Date(today.getFullYear(), 2, 29)) {
      this.companyAge--;
    }
  }

  ngAfterViewInit(): void {
    this.go(0);

    if (!this.isBrowser) {
      return;
    }

    const deck = this.deckEl?.nativeElement;
    if (deck) {
      // Pause autoplay while the deck is off-screen.
      this.io = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? this.resumeAuto() : this.pauseAuto())),
        { threshold: 0.3 },
      );
      this.io.observe(deck);
    }

    this.initReveal();
    this.initCounters();
  }

  private inView(el: Element): boolean {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  /** Scroll-reveal for .reveal* elements (fires immediately for anything already on screen). */
  private initReveal(): void {
    const sel = '.reveal,.reveal-up,.reveal-left,.reveal-right,.reveal-scale';
    this.revealIo = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); this.revealIo?.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );
    this.host.nativeElement.querySelectorAll(sel).forEach((el) => {
      if (this.inView(el)) { el.classList.add('in'); } else { this.revealIo!.observe(el); }
    });
  }

  /** Count-up animation for [data-count] numbers (ports the original initCounters). */
  private initCounters(): void {
    const fmt = (n: number): string =>
      n >= 100000 ? Math.round(n / 100000) + 'L'
        : n >= 1000 ? n.toLocaleString('en-IN')
          : String(n);

    const animate = (el: Element) => {
      const target = parseInt((el as HTMLElement).dataset['count'] || '0', 10) || 0;
      const main = el.querySelector('.num-main');
      const dur = 1600;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        if (main) { main.textContent = fmt(Math.round(ease * target)); }
        if (p < 1) { requestAnimationFrame(step); }
      };
      requestAnimationFrame(step);
    };

    this.countIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) { return; }
        animate(en.target);
        this.countIo!.unobserve(en.target);
      });
    }, { threshold: 0.4 });

    this.host.nativeElement.querySelectorAll('[data-count]').forEach((el) => {
      if (this.inView(el)) { animate(el); } else { this.countIo!.observe(el); }
    });
  }
  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.io?.disconnect();
    this.revealIo?.disconnect();
    this.countIo?.disconnect();
  }

  // ---- carousel ----
  go(i: number, userInitiated = false): void {
    this.current = ((i % this.TOTAL) + this.TOTAL) % this.TOTAL;
    if (userInitiated) {
      this.autoplayStopped = true;
    }
    this.progStart = Date.now();
    this.restart();
  }
  next(userInitiated = true): void { this.go(this.current + 1, userInitiated); }
  prev(userInitiated = true): void { this.go(this.current - 1, userInitiated); }

  private tick(): void {
    if (this.paused) { return; }
    const elapsed = Date.now() - this.progStart;
    this.progress = Math.min(100, (elapsed / this.AUTO_MS) * 100);
    if (elapsed >= this.AUTO_MS) { this.go(this.current + 1); }
  }

  private restart(): void {
    clearInterval(this.timer);
    this.progress = 0;
    this.progStart = Date.now();
    if (!this.isBrowser || this.autoplayStopped || this.prefersReducedMotion()) {
      return;
    }
    this.timer = setInterval(() => this.tick(), 80);
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  pauseAuto(): void { this.paused = true; }
  resumeAuto(): void {
    this.paused = false;
    this.progStart = Date.now() - (this.progress / 100) * this.AUTO_MS;
  }

  // ---- touch swipe ----
  onTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) { return; }
    this.touchX = e.touches[0].clientX;
    this.touchY = e.touches[0].clientY;
    this.pauseAuto();
  }
  onTouchEnd(e: TouchEvent): void {
    if (this.touchX === null) { return; }
    const dx = e.changedTouches[0].clientX - this.touchX;
    const dy = e.changedTouches[0].clientY - (this.touchY ?? 0);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? this.next() : this.prev();
    } else {
      this.resumeAuto();
    }
    this.touchX = this.touchY = null;
  }

  // ---- keyboard (only when the deck is in view) ----
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target?.matches?.('input,textarea')) { return; }
    const el = this.deckEl?.nativeElement;
    if (!el) { return; }
    const r = el.getBoundingClientRect();
    if (r.bottom < 100 || r.top > window.innerHeight) { return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
  }

  companyDetails() {
    const cdto = {};
    this.leadService.companyDetails(cdto).subscribe((res: any) => {
      // API returns a nested result set: [[ { ... } ]]
      const data = Array.isArray(res) ? res?.[0] : res;
      if (!data) { return; }

      const changed =
        this.Policy_Issued  !== (data.Policy_Issued) ||
        this.Managers       !== (data.Managers) ||
        this.Branches !== (data.Branches) ||
        this.Employees !== (data.Employees);

      this.Policy_Issued = data.Policy_Issued;
      this.Managers = data.Managers;
      this.Branches = data.Branches;
      this.Employees = data.Employees;

      // Only re-run the count-up if the fresh values differ from what already animated.
      if (changed) { this.refreshCounters(); }
    });
  }

  /** Re-run the count-up after new API values land (waits for the [attr.data-count] bindings to flush). */
  private refreshCounters(): void {
    setTimeout(() => {
      this.countIo?.disconnect();
      this.initCounters();
    });
  }

}
