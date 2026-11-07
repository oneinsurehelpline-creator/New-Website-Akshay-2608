import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LeadService } from 'src/app/services/lead.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoginModalService } from 'src/app/shared/login-modal/login-modal.service';
import { ScheduleModalService } from 'src/app/shared/schedule-modal/schedule-modal.service';
import { WHATSAPP_URL } from 'src/app/shared/site-facts';

interface QuickAction { icon: string; title: string; desc: string; route?: string; href?: string; secure?: boolean; schedule?: boolean; }
interface Faq { q: string; a: string[]; list?: boolean; }

/** One office, normalised from whatever shape branchAddress returns. */
interface Office {
  state: string;
  city: string;
  address: string;
  headOffice: boolean;
}

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss'],
})
export class ContactusComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly whatsappUrl = WHATSAPP_URL + '?text=' + encodeURIComponent('Hi, I need help with my policy.');

  readonly actions: QuickAction[] = [
    { icon: 'download', title: 'Download policy', desc: 'Download from \'My Account\'', route: '/my-account/policies' },
    { icon: 'list', title: 'View policy details', desc: 'See all policy details clearly', route: '/my-account/policies' },
    { icon: 'support', title: 'Request support', desc: 'Get help regarding your policy details or services.', route: '/service-support' },
    { icon: 'claim', title: 'File a claim', desc: 'Submit & track insurance claims', route: '/insurance-claim-support' },
    { icon: 'schedule', title: 'Schedule a call', desc: 'Book a time to talk to an advisor', schedule: true },
  ];

  readonly faqs: Faq[] = [
    {
      q: 'How do I contact OneInsure?',
      a: [
        'Call us on +91 86559 86559',
        'Connect via WhatsApp on +91 86559 86559',
        'Send an email to support@oneinsure.com',
        'Request a call back and an advisor will phone you on your mobile number',
        'Visit your nearest OneInsure office (see the list above)',
      ],
      list: true,
    },
    {
      q: 'Does OneInsure offer 24x7 support?',
      a: [
        'You can message us on WhatsApp or email us at any time and we will reply when our team is next online. '
        + 'For claims, tell us as soon as an incident happens and we will help you intimate the insurer.',
      ],
    },
    {
      q: 'What is the customer service number of OneInsure?',
      a: ['Our customer service number is +91 86559 86559. You can also write to support@oneinsure.com.'],
    },
    {
      q: 'How can I download my policy document?',
      a: ['Log in to My Account, open Policies and download the policy PDF. If it is not listed, message us on WhatsApp with your policy number and we will send it.'],
    },
    {
      q: 'How do I file or track a claim?',
      a: ['Visit the Claim Support page to file a claim or track an existing one with your claim number. Our claims team will guide you through the documents and follow up with the insurer.'],
    },
    {
      q: 'How do I raise a complaint?',
      a: ['Write to support@oneinsure.com first. If you are not satisfied with the response, escalate through the levels on our Grievance Redressal page.'],
    },
    {
      q: 'How can I verify that someone calling me is a OneInsure advisor?',
      a: ['Email support@oneinsure.com or message us on WhatsApp with the advisor\'s name and number and we will confirm. OneInsure never asks for OTPs or card details over a call.'],
    },
    {
      q: 'Can I schedule a call with an advisor?',
      a: ['Yes. Use the Schedule a call card above, pick a time that suits you and an advisor will call you at the slot you choose.'],
    },
    {
      q: 'Where can I find my nearest OneInsure office?',
      a: ['Pick your state in the Offices section above to see every OneInsure branch there, or use the Find a branch page to search by city.'],
    },
    {
      q: 'How do I update my contact details on a policy?',
      a: ['Write to support@oneinsure.com or message us on WhatsApp with your policy number and the details to change. Some insurers need a signed request or ID proof, and we will tell you what is required.'],
    },
  ];
  openFaq = 0;

  offices: Office[] = [];
  states: string[] = [];
  selectedState = '';
  loading = true;
  failed = false;

  private isBrowser: boolean;
  private observer?: IntersectionObserver;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private host: ElementRef<HTMLElement>,
    private leads: LeadService,
    private auth: AuthService,
    private loginModal: LoginModalService,
    private router: Router,
    private scheduleModal: ScheduleModalService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) { return; }
    this.leads.getbranchAddress().subscribe({
      next: (res: any) => {
        this.offices = this.normalise(res);
        this.states = Array.from(new Set(this.offices.map((o) => o.state).filter(Boolean))).sort();
        this.selectedState = this.states.includes('Maharashtra') ? 'Maharashtra' : this.states[0] ?? '';
        this.loading = false;
      },
      error: () => { this.failed = true; this.loading = false; },
    });
  }

  /** Offices for the chosen state: head office first, then by city. */
  get stateOffices(): Office[] {
    return this.offices
      .filter((o) => !this.selectedState || o.state === this.selectedState)
      .sort((a, b) => Number(b.headOffice) - Number(a.headOffice) || a.city.localeCompare(b.city));
  }

  /** Account cards: logged out → login popup on this page, then on to My Policies. */
  onCard(e: Event, a: QuickAction): void {
    if (a.schedule) { this.scheduleModal.open(); return; }
    if (!a.secure) { return; }
    e.preventDefault();
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/my-account', 'policies']);
    } else {
      this.loginModal.open(['/my-account', 'policies']);
    }
  }

  openSchedule(): void { this.scheduleModal.open(); }

  toggleFaq(i: number): void { this.openFaq = this.openFaq === i ? -1 : i; }

  /** The API may return [[...]] or [...]; field names are matched loosely. */
  private normalise(res: any): Office[] {
    const rows: any[] = Array.isArray(res?.[0]) ? res[0] : Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    const text = (v: any) => (v == null ? '' : String(v).trim());
    const title = (v: string) => v.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
    return rows.map((r) => ({
      state: title(text(r.State)),
      city: text(r.City) || 'Other',
      address: text(r.Address),
      // Branch_Name marks it, e.g. "Mumbai-HO-501-504"
      headOffice: /(^|[\s-])HO([\s-]|$)|head office/i.test(text(r.Branch_Name)),
    })).filter((o) => o.address);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) { return; }
    const els = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal-up'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    this.observer = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); this.observer?.unobserve(e.target); }
    }), { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}
