import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LeadService } from 'src/app/services/lead.service';

interface CoverBlock {
  title: string;
  tagline: string;
  body: string;
  covers: string[];
  note?: string;
  relevantIf: string;
}

interface StepItem {
  num: string;
  title: string;
  desc: string;
}

interface WhyPoint {
  title: string;
  desc: string;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-corporateinsurance',
  templateUrl: './corporateinsurance.component.html',
  styleUrls: ['./corporateinsurance.component.scss'],
})
export class CorporateinsuranceComponent implements AfterViewInit, OnDestroy {
   userDetails: any = [];
  trustPoints: any = [];
  companyAge = 0
  private readonly isBrowser: boolean;
  constructor(
    private host: ElementRef<HTMLElement>,
    private leadService: LeadService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  scheduleUrl = 'https://schedule.oneinsure.com/book/get-expert-guidance-web';

  // ---------- HERO ----------
  heroHeadline = "The risks that don't show up on your balance sheet.";
  heroSub = "A lawsuit against your board. A breach that leaks your customer database. The sudden loss of the one person the business runs on. None of these are covered by your fire or property policy.";
  ctaButtonLabel = 'Request a risk review';
  ctaMicrocopy = "A 30-minute call. We map what you're covered for, what you're not, and what that gap would cost.";



  // ---------- THE PROBLEM ----------
  problemParagraphs = [
    'Most companies insure what they can see. The building, the stock, the fleet.',
    "The losses that actually take companies down are the ones with no physical form — a regulator's notice, a shareholder suit, a ransomware note, an obituary. These arrive without warning, cost more than any fire, and sit entirely outside a standard corporate policy.",
    'This page covers the three that matter most.',
  ];

  // ---------- WHAT'S INSIDE ----------
  coverBlocks: CoverBlock[] = [
    {
      title: 'Directors & Officers Liability',
      tagline: "When the company is sued, the company defends itself. When a director is sued, that's personal.",
      body: 'D&O liability sits on the individual — personal assets, personal savings, personal reputation. Claims come from shareholders, regulators, employees, competitors and creditors. Defence costs alone routinely run into crores, long before anyone is found liable of anything.',
      covers: [
        'Defence costs, settlements and awards',
        'Regulatory investigation costs',
        'Employment practice claims (wrongful termination, harassment, discrimination)',
        'Cover for past, present and future directors',
        'Run-off cover after an exit or acquisition',
      ],
      relevantIf: "You've taken institutional funding, you have independent directors, you're preparing for a raise or an IPO, or your investors have asked for it in the term sheet.",
    },
    {
      title: 'Cyber Liability',
      tagline: 'Your data is your biggest asset and your largest uninsured liability.',
      body: "A breach costs in three directions at once: the technical work of containing it, the legal and regulatory consequence of having lost customer data, and the revenue you don't earn while systems are down. India's data protection regime has made the second one materially more expensive.",
      covers: [
        'Incident response and forensics',
        'Ransomware and extortion demands',
        'Business interruption from a cyber event',
        'Third-party claims from affected customers',
        'Regulatory fines and legal defence',
        'Notification costs and PR support',
      ],
      relevantIf: 'You hold customer data, process payments, run operations on cloud infrastructure, or have a vendor with access to your systems.',
    },
    {
      title: 'Keyman Insurance',
      tagline: "Insure the person the business can't replace.",
      body: 'Every company has someone whose absence would be visible in the next quarter\'s numbers — a founder, a technical head, a rainmaker who owns the client relationships. Keyman cover pays the company, not the family, so the business can absorb the shock and buy time to rebuild.',
      covers: [
        'A lump sum to the company on the death of a named individual',
        'Optional critical illness extension',
        'Recruitment and transition costs',
        'Reassurance for lenders and investors who underwrote the person as much as the plan',
      ],
      note: 'Premiums are generally deductible as a business expense.',
      relevantIf: 'Revenue, technical capability or key client relationships are concentrated in one or two people. Which, in most companies under ₹500 crore, they are.',
    },
  ];

  // ---------- HOW WE WORK ----------
  steps: StepItem[] = [
    {
      num: '1',
      title: 'Exposure mapping.',
      desc: 'We go through your structure, your contracts, your data footprint and your cap table — and identify where the real liability sits.',
    },
    {
      num: '2',
      title: 'Gap analysis.',
      desc: 'We read your existing policies properly. Not the brochure, the wording. Gaps and overlaps both cost money.',
    },
    {
      num: '3',
      title: 'Market placement.',
      desc: 'We take your risk to multiple insurers, negotiate terms and wordings, and bring back options with the differences explained in plain language.',
    },
    {
      num: '4',
      title: 'Claims, when it matters.',
      desc: "A broker's value shows up on the day a claim is contested. That's when our servicing team does the work instead of your CFO.",
    },
  ];

  // ---------- WHY A BROKER ----------
  whyBroker: WhyPoint[] = [
    {
      title: "We're on your side of the table.",
      desc: "An insurer's agent sells one company's products. As a licensed broker, we place your risk across the market and negotiate against it.",
    },
    {
      title: 'It costs you nothing extra.',
      desc: 'Brokers are remunerated by insurers within IRDAI limits. Your premium is not higher for having one.',
    },
    {
      title: 'Wordings decide claims, not premiums.',
      desc: 'The cheapest quote is often the one with the exclusion that matters. Reading for that is the job.',
    },
  ];

  // ---------- WHO THIS IS FOR ----------
  whoThisIsFor = [
    'Funded startups with a board',
    'Mid-market companies with concentrated leadership',
    'Any business holding customer data at scale',
    'Companies where an investor or lender has asked for D&O or cyber cover in writing',
  ];

  // ---------- FAQs ----------
  faqs: FaqItem[] = [
    {
      q: "We're a private company with no outside investors. Do we still need D&O?",
      a: 'Often yes. A large share of D&O claims in India come from employees and regulators, not shareholders. Any company with a board and an HR function has exposure.',
    },
    {
      q: "Isn't cyber liability just for tech companies?",
      a: 'No. Manufacturers, hospitals, retailers and schools are frequent targets precisely because their defences are thinner. If you hold data or depend on systems to operate, you have the exposure.',
    },
    {
      q: 'How is keyman cover valued?',
      a: "Usually 5–10× the individual's annual compensation, or a multiple of the gross profit reasonably attributable to them. We'll help build the justification the insurer will ask for.",
    },
    {
      q: 'We already have policies through our existing agent. Can you review them?',
      a: "Yes. Most of our corporate relationships begin with a free gap analysis of existing cover. If your current programme is sound, we'll tell you that.",
    },
    {
      q: 'How long does placement take?',
      a: 'A straightforward cover, about a week. A multi-insurer programme with negotiated wordings, three to four weeks.',
    },
  ];

  openFaq: number | null = null;
  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }

  // ---------- CLOSING CTA ----------
  closingHeadline = "Find out what you're actually covered for.";
  closingLine = "Send us your current policies. We'll come back with a one-page gap analysis, no obligation.";
  closingButtonLabel = 'Request a risk review';

  // ---------- Scroll reveal (same pattern as the other pages) ----------
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }
    this.setupReveal();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
  ngOnInit() {
    if (this.isBrowser) {
      this.companyDetails();
    }
    const startDate = new Date('2008-03-27');
    const today = new Date();

    this.companyAge = today.getFullYear() - startDate.getFullYear();

    if (today < new Date(today.getFullYear(), 2, 29)) {
      this.companyAge--;
    }
  }
  private setupReveal(): void {
    const sel = '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale';
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.io?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );
    this.host.nativeElement.querySelectorAll(sel).forEach((el) => this.io!.observe(el));
  }
  companyDetails() {
    const cdto = {};
    this.leadService.companyDetails(cdto).subscribe((res: any) => {

      this.userDetails = res;
      this.trustPoints = [
        this.companyAge + '+ years',
        'IRDAI-licensed composite broker',
        this.userDetails[0].Branches + '+ branches',
        'Advisors, not call centres',
      ];
    });
  }
}
