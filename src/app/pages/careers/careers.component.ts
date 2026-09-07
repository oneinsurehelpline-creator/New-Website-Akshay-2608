import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component, HostListener, ElementRef, AfterViewInit, OnInit, OnDestroy, Inject, PLATFORM_ID,
} from '@angular/core';
import { ViewportScroller, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '../../services/lead.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ConfigService } from 'src/app/services/config.service';

interface Role {
  title: string;
  dept: string;       // display label (also shown in the modal)
  deptKey: string;    // filter key
  type: string;
  location: string;
  experience: string;       // e.g. '3–5 years'
  summary: string;          // one-paragraph overview
  responsibilities: string[]; // "What you'll do"
  requirements: string[];     // "What you bring"
}

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.scss'],
})
export class CareersComponent implements OnInit, AfterViewInit, OnDestroy {
  private revealObserver?: IntersectionObserver;
  private countIo?: IntersectionObserver;

  /** Trusted-count stats — seeded with fallbacks, overwritten by companyDetails() */
  Policy_Issued = 0;   // → "Customers served"
  Employees = 0;       // → "Team members"
  companyAge = 0;      // → "In business" (yrs)
  resumepdf: any;

  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private viewportScroller: ViewportScroller,
    private fb: FormBuilder,
    private http: HttpClient,
    private leadService: LeadService,
    private utility: UtilityService,
    private configService: ConfigService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {
    if (this.isBrowser) {
      this.companyDetails();
    }

    // Years in business (same logic as carousel-header)
    const startDate = new Date('2008-03-27');
    const today = new Date();
    this.companyAge = today.getFullYear() - startDate.getFullYear();
    if (today < new Date(today.getFullYear(), 2, 29)) { this.companyAge--; }
  }

  ngAfterViewInit(): void {
    const els = this.host.nativeElement.querySelectorAll(
      '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
    );

    // Safety net: if IntersectionObserver isn't available, just show everything.
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach(el => el.classList.add('in'));
      return;
    }

    this.revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);   // reveal once, then stop watching
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => this.revealObserver!.observe(el));

    this.initCounters();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.countIo?.disconnect();
    if (this.isBrowser) {
      document.body.style.overflow = '';   // safety: never leave scroll locked
    }
  }

  private inView(el: Element): boolean {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  /** Count-up animation for [data-count] numbers. */
  private initCounters(): void {
    const fmt = (n: number): string =>
      n >= 100000 ? Math.round(n / 100000) + 'L'
        : n >= 1000 ? n.toLocaleString('en-IN')
          : String(n);

    const animate = (el: Element) => {
      const target = parseInt((el as HTMLElement).dataset['count'] || '0', 10) || 0;
      const main = el.querySelector('.num-main');
      const dur = 1600;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        if (main) { main.textContent = fmt(Math.round(ease * target)); }
        if (p < 1) { requestAnimationFrame(step); }
      };
      requestAnimationFrame(step);
    };

    this.countIo = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) { return; }
        animate(en.target);
        this.countIo!.unobserve(en.target);
      });
    }, { threshold: 0.4 });

    this.host.nativeElement.querySelectorAll('[data-count]').forEach((el) => {
      if (this.inView(el)) { animate(el); } else { this.countIo!.observe(el); }
    });
  }

  /** Re-run the count-up after new API values land (waits for the bindings to flush). */
  private refreshCounters(): void {
    setTimeout(() => {
      this.countIo?.disconnect();
      this.initCounters();
    });
  }

  // ── Filters ─────────────────────────────────────────────
  filters = [
    { key: 'all', label: 'All teams' },
    { key: 'tech', label: 'Technology' },
    { key: 'advisory', label: 'Advisory' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'ops', label: 'Operations' },
  ];
  activeFilter = 'all';

  // ── Roles ───────────────────────────────────────────────
  roles: Role[] = [
    {
      title: 'Senior Frontend Engineer', dept: 'Technology', deptKey: 'tech',
      type: 'Full-time', location: 'Mumbai / Remote', experience: '4–7 years',
      summary: 'Own the experience customers see — from quote flows to claims tracking — building fast, accessible interfaces in Angular that make insurance feel effortless.',
      responsibilities: [
        'Build and maintain customer-facing features in Angular, with a focus on performance and accessibility.',
        'Translate Figma designs into pixel-accurate, responsive components.',
        'Partner with backend and product teams to ship end-to-end flows.',
        'Set frontend standards — code review, testing, and reusable component libraries.',
      ],
      requirements: [
        '4+ years building production web apps with Angular (or React/Vue with willingness to switch).',
        'Strong TypeScript, RxJS, and modern CSS / responsive layout skills.',
        'Eye for detail and a track record of shipping polished UI.',
        'Comfort working across the stack and mentoring juniors.',
      ],
    },
    {
      title: 'Backend Engineer — Node.js / Python', dept: 'Technology', deptKey: 'tech',
      type: 'Full-time', location: 'Pune / Remote', experience: '3–6 years',
      summary: 'Design the services and APIs that power policies, payments, and claims at scale — reliable, secure, and built to handle millions of customer interactions.',
      responsibilities: [
        'Design, build, and maintain REST APIs and microservices in Node.js and/or Python.',
        'Model data and optimise queries across SQL and NoSQL stores.',
        'Integrate with insurer and payment-gateway partners.',
        'Own reliability — monitoring, logging, and incident response for your services.',
      ],
      requirements: [
        '3+ years of backend development with Node.js or Python.',
        'Solid grasp of databases, caching, and API design.',
        'Experience with cloud infra (AWS/GCP) and CI/CD pipelines.',
        'Care for security and data privacy in a regulated domain.',
      ],
    },
    {
      title: 'AI / ML Engineer — Sahay', dept: 'Technology', deptKey: 'tech',
      type: 'Full-time', location: 'Remote', experience: '3–6 years',
      summary: 'Build Sahay, our AI advisor that helps customers understand policies in plain language — from retrieval pipelines to model evaluation and guardrails.',
      responsibilities: [
        'Develop and ship LLM-powered features: retrieval, summarisation, and conversational guidance.',
        'Build evaluation and guardrail systems to keep advice accurate and compliant.',
        'Work with domain experts to ground models in real insurance knowledge.',
        'Optimise latency, cost, and quality of inference in production.',
      ],
      requirements: [
        '3+ years in ML/AI engineering, with recent hands-on LLM/NLP work.',
        'Strong Python and experience with modern ML tooling and vector stores.',
        'Pragmatism about evaluation, prompt design, and shipping safely.',
        'Bonus: experience in regulated or high-trust domains.',
      ],
    },
    {
      title: 'Product Manager — Digital Products', dept: 'Technology', deptKey: 'tech',
      type: 'Full-time', location: 'Mumbai', experience: '4–8 years',
      summary: 'Drive the roadmap for our digital purchase and servicing journeys — turning customer pain points into clear, measurable product bets.',
      responsibilities: [
        'Own the roadmap and discovery for one or more customer journeys.',
        'Translate research and data into crisp requirements and success metrics.',
        'Lead a cross-functional squad of design, engineering, and analytics.',
        'Balance customer outcomes, compliance, and business goals.',
      ],
      requirements: [
        '4+ years in product management, ideally for consumer digital products.',
        'Strong analytical skills and comfort with experimentation.',
        'Excellent communication and stakeholder management.',
        'Bonus: fintech, insurtech, or other regulated-industry experience.',
      ],
    },
    {
      title: 'Insurance Advisor — Health & Life', dept: 'Advisory', deptKey: 'advisory',
      type: 'Full-time', location: 'Pan-India', experience: '1–4 years',
      summary: 'Be the trusted voice on the other end of the call — helping families choose the right health and life cover with honesty and zero pressure.',
      responsibilities: [
        'Understand each customer\u2019s needs and recommend suitable health/life products.',
        'Explain options in plain language — coverage, exclusions, and claims.',
        'Guide customers through application and onboarding.',
        'Maintain long-term relationships built on trust, not pushy sales.',
      ],
      requirements: [
        '1+ year in insurance, financial services, or customer advisory (freshers with aptitude welcome).',
        'Excellent communication in English and at least one regional language.',
        'IRDAI certification (or willingness to certify — we support this).',
        'Genuine customer-first attitude.',
      ],
    },
    {
      title: 'Senior Wealth Advisor', dept: 'Advisory', deptKey: 'advisory',
      type: 'Full-time', location: 'Mumbai / Delhi', experience: '5–10 years',
      summary: 'Advise high-value clients across protection and investment-linked plans, building durable relationships and a referral-driven book of business.',
      responsibilities: [
        'Manage and grow a portfolio of premium clients.',
        'Provide holistic advice across guaranteed, market-linked, and protection plans.',
        'Conduct periodic reviews and align plans with life changes.',
        'Mentor junior advisors and uphold advisory standards.',
      ],
      requirements: [
        '5+ years in wealth management, life insurance, or financial advisory.',
        'Proven track record managing HNI relationships.',
        'Relevant certifications (IRDAI; CFP/NISM a plus).',
        'Consultative, ethical approach to advice.',
      ],
    },
    {
      title: 'Claims Relationship Manager', dept: 'Advisory', deptKey: 'advisory',
      type: 'Full-time', location: 'Bengaluru', experience: '2–5 years',
      summary: 'Stand beside customers at their hardest moment — owning claims end to end so families get what they\u2019re owed, quickly and with dignity.',
      responsibilities: [
        'Own claims cases from intimation to settlement.',
        'Coordinate between customers, hospitals, and insurer claims teams.',
        'Keep customers informed and reassured throughout the process.',
        'Spot and escalate disputes; advocate for fair outcomes.',
      ],
      requirements: [
        '2+ years in claims, hospital TPA, or insurance operations.',
        'Calm, empathetic communication under pressure.',
        'Strong follow-through and attention to documentation.',
        'Working knowledge of health/life claims processes.',
      ],
    },
    {
      title: 'Content Strategist — Insurance Education', dept: 'Marketing', deptKey: 'marketing',
      type: 'Full-time', location: 'Remote', experience: '3–6 years',
      summary: 'Make insurance make sense. Plan and create content that demystifies policies and helps lakhs of Indians make confident decisions.',
      responsibilities: [
        'Own the content roadmap across blog, video scripts, and explainers.',
        'Turn complex insurance topics into clear, trustworthy content.',
        'Collaborate with advisors and compliance for accuracy.',
        'Use SEO and performance data to prioritise what to create.',
      ],
      requirements: [
        '3+ years in content strategy or editorial, ideally finance/insurance.',
        'Sharp writing and editing skills; can simplify the complex.',
        'Understanding of SEO and content performance.',
        'Bonus: experience briefing designers and video teams.',
      ],
    },
    {
      title: 'Performance Marketing Manager', dept: 'Marketing', deptKey: 'marketing',
      type: 'Full-time', location: 'Mumbai', experience: '3–6 years',
      summary: 'Own paid acquisition end to end — turn budget into qualified leads across Google, Meta, and beyond, with a relentless focus on cost per quality lead.',
      responsibilities: [
        'Plan, run, and optimise paid campaigns across search and social.',
        'Own budgets, targets, and reporting for lead generation.',
        'Run experiments on creative, audiences, and landing pages.',
        'Work with content and product to improve funnel conversion.',
      ],
      requirements: [
        '3+ years in performance marketing with real budget ownership.',
        'Hands-on with Google Ads, Meta Ads, and analytics tools.',
        'Strong analytical mindset and comfort with A/B testing.',
        'Bonus: lead-gen experience in finance or insurance.',
      ],
    },
    {
      title: 'Policy Operations Executive', dept: 'Operations', deptKey: 'ops',
      type: 'Full-time', location: 'Pune', experience: '0–3 years',
      summary: 'Keep the engine running — process policies accurately and on time so every customer\u2019s cover is exactly what they were promised.',
      responsibilities: [
        'Process new policies, renewals, and endorsements accurately.',
        'Coordinate with insurers and resolve discrepancies.',
        'Maintain clean records and meet turnaround SLAs.',
        'Support advisors and customers with policy queries.',
      ],
      requirements: [
        '0–3 years in operations, back-office, or data entry (freshers welcome).',
        'Strong attention to detail and organisation.',
        'Comfort with spreadsheets and internal tools.',
        'Reliable, process-oriented mindset.',
      ],
    },
  ];

  get visibleRoles(): Role[] {
    return this.activeFilter === 'all'
      ? this.roles
      : this.roles.filter(r => r.deptKey === this.activeFilter);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  trackByTitle(_index: number, role: Role): string {
    return role.title;
  }

  private lockScroll(lock: boolean): void {
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  // ── In-page scroll (matches the site's anchor behaviour) ─
  scrollTo(anchor: string): void {
    this.viewportScroller.scrollToAnchor(anchor);
  }

  // ── Modals ──────────────────────────────────────────────
  selectedRole: Role | null = null;
  showApply = false;
  sending = false;

  // Resume file — stored outside the form as base64; the `resume` control
  // just holds the filename so Validators.required + invalid('resume') work.
  resumeBase64 = '';
  resumeName = '';

  openRole(role: Role): void {
    this.selectedRole = role;
    this.lockScroll(true);
  }

  closeRole(): void {
    this.selectedRole = null;
    if (!this.showApply) { this.lockScroll(false); }
  }

  openApply(): void {
    this.showApply = true;
    this.lockScroll(true);
  }

  closeApply(): void {
    this.showApply = false;
    if (!this.selectedRole) { this.lockScroll(false); }
  }

  onBackdrop(event: MouseEvent, which: 'role' | 'apply'): void {
    if (event.target === event.currentTarget) {
      which === 'role' ? this.closeRole() : this.closeApply();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showApply) { this.closeApply(); }
    else if (this.selectedRole) { this.closeRole(); }
  }

  applyForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    // 10 digits, must start with 6-9 (Indian mobile format)
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    qualification: ['', Validators.required],
    experience: ['', Validators.required],
    currentDesignation: ['', Validators.required],
    resume: ['', Validators.required],
  });

  /** True only once a control is invalid AND the user has interacted with it. */
  invalid(controlName: string): boolean {
    const c = this.applyForm.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Digits-only guard for the phone field (strips non-numerics, caps at 10). */
  onPhoneInput(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    input.value = digits;
    this.applyForm.get('phone')?.setValue(digits);
  }

  /** Reads the chosen resume into base64 and validates type/size. */
  onResumeSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) { return; }

    const extOk = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!extOk) {
      this.utility.toast('warning', 'Please upload a PDF or Word (.doc/.docx) file.');
      this.clearResume(input);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.utility.toast('warning', 'Resume must be under 5 MB.');
      this.clearResume(input);
      return;
    }

    // const reader = new FileReader();
    // reader.onload = () => {
    //   const result = reader.result as string;
    //   // Strip the "data:...;base64," prefix — the API expects raw base64.
    //   // (If your backend wants the full data URI, send `result` instead.)
    //   this.resumeBase64 = result.includes(',') ? result.split(',')[1] : result;
    //   this.resumeName = file.name;
    //   const ctrl = this.applyForm.get('resume');
    //   ctrl?.setValue(file.name);
    //   ctrl?.markAsDirty();
    // };
    // reader.readAsDataURL(file);
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);

      let hex = '0x';

      bytes.forEach((byte) => {
        hex += byte.toString(16).padStart(2, '0').toUpperCase();
      });

      this.resumeBase64 = hex; // send this as Document
      this.resumeName = file.name;

      const ctrl = this.applyForm.get('resume');
      ctrl?.setValue(file.name);
      ctrl?.markAsDirty();
    };

    reader.readAsArrayBuffer(file);
  }

  private clearResume(input?: HTMLInputElement): void {
    this.resumeBase64 = '';
    this.resumeName = '';
    this.applyForm.get('resume')?.setValue('');
    if (input) { input.value = ''; }
  }

  submitApply(): void {
    // Reveal all validation messages if anything is missing/invalid.
    if (this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }
    if (this.sending) { return; }

    this.sending = true;
    const v = this.applyForm.value;
    const roleTitle = this.selectedRole ? this.selectedRole.title : 'Open Application';

    // Matches the saveJobApplicationDetails DTO shape.
    const dto = {
      Id: 0,
      Name: (v.fullName as string).trim(),
      MobileNo: v.phone,
      EmailId: v.email,
      Qualification: v.qualification,
      CurrentDesignation: v.currentDesignation,
      TotalExperience: v.experience,
      // Fields not collected in this form — sent empty so the DTO stays consistent.
      CurrentEmployer: '',
      CurrentCTC: '',
      ExpectedCTC: '',
      NoticePeriod: '',
      DocumentUrl: this.resumeName,   // original filename
      Document: this.resumeBase64,    // base64 content — server writes the file
      AppliedFor: roleTitle,
    };

    // 1. Save the application, 2. mail the recruitment team, 3. show success.
    this.leadService.saveJobApplicationDetails(dto).subscribe({
      next: (res: any) => {
        // Save returns the stored file's server path, e.g. d:\oneinsure.com\Resume\xyz.pdf
        const serverPath = res?.[0]?.[''] || '';
        const fullPath = res[0][""];

        const url = fullPath.split("Resume\\")[1].replace(/\\/g, "/");

        // Result:
        const baseUrl = new URL(this.configService.baseUrl).origin;
        this.resumepdf = `${baseUrl}/${url}`;
        this.sendRecruitmentEmail(dto, roleTitle, serverPath);
      },
      error: (err) => {
        console.error(err);
        this.sending = false;
        this.utility.error(
          'Submission Failed',
          'Something went wrong while sending your application. Please try again.'
        );
      },
    });
  }

  /** Fires the same util_FreedomEmail endpoint the carousel-header uses. */
  private sendRecruitmentEmail(dto: any, roleTitle: string, resumePath = ''): void {
    const emailBody = {
      IssueId: 9999,
      FromEmail: this.configService.careersFromEmail,
      ToEmail: this.configService.careersToEmail,
      CCEmail: '', // <-- add your email here
      Subject: `New Job Application: ${roleTitle} — ${dto.Name}`,
      HTMLBody: this.buildRecruitmentHtml(dto, roleTitle),
      AttachmentFilePath: null,   // attaches the uploaded resume
      ReplyEmailId: dto.EmailId,
      FromDisplayName: 'OneInsure Careers',
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
        this.sending = false;
        this.utility.success(
          'Application Submitted',
          `You have successfully applied for ${roleTitle}. Our team will get back to you shortly.`
        );
        this.applyForm.reset({
          fullName: '', email: '', phone: '',
          qualification: '', experience: '', currentDesignation: '', resume: '',
        });
        this.clearResume();
        this.selectedRole = null;   // also close the role-detail modal behind it
        this.closeApply();
      },
      error: (err) => {
        console.error(err);
        this.sending = false;
        this.utility.error(
          'Email Sending Failed',
          'Your application was saved, but we could not notify the team. Please try again.'
        );
      },
    });
  }

  /** Recruitment-team email body: a clean table of the applicant's details. */
  private buildRecruitmentHtml(dto: any, roleTitle: string): string {
    const row = (label: string, value: string) => `
      <tr>
        <td style="padding:10px 14px;border:1px solid #E6ECF5;background:#F8FAFF;font-family:Roboto,Arial,sans-serif;font-size:13px;font-weight:600;color:#1F2937;width:38%;">${label}</td>
        <td style="padding:10px 14px;border:1px solid #E6ECF5;font-family:Roboto,Arial,sans-serif;font-size:13px;color:#444;">${value || '—'}</td>
      </tr>`;

    return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Job Application</title>
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
          <!-- Intro -->
          <tr>
            <td style="padding:20px 20px 6px;font-size:18px;font-weight:700;color:#222;">New Job Application Received</td>
          </tr>
          <tr>
            <td style="padding:0 20px 16px;font-size:14px;line-height:22px;color:#6B7280;">
              A candidate has applied for <strong style="color:#1F2937;">${roleTitle}</strong>. Details are below.
            </td>
          </tr>
          <!-- Details table -->
          <tr>
            <td style="padding:0 20px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                ${row('Applied For', roleTitle)}
                ${row('Name', dto.Name)}
                ${row('Mobile No', dto.MobileNo)}
                ${row('Email', dto.EmailId)}
                ${row('Qualification', dto.Qualification)}
                ${row('Current Designation', dto.CurrentDesignation)}
                ${row('Total Experience', dto.TotalExperience)}
               ${row(
      'Resume',
      `<a href="${this.resumepdf}" target="_blank">Download</a>`
    )}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 20px 22px;font-size:12px;line-height:20px;color:#9AA3B2;border-top:1px solid #E6ECF5;padding-top:16px;">
              This is an automated notification from the OneInsure Careers page.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // ── Stats: API + count-up (ported from carousel-header) ──
  companyDetails(): void {
    const cdto = {};
    this.leadService.companyDetails(cdto).subscribe((res: any) => {
      // API returns a nested result set: [[ { ... } ]]
      const data = Array.isArray(res) ? res?.[0] : res;
      if (!data) { return; }

      const changed =
        this.Policy_Issued !== data.Policy_Issued ||
        this.Employees !== data.Employees;

      this.Policy_Issued = data.Policy_Issued;
      this.Employees = data.Employees;

      // Only re-run the count-up if the fresh values differ from what already animated.
      if (changed) { this.refreshCounters(); }
    });
  }
}