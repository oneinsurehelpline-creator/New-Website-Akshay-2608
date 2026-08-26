import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';
import { LeadService } from '../../services/lead.service';
import {
  KB_ARTICLES,
  KB_CATEGORIES,
  KB_POPULAR,
  KbArticle,
  KbCategory,
} from './knowledgebase.data';

interface KbAuthor {
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'app-knowledgebase',
  templateUrl: './knowledgebase.component.html',
  styleUrls: ['./knowledgebase.component.scss'],
})
export class KnowledgebaseComponent implements AfterViewInit, OnDestroy {
  // ======================= DATA =======================
  categories: KbCategory[] = KB_CATEGORIES;
  articles: KbArticle[] = KB_ARTICLES;
  popular: string[] = KB_POPULAR;

  /** Articles for the "Most read" strip, resolved by title fragment. */
  featured: KbArticle[] = [];

  private byId: Record<string, KbArticle> = {};
  /** public so the template can resolve a category from an article's `cat`. */
  catById: Record<string, KbCategory> = {};

  /** Pre-selects the "Looking for" dropdown when a CTA is topic-specific. */
  private catNeed: Record<string, string> = {
    basics: 'unsure', life: 'life', savings: 'life', term: 'term',
    health: 'health', motor: 'motor', travel: 'unsure',
  };

  // ==================== CATEGORY TABS ====================
  activeCat = 'basics';

  get activeCategory(): KbCategory | undefined {
    return this.catById[this.activeCat];
  }

  get activeArticles(): KbArticle[] {
    return this.articles.filter((a) => a.cat === this.activeCat);
  }

  setTab(id: string): void {
    this.activeCat = id;
  }

  // ======================= SEARCH =======================
  query = '';
  searchOpen = false;
  searchFocused = false;
  quickAnswer?: KbArticle;
  relatedHits: KbArticle[] = [];
  noResults = false;

  private runSearch(raw: string): KbArticle[] {
    const q = raw.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t.length > 1);
    if (!tokens.length && q.length < 2) { return []; }
    const scored = this.articles.map((a) => {
      let s = 0;
      const tl = a.title.toLowerCase();
      const ml = a.meta.toLowerCase();
      const full = q.length > 1 && (tl.indexOf(q) > -1 || ml.indexOf(q) > -1);
      if (tl.indexOf(q) > -1 && q.length > 1) { s += 120; }
      if (ml.indexOf(q) > -1 && q.length > 1) { s += 30; }
      let hitAll = tokens.length > 0;
      tokens.forEach((t) => {
        let h = false;
        if (tl.indexOf(t) > -1) { s += 22; h = true; }
        if (ml.indexOf(t) > -1) { s += 7; h = true; }
        if (!h) { if ((a._text || '').indexOf(t) > -1) { s += 3; } hitAll = false; }
      });
      const rel = full || (tokens.length > 0 && hitAll);
      return { a, s, rel };
    }).filter((x) => x.rel);
    scored.sort((x, y) => y.s - x.s || x.a.title.length - y.a.title.length);
    return scored.slice(0, 7).map((x) => x.a);
  }

  onSearchInput(): void {
    const v = this.query;
    if (v.trim().length >= 2) {
      const results = this.runSearch(v);
      this.noResults = results.length === 0;
      this.quickAnswer = results[0];
      this.relatedHits = results.slice(1, 7);
      this.searchOpen = true;
    } else {
      this.searchOpen = false;
      this.quickAnswer = undefined;
      this.relatedHits = [];
      this.noResults = false;
    }
  }

  onSearchFocus(): void {
    this.searchFocused = true;
    if (this.query.trim().length >= 2) { this.onSearchInput(); }
  }

  clearSearch(): void {
    this.query = '';
    this.searchOpen = false;
    this.quickAnswer = undefined;
    this.relatedHits = [];
    this.noResults = false;
  }

  /** Enter key / Search button — jump to the best match. */
  goSearch(): void {
    const results = this.runSearch(this.query);
    if (results.length) { this.openArticle(results[0].id); }
  }

  pickPopular(q: string): void {
    this.query = q;
    this.searchFocused = true;
    this.onSearchInput();
    setTimeout(() => {
      (this.host.nativeElement.querySelector('#kbInput') as HTMLElement | null)?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== ARTICLE READER ====================
  activeArticle: KbArticle | null = null;
  activeAuthor?: KbAuthor;
  related: KbArticle[] = [];
  openFaqs = new Set<number>();
  progress = 0;

  private authors: Record<string, KbAuthor> = {
    susant: { name: 'Susant Padhi', role: 'Claims Head & General Insurance Expert', initials: 'SP' },
    ritesh: { name: 'Ritesh Agrawal', role: 'Motor Insurance Expert', initials: 'RA' },
    rochelle: { name: 'Rochelle Mascarenhas', role: 'Life Insurance & Guaranteed Investment Expert', initials: 'RM' },
    rohit: { name: 'Rohit Yadav', role: 'Products Expert', initials: 'RY' },
  };
  private catAuthors: Record<string, string[]> = {
    basics: ['rohit', 'susant'], life: ['rochelle'], savings: ['rochelle'],
    term: ['rochelle', 'rohit'], health: ['susant'], motor: ['ritesh'], travel: ['susant'],
  };

  private pickAuthor(a: KbArticle): KbAuthor {
    const pool = this.catAuthors[a.cat] || ['rohit'];
    let h = 0;
    for (let i = 0; i < a.id.length; i++) { h = (h * 31 + a.id.charCodeAt(i)) >>> 0; }
    return this.authors[pool[h % pool.length]];
  }

  private buildRelated(a: KbArticle): KbArticle[] {
    const same = this.articles.filter((x) => x.cat === a.cat && x.id !== a.id);
    if (same.length >= 3) { return same.slice(0, 3); }
    const others = this.articles.filter((x) => x.cat !== a.cat && x.id !== a.id);
    return same.concat(others).slice(0, 3);
  }

  /** Open an article in the in-page reader. */
  openArticle(id: string, updateUrl = true): void {
    const a = this.byId[id];
    if (!a) { return; }
    this.activeArticle = a;
    this.activeAuthor = this.pickAuthor(a);
    this.related = this.buildRelated(a);
    this.openFaqs.clear();
    this.searchOpen = false;
    this.searchFocused = false;
    this.progress = 0;
    if (updateUrl) { history.pushState({ kb: id }, '', location.pathname + location.search + '#' + id); }
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      this.revealScan();
    });
  }

  showHub(updateUrl = true): void {
    this.activeArticle = null;
    this.progress = 0;
    if (updateUrl) { history.pushState({}, '', location.pathname + location.search); }
    setTimeout(() => this.revealScan());
  }

  /** Deep-link + browser back/forward: open/close based on the URL hash. */
  @HostListener('window:popstate')
  onPopState(): void { this.syncFromHash(false); }

  private syncFromHash(updateUrl = false): void {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (id && this.byId[id]) { this.openArticle(id, updateUrl); }
    else if (this.activeArticle) { this.showHub(updateUrl); }
  }

  toggleFaq(i: number): void {
    if (this.openFaqs.has(i)) { this.openFaqs.delete(i); }
    else { this.openFaqs.add(i); }
  }

  // ================== BOOK A CALL MODAL ==================
  modalOpen = false;
  submitting = false;
  form!: FormGroup;

  toastMsg = '';
  toastShow = false;
  toastType: 'success' | 'error' = 'success';
  private toastTimer?: ReturnType<typeof setTimeout>;

  /** need -> readable label used in the "Insurance" segment of PageData */
  private needLabel: Record<string, string> = {
    health: 'Health', term: 'Term', life: 'Life', motor: 'Motor', unsure: 'Not sure',
  };

  /** convenience accessor for the template */
  get cf() { return this.form.controls; }

  /** show a field error only after the user has interacted with it */
  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  openModal(pref?: string): void {
    const need = pref && this.catNeed[pref] ? this.catNeed[pref] : '';
    this.form.patchValue({ need });
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      (this.host.nativeElement.querySelector('#cf_name') as HTMLElement | null)?.focus();
    }, 60);
  }

  closeModal(): void {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  /** keep the phone field digits-only, max 10 (Indian mobile) */
  onPhoneInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 10);
    this.form.get('phone')!.setValue(digits);
    el.value = digits;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const name = String(v.name).trim();
    const firstName = name.split(' ')[0];

    // Build PageData in the exact shape the CustomerDetails API expects
    // (same order/format as the home consultation form).
    const pageData = [
      `Contact No : ${v.phone}`,
      `Name : ${name}`,
      `City : `,                                       // not collected on this form
      `Mail : `,                                       // not collected on this form
      `Insurance : ${this.needLabel[v.need] || v.need}`,
      `Remarks : Book a free call (Knowledge Base)`,
      `Mode : Knowledge Base - Book a Call`,
      `Type : Website Lead`,
    ].join(', ');

    const cdto = {
      Id: 0,
      PageName: 'Book a Call - Knowledge Base',
      PageUrl: window.location.href,
      PageData: pageData,
    };

    const scheduleCall = 'https://schedule.oneinsure.com/book/get-expert-guidance-web';

    this.submitting = true;

    this.leadService.CustomerDetails(cdto).pipe(
      timeout(15000),
      finalize(() => { this.submitting = false; })      // always releases the button
    ).subscribe({
      next: (res: any) => {
        console.log('CustomerDetails response:', res);
        this.closeModal();
        this.form.reset({ name: '', phone: '', need: '' });
        this.showToast(`Thanks ${firstName} — an advisor will call you shortly.`, 'success');
        window.location.assign(scheduleCall);
      },
      error: (err) => {
        console.error('CustomerDetails failed:', err);
        const msg = err?.name === 'TimeoutError'
          ? 'The server took too long to respond. Please try again.'
          : 'Something went wrong sending your request. Please try again.';
        this.showToast(msg, 'error');
        window.location.assign(scheduleCall);
      },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.toastShow = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastShow = false), type === 'error' ? 6000 : 4200);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.modalOpen) { this.closeModal(); return; }
    if (this.activeArticle) { this.showHub(); }
  }

  /** Close the search dropdown when clicking outside the search / chips. */
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.searchOpen && !this.searchFocused) { return; }
    const t = e.target as Node;
    const search = this.host.nativeElement.querySelector('.kb-search');
    const popular = this.host.nativeElement.querySelector('.kb-popular');
    const inside = (search && search.contains(t)) || (popular && popular.contains(t));
    if (!inside) {
      this.searchOpen = false;
      this.searchFocused = false;
    }
  }

  // ==================== LIFECYCLE ====================
  private revealIo?: IntersectionObserver;

  constructor(
    private host: ElementRef<HTMLElement>,
    private fb: FormBuilder,
    private leadService: LeadService,
  ) {
    // index lookups + search text
    this.categories.forEach((c) => (this.catById[c.id] = c));
    this.articles.forEach((a) => {
      a._text = (a.title + ' ' + a.meta + ' ' + this.stripHtml(a.html)).toLowerCase();
      this.byId[a.id] = a;
    });
    this.activeCat = this.categories[0]?.id ?? 'basics';

    // "Most read" strip — resolve by title fragment (same set as the source).
    const frags = [
      'how much term insurance cover',
      'what is health insurance and what does it cover',
      'cashless vs reimbursement',
      'guaranteed plans vs fixed deposits',
      'third-party vs comprehensive',
      'what is insurance and how does it actually',
    ];
    frags.forEach((f) => {
      const m = this.articles.find((a) => a.title.toLowerCase().indexOf(f) > -1);
      if (m && this.featured.indexOf(m) < 0) { this.featured.push(m); }
    });

    // Book-a-call form + validation
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      need: ['', Validators.required],
    });
  }

  private stripHtml(html: string): string {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }

  ngAfterViewInit(): void {
    this.initReveal();
    this.syncFromHash(false);   // <-- add this line
  }

  ngOnDestroy(): void {
    this.revealIo?.disconnect();
    clearTimeout(this.toastTimer);
    document.body.style.overflow = '';
  }

  // reading progress bar
  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.activeArticle) { this.progress = 0; return; }
    const art = this.host.nativeElement.querySelector('.kb-article') as HTMLElement | null;
    if (!art) { return; }
    const start = art.offsetTop;
    const total = art.offsetHeight - window.innerHeight * 0.6;
    const p = (window.scrollY - start) / Math.max(1, total);
    this.progress = Math.max(0, Math.min(1, p)) * 100;
  }

  private inView(el: Element): boolean {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  private initReveal(): void {
    this.revealIo = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.revealIo?.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );
    this.revealScan();
  }

  /** (Re)observe reveal targets — called after view swaps (hub then reader). */
  private revealScan(): void {
    const sel = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale';
    this.host.nativeElement.querySelectorAll(sel).forEach((el) => {
      if (el.classList.contains('in')) { return; }
      this.inView(el) ? el.classList.add('in') : this.revealIo?.observe(el);
    });
  }
}