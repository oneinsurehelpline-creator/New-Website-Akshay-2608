import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, HostListener,
} from '@angular/core';
import { LeadService } from 'src/app/services/lead.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-carousel-header',
  templateUrl: './carousel-header.component.html',
  styleUrls: ['./carousel-header.component.scss']
})
export class CarouselHeaderComponent {
  @ViewChild('deckEl') deckEl!: ElementRef<HTMLElement>;

  waitListEmailId: string = '';
  submittingWaitList = false;

  constructor(private host: ElementRef<HTMLElement>, private http: HttpClient, private leadService: LeadService, private utility: UtilityService) { }

  /** Hero deck carousel state */
  readonly TOTAL = 4;
  private readonly AUTO_MS = 6000;
  current = 0;
  progress = 0;                 // bound to the progress bar width (%)
  companyAge = 0;

  /** Trusted-count stats — seeded with fallbacks, overwritten by companyDetails() */
  Policy_Issued = 0;
  Managers = 0;
  Branches = 0;
  Employees = 0;

  private timer: ReturnType<typeof setInterval> | undefined;
  private progStart = Date.now();
  private paused = false;
  private touchX: number | null = null;
  private touchY: number | null = null;
  private io?: IntersectionObserver;
  private revealIo?: IntersectionObserver;
  private countIo?: IntersectionObserver;

  ngOnInit() {
    this.companyDetails();
    const startDate = new Date('2008-03-27');
    const today = new Date();

    this.companyAge = today.getFullYear() - startDate.getFullYear();

    if (today < new Date(today.getFullYear(), 2, 29)) {
      this.companyAge--;
    }
  }

  ngAfterViewInit(): void {
    this.go(0);

    const deck = this.deckEl?.nativeElement;
    if (deck) {
      // Pause autoplay while the deck is off-screen.
      this.io = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? this.resumeAuto() : this.pauseAuto())),
        { threshold: 0.3 },
      );
      this.io.observe(deck);
    }

    this.initReveal();
    this.initCounters();
  }

  private inView(el: Element): boolean {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  /** Scroll-reveal for .reveal* elements (fires immediately for anything already on screen). */
  private initReveal(): void {
    const sel = '.reveal,.reveal-up,.reveal-left,.reveal-right,.reveal-scale';
    this.revealIo = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); this.revealIo?.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );
    this.host.nativeElement.querySelectorAll(sel).forEach((el) => {
      if (this.inView(el)) { el.classList.add('in'); } else { this.revealIo!.observe(el); }
    });
  }

  /** Count-up animation for [data-count] numbers (ports the original initCounters). */
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
  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.io?.disconnect();
    this.revealIo?.disconnect();
    this.countIo?.disconnect();
  }

  // ---- carousel ----
  go(i: number): void {
    this.current = ((i % this.TOTAL) + this.TOTAL) % this.TOTAL;
    this.progStart = Date.now();
    this.restart();
  }
  next(): void { this.go(this.current + 1); }
  prev(): void { this.go(this.current - 1); }

  private tick(): void {
    if (this.paused) { return; }
    const elapsed = Date.now() - this.progStart;
    this.progress = Math.min(100, (elapsed / this.AUTO_MS) * 100);
    if (elapsed >= this.AUTO_MS) { this.go(this.current + 1); }
  }

  private restart(): void {
    clearInterval(this.timer);
    this.progress = 0;
    this.progStart = Date.now();
    this.timer = setInterval(() => this.tick(), 80);
  }

  pauseAuto(): void { this.paused = true; }
  resumeAuto(): void {
    this.paused = false;
    this.progStart = Date.now() - (this.progress / 100) * this.AUTO_MS;
  }

  // ---- touch swipe ----
  onTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) { return; }
    this.touchX = e.touches[0].clientX;
    this.touchY = e.touches[0].clientY;
    this.pauseAuto();
  }
  onTouchEnd(e: TouchEvent): void {
    if (this.touchX === null) { return; }
    const dx = e.changedTouches[0].clientX - this.touchX;
    const dy = e.changedTouches[0].clientY - (this.touchY ?? 0);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? this.next() : this.prev();
    } else {
      this.resumeAuto();
    }
    this.touchX = this.touchY = null;
  }

  // ---- keyboard (only when the deck is in view) ----
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target?.matches?.('input,textarea')) { return; }
    const el = this.deckEl?.nativeElement;
    if (!el) { return; }
    const r = el.getBoundingClientRect();
    if (r.bottom < 100 || r.top > window.innerHeight) { return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
  }


  joinWaitList() {

    const email = this.waitListEmailId.trim();
    const mail=email

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      this.utility.toast(
        'warning',
        'Please enter a valid email address.'
      );
      return;
    }

    if (this.submittingWaitList) { return; }
    this.submittingWaitList = true;

    // 1. Store email
    this.leadService.waitListEmail({
      mail
    }).subscribe({
      next: (res:any) => { 
        this.emailsent(res.Mail)
      },
      error: (err) => {
        console.error(err);
        this.utility.error(
          'Registration Failed',
          'Please try again later.'
        );
        this.submittingWaitList = false;
      }
    });

 
  }
  emailsent(email:any){
       // 2. Send welcome email directly
    const emailBody = {
      IssueId: 9999,
      FromEmail: "support@oneinsure.com",
      ToEmail: email,
      Subject: "Welcome to Sahay Beta!",
      HTMLBody: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light only" />
    <title>Welcome to Sahay Beta</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" />
    <style>
        /* Client resets */
        body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
        table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
        body { margin:0; padding:0; width:100% !important; height:100% !important; }

        /* Mobile */
        @media only screen and (max-width:620px) {
            .email-container { width:100% !important; }
            .px { padding-left:16px !important; padding-right:16px !important; }
            .stack { display:block !important; width:100% !important; padding:0 0 12px 0 !important; }
            .spacer-col { display:none !important; width:0 !important; }
            .h1 { font-size:26px !important; line-height:32px !important; }
            .brand { font-size:32px !important; line-height:38px !important; }
        }
    </style>
</head>

<body style="margin:0; padding:0; background-color:#eef1f6;">

    <!-- Preheader (hidden preview text) -->
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#eef1f6;">
        You're on the Sahay Beta waitlist — we'll notify you the moment it launches.
        &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef1f6;">
        <tr>
            <td align="center" style="padding:24px 12px;">

                <!--[if mso]>
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td>
                <![endif]-->

                <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0"
                    align="center" style="width:600px; max-width:600px; font-family:Roboto,'Segoe UI',Arial,sans-serif;">

                    <!-- Header / Logo -->
                    <tr>
                        <td class="px" style="background-color:#ffffff; border-radius:12px 12px 0 0; padding:18px 24px;">
                            <a href="https://www.oneinsure.com/" target="_blank" style="text-decoration:none; display:inline-block;">
                                <img src="https://www.oneinsure.com/Media/Default/MPC/India_ki_insurance_help_line-svg.png"
                                    alt="OneInsure" width="150" height="41"
                                    style="display:block; width:150px; height:41px; border:0;" />
                            </a>
                        </td>
                    </tr>

                    <!-- Card body -->
                    <tr>
                        <td style="background-color:#f6f8fc; padding:20px 16px;">

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#ffffff; border:1px solid #e6ecf5; border-radius:16px;">

                                <!-- Success badge -->
                                <tr>
                                    <td align="center" style="padding:32px 24px 12px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td align="center" valign="middle" width="76" height="76"
                                                    style="width:76px; height:76px; background-color:#22c55e; border-radius:50%; box-shadow:0 6px 16px rgba(34,197,94,0.35);">
                                                    <span style="font-family:Arial,sans-serif; font-size:40px; line-height:76px; color:#ffffff; font-weight:bold;">&#10004;</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Small heading -->
                                <tr>
                                    <td align="center" style="padding:8px 24px 4px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:16px; line-height:24px; color:#6b7280;">
                                        Thank you for registering!
                                    </td>
                                </tr>

                                <!-- Welcome -->
                                <tr>
                                    <td class="h1" align="center" style="padding:0 24px 2px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:30px; line-height:38px; font-weight:700; color:#1f2937;">
                                        Welcome to
                                    </td>
                                </tr>

                                <!-- Sahay -->
                                <tr>
                                    <td class="brand" align="center" style="padding:0 24px 16px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:38px; line-height:44px; font-weight:900; letter-spacing:0.5px; color:#f29d1e;">
                                        SAHAY BETA
                                    </td>
                                </tr>

                                <!-- Description -->
                                <tr>
                                    <td align="center" style="padding:0 28px 24px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:16px; line-height:26px; color:#5f6368;">
                                        You're officially on the waitlist. We'll notify you as soon as
                                        <strong style="color:#374151;">Sahay Beta</strong> becomes available.
                                    </td>
                                </tr>

                                <!-- Divider -->
                                <tr>
                                    <td align="center" style="padding:0 24px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr><td style="border-top:1px solid #eceff4; font-size:0; line-height:0;">&nbsp;</td></tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Feature cards -->
                                <tr>
                                    <td class="px" style="padding:24px 20px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>

                                                <!-- Card 1 -->
                                                <td class="stack" width="31%" valign="top">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                                        style="border:1px solid #e7edff; border-radius:12px; background-color:#f8faff;">
                                                        <tr>
                                                            <td align="center" style="padding:16px 12px 4px;">
                                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td align="center" valign="middle" width="44" height="44"
                                                                            style="width:44px; height:44px; background-color:#e6f6fd; border-radius:50%;">
                                                                            <span style="font-family:Arial,sans-serif; font-size:22px; line-height:44px; color:#00b5eb;">&#10003;</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding:8px 8px 0; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:15px; line-height:20px; font-weight:700; color:#1f2937;">
                                                                Registration
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding:2px 10px 14px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:13px; line-height:18px; color:#6b7280;">
                                                                Successful
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>

                                                <td class="spacer-col" width="3%">&nbsp;</td>

                                                <!-- Card 2 -->
                                                <td class="stack" width="31%" valign="top">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                                        style="border:1px solid #e7edff; border-radius:12px; background-color:#f8faff;">
                                                        <tr>
                                                            <td align="center" style="padding:16px 12px 4px;">
                                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td align="center" valign="middle" width="44" height="44"
                                                                            style="width:44px; height:44px; background-color:#e6f6fd; border-radius:50%;">
                                                                            <span style="font-family:Arial,sans-serif; font-size:22px; line-height:44px; color:#00b5eb;">&#9733;</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding:8px 8px 0; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:15px; line-height:20px; font-weight:700; color:#1f2937;">
                                                                Early Access
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding:2px 10px 14px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:13px; line-height:18px; color:#6b7280;">
                                                                Your spot is reserved
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>

                                                <td class="spacer-col" width="3%">&nbsp;</td>

                                                <!-- Card 3 -->
                                                <td class="stack" width="31%" valign="top">
                                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                                        style="border:1px solid #e7edff; border-radius:12px; background-color:#f8faff;">
                                                        <tr>
                                                            <td align="center" style="padding:16px 12px 4px;">
                                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                                                    <tr>
                                                                        <td align="center" valign="middle" width="44" height="44"
                                                                            style="width:44px; height:44px; background-color:#e6f6fd; border-radius:50%;">
                                                                            <span style="font-family:Arial,sans-serif; font-size:20px; line-height:44px; color:#00b5eb;">&#9993;</span>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding:8px 8px 0; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:15px; line-height:20px; font-weight:700; color:#1f2937;">
                                                                Stay Updated
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td align="center" style="padding:2px 10px 14px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:13px; line-height:18px; color:#6b7280;">
                                                                Launch notification
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>

                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Regards -->
                                <tr>
                                    <td style="padding:4px 28px 28px; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:16px; line-height:26px; color:#444444;">
                                        Regards,<br />
                                        <strong style="color:#1f2937;">Team Sahay</strong>
                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#ffffff; border-radius:0 0 12px 12px; padding:20px 24px; text-align:center; font-family:Roboto,'Segoe UI',Arial,sans-serif; font-size:12px; line-height:18px; color:#9aa2ae;">
                            &copy; 2026 OneInsure. All rights reserved.<br />
                            You're receiving this email because you joined the Sahay Beta waitlist.
                        </td>
                    </tr>

                </table>

                <!--[if mso]>
                </td></tr></table>
                <![endif]-->

            </td>
        </tr>
    </table>

</body>

</html>`,
      AttachmentFilePath: "",
      CCEmail: "",
      ReplyEmailId: "",
      FromDisplayName: "Sahay",
      TemplateId: 0,
      EmailType: 1,
      PurposeId: 0,
      IsHeaderFooter: 1,
      UserId: null
    };

    this.http.post(
      'https://crmwebapi.oneinsure.com/api/common/util_FreedomEmail',
      emailBody,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    ).subscribe({
      next: () => {
        this.utility.success(
          'Registration Successful',
          'Welcome to Sahay Beta! We will notify you soon.'
        );

        this.waitListEmailId = '';
        this.submittingWaitList = false;
      },
      error: (err) => {
        console.error(err);
        this.utility.error(
          'Email Sending Failed',
          'Please try again later.'
        );
        this.submittingWaitList = false;
      }
    });
  }

  companyDetails() {
    const cdto = {};
    this.leadService.companyDetails(cdto).subscribe((res: any) => {
      // API returns a nested result set: [[ { ... } ]]
      const data = Array.isArray(res) ? res?.[0] : res;
      if (!data) { return; }

      const changed =
        this.Policy_Issued  !== (data.Policy_Issued) ||
        this.Managers       !== (data.Managers) ||
        this.Branches !== (data.Branches) ||
        this.Employees !== (data.Employees);

      this.Policy_Issued = data.Policy_Issued;
      this.Managers = data.Managers;
      this.Branches = data.Branches;
      this.Employees = data.Employees;

      // Only re-run the count-up if the fresh values differ from what already animated.
      if (changed) { this.refreshCounters(); }
    });
  }

  /** Re-run the count-up after new API values land (waits for the [attr.data-count] bindings to flush). */
  private refreshCounters(): void {
    setTimeout(() => {
      this.countIo?.disconnect();
      this.initCounters();
    });
  }

} 