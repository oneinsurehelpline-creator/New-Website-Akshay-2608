import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { LeadService } from 'src/app/services/lead.service';
import { AccountClaim, ClaimCategory, ClaimDetail, ClaimDocStatus, ClaimDocument, ClaimStep } from './account-claims.model';
import { applyHealthDetails, applyLifeDetails, applyMotorDetails } from './claim-details.mapper';

type ClaimView = 'ongoing' | 'closed';
type StepState = 'done' | 'current' | 'pending' | 'failed';

const DOC_LABEL: Record<ClaimDocStatus, string> = {
  pending: 'Pending',
  uploaded: 'Under review',
  verified: 'Verified',
  rejected: 'Rejected',
};

/** Shown when a claim has no insurer logo (or the logo fails to load). */
const CATEGORY_ICON: Record<string, string> = {
  health: 'assets/images/icons/08_Health.png',
  life: 'assets/images/icons/07_Term_Life_Insurance.png',
  motor: 'assets/images/icons/09_Car_Bike_Motor.png',
};
const DEFAULT_ICON = 'assets/images/icons/05_TULIP_Plans.png';

@Component({
  selector: 'app-account-claims',
  templateUrl: './account-claims.component.html',
  styleUrls: ['./account-claims.component.scss'],
  providers: [DatePipe]
})
export class AccountClaimsComponent {
  @Input() claims: AccountClaim[] = [];
  @Input() loading = false;
  @Input() error = false;

  view: ClaimView = 'ongoing';
  category: ClaimCategory | null = null;
  selected: AccountClaim | null = null;
  copied = false;

  readonly categories: ClaimCategory[] = ['Health', 'Life', 'Motor'];
  readonly skeletons = [1, 2, 3];

  private brokenLogos = new Set<number>();
  private isBrowser: boolean;

  constructor(
    private datePipe: DatePipe,
    private leadService: LeadService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /* ---------- list ---------- */

  count(view: ClaimView): number {
    return this.claims.filter((c) => c.closed === (view === 'closed')).length;
  }

  get viewList(): AccountClaim[] {
    return this.claims.filter((c) => c.closed === (this.view === 'closed'));
  }

  get visible(): AccountClaim[] {
    return this.category
      ? this.viewList.filter((c) => c.category.toLowerCase() === this.category!.toLowerCase())
      : this.viewList;
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
    this.loadDetails(c);
  }

  back(): void {
    this.selected = null;
  }

  /** Fetches the Health / Motor / Life details for the claim (once) and merges them in. */
  loadDetails(c: AccountClaim): void {
    if (c.detailsState === 'loading' || c.detailsState === 'loaded') return;

    let req: Observable<any>;
    let apply: (c: AccountClaim, r: any) => void;
    switch (this.key(c)) {
      case 'health':
        req = this.leadService.healthClaims({ issueId: c.issueId });
        apply = applyHealthDetails;
        break;
      case 'motor':
        req = this.leadService.motorClaims({ issueId: c.issueId });
        apply = applyMotorDetails;
        break;
      case 'life':
        req = this.leadService.lifeClaims({ ID: c.issueId });
        apply = applyLifeDetails;
        break;
      default:
        c.detailsState = 'loaded';
        return;
    }

    c.detailsState = 'loading';
    req.subscribe({
      next: (res) => {
        const row = Array.isArray(res) ? res[0] : res;
        if (row) apply(c, row);
        c.detailsState = 'loaded';
      },
      error: () => {
        console.error('Failed to retrieve claim details.');
        c.detailsState = 'error';
      }
    });
  }

  /* ---------- display helpers ---------- */

  key(c: AccountClaim): string {
    return c.category.toLowerCase();
  }

  logo(c: AccountClaim): string {
    if (c.logo && !this.brokenLogos.has(c.issueId)) return c.logo;
    return CATEGORY_ICON[this.key(c)] || DEFAULT_ICON;
  }

  onLogoError(c: AccountClaim): void {
    this.brokenLogos.add(c.issueId);
  }

  statusLabel(c: AccountClaim): string {
    return c.insurerStatus || (c.closed ? 'Closed' : 'Filed');
  }

  docLabel(d: ClaimDocument): string {
    return DOC_LABEL[d.status];
  }

  stepState(c: AccountClaim, i: number): StepState {
    const step = c.timeline[i];
    if (step.failed) return 'failed';
    if (step.done) return 'done';
    const firstOpen = c.timeline.findIndex((s) => !s.done && !s.failed);
    return !c.closed && i === firstOpen ? 'current' : 'pending';
  }

  /** Latest stage reached, for the list card. */
  currentStep(c: AccountClaim): ClaimStep {
    const reached = c.timeline.filter((s) => s.done || s.failed);
    return reached[reached.length - 1] || c.timeline[0];
  }

  progress(c: AccountClaim): number {
    if (!c.timeline.length) return 0;
    const done = c.timeline.filter((s) => s.done).length;
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
    navigator.clipboard.writeText(String(c.issueId)).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1800);
    });
  }
}
