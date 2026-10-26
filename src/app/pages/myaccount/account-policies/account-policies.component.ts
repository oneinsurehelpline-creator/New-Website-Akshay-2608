
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  AccountPolicy,
  PolicyCategory,
  PolicyState
} from './account-policies.model';
import { LeadService } from 'src/app/services/lead.service';

@Component({
  selector: 'app-account-policies',
  templateUrl: './account-policies.component.html',
  styleUrls: ['./account-policies.component.scss']
})
export class AccountPoliciesComponent implements OnInit {

  // First API: all policies
  policies: AccountPolicy[] = [];

  // Second API: selected policy details
  policyDetails: any = null;

  state: PolicyState = 'active';
  category: PolicyCategory | null = null;
  selected: AccountPolicy | null = null;

  copied = false;
  detailsLoading = false;
  detailsError = false;
  policiesLoading = false;

  readonly categories: PolicyCategory[] = [
    'Health',
    'Life',
    'Motor'
  ];

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private leadService: LeadService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.getPolicy();
  }

  // FIRST API: Fetch policy list
  getPolicy(): void {
    const cdto = {
      userid: this.leadService.userId
    };

    this.policiesLoading = true;

    this.leadService.getpolicies(cdto).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];

        this.policies = data.map((item: any): AccountPolicy => {
          const policyType = String(
            item.PolicyTypeName || ''
          ).toLowerCase();

          const category: PolicyCategory =
            policyType.includes('health')
              ? 'Health'
              : policyType.includes('life')
                ? 'Life'
                : 'Motor';

          const logoFile = item.InsurerLogo;

          return {
            id: String(item.Policyidd),
            category,
            state: Number(
              item.IsActive ?? item.Isactive
            ) === 1 ? 'active' : 'inactive',

            insurer: item.InsurerName || '',
            logo: logoFile
              ? 'https://v2.oneinsure.com/assets/bi/images/flutteroneinsureimg/flutterinsurerimg/'
              + logoFile
              : '',

            planName:
              item.PlanName ||
              item.ProductName ||
              item.PolicyNickName ||
              item.PolicyTypeName ||
              'Insurance Policy',

            coverAmount: Number(item.SumAssured) || 0,

            premium: Number(
              item.Premium ??
              item.ModelPremium ??
              item.TotalPremium
            ) || 0,

            policyNo: String(item.PolicyNo || ''),
            termYears: 1,

            startDate:
              item.PolicyStartDate ||
              item.StartDate ||
              '',

            endDate:
              item.PolicyEndDate ||
              item.EndDate ||
              item.PremiumDueDate ||
              '',

            bookingDate:
              item.CreatedDate ||
              item.BookingDate ||
              '',

            proposer: item.Proposer || '',

            insuredMembers: Array.isArray(item.InsuredMembers)
              ? item.InsuredMembers
              : [],

            statusLabel:
              item.PolicyStatusName ||
              item.PolicyStatus ||
              'Unknown',

            vehicle: item.VehicleName
              ? {
                name: item.VehicleName,
                regNo: item.VehicleRegNo || ''
              }
              : undefined,

            policyCopyUrl:
              item.PolicyCopy ||
              item.Policycopy ||
              item.Document ||
              ''
          };
        });

        this.policiesLoading = false;
      },

      error: (err: any) => {
        console.error('Error fetching policies:', err);
        this.policies = [];
        this.policiesLoading = false;
      }
    });
  }

  // SECOND API: Fetch details for the clicked policy
  open(p: AccountPolicy): void {
    this.selected = p;
    this.copied = false;
    this.policyDetails = null;
    this.detailsLoading = true;
    this.detailsError = false;

    const cdto = {
      UserID: this.leadService.userId,
      PolicyID: Number(p.id)
    };

    this.leadService.getPolicyDetails(cdto).subscribe({
      next: (res: any) => {
        const details = Array.isArray(res)
          ? res[0]
          : Array.isArray(res)
            ? res
            : res ?? res;

        this.policyDetails = details || null;
        this.detailsLoading = false;

        if (!this.policyDetails) {
          this.detailsError = true;
        }

        console.log(
          'Selected policy details:',
          this.policyDetails
        );
      },

      error: (err: any) => {
        console.error(
          'Error fetching policy details:',
          err
        );

        this.detailsLoading = false;
        this.detailsError = true;
      }
    });

    if (this.isBrowser) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  // Return to the policy list
  back(): void {
    this.selected = null;
    this.policyDetails = null;
    this.detailsLoading = false;
    this.detailsError = false;
    this.copied = false;
  }

  count(state: PolicyState): number {
    return this.policies.filter(
      p => p.state === state
    ).length;
  }

  get stateList(): AccountPolicy[] {
    return this.policies.filter(
      p => p.state === this.state
    );
  }

  // get visible(): AccountPolicy[] {
  //   return this.category
  //     ? this.stateList.filter(
  //       p => p.category === this.category
  //     )
  //     : this.stateList;
  // }

  get visible(): AccountPolicy[] {
  return this.policies.filter(p =>
    p.state === this.state &&
    !!p.policyNo?.trim() &&
    (!this.category || p.category === this.category)
  );
}

  setState(state: PolicyState): void {
    this.state = state;
    this.category = null;
  }

  toggleCategory(cat: PolicyCategory): void {
    this.category = this.category === cat
      ? null
      : cat;
  }

  // Display title on each policy card
  headline(p: AccountPolicy): string {
    if (p.category === 'Motor' && p.vehicle) {
      return p.vehicle.name;
    }

    return `${this.shortAmount(p.coverAmount)} ${p.category === 'Life'
        ? 'life cover'
        : p.category === 'Health'
          ? 'health cover'
          : 'motor policy'
      }`;
  }

  subline(p: AccountPolicy): string | null {
    if (p.vehicle) {
      return p.vehicle.regNo;
    }

    return p.category === 'Life'
      ? p.insuredMembers[0] ?? null
      : null;
  }

  shortAmount(n: number): string {
    if (n >= 10000000) {
      return `₹${+(n / 10000000).toFixed(2)} Crore`;
    }

    if (n >= 100000) {
      return `₹${+(n / 100000).toFixed(2)} Lakhs`;
    }

    return this.inr(n);
  }

  inr(n: number): string {
    return '₹' + (Number(n) || 0).toLocaleString('en-IN');
  }

  term(years: number): string {
    return `${years} ${years === 1 ? 'Year' : 'Years'}`;
  }

  // Copy the selected policy number
  copyPolicyNo(p: AccountPolicy): void {
    if (!this.isBrowser || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(
      this.policyDetails?.PolicyNo || p.policyNo
    ).then(() => {
      this.copied = true;

      setTimeout(() => {
        this.copied = false;
      }, 1800);
    }).catch(err => {
      console.error('Unable to copy policy number:', err);
    });
  }

  // Helpers: use second API values with first API fallbacks
  get detailPlanName(): string {
    const d = this.policyDetails;
    const p = this.selected;

    return d?.PlanName ||
      d?.ProductName ||
      d?.PolicyNickName ||
      d?.PolicyTypeName ||
      p?.planName ||
      'Insurance Policy';
  }

  get detailInsurer(): string {
    return this.policyDetails?.InsurerName ||
      this.selected?.insurer ||
      '';
  }

  get detailPolicyNo(): string {
    return this.policyDetails?.PolicyNo ||
      this.selected?.policyNo ||
      '';
  }

  get detailCoverAmount(): number {
    const amount = Number(this.policyDetails?.SumAssured);

    return amount > 0
      ? amount
      : Number(this.selected?.coverAmount) || 0;
  }

  get detailPremium(): number {
    const d = this.policyDetails;

    return Number(
      d?.ModelPremium ??
      d?.Premium ??
      d?.TotalPremium ??
      this.selected?.premium
    ) || 0;
  }

  get detailStartDate(): string {
    return this.policyDetails?.PolicyStartDate ||
      this.selected?.startDate ||
      '';
  }

  get detailEndDate(): string {
    return this.policyDetails?.PolicyEndDate ||
      this.selected?.endDate ||
      '';
  }

  get detailBookingDate(): string {
    return this.policyDetails?.CreatedDate ||
      this.selected?.bookingDate ||
      '';
  }

  get detailStatus(): string {
    return this.policyDetails?.PolicyStatusName ||
      this.selected?.statusLabel ||
      'Unknown';
  }

  get detailPolicyCopyUrl(): string {
    return this.policyDetails?.PolicyCopy ||
      '';
  }

  get detailVehicleName(): string {
    return this.policyDetails?.MAKE ||
      this.policyDetails?.VehicleName ||
      this.selected?.vehicle?.name ||
      '';
  }

  get detailVehicleRegNo(): string {
    return this.policyDetails?.RegNumber ||
      this.policyDetails?.VehicleRegNo ||
      this.selected?.vehicle?.regNo ||
      '';
  }
  
downloadPolicyCopy(): void {
  const url = this.detailPolicyCopyUrl;
  console.log('Downloading policy copy from URL:', url);

  if (!url) {
    console.warn('Policy copy is not available.');
    return;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = 'PolicyCopy';
  link.target = '_blank';
  link.rel = 'noopener';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

}
