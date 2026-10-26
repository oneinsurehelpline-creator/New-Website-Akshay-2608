import { INSURER_COUNT } from '../../shared/site-facts';
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, HostListener, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LeadService } from '../../services/lead.service';
import { finalize, timeout } from 'rxjs/operators';

interface Insurer {
  Id: number;
  Name: string;
  ImageUrl: string;
  IsActive: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {


  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private leadService: LeadService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadInsurers();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.initReveal();
    this.initCounters();
    // this.testiCompute();
    setTimeout(() => this.applyTesti(), 0);
    this.startTesti();
  }
  ngOnDestroy(): void {
    this.revealIo?.disconnect();
    this.countIo?.disconnect();
    this.stopTesti();
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  // ============ INSURER LOGOS ============
  insurers: Insurer[] = [];
  insurersLoading = true;
  insurersError = false;

  private loadInsurers(): void {
    this.insurersLoading = true;
    this.insurersError = false;
 
    // Adjust if your API expects e.g. { IsActive: 1 }.
    this.leadService.insurerImgs({}).pipe(
      timeout(15000),
      finalize(() => { this.insurersLoading = false; })   // always recovers
    ).subscribe({
      next: (res: any) => {
        // API returns a nested array: [ [ {...}, {...} ] ]
        const raw = Array.isArray(res)
          ? (Array.isArray(res[0]) ? res[0] : res)
          : [];
        this.insurers = (raw as Insurer[])
          .filter(x => x && x.IsActive === 1 && !!x.ImageUrl);
        if (!this.insurers.length) { this.insurersError = true; }
      },
      error: (err) => {
        console.error('insurerImgs failed:', err);
        this.insurers = [];
        this.insurersError = true;
      },
    });
  }

  /** Duplicated list so the CSS marquee (-50%) loops seamlessly. */
  get marqueeInsurers(): Insurer[] {
    return this.insurers.length ? [...this.insurers, ...this.insurers] : [];
  }

  /** "Aditya_Birla_Life" -> "Aditya Birla Life" for the alt text. */
  prettifyName(name: string): string {
    return (name || '').replace(/[_-]+/g, ' ').trim();
  }

  trackByInsurer(_i: number, ins: Insurer): number { return ins.Id; }

  /** Hide any logo whose image URL is broken so the row has no gaps. */
  onLogoError(e: Event): void {
    const box = (e.target as HTMLImageElement).closest('.logo-box') as HTMLElement | null;
    if (box) { box.style.display = 'none'; }
  }

  // ============ REVEAL + COUNTERS ============
  private revealIo?: IntersectionObserver;
  private countIo?: IntersectionObserver;

  private inView(el: Element): boolean {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }
  private initReveal(): void {
    const sel = '.reveal,.reveal-up,.reveal-left,.reveal-right,.reveal-scale';
    this.revealIo = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); this.revealIo?.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    this.host.nativeElement.querySelectorAll(sel).forEach((el) =>
      this.inView(el) ? el.classList.add('in') : this.revealIo!.observe(el));
  }
  private initCounters(): void {
    const fmt = (n: number) => n >= 100000 ? Math.round(n / 100000) + 'L' : n >= 1000 ? n.toLocaleString('en-IN') : String(n);
    const animate = (el: Element) => {
      const target = parseInt((el as HTMLElement).dataset['count'] || '0', 10) || 0;
      const main = el.querySelector('.num-main'); const dur = 1600; const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1); const ease = 1 - Math.pow(1 - p, 4);
        if (main) { main.textContent = fmt(Math.round(ease * target)); }
        if (p < 1) { requestAnimationFrame(step); }
      };
      requestAnimationFrame(step);
    };
    this.countIo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { animate(e.target); this.countIo!.unobserve(e.target); } }), { threshold: 0.4 });
    this.host.nativeElement.querySelectorAll('[data-count]').forEach((el) =>
      this.inView(el) ? animate(el) : this.countIo!.observe(el));
  }


  /** "Built by advisors" section: the usual way (struck out) vs the OneInsure way. */
  readonly insurerCount = INSURER_COUNT;

  readonly diffRows = [
    {
      stat: '30 min', cap: 'Free first review',
      old: 'Pitches you a policy on the first call.',
      now: 'We start with a free review of what you actually need. A policy comes only if it fits.',
    },
    {
      stat: '30+', cap: 'Insurers compared',
      old: 'Sells the one or two insurers they are tied to.',
      now: `We compare ${INSURER_COUNT} insurers and hand you the three that make sense for your family.`,
    },
    {
      stat: '1', cap: 'Advisor, start to finish',
      old: 'Hands you over to a call centre once you have bought.',
      now: 'One advisor stays with you, from the first quote to the final claim.',
    },
    {
      stat: '₹0', cap: 'Claim support fees',
      old: 'Goes quiet when it is time to claim.',
      now: 'We do the paperwork and chase the insurer for you. Free, for life.',
    },
  ];

  // ============ PRODUCTS "VIEW ALL" MODAL ============
  productsModalOpen = false;
  openProductsModal(): void { this.productsModalOpen = true; document.body.style.overflow = 'hidden'; }
  closeProductsModal(): void { this.productsModalOpen = false; document.body.style.overflow = ''; }

  @HostListener('document:keydown.escape') onEsc(): void {
    if (this.productsModalOpen) { this.closeProductsModal(); }
  }

  // ============ TESTIMONIALS CAROUSEL ============
  @ViewChild('testiTrack') private testiTrack?: ElementRef<HTMLElement>;
  private readonly testiTotal = 6;
  testiIdx = 0;
  testiPerView = typeof window !== 'undefined' ? (window.innerWidth < 900 ? 1 : 3) : 3;
  testiDots: number[] = [0, 1, 2, 3];
  testiTransform = 'translateX(0)';
  private testiTimer?: ReturnType<typeof setInterval>;

  private get testiPages(): number { return this.testiDots.length; }

  private testiCompute(): void {
    this.testiPerView = window.innerWidth < 900 ? 1 : 3;
    const pages = Math.max(1, this.testiTotal - this.testiPerView + 1);
    this.testiDots = Array.from({ length: pages }, (_, i) => i);
    if (this.testiIdx >= pages) { this.testiIdx = 0; }
  }
  applyTesti(): void {
    const track = this.testiTrack?.nativeElement;
    if (!track || !track.children.length) { return; }
    if (this.testiIdx >= this.testiPages) { this.testiIdx = 0; }
    if (this.testiIdx < 0) { this.testiIdx = this.testiPages - 1; }
    const cardW = (track.children[0] as HTMLElement).getBoundingClientRect().width;
    const gap = 20;
    this.testiTransform = `translateX(-${this.testiIdx * (cardW + gap)}px)`;
  }
  prevTesti(): void { this.testiIdx--; this.applyTesti(); }
  nextTesti(): void { this.testiIdx++; this.applyTesti(); }
  goTesti(i: number): void { this.testiIdx = i; this.applyTesti(); }
  private startTesti(): void { this.stopTesti(); this.testiTimer = setInterval(() => this.nextTesti(), 5500); }
  private stopTesti(): void { if (this.testiTimer) { clearInterval(this.testiTimer); this.testiTimer = undefined; } }
  pauseTesti(): void { this.stopTesti(); }
  resumeTesti(): void { this.startTesti(); }

  @HostListener('window:resize') onResize(): void {
    const prev = this.testiPerView;
    this.testiCompute();
    if (this.testiPerView !== prev) { this.testiIdx = 0; }
    this.applyTesti();
  }


}