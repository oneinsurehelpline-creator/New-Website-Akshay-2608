import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';
import { LeadService } from '../../services/lead.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ScheduleModalService } from 'src/app/shared/schedule-modal/schedule-modal.service';
import { finalize, timeout } from 'rxjs/operators';

type CalcKey = 'life' | 'guaranteed' | 'health' | 'fire' | 'tax';

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


  constructor(
    private host: ElementRef<HTMLElement>,
    private fb: FormBuilder,
    private viewport: ViewportScroller,
    private router: Router,
    private leadService: LeadService,
    private utility: UtilityService,
    private scheduleModal: ScheduleModalService
  ) {
    this.consultForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(40)]],
      lastName: ['', [Validators.required, Validators.maxLength(40)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      help: ['Starting from scratch', Validators.required],
      time: ['Morning (9–12)', Validators.required],
    });
  }

  // ============ CONSULT FORM ============
  consultForm!: FormGroup;
  consultSubmitting = false;
  consultDone = false;
  consultError = '';

  /** convenience accessor for the template */
  get cf() { return this.consultForm.controls; }

  /** show an error only once the user has interacted with the field */
  invalid(name: string): boolean {
    const c = this.consultForm.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  onConsultSubmit(): void {
    this.consultError = '';

    // validation guard — template already shows the per-field errors
    if (this.consultForm.invalid) {
      this.consultForm.markAllAsTouched();
      this.utility.toast('warning', 'Please fill all required fields correctly.');
      return;
    }

    const v = this.consultForm.value;

    // build PageData in the shape the API expects
    const pageData = [
      `Contact No : ${v.phone}`,
      `Name : ${(v.firstName + ' ' + v.lastName).trim()}`,
      `City : `,                 // no city field on this form
      `Mail : ${v.email}`,
      `Insurance : `,            // no insurance field on this form
      `Remarks : Help: ${v.help}, Preferred time: ${v.time}`,
      `Mode : Home - Free Consultation`,
      `Type : Website Lead`,
    ].join(', ');

    const cdto = {
      Id: 0,
      PageName: 'Book - Free Consultation',
      PageUrl: window.location.href,
      PageData: pageData,
    };

    this.consultSubmitting = true;
    this.utility.loading('Submitting…', 'Sending your consultation request.');

    this.leadService.CustomerDetails(cdto).pipe(
      timeout(15000),
      finalize(() => { this.consultSubmitting = false; })   // always recovers
    ).subscribe({
      next: (res: any) => {
        console.log('CustomerDetails response:', res);
        this.consultDone = true;
        this.utility.success('Request received!', 'Our advisor will call you at your preferred time.');
        this.consultForm.reset({ help: 'Starting from scratch', time: 'Morning (9–12)' });
        this.scheduleModal.open();
      },
      error: (err) => {
        console.error('CustomerDetails failed:', err);
        this.consultError = err?.name === 'TimeoutError'
          ? 'The server took too long to respond. Please try again or reach us on WhatsApp.'
          : 'Something went wrong sending your request. Please try again, or reach us on WhatsApp.';
        this.utility.error('Could not send', this.consultError);
        this.scheduleModal.open();
      },
    });
  }

  onPhoneInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const digits = el.value.replace(/\D/g, '').slice(0, 10);
    this.consultForm.get('phone')!.setValue(digits);
    el.value = digits;
  }

  ngOnInit(): void {
    this.loadInsurers();
  }

  ngAfterViewInit(): void {
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
    document.body.style.overflow = '';
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


  // ============ CALCULATORS ============
  activeCalc: CalcKey | null = null;

  meta: Record<CalcKey, { title: string; sub: string }> = {
    life: { title: 'How much life cover do I need?', sub: 'The ten-minute answer.' },
    guaranteed: { title: 'What will my guaranteed plan return?', sub: 'At a conservative 6.25% IRR.' },
    health: { title: 'How much health cover should I take?', sub: 'City-indexed to hospital costs.' },
    fire: { title: 'What is my FIRE number?', sub: 'Financial Independence, Retire Early.' },
    tax: { title: 'How much tax can I save with insurance?', sub: 'Sections 80C + 80D.' },
  };

  // Life cover
  lcInc = 150000; lcDep = 2; lcExistStr = '25,00,000';
  // Guaranteed
  grAmt = 10000; grYr = 20;
  // Health
  hCity = 2; hAge = 45; hFam = 3;
  // FIRE
  fExp = 80000; fInf = 6; fYr = 20;
  // Tax
  tLife = 60000; tH = 25000; tSlab = 0.30;

  // ---- helpers ----
  private inr(n: number): string {
    const x = Math.round(n).toString();
    const last3 = x.slice(-3);
    const other = x.slice(0, -3);
    return other ? other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  }
  private parseNum(s: string): number { return parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0; }
  private fmtCr(v: number): string {
    return v >= 10000000 ? (v / 10000000).toFixed(2) + ' Cr'
      : v >= 100000 ? (v / 100000).toFixed(1) + ' L'
        : this.inr(v);
  }

  // ---- Life cover ----
  get lcExist(): number { return this.parseNum(this.lcExistStr); }
  get lcIncV(): string { return '₹ ' + this.inr(this.lcInc); }
  get lcOut(): string {
    const rec = Math.max(0, this.lcInc * 144 + this.lcDep * 1500000 - this.lcExist);
    return this.inr(rec);
  }
  get lcNote(): string {
    return `Based on 12× annual income (₹ ${this.inr(this.lcInc * 12)}) + ${this.lcDep} dependents, less existing cover.`;
  }
  stepLC(d: number): void { this.lcDep = Math.max(0, Math.min(8, this.lcDep + d)); }

  // ---- Guaranteed ----
  get grAmtV(): string { return '₹ ' + this.inr(this.grAmt); }
  get grYrV(): string { return this.grYr + ' yrs'; }
  private get grFV(): number {
    const r = 0.0625 / 12, n = this.grYr * 12;
    return this.grAmt * ((Math.pow(1 + r, n) - 1) / r);
  }
  get grOut(): string { return this.fmtCr(this.grFV); }
  get grNote(): string {
    const totalIn = this.grAmt * this.grYr * 12;
    return `You invest ₹ ${this.fmtCr(totalIn)} · You get back ₹ ${this.fmtCr(this.grFV)}. Guaranteed at 6.25% IRR.`;
  }
  stepGR(d: number): void { this.grYr = Math.max(5, Math.min(30, this.grYr + d)); }

  // ---- Health ----
  get hAgeV(): number { return this.hAge; }
  get hFamV(): number { return this.hFam; }
  private get hRec(): number {
    const base = this.hCity === 1 ? 1500000 : this.hCity === 2 ? 1000000 : 700000;
    const famMult = 1 + (this.hFam - 1) * 0.18;
    const ageMult = this.hAge < 40 ? 1 : this.hAge < 55 ? 1.35 : this.hAge < 65 ? 1.75 : 2.2;
    return Math.round(base * famMult * ageMult / 500000) * 500000;
  }
  get hOut(): string { return this.fmtCr(this.hRec); }
  get hNote(): string {
    const city = this.hCity === 1 ? 'metro' : this.hCity === 2 ? 'Tier 1' : 'Tier 2';
    return `Covers multi-day hospitalisation in a ${city} city for a family of ${this.hFam} plus a critical-illness buffer.`;
  }
  stepH(d: number): void { this.hFam = Math.max(1, Math.min(8, this.hFam + d)); }

  // ---- FIRE ----
  get fExpV(): string { return '₹ ' + this.inr(this.fExp); }
  get fInfV(): string { return this.fInf.toFixed(1) + '%'; }
  get fYrV(): string { return this.fYr + ' yrs'; }
  private get fFutureAnnual(): number { return this.fExp * 12 * Math.pow(1 + this.fInf / 100, this.fYr); }
  get fOut(): string { return this.fmtCr(this.fFutureAnnual * 25); }
  get fNote(): string {
    return `Today's ₹${this.inr(this.fExp * 12)}/yr becomes ₹${this.fmtCr(this.fFutureAnnual)}/yr in ${this.fYr} years. Corpus = 25× that (4% SWR).`;
  }
  stepF(d: number): void { this.fYr = Math.max(5, Math.min(45, this.fYr + d)); }

  // ---- Tax ----
  get tLifeV(): string { return '₹ ' + this.inr(this.tLife); }
  get tHV(): string { return '₹ ' + this.inr(this.tH); }
  get tOut(): string {
    const life = Math.min(150000, this.tLife), health = Math.min(75000, this.tH);
    return this.inr((life + health) * this.tSlab);
  }
  get tNote(): string {
    const life = Math.min(150000, this.tLife), health = Math.min(75000, this.tH);
    return `80C eligible: ₹${this.inr(life)} · 80D eligible: ₹${this.inr(health)} · Tax slab: ${(this.tSlab * 100).toFixed(0)}%.`;
  }

  // ---- modal control ----
  openCalc(k: CalcKey): void { this.activeCalc = k; document.body.style.overflow = 'hidden'; }
  closeCalc(): void { this.activeCalc = null; document.body.style.overflow = ''; }
  @HostListener('document:keydown.escape') onEsc(): void { if (this.activeCalc) { this.closeCalc(); } }

  /** Close the calculator modal (if open) and scroll to the consult form. */
  goConsult(): void {
    this.closeCalc();
    setTimeout(() => this.viewport.scrollToAnchor('consult'), 0);
  }

  /** Close the modal and navigate to another page (optionally to a section id). */
  goTo(route: string, fragment?: string): void {
    this.closeCalc();
    this.router.navigate([route], fragment ? { fragment } : {});
  }

  // ============ TESTIMONIALS CAROUSEL ============
  @ViewChild('testiTrack') private testiTrack?: ElementRef<HTMLElement>;
  private readonly testiTotal = 6;
  testiIdx = 0;
  testiPerView = window.innerWidth < 900 ? 1 : 3;;
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