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
  selector: 'app-criticalillnessplans',
  templateUrl: './criticalillnessplans.component.html',
  styleUrls: ['./criticalillnessplans.component.scss'],
})
export class CriticalillnessplansComponent implements AfterViewInit, OnDestroy {
  constructor(private host: ElementRef<HTMLElement>) {}

  scheduleUrl = 'https://schedule.oneinsure.com/book/get-expert-guidance-web';

  // ---------- HERO ----------
  heroHeadline = "A lump sum on the day you're diagnosed.";
  heroSub = "Health insurance pays the hospital. Critical illness pays you — for everything else the illness costs.";
  trustPoints = [
    '30+ illnesses covered',
    'Money paid on diagnosis, not on bills',
    'Use it however you want',
  ];
  ctaMicrocopy = "Five minutes to understand what your health cover doesn't pay for.";

  // ---------- TRUST STRIP (reusable) ----------
  companyTrust = [
    '18+ years',
    'IRDAI-licensed composite broker',
    '100+ branches',
    'Advisors, not call centres',
  ];

  // ---------- WHAT IT COVERS ----------
  covers = [
    'Cancer, heart attack, stroke, kidney failure, major organ transplant and 25+ more',
    'A single tax-free lump sum paid on diagnosis, no bills required',
    'Income replacement during months of treatment and recovery',
    "Costs health insurance won't touch — travel, home care, loan EMIs, a second opinion abroad",
    'Available as a standalone plan or as a rider on term insurance',
  ];

  // ---------- HOW IT WORKS ----------
  threeUpEyebrow = 'How it works';
  threeUpKind: 'steps' | 'points' = 'steps';
  threeUp: ThreeUpItem[] = [
    {
      num: '1',
      title: 'Diagnosis',
      desc: 'A doctor confirms a listed illness and the survival period is met (usually 30 days).',
    },
    {
      num: '2',
      title: 'Claim',
      desc: 'You submit the diagnosis report. No hospital bills, no reimbursement paperwork.',
    },
    {
      num: '3',
      title: 'Payout',
      desc: 'The full sum insured lands in your account. You decide where it goes.',
    },
  ];

  // ---------- FAQs ----------
  faqs: FaqItem[] = [
    {
      q: 'If I already have health insurance, do I need this?',
      a: 'They solve different problems. Health insurance pays hospitals for treatment. Critical illness pays you for lost income, EMIs, and the year of your life the illness takes.',
    },
    {
      q: 'What is the survival period?',
      a: 'Most policies require you to survive 30 days from diagnosis for the claim to be paid. This varies by insurer and illness.',
    },
    {
      q: 'Can I claim more than once?',
      a: 'Standard plans pay once and terminate. Multi-payout plans, which cost more, allow claims across different illness categories.',
    },
    {
      q: 'Does it cover illnesses I already have?',
      a: 'Pre-existing conditions are excluded, usually for 2–4 years. Full disclosure at the time of buying is what protects your claim later.',
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
