import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize, timeout } from 'rxjs/operators';
import { LeadService } from 'src/app/services/lead.service';
import {
  INSURERS, InsurerContact, SERVICE_CATEGORIES, SERVICES, ServiceCategory, ServiceItem, WAY_LABELS,
} from './servicesupport.data';

interface ServiceGroup { title: string; items: ServiceItem[]; }

@Component({
  selector: 'app-servicesupport',
  templateUrl: './servicesupport.component.html',
  styleUrls: ['./servicesupport.component.scss'],
})
export class ServicesupportComponent implements AfterViewInit, OnDestroy {
  readonly categories = SERVICE_CATEGORIES;
  readonly wayLabels = WAY_LABELS;

  category: ServiceCategory = 'life';
  query = '';
  searchOpen = false;

  /** Service open in the side panel. */
  active: ServiceItem | null = null;
  activeCase = 0;

  /** Insurer whose contact card is open, per place it can be opened from. */
  openInsurer: Record<'panel' | 'page', string | null> = { panel: null, page: null };

  // callback form (inside the panel)
  cbName = '';
  cbPhone = '';
  cbInsurer = '';
  cbError = '';
  cbSending = false;
  cbDone = false;

  private isBrowser: boolean;
  private observer?: IntersectionObserver;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private host: ElementRef<HTMLElement>,
    private leads: LeadService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ---------- lists ----------

  /** Services for the selected category, grouped. */
  get groups(): ServiceGroup[] {
    const groups: ServiceGroup[] = [];
    for (const s of SERVICES.filter((x) => x.category === this.category)) {
      let g = groups.find((x) => x.title === s.group);
      if (!g) { g = { title: s.group, items: [] }; groups.push(g); }
      g.items.push(s);
    }
    return groups;
  }

  /** Search matches across every category, shown in the dropdown under the search bar. */
  get hits(): ServiceItem[] {
    const q = this.query.trim().toLowerCase();
    if (q.length < 2) { return []; }
    return SERVICES.filter((s) => !s.other && `${s.title} ${s.short} ${s.group}`.toLowerCase().includes(q));
  }

  insurersFor(cat: ServiceCategory): InsurerContact[] {
    return INSURERS.filter((i) => i.categories.includes(cat));
  }

  insurerById(id: string | null): InsurerContact | undefined {
    return id ? INSURERS.find((i) => i.id === id) : undefined;
  }

  categoryLabel(cat: ServiceCategory): string {
    return this.categories.find((c) => c.id === cat)?.label ?? '';
  }

  /** Initials for insurers without a current-brand logo. */
  initials(name: string): string {
    return name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
  }

  telHref(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }

  // ---------- actions ----------

  setCategory(cat: ServiceCategory): void {
    this.category = cat;
    this.openInsurer.page = null;
  }

  clearSearch(): void {
    this.query = '';
    this.searchOpen = false;
  }

  /** Pick a search result: switch to its category and open it in the panel. */
  pickHit(s: ServiceItem): void {
    this.category = s.category;
    this.searchOpen = false;
    this.open(s);
  }

  openFirstHit(): void {
    const first = this.hits[0];
    if (first) { this.pickHit(first); }
  }

  open(s: ServiceItem): void {
    this.active = s;
    this.activeCase = 0;
    this.openInsurer.panel = null;
    this.cbName = ''; this.cbPhone = ''; this.cbInsurer = ''; this.cbError = ''; this.cbDone = false;
    if (this.isBrowser) { document.body.style.overflow = 'hidden'; }
  }

  close(): void {
    this.active = null;
    if (this.isBrowser) { document.body.style.overflow = ''; }
  }

  toggleInsurer(where: 'panel' | 'page', id: string): void {
    this.openInsurer[where] = this.openInsurer[where] === id ? null : id;
    if (!this.openInsurer[where] || !this.isBrowser) { return; }
    // wait for the contact card to render, then bring it into view
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>(`.ss-contact[data-where="${where}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.active) { this.close(); return; }
    this.searchOpen = false;
  }

  /** Close the search dropdown when clicking outside it. */
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.searchOpen) { return; }
    const search = this.host.nativeElement.querySelector('.ss-search');
    if (search && !search.contains(e.target as Node)) { this.searchOpen = false; }
  }

  sendCallback(): void {
    if (!this.active) { return; }
    const phone = this.cbPhone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!/^[6-9]\d{9}$/.test(phone)) {
      this.cbError = 'Please enter a valid 10-digit mobile number.';
      return;
    }
    this.cbError = '';
    const s = this.active;
    const insurer = this.insurerById(this.cbInsurer)?.name ?? 'Not specified';
    const caseLabel = s.cases ? ` (${s.cases[this.activeCase].label})` : '';
    const pageData = [
      `Contact No : ${phone}`,
      `Name : ${this.cbName.trim()}`,
      `City : `,
      `Mail : `,
      `Insurance : ${this.categoryLabel(s.category)}`,
      `Remarks : Service request: ${s.title}${caseLabel}. Insurer: ${insurer}`,
      `Mode : Service Support - Callback`,
      `Type : Website Lead`,
    ].join(', ');

    this.cbSending = true;
    this.leads.CustomerDetails({
      Id: 0,
      PageName: 'Service Support - Callback',
      PageUrl: window.location.href,
      PageData: pageData,
    }).pipe(
      timeout(15000),
      finalize(() => { this.cbSending = false; }),
    ).subscribe({
      next: () => { this.cbDone = true; },
      error: () => { this.cbError = 'That didn\'t go through. Please try again, or call us on 86559 86559.'; },
    });
  }

  // ---------- scroll reveal (same as the other pages) ----------

  ngAfterViewInit(): void {
    if (!this.isBrowser) { return; }
    const els = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal, .reveal-up, .reveal-scale'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    this.observer = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); this.observer?.unobserve(e.target); }
    }), { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (typeof document !== 'undefined') { document.body.style.overflow = ''; }
  }
}
