import { Component, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LeadService } from 'src/app/services/lead.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-claimsupport',
  templateUrl: './claimsupport.component.html',
  styleUrls: ['./claimsupport.component.scss'],
})
export class ClaimsupportComponent implements AfterViewInit, OnDestroy {
  /** SECTION 4 — Types of Claims tabs */
  activeTab: 'health' | 'motor' | 'life' | 'home' | 'travel' = 'health';

  /** SECTION 5 — Documents checklist tabs */
  activeDoc: 'health' | 'motor' | 'life' | 'home' | 'travel' = 'health';

  /** SECTION 2 — Track a claim */

  /** SECTION 9 — FAQ accordion */
  openFaq: number | null = null;

  /** SECTION 7 — Grievance redressal modal */
  grievanceOpen = false;

  faqs = [
    {
      q: 'How long does it take to process a claim?',
      a: 'Health and travel claims are typically resolved within 7–10 working days. Motor and home claims may take up to 15 working days depending on assessment needs. Life and term death claims are settled within 30 days of receiving all documents, as mandated by IRDAI — longer only if an investigation is required.',
    },
    {
      q: 'Can I file a claim without all my documents?',
      a: 'You can initiate a claim with partial documents, but settlement only proceeds once all documents are submitted. Use the checklist above to avoid delays.',
    },
    {
      q: 'What is the difference between cashless and reimbursement claims?',
      a: 'Cashless means we settle directly with the hospital or garage. Reimbursement means you pay first and we refund the eligible amount to your bank account.',
    },
    {
      q: 'My claim was rejected. What can I do?',
      a: "You'll receive a detailed rejection letter with the reason. If you disagree, raise a grievance or contact our claims team. See the Escalations section above.",
    },
    {
      q: 'How do I check my claim status?',
      a: 'Use the Track Your Claim tool at the top of this page, or ask Sahay for an instant update.',
    },
    {
      q: 'Can I file a claim through the app?',
      a: 'Yes. Claims can be filed, tracked, and documents uploaded directly through our mobile app.',
    },
  ];

  private observer?: IntersectionObserver;

  /* ---------- File-a-claim modal (mirrors partner lead modal) ---------- */
  claimOpen = false;
  submitting = false;
  submitted = false;   // flips true on first submit attempt (drives error display)
  claimDone = false;   // success state
  SRNumber: any = '';
  serverError = '';

  viaOptions = ['Yes', 'No'];
  insurers = ['HDFC Ergo', 'ICICI Lombard', 'Star Health', 'LIC', 'Other'];
  insTypes = [
    { value: 'health', label: 'Health' },
    { value: 'life', label: 'Life' },
    // { value: 'motor', label: 'Motor' },
    // { value: 'travel', label: 'Travel' },
  ];

  /** Claim sub-types shown per insurance type. */
  private claimTypeMap: Record<string, string[]> = {
    health: ['Cashless', 'Reimbursement', 'Day-care', 'Critical Illness'],
    life: ['Death Claim', 'Maturity Claim', 'Surrender'],
    motor: ['Own Damage', 'Third Party', 'Theft'],
    travel: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss'],
  };

  claimForm: FormGroup;

  constructor(
    private host: ElementRef<HTMLElement>,
    private router: Router,
    private fb: FormBuilder,
    private leadService: LeadService,
    private utility: UtilityService,
     private configService: ConfigService
  ) {
    this.claimForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      policyNumber: ['', [Validators.required]],
      viaOneInsure: ['Yes', [Validators.required]],
      insType: ['health', [Validators.required]],
      insurer: ['HDFC Ergo', [Validators.required]],
      claimSubType: ['Cashless', [Validators.required]],
      details: ['', [Validators.required, Validators.minLength(10)]],
      mobile: ['', [Validators.required, this.phoneValidator]],
      email: ['', [Validators.required, Validators.email]],
      declaration: [false, [Validators.requiredTrue]],
    });
  }

  /** Claim-type options for the currently selected insurance type. */
  get claimTypeOptions(): string[] {
    const type = this.claimForm?.get('insType')?.value;
    return this.claimTypeMap[type] ?? [];
  }

  /** When the insurance type changes, default to that type's first claim sub-type. */
  onInsTypeChange(type: string): void {
    const first = this.claimTypeMap[type]?.[0] ?? '';
    this.claimForm.get('claimSubType')?.setValue(first);
  }

  /** Accepts Indian mobile numbers with optional +91 and spaces/dashes. */
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const raw = (control.value ?? '').toString().trim();
    if (!raw) { return null; } // 'required' handles the empty case
    const digits = raw.replace(/\D/g, '').replace(/^91/, '');
    return /^[6-9]\d{9}$/.test(digits) ? null : { phone: true };
  }

  /** True when a control should show its error (invalid + touched/submitted). */
  invalid(name: string): boolean {
    const c = this.claimForm?.get(name);
    return !!c && c.invalid && (c.dirty || c.touched || this.submitted);
  }

  openClaimForm(): void {
    // Fresh form + cleared validation state on every open.
    this.claimForm.reset({
      fullName: '',
      policyNumber: '',
      viaOneInsure: 'Yes',
      insType: 'health',
      insurer: '',
      claimSubType: '',
      details: '',
      mobile: '',
      email: '',
      declaration: false,
    });
    this.submitted = false;
    this.claimOpen = true;
    this.claimDone = false;
    this.serverError = '';
    document.body.style.overflow = 'hidden';
  }

  closeClaimForm(): void {
    this.claimOpen = false;
    document.body.style.overflow = '';
  }

  submitClaim(): void {
    this.serverError = '';

    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      this.utility.toast('warning', 'Please fill all required fields correctly.');
      return;
    }
    const payload = this.claimForm.value;
    this.submitting = true; 
    const date = new Date();
    date.setDate(date.getDate() + 7);

    const dueDate = date.toISOString().split('T')[0];
    var cdto = {
      "IssueDueDate": dueDate, // add +7 days
      "IssueDescription": payload.details,
      "IssueId": 0,
      "ProjectId": 1,
      "UserId": "0", // customerid 
      "PolicyId": 0,
      "ServiceTypeId": payload.insType === 'health' ? 99004091 : 99004050, // Health-Health Claims(99004091)... Life-Death Claim(99004050)
      "IssueTypeId": 1,
      "Source": "0",
      "IssueCreatorUserName": "SystemAdmin",
      "IssueOwnerUserName": "SystemAdmin",
      "LastUpdatedUserName": "SystemAdmin",
      "IssuePriorityId": "2",
      "Vendor": "0",
      "SourceId": "0",
      "PosAgentuserid": "0",
      "BStatusId": 1,
      "BSubStatusId": 4,
      "AssignedUserName": this.configService.claimAssignedUserName,
      "DateReceived": null,
      "DateCreated": null,
      "LastUpdate": null
    }
    this.leadService.CreateNewSR(cdto).subscribe((res: any) => { 
      this.submitting = false;
      this.utility.toast('success', 'Request received!.');
      console.log(res);
      this.SRNumber = res;
      this.saveclaimFile(payload, res);
    }, (err: any) => {
      console.error('Error creating new SR:', err);
      this.submitting = false;
      this.utility.toast('error', 'Failed to create a new service request. Please try again later.');
    });
    // ----------------------------------------------------------------
    // TODO: wire up the real claims API here 
    // ----------------------------------------------------------------
    console.log('Claim payload →', this.claimForm.value);

    // Temporary simulated success until the endpoint is connected.

  }

  /* ---------- Interactions ---------- */
  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }

  onTrackSubmit(claimNumber: string): void {
    console.log('Track claim:', claimNumber.trim());
  }

  /** SECTION 7 — Grievance redressal modal */
  openGrievance(e: Event): void { e.preventDefault(); this.grievanceOpen = true; }
  closeGrievance(): void { this.grievanceOpen = false; }
  onGrvBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('grv')) { this.closeGrievance(); }
  }
  @HostListener('document:keydown.escape') onEsc(): void {
    if (this.claimOpen) { this.closeClaimForm(); }
    else if (this.grievanceOpen) { this.closeGrievance(); }
  }

  openSahay(): void {
    // TODO: open your Sahay AI chat widget / drawer here.
  }

  /** In-page smooth scroll (e.g. hero "Track a Claim" → #track). */
  scrollToId(id: string): void {
    const el = this.host.nativeElement.querySelector('#' + id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Navigate to the #consult section on the Home page. 
   */
  goToConsult(): void {
    this.router.navigate(['/'], { fragment: 'consult' });
  }

  /* ---------- Scroll-reveal (matches Home / About) ---------- */
  ngAfterViewInit(): void {
    const els = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(
        '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
      )
    );

    // No IntersectionObserver support → just show everything.
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => this.observer!.observe(el));

    requestAnimationFrame(() => this.revealInView(els));
  }

  /** Immediately reveal elements that are already visible on load. */
  private revealInView(els: HTMLElement[]): void {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      const rendered = r.width > 0 || r.height > 0;   // skips display:none (e.g. hidden hero)
      if (rendered && r.top < vh) {                   // in view or already scrolled past
        el.classList.add('in');
        this.observer?.unobserve(el);
      }
    });
  }
  saveclaimFile(payload: any, res: any) {
    var cdto = {
      "IssueId": res,
      "FullName": payload.fullName,
      "PolicyNumber": payload.policyNumber,
      "MobileNumber": payload.mobile,
      "EmailId": payload.email,
      "PolicyBuy": payload.viaOneInsure,
      "insuranceType": payload.insType,
      "Insurer": payload.insurer,
      "ClaimType": payload.claimSubType,
      "Description": payload.details,
    }
    this.leadService.saveclaimFile(cdto).subscribe((res: any) => {
      console.log(res);
      this.submitted = false;
      this.claimDone = true;
    }, (err: any) => {
      console.error('Error saving claim file:', err);
      this.submitting = false;
      this.utility.toast('error', 'Failed to save claim file. Please try again later.');
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    document.body.style.overflow = '';
  }
}