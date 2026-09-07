import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface TldrCard {
  title: string;
  desc: string;
  icon: 'user' | 'lock' | 'share' | 'optout';
}

interface TocItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-privacypolicy',
  templateUrl: './privacypolicy.component.html',
  styleUrls: ['./privacypolicy.component.scss'],
})
export class PrivacypolicyComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  lastUpdated = 'June 11, 2015';

  // ---------- TL;DR STRIP ----------
  tldr: TldrCard[] = [
    {
      title: 'Only what you give us',
      desc: "We never collect anything you haven't shared yourself.",
      icon: 'user',
    },
    {
      title: 'Encrypted & secure',
      desc: 'SSL channel, signed transfers, no plaintext storage of sensitive data.',
      icon: 'lock',
    },
    {
      title: 'Shared only to serve you',
      desc: 'With your insurer or partner — and only with your permission.',
      icon: 'share',
    },
    {
      title: 'Opt out, anytime',
      desc: "Unsubscribe link on every email. Or write to us, we'll remove you.",
      icon: 'optout',
    },
  ];

  // ---------- TABLE OF CONTENTS ----------
  toc: TocItem[] = [
    { id: 'sec-overview', label: 'Overview' },
    { id: 'sec-personal', label: 'Personal information' },
    { id: 'sec-nonpersonal', label: 'Non-personal data' },
    { id: 'sec-cookies', label: 'Cookies' },
    { id: 'sec-use', label: 'How we use it' },
    { id: 'sec-protect', label: 'How we protect it' },
    { id: 'sec-share', label: 'Sharing' },
    { id: 'sec-thirdparty', label: 'Third-party sites' },
    { id: 'sec-changes', label: 'Changes' },
    { id: 'sec-accept', label: 'Acceptance' },
  ];

  /** id of the TOC entry currently in view (drives the active highlight) */
  activeSection = this.toc[0].id;

  private readonly headerOffset = 112;
  private io?: IntersectionObserver;

  // ---------- Lifecycle ----------
  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.setupReveal();
    // set the initial active TOC entry
    setTimeout(() => this.spyOnScroll(), 0);
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  // ---------- Scroll reveal (same pattern as the other pages) ----------
  private setupReveal(): void {
    const sel = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale';
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
    let current = this.toc[0].id;
    for (const item of this.toc) {
      const el = document.getElementById(item.id);
      if (el && el.offsetTop <= y) {
        current = item.id;
      }
    }
    this.activeSection = current;
  }

  // ---------- Navigation ----------
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - this.headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
    this.activeSection = id;
  }
}