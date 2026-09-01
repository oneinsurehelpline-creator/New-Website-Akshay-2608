import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { LeadService } from 'src/app/services/lead.service';

interface ThreeUpItem {
  num?: string;
  title: string;
  desc: string;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-fireinsurance',
  templateUrl: './fireinsurance.component.html',
  styleUrls: ['./fireinsurance.component.scss'],
})
export class FireinsuranceComponent implements AfterViewInit, OnDestroy {
  userDetails: any = [];
  companyTrust: any = [];
  companyAge = 0
  constructor(private host: ElementRef<HTMLElement>, private leadService: LeadService) { }

  scheduleUrl = 'https://schedule.oneinsure.com/book/get-expert-guidance-web';

  // ---------- HERO ----------
  heroHeadline = 'Rebuild without touching your reserves.';
  heroSub = "Fire, explosion, riot, flood and earthquake cover for buildings, stock and plant — at a premium that's a rounding error against the risk.";
  trustPoints = [
    'Standard fire & special perils',
    'Covers stock and machinery',
    'Claims support end-to-end',
  ];
  ctaMicrocopy = 'Get your assets accurately valued — before you ever need to claim.';


  // ---------- WHAT IT COVERS ----------
  covers = [
    'Fire, lightning, explosion and implosion',
    'Riot, strike, malicious damage and terrorism',
    'Storm, cyclone, flood and inundation',
    'Earthquake, landslide and subsidence',
    'Impact damage, bursting of water tanks and pipes',
  ];

  // ---------- WHY IT MATTERS ----------
  threeUpEyebrow = 'Why it matters';
  threeUpKind: 'steps' | 'points' = 'points';
  threeUp: ThreeUpItem[] = [
    {
      title: "It's misnamed.",
      desc: 'A standard fire policy covers a long list of perils that have nothing to do with fire — flood and earthquake among them.',
    },
    {
      title: 'Underinsurance is the real risk.',
      desc: "If your sum insured is below the actual value, the insurer applies average and pays proportionally. We re-value assets each year so that doesn't happen.",
    },
    {
      title: 'Add business interruption.',
      desc: 'The building is only half the loss. The months of lost production are the other half.',
    },
  ];

  // ---------- FAQs ----------
  faqs: FaqItem[] = [
    {
      q: 'Is stock covered, or only the building?',
      a: 'Both, if declared. Stock is usually covered on a floating basis with a declared maximum value.',
    },
    {
      q: 'What is the "average clause"?',
      a: 'If you insure a ₹1 crore asset for ₹50 lakh, the insurer treats you as self-insured for half and pays only half of any claim — even a small one.',
    },
    {
      q: 'Is flood really included?',
      a: 'Yes, under Standard Fire and Special Perils. Terrorism cover is available as an add-on.',
    },
    {
      q: 'How is the premium set?',
      a: 'By the sum insured, the occupancy class of the building, its construction, and the fire-protection systems in place.',
    },
  ];

  openFaq: number | null = null;
  toggleFaq(i: number): void {
    this.openFaq = this.openFaq === i ? null : i;
  }

  // ---------- Scroll reveal (same pattern as the other pages) ----------
  private io?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.setupReveal();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
  ngOnInit() {
    this.companyDetails();
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
