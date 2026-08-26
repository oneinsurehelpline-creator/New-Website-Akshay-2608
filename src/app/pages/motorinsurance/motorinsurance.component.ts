import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lead, LeadService } from '../../services/lead.service';
import { VideoModalService } from '../../shared/video-modal/video-modal.service';

/** Payload the quote form collects. Map this to whatever your API expects. */
interface MotorQuoteRequest {
  vehicleType: 'car' | 'bike' | 'commercial';
  policyKind: 'renewal' | 'new';
  regNumber: string;
  make: string;
  model: string;
  year: string;
  fuel: string;
  mobile: string;
  city: string;
  coverType: 'comprehensive' | 'third-party' | 'own-damage';
}

/** Shape of a single insurer quote the results grid renders (fill in once the API is ready). */
interface InsurerQuote {
  insurer: string;
  plan: string;
  logo: string;
  logoImg?: string;
  logoColor: string;
  premium: number;
  idv: number;
  features: string[];
  badge?: string;
  recommended?: boolean;
}

interface WhyPoint {
  title: string;
  desc: string;
  icon: 'shield' | 'wrench' | 'clock' | 'home';
}

interface CoverCard {
  icon: 'shield' | 'users' | 'link';
  tag: string;
  tagClass: 'comp' | 'tp' | 'od';
  title: string;
  desc: string;
  bullets: string[];
  coverType: MotorQuoteRequest['coverType'];
  cta: string;
}

interface QuoteLink {
  key: 'car' | 'bike';
  icon: 'car' | 'bike';
  eyebrow: string;
  title: string;
  desc: string;
  features: string[];
  cta: string;
  url: string;
}

interface VideoItem {
  num: string;
  topic: string;
  dur: string;             // fallback watch time (oEmbed can't provide duration)
  cap: string;
  title: string;           // overwritten live for cards that set a videoId
  desc: string;            // oEmbed can't provide description — stays as written
  url: string;
  videoId?: string;        // set this to enrich the card from YouTube oEmbed
  thumb?: string;          // filled at runtime (thumbnail image URL)
}

@Component({
  selector: 'app-motorinsurance',
  templateUrl: './motorinsurance.component.html',
  styleUrls: ['./motorinsurance.component.scss'],
})
export class MotorinsuranceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('vidsTrack', { static: false }) vidsTrack!: ElementRef<HTMLElement>;

  constructor(
    private host: ElementRef<HTMLElement>,
    private fb: FormBuilder,
    private leadSvc: LeadService,
    private cdr: ChangeDetectorRef,
    private videoModal: VideoModalService,
  ) {
    this.quoteForm = this.fb.group({
      vehicleType: ['car', Validators.required],
      policyKind: ['renewal', Validators.required],
      regNumber: ['', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      fuel: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      city: ['', Validators.required],
      coverType: ['comprehensive', Validators.required],
    });
  }

  /** Opens the explainer video inline; falls back to a new tab when there's no known videoId. */
  openVideo(v: VideoItem, event: Event): void {
    event.preventDefault();
    if (v.videoId) {
      this.videoModal.open(v.videoId, v.title || v.topic);
    } else {
      window.open(v.url, '_blank', 'noopener');
    }
  }

  // ---------- HERO ----------
  trust = [
    'IRDAI-licensed broker',
    'Instant policy issuance',
    '5,000+ cashless garages',
    'Claim support 24 × 7',
  ];

  stats = [
    { num: '2', sup: 'min', lbl: 'To get a quote online' },
    { num: '5K', sup: '+', lbl: 'Cashless garages' },
    { num: '24', sup: 'hr', lbl: 'Claim settlement target' },
    { num: '₹0', sup: ' extra', lbl: 'Broker fee charged' },
  ];

  // ---------- SUBNAV ----------
  subnav = [
    { id: 'why', label: 'Why motor cover' },
    { id: 'covertypes', label: 'Types of cover' },
    { id: 'videos', label: 'Explainer videos' },
    { id: 'quote', label: 'Get a quote' },
  ];
  activeSection = 'why';

  // ---------- WHY MOTOR ----------
  whyPoints: WhyPoint[] = [
    {
      title: 'Legally mandatory — and enforceable.',
      desc: 'Driving without at least third-party cover is a criminal offence. Fine up to ₹4,000 and up to 3 months imprisonment from 2019 rules.',
      icon: 'shield',
    },
    {
      title: 'Cashless repairs at 5,000+ garages.',
      desc: 'No out-of-pocket payment. Authorised network garages bill the insurer directly — you just drop the car and collect it.',
      icon: 'wrench',
    },
    {
      title: 'No-claim bonus — up to 50% off premiums.',
      desc: 'For every claim-free year, your premium reduces. Five years without a claim cuts your OD premium by 50%. Transferable to a new vehicle.',
      icon: 'clock',
    },
    {
      title: 'Covers theft, flood, fire — not just accidents.',
      desc: 'Comprehensive cover includes damage from natural calamities, riots, vandalism, and theft of the vehicle or its parts.',
      icon: 'home',
    },
  ];

  // ---------- COVER TYPES ----------
  coverCards: CoverCard[] = [
    {
      icon: 'shield',
      tag: 'Most popular',
      tagClass: 'comp',
      title: 'Comprehensive Cover',
      desc: 'The full package — covers your vehicle, third-party damage, and your passengers. Recommended for any car under 10 years old.',
      bullets: [
        'Own damage (accidents, fire, flood, theft)',
        'Third-party liability (unlimited for death/injury)',
        'Personal accident cover for owner-driver',
        'Add-ons: zero depreciation, engine protect, roadside',
      ],
      coverType: 'comprehensive',
      cta: 'Get comprehensive quote',
    },
    {
      icon: 'users',
      tag: 'Legally mandatory',
      tagClass: 'tp',
      title: 'Third-Party Only',
      desc: 'Covers damage or injury you cause to another person or their property. The legal minimum — but offers no cover for your own vehicle.',
      bullets: [
        'Unlimited liability for third-party death/injury',
        'Third-party property damage up to ₹7.5 lakh',
        'Personal accident cover (₹15 lakh)',
        'Does NOT cover own vehicle damage',
      ],
      coverType: 'third-party',
      cta: 'Get TP-only quote',
    },
    {
      icon: 'link',
      tag: 'Own damage only',
      tagClass: 'od',
      title: 'Standalone OD Cover',
      desc: 'Own-damage cover without third-party. Useful if you already hold a valid separate long-term TP policy.',
      bullets: [
        'Covers accidental damage to your vehicle',
        'Fire, explosion, self-ignition',
        'Theft and burglary',
        'Natural calamities — flood, earthquake, cyclone',
      ],
      coverType: 'own-damage',
      cta: 'Get OD quote',
    },
  ];

  // ---------- EXPLAINER VIDEOS ----------
  videos: VideoItem[] = [
    { num: '01', topic: 'What Is IDV', dur: '0:55', cap: '', title: '', desc: "IDV is your vehicle’s current market value and the maximum claim payout for theft or total loss.", url: 'https://www.youtube.com/watch?v=wvivzbRx_HQ', videoId: 'wvivzbRx_HQ' },
    { num: '02', topic: 'Zero Depreciation', dur: '0:45', cap: '', title: '', desc: 'Zero Dep cover avoids depreciation deductions on parts, making it especially useful for newer vehicles.', url: 'https://www.youtube.com/watch?v=zw6z0deZKaU', videoId: 'zw6z0deZKaU' },
    { num: '03', topic: 'Save More with NCB', dur: '1:00', cap: '', title: '', desc: 'No Claim Bonus rewards claim-free years with up to 50% discount on your own-damage premium.', url: 'https://www.youtube.com/watch?v=LxKrJ5osR_w', videoId: 'LxKrJ5osR_w' },
    { num: '04', topic: 'Motor Add-Ons', dur: '1:14', cap: '', title: '', desc: 'Learn which add-ons can protect your vehicle, engine, roadside emergencies, repair costs, and pillion riders.', url: 'https://www.youtube.com/watch?v=2QW4XNVQ8uw', videoId: '2QW4XNVQ8uw' },
    { num: '05', topic: 'Claims', dur: '2:30', cap: 'How to file a cashless claim — step by step from accident to delivery', title: 'Filing a cashless claim', desc: 'Call the insurer → survey → network garage → repair → delivery. What happens at each step and how we help you through it.', url: 'https://www.youtube.com/results?search_query=OneInsure+cashless+motor+insurance+claim' },
    { num: '06', topic: 'Add-ons', dur: '2:18', cap: 'Engine protect, RTI, consumables — which add-ons are actually useful', title: 'The add-ons worth buying', desc: 'Engine & gearbox protect, return to invoice, key replacement, consumables — we rank them by real-world value.', url: 'https://www.youtube.com/results?search_query=OneInsure+motor+insurance+add+ons+worth+it' },
    { num: '07', topic: 'Renewal', dur: '1:52', cap: 'Renewal vs fresh policy — and what to check before you renew', title: 'The renewal checklist', desc: 'NCB transfer, IDV review, add-on comparison — five things to check before auto-renewing with the same insurer.', url: 'https://www.youtube.com/results?search_query=OneInsure+motor+insurance+renewal+checklist' },
  ];
  videoCount = 1;
  videoProgress = 14; // %

  // ---------- QUOTE LINK CARDS ----------
  /** Set to true to bring back the full detailed quote form. */
  showQuoteForm = false;

  quoteLinks: QuoteLink[] = [
    {
      key: 'car',
      icon: 'car',
      eyebrow: 'Four-wheeler',
      title: 'Car Insurance',
      desc: 'Comprehensive, third-party or standalone OD cover for your car — compare live prices from top insurers and buy in minutes.',
      features: [
        'Set your own IDV, pick the add-ons that matter',
        'Cashless repairs at 5,000+ network garages',
        'Instant policy issuance, zero paperwork',
      ],
      cta: 'View car quotes',
      url: 'https://online.oneinsure.com/car-insurance/?_ga=2.184066214.1847325676.1785406708-940937582.1774530673',
    },
    {
      key: 'bike',
      icon: 'bike',
      eyebrow: 'Two-wheeler',
      title: 'Bike Insurance',
      desc: 'Protect your bike or scooter with the right cover — long-term third-party, comprehensive or own-damage — at the insurer’s own price.',
      features: [
        'Multi-year third-party cover options',
        'Theft, fire & natural-calamity protection',
        'Renew online in under two minutes',
      ],
      cta: 'View bike quotes',
      url: 'https://online.oneinsure.com/two-wheeler-insurance/?_ga=2.184066214.1847325676.1785406708-940937582.1774530673',
    },
  ];

  // ---------- QUOTE FORM ----------
  quoteForm!: FormGroup;

  vehicleTabs = [
    { value: 'car' as const, label: 'Car' },
    { value: 'bike' as const, label: 'Bike / Scooter' },
    { value: 'commercial' as const, label: 'Commercial' },
  ];

  policyKindTabs = [
    { value: 'renewal' as const, label: 'Renewal' },
    { value: 'new' as const, label: 'New vehicle' },
  ];

  coverTabs = [
    { value: 'comprehensive' as const, label: 'Comprehensive' },
    { value: 'third-party' as const, label: 'Third-party only' },
    { value: 'own-damage' as const, label: 'Own damage only' },
  ];

  fuelTypes = ['Petrol', 'Diesel', 'CNG / LPG', 'Electric', 'Petrol + CNG'];

  cities = [
    'Mumbai', 'Delhi / NCR', 'Bengaluru', 'Chennai', 'Hyderabad',
    'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Other',
  ];

  private readonly makesByVehicle: Record<string, string[]> = {
    car: ['Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Kia', 'MG', 'Skoda', 'Volkswagen'],
    bike: ['Hero', 'Honda', 'TVS', 'Bajaj', 'Royal Enfield', 'Suzuki', 'Yamaha', 'KTM', 'Jawa'],
    commercial: ['Tata', 'Mahindra', 'Ashok Leyland', 'Eicher', 'Force', 'Piaggio'],
  };

  private readonly MODELS: Record<string, string[]> = {
    'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Wagon R', 'Alto', 'Ertiga', 'Dzire', 'Ciaz', 'Jimny', 'Fronx', 'Grand Vitara'],
    'Hyundai': ['Creta', 'i20', 'Venue', 'Verna', 'Aura', 'Tucson', 'Exter', 'Grand i10 Nios'],
    'Tata': ['Nexon', 'Punch', 'Tiago', 'Tigor', 'Harrier', 'Safari', 'Altroz', 'Ace EV', 'Intra V30'],
    'Honda': ['City', 'Amaze', 'Elevate', 'WR-V', 'Activa', 'Shine', 'SP 125', 'Unicorn'],
    'Toyota': ['Innova Crysta', 'Innova HyCross', 'Fortuner', 'Urban Cruiser Hyryder', 'Glanza', 'Camry'],
    'Mahindra': ['Scorpio-N', 'XUV700', 'XUV300', 'Thar', 'Bolero', 'BE 6', 'XEV 9e', 'Bolero Pickup', 'Jeeto'],
    'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6', 'EV9'],
    'MG': ['Hector', 'Astor', 'Gloster', 'ZS EV', 'Windsor EV'],
    'Skoda': ['Slavia', 'Kushaq', 'Superb', 'Octavia', 'Kodiaq'],
    'Volkswagen': ['Virtus', 'Taigun', 'Tiguan', 'Vento'],
    'Hero': ['Splendor Plus', 'HF Deluxe', 'Passion Pro', 'Glamour', 'Xpulse 200', 'Xtreme 160R'],
    'Bajaj': ['Pulsar NS200', 'Pulsar N250', 'Platina', 'CT100', 'Dominar 400', 'Avenger'],
    'TVS': ['Jupiter', 'Ntorq 125', 'Apache RTR 160', 'Apache RR 310', 'Raider 125', 'iQube'],
    'Royal Enfield': ['Classic 350', 'Bullet 350', 'Meteor 350', 'Himalayan', 'Hunter 350', 'Super Meteor 650'],
    'Suzuki': ['Access 125', 'Burgman Street', 'Gixxer', 'Avenis'],
    'Yamaha': ['FZ', 'R15', 'MT-15', 'Fascino', 'Ray ZR'],
    'KTM': ['Duke 200', 'Duke 390', 'RC 200', 'RC 390'],
    'Jawa': ['Jawa 42', 'Perak', 'Yezdi Roadster'],
    'Ashok Leyland': ['Dost+', 'Bada Dost', 'Partner'],
    'Eicher': ['Pro 2049', 'Pro 2059', 'Pro 3015'],
    'Force': ['Traveller', 'Urbania', 'Trump'],
    'Piaggio': ['Ape Xtra', 'Ape City', 'Ape E-City'],
  };

  submitting = false;
  quotesReady = false;
  quotesError = '';
  quotes: InsurerQuote[] = [];

  /** convenience accessor for the template */
  get qf() {
    return this.quoteForm.controls;
  }

  /** show an error only once the user has interacted with the field */
  invalid(name: string): boolean {
    const c = this.quoteForm.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  get makeOptions(): string[] {
    return this.makesByVehicle[this.qf['vehicleType'].value] ?? [];
  }

  get modelOptions(): string[] {
    return this.MODELS[this.qf['make'].value] ?? [];
  }

  get years(): number[] {
    const now = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => now - i);
  }

  get showRegField(): boolean {
    return this.qf['policyKind'].value === 'renewal';
  }

  selectVehicle(value: MotorQuoteRequest['vehicleType']): void {
    this.quoteForm.patchValue({ vehicleType: value, make: '', model: '' });
  }

  selectPolicyKind(value: MotorQuoteRequest['policyKind']): void {
    this.quoteForm.patchValue({ policyKind: value });
    // Registration number is only required when renewing an existing policy.
    const reg = this.quoteForm.get('regNumber');
    if (value === 'renewal') {
      reg?.setValidators(Validators.required);
    } else {
      reg?.clearValidators();
      reg?.setValue('');
    }
    reg?.updateValueAndValidity();
  }

  selectCover(value: MotorQuoteRequest['coverType']): void {
    this.quoteForm.patchValue({ coverType: value });
  }

  onMakeChange(): void {
    this.quoteForm.patchValue({ model: '' });
  }

  onRegInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.quoteForm.patchValue({ regNumber: input.value });
  }

  /** Jump to the quote form and pre-select a cover type (from the cover-type cards). */
  goToQuoteWithCover(coverType: MotorQuoteRequest['coverType']): void {
    this.selectCover(coverType);
    this.scrollTo('quote');
  }

  onQuoteSubmit(): void {
    this.quotesError = '';
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.quotesReady = false;

    const payload = this.quoteForm.value as MotorQuoteRequest;

    // Using the shared LeadService for now. Point it at the motor-quote
    // endpoint once the API is ready, then type the response as InsurerQuote[].
    this.leadSvc.submit(payload as unknown as Lead).subscribe({
      next: (res) => {
        this.quotes = (res as InsurerQuote[]) ?? [];
        this.submitting = false;
        this.quotesReady = true;
        setTimeout(() => this.scrollTo('quote-results'), 0);
      },
      error: () => {
        this.submitting = false;
        this.quotesError =
          "We couldn't fetch quotes right now. Please try again, or reach us on WhatsApp.";
      },
    });
  }

  inr(n: number): string {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  trackByInsurer(_i: number, q: InsurerQuote): string {
    return q.insurer + q.plan;
  }

  // ---------- Navigation ----------
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- Videos ----------
  // Pulls live title + thumbnail for any card that has a `videoId`, using
  // YouTube's public oEmbed endpoint (no API key needed). 
  private enrichVideos(): void {
    this.videos.forEach((v) => {
      if (!v.videoId) {
        return;
      }

      // Instant thumbnail — hqdefault always exists, no request required.
      v.thumb = `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;

      const oembed =
        'https://www.youtube.com/oembed?format=json&url=' +
        encodeURIComponent(`https://www.youtube.com/watch?v=${v.videoId}`);

      fetch(oembed)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) {
            return;
          }
          if (data.title) {
            v.title = data.title;            // real video title from YouTube
          }
          if (data.thumbnail_url) {
            v.thumb = data.thumbnail_url;    // upgrade to the oEmbed thumbnail
          }
          this.cdr.detectChanges();
        })
        .catch(() => {
          // Network/CORS issue — keep the hardcoded title + hqdefault thumb.
        });
    });
  }

  scrollVideos(dir: number): void {
    this.vidsTrack?.nativeElement.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }

  onVideoScroll(): void {
    const track = this.vidsTrack?.nativeElement;
    if (!track) {
      return;
    }
    const pct = track.scrollLeft / (track.scrollWidth - track.clientWidth || 1);
    this.videoProgress = Math.max(14, pct * 100);
    this.videoCount = Math.min(this.videos.length, Math.round(pct * (this.videos.length - 1)) + 1);
  }

  // ---------- Reveal + section spy ----------
  private revealIo?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.setupReveal();
    this.setupSectionSpy();
    this.enrichVideos();
  }

  ngOnDestroy(): void {
    this.revealIo?.disconnect();
    this.sectionObserver?.disconnect();
  }

  private inView(el: Element): boolean {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  private setupReveal(): void {
    const sel = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .hstat, .point, .ctcard, .qlink, #qcard';
    this.revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.revealIo?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
    );
    this.host.nativeElement
      .querySelectorAll(sel)
      .forEach((el) => (this.inView(el) ? el.classList.add('in') : this.revealIo!.observe(el)));
  }

  private setupSectionSpy(): void {
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            this.activeSection = (e.target as HTMLElement).id;
          }
        });
      },
      { threshold: 0.4 },
    );
    this.subnav.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        this.sectionObserver!.observe(el);
      }
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    // Submit the quote when Enter is pressed inside the quote card (except on a button).
    const card = this.host.nativeElement.querySelector('#qcard');
    const target = event.target as HTMLElement;
    if (card && card.contains(target) && target.tagName !== 'BUTTON') {
      this.onQuoteSubmit();
    }
  }
}