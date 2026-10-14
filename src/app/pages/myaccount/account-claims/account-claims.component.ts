import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import {
  AccountClaim, ClaimCategory, ClaimDetail, ClaimDocStatus, ClaimDocument, ClaimStatus, ClaimStep
} from './account-claims.model';

type ClaimView = 'ongoing' | 'closed';
type StepState = 'done' | 'current' | 'pending' | 'failed';

const CLOSED: ClaimStatus[] = ['settled', 'rejected', 'cancelled'];

const STATUS_LABEL: Record<ClaimStatus, string> = {
  'initiated': 'Initiated',
  'in-review': 'In review',
  'approved': 'Approved',
  'settled': 'Settled',
  'rejected': 'Rejected',
  'cancelled': 'Cancelled',
};

const DOC_LABEL: Record<ClaimDocStatus, string> = {
  pending: 'Pending',
  uploaded: 'Under review',
  verified: 'Verified',
  rejected: 'Rejected',
};

/** Shown when a claim has no insurer logo yet. */
const CATEGORY_ICON: Record<ClaimCategory, string> = {
  Health: 'assets/images/icons/08_Health.png',
  Life: 'assets/images/icons/07_Term_Life_Insurance.png',
  Motor: 'assets/images/icons/09_Car_Bike_Motor.png',
};

@Component({
  selector: 'app-account-claims',
  templateUrl: './account-claims.component.html',
  styleUrls: ['./account-claims.component.scss'],
  providers: [DatePipe]
})
export class AccountClaimsComponent {
  @Input() claims: AccountClaim[] = [];

  view: ClaimView = 'ongoing';
  category: ClaimCategory | null = null;
  selected: AccountClaim | null = null;
  copied = false;

  readonly categories: ClaimCategory[] = ['Health', 'Life', 'Motor'];

  private isBrowser: boolean;

  constructor(
    private datePipe: DatePipe,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /* ---------- list ---------- */

  isClosed(c: AccountClaim): boolean {
    return CLOSED.includes(c.status);
  }

  count(view: ClaimView): number {
    return this.claims.filter((c) => this.isClosed(c) === (view === 'closed')).length;
  }

  get viewList(): AccountClaim[] {
    return this.claims.filter((c) => this.isClosed(c) === (this.view === 'closed'));
  }

  get visible(): AccountClaim[] {
    return this.category ? this.viewList.filter((c) => c.category === this.category) : this.viewList;
  }

  setView(view: ClaimView): void {
    this.view = view;
    this.category = null;
  }

  toggleCategory(cat: ClaimCategory): void {
    this.category = this.category === cat ? null : cat;
  }

  open(c: AccountClaim): void {
    this.selected = c;
    this.copied = false;
    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  back(): void {
    this.selected = null;
  }

  /* ---------- display helpers ---------- */

  title(c: AccountClaim): string {
    return this.titleCase(c.situation[c.situation.length - 1] || c.claimType);
  }

  titleCase(s: string): string {
    return s.replace(/\bDont\b/gi, 'Don’t').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  logo(c: AccountClaim): string {
    return c.logo || CATEGORY_ICON[c.category];
  }

  statusLabel(c: AccountClaim): string {
    return STATUS_LABEL[c.status];
  }

  docLabel(d: ClaimDocument): string {
    return DOC_LABEL[d.status];
  }

  stepState(c: AccountClaim, i: number): StepState {
    const step = c.timeline[i];
    if (step.failed) return 'failed';
    if (step.date) return 'done';
    const firstOpen = c.timeline.findIndex((s) => !s.date);
    return !this.isClosed(c) && i === firstOpen ? 'current' : 'pending';
  }

  /** Latest stage reached, for the list card. */
  currentStep(c: AccountClaim): ClaimStep {
    const reached = c.timeline.filter((s) => s.date);
    return reached[reached.length - 1] || c.timeline[0];
  }

  progress(c: AccountClaim): number {
    if (c.status === 'settled') return 100;
    const done = c.timeline.filter((s) => s.date).length;
    return Math.round((done / c.timeline.length) * 100);
  }

  pendingDocs(c: AccountClaim): number {
    return c.documents.filter((d) => d.status === 'pending' || d.status === 'rejected').length;
  }

  hasAmounts(c: AccountClaim): boolean {
    return c.claimAmount != null || c.approvedAmount != null || c.settledAmount != null;
  }

  detailValue(d: ClaimDetail): string {
    if (d.value === null || d.value === '') return '—';
    if (d.type === 'amount') return this.inr(+d.value);
    if (d.type === 'date') return this.datePipe.transform(d.value, 'dd MMM, yyyy') || String(d.value);
    return String(d.value);
  }

  inr(n: number): string {
    return '₹' + n.toLocaleString('en-IN');
  }

  /* ---------- copy ---------- */

  copyClaimNo(c: AccountClaim): void {
    if (!this.isBrowser || !navigator.clipboard) return;
    navigator.clipboard.writeText(c.claimNo).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1800);
    });
  }
}
