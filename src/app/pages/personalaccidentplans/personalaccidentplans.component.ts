import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LeadService } from 'src/app/services/lead.service';

interface ThreeUpItem {
  num?: string;
  title: string;
  desc: string;
}

interface CoverItem {
  icon: string;
  text: string;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'app-personalaccidentplans',
  templateUrl: './personalaccidentplans.component.html',
  styleUrls: ['./personalaccidentplans.component.scss'],
})
export class PersonalaccidentplansComponent implements AfterViewInit, OnDestroy {
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
  heroHeadline = "Accidents don't end at the hospital.";
  heroSub = "They end your income. Personal accident cover pays a lump sum for death or disability — and a weekly amount while you can't work.";
  trustPoints = [
    'Cover from ₹500/year',
    '24×7 worldwide',
    'Pays on top of health insurance',
  ];
  ctaMicrocopy = "Two minutes to see what your health cover leaves out.";



  // ---------- WHAT IT COVERS ----------
  coversIcon = 'assets/images/icons/14_Personal_Accident.png';
  covers: CoverItem[] = [
    {
      icon: 'assets/images/icons/knowledgebase/life.png',
      text: 'Accidental death — lump sum to your nominee',
    },
    {
      icon: 'assets/images/icons/general/comprehensive-cover.png',
      text: 'Permanent total or partial disability — lump sum scaled to the loss',
    },
    {
      icon: 'assets/images/icons/general/low-cost.png',
      text: "Temporary disability — a weekly payout while you're unable to work",
    },
    {
      icon: 'assets/images/icons/calculators/health-cover.png',
      text: 'Hospitalisation, ambulance, and broken-bone expenses',
    },
    {
      icon: 'assets/images/icons/knowledgebase/basics.png',
      text: 'Optional education benefit for your children',
    },
  ];

  // ---------- WHY IT MATTERS ----------
  threeUpEyebrow = 'Why it matters';
  threeUpKind: 'steps' | 'points' = 'points';
  threeUp: ThreeUpItem[] = [
    {
      title: "It's the cheapest cover you'll ever buy.",
      desc: 'A ₹25 lakh accident policy often costs less than a monthly OTT subscription.',
    },
    {
      title: 'Disability is the bigger risk.',
      desc: "A permanent disability stops your income but keeps your expenses running. That's a harder problem than death.",
    },
    {
      title: 'It stacks.',
      desc: 'A personal accident claim is paid in full even if health insurance and term insurance also pay out.',
    },
  ];

  // ---------- FAQs ----------
  faqs: FaqItem[] = [
    {
      q: 'How is this different from term insurance?',
      a: 'Term insurance pays only on death, from any cause. Personal accident covers accidental death and disability — including the temporary kind, which is far more common.',
    },
    {
      q: 'Am I covered outside India?',
      a: 'Most policies cover you 24×7 anywhere in the world.',
    },
    {
      q: 'Does it cover accidents at work?',
      a: 'Yes. Cover is not restricted to work hours or location, though high-risk occupations are priced differently.',
    },
    {
      q: "What isn't covered?",
      a: 'Self-inflicted injury, accidents under the influence of alcohol or drugs, adventure sports (unless added), and war.',
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
