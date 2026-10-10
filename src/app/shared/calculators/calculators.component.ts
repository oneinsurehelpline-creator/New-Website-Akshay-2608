import { AfterViewInit, Component, ElementRef, HostListener, Inject, Input, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ScheduleModalService } from '../schedule-modal/schedule-modal.service';
import { WHATSAPP_URL } from '../site-facts';
import { ESTIMATE_NOTE, MORE_CALCS, MORE_GROUPS, MoreCalc, MoreField, MoreResult, inr as fmtInr } from './more-calcs';

export type CalcKey = 'life' | 'guaranteed' | 'health' | 'fire' | 'tax';

/**
 * The five calculators (cards + modal). Used on the homepage and on /calculators.
 * Moved out of HomeComponent unchanged, plus a "Send my result on WhatsApp" link.
 */
@Component({
  selector: 'app-calculators',
  templateUrl: './calculators.component.html',
  styleUrls: ['./calculators.component.scss'],
})
export class CalculatorsComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private revealIo?: IntersectionObserver;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private host: ElementRef<HTMLElement>,
    private router: Router,
    private scheduleModal: ScheduleModalService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ============ CALCULATORS ============
  /** One of the five originals, or a MORE_CALCS id. */
  activeCalc: CalcKey | string | null = null;

  /** Show the extra calculators (used on /calculators, not the homepage). */
  @Input() showMore = false;

  // ---------- extra calculators ----------
  readonly moreGroups = MORE_GROUPS;
  readonly estimateNote = ESTIMATE_NOTE;
  /** Current input values per extra calculator, seeded with the defaults. */
  readonly moreVals: Record<string, Record<string, number>> = Object.fromEntries(
    MORE_CALCS.map((c) => [c.id, Object.fromEntries(c.fields.map((f) => [f.key, f.def]))]));

  moreIn(group: MoreCalc['group']): MoreCalc[] { return MORE_CALCS.filter((c) => c.group === group); }
  get activeMore(): MoreCalc | undefined { return MORE_CALCS.find((c) => c.id === this.activeCalc); }
  moreResult(c: MoreCalc): MoreResult { return c.compute(this.moreVals[c.id]); }
  setMore(c: MoreCalc, f: MoreField, value: number): void { this.moreVals[c.id][f.key] = value; this.calcTouched = true; }
  stepMore(c: MoreCalc, f: MoreField, dir: number): void {
    if (f.kind === 'select') { return; }
    const next = this.moreVals[c.id][f.key] + dir * f.step;
    this.setMore(c, f, Math.max(f.min, Math.min(f.max, next)));
  }
  fieldVal(c: MoreCalc, f: MoreField): string {
    const v = this.moreVals[c.id][f.key];
    if (f.kind === 'select') { return ''; }
    switch (f.fmt) {
      case 'money': return '₹ ' + fmtInr(v);
      case 'pct': return (Number.isInteger(v) ? String(v) : v.toFixed(Math.abs(v * 10 - Math.round(v * 10)) > 1e-6 ? 2 : 1)) + '%';
      case 'yrs': return v + (v === 1 ? ' yr' : ' yrs');
      default: return String(v);
    }
  }
  waMore(c: MoreCalc): string {
    return WHATSAPP_URL + '?text=' + encodeURIComponent(`Hi, ${this.moreResult(c).wa}. Can an advisor help me plan this?`);
  }


  meta: Record<CalcKey, { title: string; sub: string }> = {
    life: { title: 'How much life cover do I need?', sub: 'The ten-minute answer.' },
    guaranteed: { title: 'How much will my guaranteed plan return?', sub: 'At a conservative 6.25% IRR.' },
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
  /** Shows the "turn this into a plan" nudge once the visitor has adjusted any input. */
  calcTouched = false;
  openCalc(k: CalcKey | string): void { this.activeCalc = k; this.calcTouched = false; document.body.style.overflow = 'hidden'; }
  closeCalc(): void { this.activeCalc = null; document.body.style.overflow = ''; }

  @HostListener('document:keydown.escape') onEsc(): void {
    if (this.activeCalc) { this.closeCalc(); }
  }

  /** Close the calculator and open the booking modal. */
  goConsult(): void {
    this.closeCalc();
    this.scheduleModal.open();
  }

  /** Close the modal and navigate to another page (optionally to a section id). */
  goTo(route: string, fragment?: string): void {
    this.closeCalc();
    this.router.navigate([route], fragment ? { fragment } : {});
  }

  /** WhatsApp link pre-filled with the visitor's current result. */
  waResult(k: CalcKey): string {
    const lines: Record<CalcKey, string> = {
      life: `the OneInsure life cover calculator says my family needs about ₹${this.lcOut} of cover (income ₹${this.inr(this.lcInc)}/month, ${this.lcDep} dependents).`,
      guaranteed: `the OneInsure guaranteed plan calculator shows about ₹${this.grOut} at maturity (₹${this.inr(this.grAmt)}/month for ${this.grYr} years).`,
      health: `the OneInsure health cover calculator suggests about ₹${this.hOut} of health cover for a family of ${this.hFam}.`,
      fire: `the OneInsure FIRE calculator puts my FIRE number at about ₹${this.fOut}.`,
      tax: `the OneInsure tax calculator says I could save about ₹${this.tOut} in tax this year.`,
    };
    return WHATSAPP_URL + '?text=' + encodeURIComponent(`Hi, ${lines[k]} Can an advisor help me plan this?`);
  }

  // Reveal-on-scroll for the section heading (works on any page this is used on).
  ngAfterViewInit(): void {
    if (!this.isBrowser) { return; }
    const els = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal-up'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    this.revealIo = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); this.revealIo?.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    els.forEach((el) => this.revealIo!.observe(el));
  }

  ngOnDestroy(): void {
    this.revealIo?.disconnect();
    if (typeof document !== 'undefined' && this.activeCalc) { document.body.style.overflow = ''; }
  }
}
