import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AccountPolicy, PolicyCategory, PolicyState } from './account-policies.model';

@Component({
  selector: 'app-account-policies',
  templateUrl: './account-policies.component.html',
  styleUrls: ['./account-policies.component.scss']
})
export class AccountPoliciesComponent {
  @Input() policies: AccountPolicy[] = [];

  state: PolicyState = 'active';
  category: PolicyCategory | null = null;
  selected: AccountPolicy | null = null;
  copied = false;

  readonly categories: PolicyCategory[] = ['Health', 'Life', 'Motor'];

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  count(state: PolicyState): number {
    return this.policies.filter((p) => p.state === state).length;
  }

  get stateList(): AccountPolicy[] {
    return this.policies.filter((p) => p.state === this.state);
  }

  get visible(): AccountPolicy[] {
    return this.category ? this.stateList.filter((p) => p.category === this.category) : this.stateList;
  }

  setState(state: PolicyState): void {
    this.state = state;
    this.category = null;
  }

  toggleCategory(cat: PolicyCategory): void {
    this.category = this.category === cat ? null : cat;
  }

  open(p: AccountPolicy): void {
    this.selected = p;
    this.copied = false;
    if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  back(): void {
    this.selected = null;
  }

  /** Card headline: "₹10 Lakhs health policy", "₹1 Crore life cover" or the vehicle name. */
  headline(p: AccountPolicy): string {
    if (p.category === 'Motor' && p.vehicle) return p.vehicle.name;
    return `${this.shortAmount(p.coverAmount)} ${p.category === 'Life' ? 'life cover' : 'health policy'}`;
  }

  subline(p: AccountPolicy): string | null {
    if (p.vehicle) return p.vehicle.regNo;
    return p.category === 'Life' ? p.insuredMembers[0] ?? null : null;
  }

  shortAmount(n: number): string {
    if (n >= 10000000) return `₹${+(n / 10000000).toFixed(2)} Crore`;
    if (n >= 100000) return `₹${+(n / 100000).toFixed(2)} Lakhs`;
    return this.inr(n);
  }

  inr(n: number): string {
    return '₹' + n.toLocaleString('en-IN');
  }

  term(years: number): string {
    return `${years} ${years === 1 ? 'Year' : 'Years'}`;
  }

  copyPolicyNo(p: AccountPolicy): void {
    if (!this.isBrowser || !navigator.clipboard) return;
    navigator.clipboard.writeText(p.policyNo).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1800);
    });
  }
}
