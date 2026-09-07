import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LeadService } from 'src/app/services/lead.service';
import { UtilityService } from 'src/app/services/utility.service';

interface Feature {
  icon: string;
  img: string;
  title: string;
  desc: string;
  tag: string;
}

interface Benefit {
  icon: string;
  img: string;
  num: string;
  title: string;
  desc: string;
}

interface Metric {
  prefix?: string;   // e.g. "₹"
  value?: number;    // numeric target (animated)
  suffix?: string;   // e.g. "Cr+", "+"
  text?: string;     // non-numeric value (e.g. "PAN India")
  label: string;
  group?: boolean;   // format with thousands grouping (e.g. 5,00,000)
  display?: string;  // runtime animated value
}

interface ProductOption {
  value: string;
  checked: boolean;
}

@Component({
  selector: 'app-partnerprogram',
  templateUrl: './partnerprogram.component.html',
  styleUrls: ['./partnerprogram.component.scss'],
})
export class PartnerprogramComponent implements AfterViewInit, OnDestroy {
  // ------------------------------------------------------------------
  //  SECTION 1 — HERO
  //  Login card is intentionally hidden for now (feature comes later).
  //  Flip this to `true` when the partner-login flow is ready.
  // ------------------------------------------------------------------
  showLoginCard = false;

  // ------------------------------------------------------------------
  //  SECTION 2 — WHY JOIN
  // ------------------------------------------------------------------
  features: Feature[] = [
    {
      icon: 'grid',
      img: 'assets/images/icons/partners/multi-product-access.png',
      title: 'Multi-Product Access',
      desc: 'Offer life, health, motor, investment, and corporate solutions from multiple insurers — all in one place.',
      tag: 'One platform · Many insurers',
    },
    {
      icon: 'wrench',
      img: 'assets/images/icons/partners/dedicated-operations-support.png',
      title: 'Dedicated Operations Support',
      desc: 'From quotations to issuance and servicing, our backend teams help you move faster and close smoother.',
      tag: 'Quote → Issue → Service',
    },
    {
      icon: 'trending',
      img: 'assets/images/icons/partners/growth-beyond-selling.png',
      title: 'Growth Beyond Selling',
      desc: 'Get training, branding support, digital marketing assistance, and systems that help you build a long-term business.',
      tag: 'Build a real business',
    },
  ];

  // ------------------------------------------------------------------
  //  SECTION 3 — BENEFITS GRID
  // ------------------------------------------------------------------
  benefits: Benefit[] = [
    {
      icon: 'bolt',
      img: 'assets/images/icons/partners/faster-policy-issuance.png',
      num: '01',
      title: 'Faster Policy Issuance',
      desc: 'Streamlined workflows and insurer integrations cut turnaround so your clients are covered sooner.',
    },
    {
      icon: 'chat',
      img: 'assets/images/icons/partners/better-customer-experience.png',
      num: '02',
      title: 'Better Customer Experience',
      desc: 'Give clients a smooth, modern journey — from quote to claim — that reflects well on you.',
    },
    {
      icon: 'refresh',
      img: 'assets/images/icons/partners/renewal-persistency-support.png',
      num: '03',
      title: 'Renewal & Persistency Support',
      desc: 'Automated reminders and servicing help protect renewals and keep your book healthy.',
    },
    {
      icon: 'megaphone',
      img: 'assets/images/icons/partners/marketing-social-media.png',
      num: '04',
      title: 'Marketing & Social Media Help',
      desc: 'Ready-to-use creatives, campaigns, and a co-branded presence to grow your visibility.',
    },
    {
      icon: 'cap',
      img: 'assets/images/icons/partners/sales-training-sessions.png',
      num: '05',
      title: 'Sales Training & Product Sessions',
      desc: 'Regular upskilling on products, compliance, and closing techniques that move the needle.',
    },
    {
      icon: 'exchange',
      img: 'assets/images/icons/partners/cross-sell-upsell.png',
      num: '06',
      title: 'Cross-Sell & Upsell Opportunities',
      desc: 'Surface the right products for each client so you can deepen relationships and income.',
    },
  ];

  // ------------------------------------------------------------------
  //  SECTION 4 — CINEMATIC BANNER (floating icons only)
  // ------------------------------------------------------------------
  bannerFloats = ['shield', 'heart', 'car', 'trending'];

  // ------------------------------------------------------------------
  //  SECTION 5 — FINAL CTA + TRUST METRICS
  // ------------------------------------------------------------------
  metrics: Metric[] = [
    { prefix: '₹', value: 0, suffix: 'Cr+', label: 'Premium Managed' },
    { value: 0, suffix: 'L+', label: 'Customers Served' },
    { value: 0, suffix: '+', label: 'Insurance Partners' },
    { text: 'PAN India', label: 'Presence' },
  ];

  // ------------------------------------------------------------------
  //  LEAD MODAL — Partner application
  // ------------------------------------------------------------------
  leadOpen = false;
  submitting = false;
  submitted = false;      // flips true once submit is attempted (drives error display)
  leadDone = false;       // success state
  serverError = '';

  experienceOptions = ['New to Insurance', '1–3 years', '3–5 years', '5+ years'];
  // 'Yes' is shown but disabled for now (self-serve POS flow comes later);
  // 'No' is the only selectable option and the default.
  posOptions = ['Yes', 'No'];

  // Insurance types — checkbox chips. One item is active by default.
  products: ProductOption[] = [
    { value: 'Motor', checked: false },
    { value: 'Health', checked: true },   // <-- default active item
    { value: 'Life', checked: false },
    { value: 'Term', checked: false },
    { value: 'Investment', checked: false },
    { value: 'Corporate', checked: false },
    { value: 'Travel', checked: false },
    { value: 'Other', checked: false },
  ];

  leadForm: FormGroup;

  private readonly isBrowser: boolean;

  constructor(private fb: FormBuilder, private leadService: LeadService,
    private utility: UtilityService, private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.leadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      // 10 digits, must start with 6-9 (Indian mobile). The digits-only input
      // guard below strips anything that isn't a number.
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]], // now mandatory
      company: [''],                                         // optional
      city: ['', [Validators.required, Validators.minLength(3)]], // min 3 chars
      experience: ['', [Validators.required]],
      posCode: ['No', [Validators.required]],  // 'No' selected by default
      portfolioLakhs: [null, [Validators.min(0)]], // optional
    });
  }

  // ---------- Validators / helpers ----------
  /** Digits-only guard for the phone field (strips non-numerics, caps at 10). */
  onPhoneInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digits;
    this.leadForm.get('phone')?.setValue(digits);
  }

  /** True when a control should show its error (invalid + touched/submitted). */
  invalid(name: string): boolean {
    const c = this.leadForm.get(name);
    return !!c && c.invalid && (c.dirty || c.touched || this.submitted);
  }

  get selectedProducts(): string[] {
    return this.products.filter((p) => p.checked).map((p) => p.value);
  }

  get productsInvalid(): boolean {
    return this.submitted && this.selectedProducts.length === 0;
  }

  toggleProduct(p: ProductOption): void {
    p.checked = !p.checked;
  }

  // ---------- Modal control ----------
  openLead(): void {
    this.leadOpen = true;
    this.leadDone = false;
    this.serverError = '';
    document.body.style.overflow = 'hidden';
  }

  closeLead(): void {
    this.leadOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.leadOpen) {
      this.closeLead();
    }
  }

  // ---------- Submit ----------
  submitLead(): void {
    this.submitted = true;
    this.serverError = '';

    if (this.leadForm.invalid || this.selectedProducts.length === 0) {
      this.leadForm.markAllAsTouched();
      this.utility.toast('warning', 'Please fill all required fields correctly.');
      return;
    }
    if (this.submitting) { return; }

    this.submitting = true;
    const payload = {
      ...this.leadForm.value,
      products: this.selectedProducts,
    };

    const cdto = {
      FullName: payload.name,
      MobileNumber: payload.phone,
      Email: payload.email,
      CompanyName: payload.company,
      City: payload.city,
      ExperinceInInsurance: payload.experience,
      IsExistPosCode: payload.posCode,
      SellInsuranceType: payload.products.join(', '),
      // portfolio is optional — guard against null so .toString() never throws
      Portfolio: payload.portfolioLakhs != null ? payload.portfolioLakhs.toString() : '',
    };

    // 1. Save the lead, 2. email the applicant, 3. show the success panel.
    this.leadService.becomePartner(cdto).subscribe({
      next: () => this.sendPartnerEmail(payload),
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.utility.error(
          'Submission Failed',
          'Something went wrong while submitting your application. Please try again later.'
        );
      },
    });
  }

  /**
   * Sends the applicant a confirmation via the util_FreedomEmail endpoint.
   * Template depends on what they selected:
   *   • Motor only  → invite them to self-register as a POS at pos.oneinsure.com
   *   • otherwise   → thank-you note; an advisor follows up in 48–72 hours
   */
  private sendPartnerEmail(payload: any): void {
    const products: string[] = payload.products || [];
    const motorOnly = products.length === 1 && products[0] === 'Motor';

    const emailBody = {
      IssueId: 9999,
      FromEmail: 'support@oneinsure.com',
      ToEmail: payload.email,
      // ToEmail: 'ramakrishna.rao@oneinsure.com',
      // Keeps the partnerships team in the loop on every application.
      CCEmail: '', // <-- add the partnerships inbox here if needed
      Subject: motorOnly
        ? 'Get started selling Motor insurance with OneInsure'
        : 'Thank you for your interest in the OneInsure Partner Program',
      HTMLBody: motorOnly
        ? this.buildMotorPosHtml(payload)
        : this.buildPartnerThanksHtml(payload),
      AttachmentFilePath: '',
      ReplyEmailId: 'support@oneinsure.com',
      FromDisplayName: 'OneInsure Partnerships',
      TemplateId: 0,
      EmailType: 1,
      PurposeId: 0,
      IsHeaderFooter: 1,
      UserId: null,
    };

    this.http.post(
      'https://crmwebapi.oneinsure.com/api/common/util_FreedomEmail',
      emailBody,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = false;
        this.leadDone = true;
        this.clearForm();
        this.utility.toast(
          'success',
          'Application Received.'
        );
      },
      error: (err) => {
        console.error(err);
        // The lead was saved — surface the success panel anyway, but flag the email.
        this.submitting = false;
        this.submitted = false;
        this.leadDone = true;
        this.clearForm();
        this.utility.toast(
          'warning',
          'Application saved, but we could not send the confirmation email.'
        );
      },
    });
  }

  // ---------- Email bodies (table-based, email-client safe) ----------
  /** One label/value row for the summary table. */
  private emailRow(label: string, value: string): string {
    return `
      <tr>
        <td style="padding:10px 14px;border:1px solid #E6ECF5;background:#F8FAFF;font-family:Roboto,Arial,sans-serif;font-size:13px;font-weight:600;color:#1F2937;width:38%;">${label}</td>
        <td style="padding:10px 14px;border:1px solid #E6ECF5;font-family:Roboto,Arial,sans-serif;font-size:13px;color:#444;">${value || '—'}</td>
      </tr>`;
  }

  /** Shared shell so both templates share the same header/footer chrome. */
  private emailShell(headline: string, intro: string, inner: string): string {
    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OneInsure Partner Program</title>
</head>
<body style="background:#f5f5f5;margin:0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #E6ECF5;border-radius:14px;font-family:Roboto,Arial,sans-serif;">
          <!-- Header -->
          <tr>
            <td style="padding:18px 20px;border-bottom:1px solid #E6ECF5;">
              <img src="https://www.oneinsure.com/Media/Default/MPC/India_ki_insurance_help_line-svg.png" alt="OneInsure" width="150" height="41" style="display:block;border:0;" />
            </td>
          </tr>
          <!-- Headline -->
          <tr>
            <td style="padding:20px 20px 6px;font-size:18px;font-weight:700;color:#222;">${headline}</td>
          </tr>
          <tr>
            <td style="padding:0 20px 16px;font-size:14px;line-height:22px;color:#6B7280;">${intro}</td>
          </tr>
          ${inner}
          <!-- Footer -->
          <tr>
            <td style="padding:0 20px 22px;font-size:12px;line-height:20px;color:#9AA3B2;border-top:1px solid #E6ECF5;padding-top:16px;">
              This is an automated message from the OneInsure Partner Program.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /** Motor-only applicants → point them to the self-serve POS onboarding portal. */
  private buildMotorPosHtml(payload: any): string {
    const inner = `
          <!-- CTA -->
          <tr>
            <td style="padding:0 20px 18px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius:10px;background:#FF7A00;">
                    <a href="https://pos.oneinsure.com" target="_blank"
                       style="display:inline-block;padding:12px 26px;font-family:Roboto,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                      Register
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 16px;font-size:13px;line-height:21px;color:#6B7280;">
              Since you sell <strong style="color:#1F2937;">Motor insurance</strong>, you can start
              right away as a POSP. Complete your registration and certification here:
              <a href="https://pos.oneinsure.com" style="color:#0B63CE;">https://pos.oneinsure.com</a>
            </td>
          </tr> `;
    return this.emailShell(
      `Welcome aboard, ${payload.name}!`,
      'Thanks for your interest in partnering with OneInsure for Motor insurance. You can get started immediately using our Point-of-Sale (POS) portal.',
      inner
    );
  }

  /** Everyone else (incl. full product spread) → thank-you + advisor follow-up. */
  private buildPartnerThanksHtml(payload: any): string {
    const inner = `
          <!-- Your details -->
          <tr>
            <td style="padding:0 20px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                ${this.emailRow('Name', payload.name)}
                ${this.emailRow('Mobile', payload.phone)}
                ${this.emailRow('Email', payload.email)}
                ${this.emailRow('City', payload.city)}
                ${this.emailRow('Experience', payload.experience)}
                ${this.emailRow('Products', (payload.products || []).join(', '))}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 20px 20px;font-size:13px;line-height:21px;color:#6B7280;">
              One of our advisors will reach out to you within
              <strong style="color:#1F2937;">48–72 hours</strong> to walk you through the next steps.
            </td>
          </tr>`;
    return this.emailShell(
      `Thank you for becoming a partner, ${payload.name}!`,
      'We have received your application to join the OneInsure Partner Program. Here is a summary of what you shared with us.',
      inner
    );
  }

  /** Wipes form values + chip selections back to defaults (leaves flags alone). */
  private clearForm(): void {
    this.leadForm.reset({ portfolioLakhs: null, posCode: 'No' });
    this.products.forEach((p) => (p.checked = p.value === 'Health'));
  }

  resetLead(): void {
    this.submitted = false;
    this.leadDone = false;
    this.serverError = '';
    this.clearForm();
  }

  // ------------------------------------------------------------------
  //  Reveal + count-up animation (same IntersectionObserver pattern
  //  used across the other pages)
  // ------------------------------------------------------------------
  private io?: IntersectionObserver;
  private countIo?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.loadCompanyMetrics();
    // seed metric displays
    this.setupReveal();
    this.setupCounters();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.countIo?.disconnect();
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  private setupReveal(): void {
    const els = document.querySelectorAll(
      '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
    );
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.io?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    els.forEach((el) => this.io!.observe(el));
  }

  private setupCounters(): void {
    const host = document.querySelector('.pp-metrics');
    if (!host) {
      return;
    }
    this.countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            this.metrics.forEach((m) => this.animateMetric(m));
            this.countIo?.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    this.countIo.observe(host);
  }

  private animateMetric(m: Metric): void {
    if (m.value == null) {
      return; // non-numeric (e.g. PAN India)
    }
    const target = m.value;
    const duration = 1400;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      m.display = Math.round(target * eased).toString();
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        m.display = target.toString();
      }
    };
    requestAnimationFrame(step);
  }

  /** Pulls live company stats and maps them onto the metric cards. */
  private loadCompanyMetrics(): void {
    this.leadService.companyDetails({}).subscribe({
      next: (res) => {
        const d = Array.isArray(res) ? res[0] : res;
        if (!d) { return; }

        // Premium Managed — raw rupees → crores (₹ …Cr+)
        if (d.PremiumManaged != null) {
          this.metrics[0].value = Math.round(d.PremiumManaged / 1e7);
        }
        // Customers Served — policies issued → lakhs (…L+)
        if (d.Policy_Issued != null) {
          this.metrics[1].value = Math.floor(d.Policy_Issued / 1e5);
        }
        // Insurance Partners
        if (d.InsurancePartners != null) {
          this.metrics[2].value = d.InsurancePartners;
        }
        // metrics[3] ("PAN India") has no API field — stays static.

        this.reseedAndCount();
      },
      error: (err) => {
        console.error('companyDetails failed — showing 0', err);
        this.metrics.forEach((m) => {
          if (!m.text) { m.value = 0; m.display = '0'; }
        });
      },
    });
  }

  /** Re-seed displays and re-run the count-up once real values are in. */
  private reseedAndCount(): void {
    this.metrics.forEach((m) => (m.display = m.text ? m.text : '0'));
    this.countIo?.disconnect();
    this.setupCounters();
  }
}