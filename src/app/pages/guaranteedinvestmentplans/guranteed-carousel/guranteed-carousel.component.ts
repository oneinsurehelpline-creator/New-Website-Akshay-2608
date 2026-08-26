import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LeadService } from 'src/app/services/lead.service';

interface CarouselDot {
  label: string;
}

@Component({
  selector: 'app-guranteed-carousel',
  templateUrl: './guranteed-carousel.component.html',
  styleUrls: ['./guranteed-carousel.component.scss'],
})
export class GuranteedCarouselComponent implements OnInit, OnDestroy {
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLElement>;
  @ViewChild('progressBar', { static: true }) progressBar!: ElementRef<HTMLElement>;

  // Slide index that is currently shown
  current = 0;

  // Dots / slide labels (order must match the slides in the template)
  dots: CarouselDot[] = [
    { label: 'Overview' },
    { label: 'For women' },
    { label: "Child's future" },
    { label: 'Retirement' },
  ];

  // Background images for the photo slides.
  // Place your images at these paths under src/assets (or edit the paths).
  slideImages = {
    women: 'assets/images/carousel/income-women.jpg',
    child: 'assets/images/carousel/child-education.jpg',
    retire: 'assets/images/carousel/retirement.jpg',
  };

  // Overview slide content
  trust: string[] = [
    'IRDAI-licensed broker',
    'Returns guaranteed at policy start',
    'Tax-free under Sec 10(10D)',
    '18 years · 5 lakh+ policies',
  ];

  stats = [
    { num: '6–7', unit: '%', label: 'Effective yield (post-tax)' },
    { num: '100', unit: '%', label: 'Capital protected' },
    { num: '10', unit: '–40yr', label: 'Flexible policy terms' },
    { num: '80', unit: 'C', label: 'Deduction on premiums paid' },
  ];

  // Autoplay
  private readonly duration = 7000; // ms per slide
  private readonly tickMs = 40;
  private elapsed = 0;
  progress = 0; // 0-100 for the progress bar
  paused = false;
  private timer: any = null;

  // Touch swipe
  private startX = 0;
  private dragging = false;

  private get count(): number {
    return this.dots.length;
  }
  userInvestmentPlanDetails: any;
  womenPlanDetails: any[] = [];
  childPlanDetails: any[] = [];
  retirementPlanDetails: any[] = [];
  constructor(private zone: NgZone, private leadService: LeadService) { }

  ngOnInit(): void {
    this.startAutoplay();
    this.InvestmentPlanDetails();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    if (this.prefersReducedMotion()) {
      return;
    }
    this.stopAutoplay();
    // Run the ticker outside Angular and write the bar width straight to the
    // DOM — no change detection per tick, so the fill stays smooth.
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        if (this.paused) {
          return;
        }
        this.elapsed += this.tickMs;
        const pct = Math.min((this.elapsed / this.duration) * 100, 100);
        this.setBarWidth(pct);
        if (this.elapsed >= this.duration) {
          this.zone.run(() => this.next());
        }
      }, this.tickMs);
    });
  }

  private setBarWidth(pct: number): void {
    const el = this.progressBar?.nativeElement;
    if (el) {
      el.style.width = pct + '%';
    }
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resetProgress(): void {
    this.elapsed = 0;
    this.progress = 0;
    this.setBarWidth(0);
  }

  go(index: number): void {
    this.current = (index + this.count) % this.count;
    this.resetProgress();
  }

  next(): void {
    this.go(this.current + 1);
  }

  prev(): void {
    this.go(this.current - 1);
  }

  /** Smoothly scroll to an in-page section by id (targets live in the parent page). */
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onMouseEnter(): void {
    this.paused = true;
  }

  onMouseLeave(): void {
    this.paused = false;
  }

  // Touch swipe
  onTouchStart(e: TouchEvent): void {
    this.startX = e.touches[0].clientX;
    this.dragging = true;
  }

  onTouchEnd(e: TouchEvent): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    const dx = e.changedTouches[0].clientX - this.startX;
    if (Math.abs(dx) > 45) {
      dx < 0 ? this.next() : this.prev();
    }
  }

  // Keyboard arrows (only while the carousel is roughly in view near the top)
  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
      return;
    }
    const rect = (this.track.nativeElement.closest('.hcar') as HTMLElement)?.getBoundingClientRect();
    if (rect && rect.bottom < 0) {
      return;
    }
    if (e.key === 'ArrowRight') {
      this.next();
    } else if (e.key === 'ArrowLeft') {
      this.prev();
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion:reduce)').matches
    );
  }
  InvestmentPlanDetails() {
    this.leadService.InvestmentPlanDetails({}).subscribe((res: any) => {
      console.log("InvestmentPlanDetails", res);
      this.userInvestmentPlanDetails = res;
      this.womenPlanDetails = res?.filter((plan: any) => plan.InvestmentValue === 1);
      this.childPlanDetails = res?.filter((plan: any) => plan.InvestmentValue === 2);
      this.retirementPlanDetails = res?.filter((plan: any) => plan.InvestmentValue === 3);
    }, (error: any) => {
      console.error("InvestmentPlanDetails error", error);
    });
  }

  /** 20000 → "20k", 2500 → "2.5k" */
  formatK(value: number | null | undefined): string {
    if (value == null) { return ''; }
    return this.trim(value / 1000) + 'k';
  }

  /** 316000 → "3.16" (rupees expressed in lakhs) */
  formatLakh(value: number | null | undefined): string {
    if (value == null) { return ''; }
    return this.trim(value / 100000);
  }

  /** Returns just the scaled number: 316000 → "3.16", 20000 → "20" */
  formatValue(value: number | null | undefined): string {
    if (value == null) { return ''; }
    const abs = Math.abs(value);
    if (abs >= 1e7) { return this.trim(value / 1e7); }
    if (abs >= 1e5) { return this.trim(value / 1e5); }
    if (abs >= 1e3) { return this.trim(value / 1e3); }
    return this.trim(value);
  }

  /** Returns the unit for that magnitude. long: "Lakhs" / short: "L" */
  formatUnit(value: number | null | undefined, long = false): string {
    if (value == null) { return ''; }
    const abs = Math.abs(value);
    if (abs >= 1e7) { return long ? 'Crore' : 'Cr'; }
    if (abs >= 1e5) { return long ? 'Lakhs' : 'L'; }
    if (abs >= 1e3) { return long ? 'Thousand' : 'k'; }
    return '';
  }

  private trim(n: number): string {
    return parseFloat(n.toFixed(2)).toString();
  }

}