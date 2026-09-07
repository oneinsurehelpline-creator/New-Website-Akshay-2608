import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LeadService } from 'src/app/services/lead.service';

interface ThreeUpItem {
  num?: string;
  title: string;
  desc: string;
}

interface CoverItem {
  img?: string;
  svgKey?: 'liability' | 'lost';
  text: string;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-petinsurance',
  templateUrl: './petinsurance.component.html',
  styleUrls: ['./petinsurance.component.scss'],
})
export class PetinsuranceComponent implements AfterViewInit, OnDestroy {
  userDetails: any = [];
  companyTrust: any = [];
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
  heroHeadline = "Vet bills shouldn't force a hard decision.";
  heroSub = "Surgery, illness and accident cover for your dog or cat — so treatment is a medical call, not a financial one.";
  trustPoints = [
    'Dogs and cats',
    'Surgery and illness covered',
    'Third-party liability included',
  ];
  ctaMicrocopy = 'A quick call before the next vet visit costs more than it should.';

  // ---------- TRUST STRIP (reusable) ----------

  // ---------- WHAT IT COVERS ----------
  coversIcon = 'assets/images/icons/04_Pet_Insurance.png';
  covers: CoverItem[] = [
    {
      img: 'assets/images/icons/general/cashless.png',
      text: 'Surgery and hospitalisation after accidents or illness',
    },
    {
      img: 'assets/images/icons/calculators/health-cover.png',
      text: 'OPD consultations, diagnostics and prescribed medication',
    },
    {
      svgKey: 'liability',
      text: 'Third-party liability if your pet injures someone or damages property',
    },
    {
      svgKey: 'lost',
      text: 'Theft, loss or straying, with advertising costs on some plans',
    },
    {
      img: 'assets/images/icons/calculators/guaranteed-return.png',
      text: 'Terminal illness and mortality benefit',
    },
  ];

  // ---------- WHY IT MATTERS ----------
  threeUpEyebrow = 'Why it matters';
  threeUpKind: 'steps' | 'points' = 'points';
  threeUp: ThreeUpItem[] = [
    {
      title: 'Treatment costs have caught up with human medicine.',
      desc: 'A cruciate ligament surgery or a course of chemotherapy for a dog can run past ₹1 lakh.',
    },
    {
      title: 'Premiums are small.',
      desc: 'Annual cover typically costs 2–5% of the sum insured.',
    },
    {
      title: 'Age matters.',
      desc: 'Most insurers accept pets between 8 weeks and 8 years. Buying early locks in cover before conditions appear.',
    },
  ];

  // ---------- FAQs ----------
  faqs: FaqItem[] = [
    {
      q: 'Which pets are eligible?',
      a: 'Dogs and cats, generally between 8 weeks and 8 years of age, with a vet health certificate and often a microchip.',
    },
    {
      q: 'Are pre-existing conditions covered?',
      a: 'No. Congenital conditions and illnesses present before the policy starts are excluded, which is why buying young matters.',
    },
    {
      q: 'Is routine vaccination covered?',
      a: 'Usually not. Preventive care and grooming are excluded on most plans; some premium plans include a wellness add-on.',
    },
    {
      q: 'How do claims work?',
      a: 'Reimbursement against vet bills, with a network of partner clinics offering cashless treatment in major cities.',
    },
  ];

  openFaq: number | null = null;
  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }

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
      this.companyTrust = [
        this.companyAge + '+ years',
        'IRDAI-licensed composite broker',
        this.userDetails[0].Branches + '+ branches',
        'Advisors, not call centres',
      ];
    });
  }
}
