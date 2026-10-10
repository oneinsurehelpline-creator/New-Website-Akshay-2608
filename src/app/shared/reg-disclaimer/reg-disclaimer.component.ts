import { Component, Input } from '@angular/core';

export type DisclaimerKind = 'ulip' | 'guaranteed';

/* ---------------------------------------------------------------
   Regulatory disclaimers, in one place for compliance to edit.
   Based on IRDAI's standard wording; get final sign-off from
   compliance before go-live.
   --------------------------------------------------------------- */
const TEXT: Record<DisclaimerKind, { title: string; short: string; full: string[] }> = {
  ulip: {
    title: 'Unit Linked Insurance Plans: risk disclosure',
    short: 'In this policy, the investment risk in the investment portfolio is borne by the policyholder. '
      + 'ULIPs are subject to market risks.',
    full: [
      'In this policy, the investment risk in the investment portfolio is borne by the policyholder.',
      'Unit Linked Insurance Products (ULIPs) are different from traditional insurance products and are subject to '
      + 'market risks. The premium paid in ULIPs is subject to investment risks associated with capital markets, and '
      + 'the NAV of the units may go up or down based on the performance of the fund and factors influencing the '
      + 'capital market. The policyholder is responsible for their decisions.',
      'The names of the insurer, the product and the funds do not in any way indicate the quality of the contract, '
      + 'its future prospects or returns. Past performance is not indicative of future performance.',
      'ULIPs do not offer any liquidity during the first five years of the contract. The policyholder cannot '
      + 'surrender or withdraw the money invested in ULIPs completely or partially until the end of the fifth year.',
      'Please read the sales brochure and policy document carefully for details of risk factors, terms and '
      + 'conditions before concluding a sale.',
    ],
  },
  guaranteed: {
    title: 'Guaranteed plans: important information',
    short: 'Guaranteed benefits are payable only if all premiums are paid on time and the policy is in force. '
      + 'Figures shown are illustrative.',
    full: [
      'Guaranteed benefits are payable only if all due premiums are paid on time and the policy is in force for '
      + 'the full term.',
      'Returns, IRRs and maturity values shown are illustrative and depend on the plan, premium amount and '
      + 'frequency, policy term, age and the insurer\'s terms. They are not a promise of returns by OneInsure.',
      'Surrendering or discontinuing the policy early can result in receiving less than the premiums paid.',
      'Please read the sales brochure, benefit illustration and policy document carefully before concluding a sale.',
    ],
  },
};

@Component({
  selector: 'app-reg-disclaimer',
  template: `
    <aside class="regd" [class.regd--compact]="compact" [class.regd--ulip]="kind === 'ulip'" role="note"
      [attr.aria-label]="t.title">
      <svg class="regd__ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle><path d="M12 8v4m0 4h.01"></path>
      </svg>
      <div>
        <strong *ngIf="!compact">{{ t.title }}</strong>
        <p *ngIf="compact">{{ t.short }}</p>
        <ul *ngIf="!compact"><li *ngFor="let line of t.full">{{ line }}</li></ul>
      </div>
    </aside>`,
  styles: [`
    :host { display: block; }
    .regd {
      display: flex; gap: 12px; text-align: left;
      padding: 16px 18px; border-radius: 14px;
      background: #FFF8EC; border: 1px solid rgba(245, 160, 17, .45);
      color: var(--blue-deep);
    }
    .regd__ic { flex-shrink: 0; margin-top: 2px; color: #C47F00; }
    strong { display: block; margin-bottom: 8px; font: 700 14px/1.3 var(--display); }
    p { margin: 0; font: 500 12.5px/1.55 var(--sans); color: #5A4520; }
    ul { margin: 0; padding-left: 16px; display: grid; gap: 6px; }
    li { font: 500 12.5px/1.55 var(--sans); color: #5A4520; }
    .regd--compact { padding: 10px 14px; border-radius: 10px; }
    .regd--compact .regd__ic { margin-top: 1px; }
  `],
})
export class RegDisclaimerComponent {
  @Input() kind: DisclaimerKind = 'ulip';
  /** One-line version for heroes and calculator results. */
  @Input() compact = false;

  get t() { return TEXT[this.kind]; }
}
