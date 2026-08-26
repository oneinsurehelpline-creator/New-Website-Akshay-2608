import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';

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
  constructor(private host: ElementRef<HTMLElement>) {}

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

  // ---------- TRUST STRIP (reusable) ----------
  companyTrust = [
    '18+ years',
    'IRDAI-licensed composite broker',
    '100+ branches',
    'Advisors, not call centres',
  ];

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
