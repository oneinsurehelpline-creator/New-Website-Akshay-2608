import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
} from '@angular/core';

interface TocItem {
  id: string;
  title: string;
}

@Component({
  selector: 'app-termsconditions',
  templateUrl: './termsconditions.component.html',
  styleUrls: ['./termsconditions.component.scss'],
})
export class TermsconditionsComponent implements AfterViewInit, OnDestroy {
  constructor(private host: ElementRef<HTMLElement>) {}

  /** Shown in the hero meta + the intro callout */
  readonly effectiveDate = 'June 11, 2015';

  /** TOC entries — each id MUST match the [id] on its <article> in the template */
  readonly sections: TocItem[] = [
    { id: 'overview', title: 'Overview' },
    { id: 'conduct', title: 'Responsible Use & Conduct' },
    { id: 'privacy', title: 'Privacy' },
    { id: 'warranties', title: 'Limitation of Warranties' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'copyrights', title: 'Copyrights / Trademarks' },
    { id: 'termination', title: 'Termination of Use' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'guarantee', title: 'Guarantee' },
  ];

  /** id of the TOC entry currently in view (drives the active highlight) */
  activeSection = this.sections[0].id;

  private readonly headerOffset = 112;
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    // Content is static, so the DOM is ready here — wire the observers once.
    this.setupReveal();
    this.spyOnScroll();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  // ---------- Scroll reveal (same pattern as the other pages) ----------
  private setupReveal(): void {
    const sel = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale';
    this.io?.disconnect();
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.io?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );
    this.host.nativeElement
      .querySelectorAll(sel)
      .forEach((el) => this.io!.observe(el));
  }

  // ---------- TOC scroll-spy ----------
  @HostListener('window:scroll')
  spyOnScroll(): void {
    const y = window.scrollY + this.headerOffset + 28;
    let current = this.sections[0].id;
    for (const s of this.sections) {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= y) {
        current = s.id;
      }
    }
    this.activeSection = current;
  }

  // ---------- Navigation ----------
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) { return; }
    const top = el.getBoundingClientRect().top + window.scrollY - this.headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
    this.activeSection = id;
  }
}