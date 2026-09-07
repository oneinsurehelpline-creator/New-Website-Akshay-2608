import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface DocItem {
  title: string;
  meta?: string;
  url: string;
}

interface ContactInfo {
  name: string;
  designation: string;
  email: string;
  phone?: string;
}

interface PersonInfo {
  name: string;
  role: string;
}

interface CommitteeInfo {
  name: string;
  members: string[];
}

interface DisclosureSection {
  id: string;
  num: string;
  title: string;
  summary: string;
  documents?: DocItem[];
  contact?: ContactInfo;
  people?: PersonInfo[];
  committees?: CommitteeInfo[];
}

interface Manifest {
  lastUpdated: string;
  sections: DisclosureSection[];
}

@Component({
  selector: 'app-regulatorydisclosures',
  templateUrl: './regulatorydisclosures.component.html',
  styleUrls: ['./regulatorydisclosures.component.scss'],
})
export class RegulatorydisclosuresComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  lastUpdated = '—';
  sections: DisclosureSection[] = [];
  loading = true;
  loadError = false;

  /** id of the TOC entry currently in view (drives the active highlight) */
  activeSection = '';

  private readonly headerOffset = 112;
  private io?: IntersectionObserver;

  ngOnInit(): void {
    this.http.get<Manifest>('assets/documents/regulatory-disclosures.json').subscribe({
      next: (data) => {
        this.lastUpdated = data.lastUpdated;
        this.sections = data.sections;
        this.activeSection = this.sections[0]?.id ?? '';
        this.loading = false;
        // Wait one tick so the *ngFor content is in the DOM before wiring observers.
        if (this.isBrowser) {
          setTimeout(() => {
            this.setupReveal();
            this.spyOnScroll();
          }, 0);
        }
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.setupReveal();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  hasDocs(s: DisclosureSection): boolean {
    return !!s.documents;
  }

  hasContact(s: DisclosureSection): boolean {
    return !!s.contact;
  }

  hasBoard(s: DisclosureSection): boolean {
    return !!s.people || !!s.committees;
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
    if (!this.sections.length) { return; }
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
