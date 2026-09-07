import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface CoverBlock {
  title: string;
  tagline: string;
  body: string;
  covers: string[];
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
  selector: 'app-employeremployeeinsurance',
  templateUrl: './employeremployeeinsurance.component.html',
  styleUrls: ['./employeremployeeinsurance.component.scss'],
})
export class EmployeremployeeinsuranceComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  constructor(
    private host: ElementRef<HTMLElement>,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  scheduleUrl = 'https://schedule.oneinsure.com/book/get-expert-guidance-web';

  // ---------- HERO ----------
  heroHeadline = 'The benefits your team notices when it counts.';
  heroSub = "Group medical, group term life and group accident cover — the three benefits that reach an employee's family, and the ones they remember at appraisal time.";
  ctaButtonLabel = 'Get a group quote';
  ctaMicrocopy = "Share your headcount and rough age mix. We'll come back with structured options in 48 hours.";

  // ---------- TRUST STRIP (page-specific) ----------
  trustPoints = [
    'From 7 employees upward',
    'Day-one cover, no waiting period',
    'Dedicated claims desk',
    'Annual utilisation reporting',
  ];

  // ---------- THE PROBLEM ----------
  problemParagraphs = [
    'Most employee benefits are invisible. They get announced at induction and never thought about again.',
    "These three are different. They activate on the worst day of someone's year — a parent in the ICU, an accident on the way to work, a death in a young family. That's when an employee finds out whether their company's cover was real or decorative.",
    "It's also when HR discovers whether their broker picks up the phone.",
  ];

  // ---------- WHAT'S INSIDE ----------
  coverBlocks: CoverBlock[] = [
    {
      title: 'Group Medical Cover (GMC)',
      tagline: 'The one benefit that reaches the whole family.',
      body: 'Cashless hospitalisation for employees and their dependents, with no waiting period for pre-existing conditions — the single biggest advantage group cover has over anything an employee could buy retail.',
      covers: [
        'Hospitalisation, room rent, ICU and surgery',
        'Pre and post-hospitalisation expenses',
        'Maternity benefit including newborn cover',
        'Daycare procedures',
        'Cashless access at 10,000+ network hospitals',
        'Optional parent cover, company-funded or voluntary',
        'Optional top-ups employees buy themselves',
      ],
    },
    {
      title: 'Group Term Life (GTL)',
      tagline: "A year's worth of income, or ten, delivered without a fight.",
      body: "A lump sum to the employee's nominee on death from any cause. Typically set at a multiple of annual salary. Underwriting is at the group level, which means employees get meaningful cover without medicals in most cases.",
      covers: [
        'Death from any cause, anytime, anywhere',
        'Cover pegged to salary bands or a flat sum',
        'Free cover limit with no individual medicals up to a threshold',
        'Optional accidental death and disability riders',
        'Continuity for new joiners from day one',
      ],
    },
    {
      title: 'Group Personal Accident (GPA)',
      tagline: 'Because disability is the harder problem.',
      body: "Accidents don't only kill. They stop an income and keep the expenses running. GPA pays a lump sum for accidental death and for permanent disability, and a weekly benefit while an employee is temporarily unable to work.",
      covers: [
        'Accidental death',
        'Permanent total and partial disability, scaled to the loss',
        'Temporary total disability with weekly payouts',
        'Ambulance and hospitalisation expenses',
        'Optional child education benefit',
        '24×7 worldwide cover, on duty and off',
      ],
    },
  ];

  // ---------- HOW WE WORK ----------
  steps: StepItem[] = [
    {
      num: '1',
      title: 'Design.',
      desc: "We build the benefit structure around your headcount, age mix, salary bands and budget — not around whatever the insurer's standard template offers.",
    },
    {
      num: '2',
      title: 'Placement.',
      desc: 'Multiple insurers quote. We negotiate terms, sub-limits and wordings, then show you the trade-offs in plain language.',
    },
    {
      num: '3',
      title: 'Rollout.',
      desc: "Enrolment, employee communication, e-cards and a helpline. Your HR team shouldn't be explaining sub-limits over WhatsApp.",
    },
    {
      num: '4',
      title: 'Renewal, with data.',
      desc: 'Every year you get a utilisation report — claim patterns, high-cost categories, where the money went. So renewal pricing is a negotiation, not a surprise.',
    },
  ];

  // ---------- WHY A BROKER ----------
  whyBroker: WhyPoint[] = [
    {
      title: 'Your HR team stops doing TPA follow-ups.',
      desc: 'We run a dedicated claims desk. That’s the line item HR heads mention first when they talk about the switch.',
    },
    {
      title: 'Renewal pricing gets argued, not accepted.',
      desc: 'Group premiums move with your claim ratio. We use the utilisation data to negotiate, and where useful, restructure the plan to hold the cost flat instead of passing on an increase.',
    },
    {
      title: 'One broker, one renewal calendar.',
      desc: 'GMC, GTL and GPA placed together, serviced together, renewed together.',
    },
  ];

  // ---------- WHO THIS IS FOR ----------
  whoThisIsFor = [
    'Companies from 7 employees to several thousand',
    'Businesses formalising benefits for the first time',
    'Teams whose current cover is placed direct and serviced by nobody',
    'Companies where a renewal quote just came in higher than expected',
  ];

  // ---------- FAQs ----------
  faqs: FaqItem[] = [
    {
      q: "What's the minimum team size?",
      a: 'Most insurers write group cover from seven employees upward. GPA and GTL can sometimes be arranged for smaller teams.',
    },
    {
      q: 'Do employees really get day-one cover for pre-existing conditions?',
      a: 'Yes, under group medical. That’s the structural advantage — a retail health policy would make them wait two to four years for the same conditions.',
    },
    {
      q: 'Can employees add their parents?',
      a: "Yes, either company-funded or as a voluntary contribution deducted from salary. For most teams, parent cover is the most valued and the most expensive part of the plan — we'll model both options.",
    },
    {
      q: 'Our renewal quote went up sharply. Is that normal?',
      a: "It's normal if your claim ratio ran high, but it's negotiable. Bring us the quote and last year's claims data before you sign it.",
    },
    {
      q: 'Who handles a claim — us or you?',
      a: 'Us. Employees and their families deal directly with our desk. Your HR team gets a status update, not a workload.',
    },
    {
      q: 'Are premiums tax-deductible for the company?',
      a: "Group medical, group term life and group accident premiums are generally allowable as a business expense. We'll walk your finance team through the treatment.",
    },
  ];

  openFaq: number | null = null;
  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }

  // ---------- CLOSING CTA ----------
  closingHeadline = 'Send us your current policy and last renewal quote.';
  closingLine = "We'll tell you what it's missing and what it should cost. No obligation.";
  closingButtonLabel = 'Get a group quote';

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
}
