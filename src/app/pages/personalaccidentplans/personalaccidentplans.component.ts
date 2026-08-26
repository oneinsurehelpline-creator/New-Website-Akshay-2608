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
  selector: 'app-personalaccidentplans',
  templateUrl: './personalaccidentplans.component.html',
  styleUrls: ['./personalaccidentplans.component.scss'],
})
export class PersonalaccidentplansComponent implements AfterViewInit, OnDestroy {
  constructor(private host: ElementRef<HTMLElement>) {}

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

  // ---------- TRUST STRIP (reusable) ----------
  companyTrust = [
    '18+ years',
    'IRDAI-licensed composite broker',
    '100+ branches',
    'Advisors, not call centres',
  ];

  // ---------- WHAT IT COVERS ----------
  covers = [
    'Accidental death — lump sum to your nominee',
    'Permanent total or partial disability — lump sum scaled to the loss',
    "Temporary disability — a weekly payout while you're unable to work",
    'Hospitalisation, ambulance, and broken-bone expenses',
    'Optional education benefit for your children',
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
