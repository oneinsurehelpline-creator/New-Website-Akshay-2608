import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';

interface Stat {
  num: string;
  sup: string;
  lbl: string;
}

interface Point {
  title: string;
  desc: string;
  icon: 'trend' | 'shield' | 'switch' | 'lock';
}

interface Step {
  num: string;
  title: string;
  desc: string;
}

interface Fund {
  name: string;
  sub: string;
  riskLabel: string;
  riskClass: 'risk-high' | 'risk-med' | 'risk-low';
  alloc: string;
  allocSub: string;
  cagr: string;
  bestFor: string;
  topPick?: boolean;
}

interface Benefit {
  title: string;
  desc: string;
  icon: 'trend' | 'shield' | 'edit' | 'clock' | 'heart' | 'monitor';
  iconBg: string;
  iconColor: string;
}

interface CompareCell {
  text: string;
  cls?: 'green' | 'muted';
}

interface CompareRow {
  feature: string;
  cells: CompareCell[];
}

@Component({
  selector: 'app-marketlinkedplans',
  templateUrl: './marketlinkedplans.component.html',
  styleUrls: ['./marketlinkedplans.component.scss'],
})
export class MarketlinkedplansComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('sectionRef') sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  // ---------- HERO ----------
  trust = [
    'IRDAI-licensed broker',
    'Tax benefits under 80C & 10(10D)',
    'Partial withdrawal after 5 years',
  ];

  stats: Stat[] = [
    { num: '₹5K', sup: '+', lbl: 'Min. monthly SIP' },
    { num: '5', sup: 'yr', lbl: 'Lock-in period' },
    { num: '12', sup: '%+', lbl: 'Avg equity CAGR' },
    { num: '0', sup: '%', lbl: 'Tax on maturity*' },
  ];

  // ---------- WHAT IS A ULIP ----------
  whyPoints: Point[] = [
    {
      title: 'Market-linked growth potential',
      desc: 'Your investment units are linked to equity, debt, or hybrid funds. Returns mirror market performance with no cap.',
      icon: 'trend',
    },
    {
      title: 'Life cover throughout the policy',
      desc: 'Your nominees receive the higher of sum assured or fund value — whichever is greater at the time of claim.',
      icon: 'shield',
    },
    {
      title: 'Flexible fund switching',
      desc: 'Switch between equity, debt, and balanced funds based on your risk appetite — free switches typically 4–6 times per year.',
      icon: 'switch',
    },
    {
      title: 'Tax benefits under 80C & 10(10D)',
      desc: 'Premiums qualify for deduction under Sec 80C. Maturity proceeds are fully tax-free under Sec 10(10D) subject to conditions.',
      icon: 'lock',
    },
  ];

  // ---------- HOW IT WORKS ----------
  steps: Step[] = [
    {
      num: '1',
      title: 'Pay premium',
      desc: 'You pay a regular or single premium. The insurer deducts charges for mortality cover, fund management, and admin.',
    },
    {
      num: '2',
      title: 'Choose your fund',
      desc: "Select from equity, debt, balanced, or liquid funds based on how much risk you're comfortable with.",
    },
    {
      num: '3',
      title: 'Units are allotted',
      desc: 'Your investable amount buys units in the chosen fund at the prevailing Net Asset Value (NAV). Your wealth grows as NAV rises.',
    },
    {
      num: '4',
      title: 'Receive maturity / claim',
      desc: 'On maturity you receive the full fund value tax-free. On death, nominees get higher of sum assured or fund value.',
    },
  ];

  // ---------- FUND OPTIONS ----------
  funds: Fund[] = [
    {
      name: 'Equity Growth Fund',
      sub: 'Pure equity · Nifty 50 & midcap',
      riskLabel: 'High',
      riskClass: 'risk-high',
      alloc: '80–100%',
      allocSub: 'in equities',
      cagr: '12–15%',
      bestFor: 'Long horizon 10+ yrs · wealth creation',
      topPick: true,
    },
    {
      name: 'Balanced Fund',
      sub: 'Equity + Debt mix',
      riskLabel: 'Medium',
      riskClass: 'risk-med',
      alloc: '50–70%',
      allocSub: 'equity + 30–50% debt',
      cagr: '9–12%',
      bestFor: '5–10 yr horizon · moderate growth',
    },
    {
      name: 'Debt / Bond Fund',
      sub: 'Govt & corporate bonds',
      riskLabel: 'Low',
      riskClass: 'risk-low',
      alloc: '80–100%',
      allocSub: 'in debt instruments',
      cagr: '6–8%',
      bestFor: 'Capital preservation · near maturity',
    },
    {
      name: 'Liquid / Money Market',
      sub: 'Short-term instruments',
      riskLabel: 'Very Low',
      riskClass: 'risk-low',
      alloc: '100%',
      allocSub: 'liquid & money market',
      cagr: '4–6%',
      bestFor: 'Parking funds · extreme caution period',
    },
  ];

  // ---------- BENEFITS ----------
  benefits: Benefit[] = [
    {
      title: 'Dual benefit: growth + protection',
      desc: 'A single product handles both your investment goal and life insurance need. No separate policy, no double tracking.',
      icon: 'trend',
      iconBg: '#d1fae5',
      iconColor: '#10b981',
    },
    {
      title: 'Tax-efficient wealth creation',
      desc: 'Premiums up to ₹1.5L deductible under 80C. Maturity amount fully exempt under Sec 10(10D) — no LTCG complications.',
      icon: 'shield',
      iconBg: '#dbeafe',
      iconColor: '#3b82f6',
    },
    {
      title: 'Flexibility to switch funds',
      desc: 'Life changes — so can your fund allocation. Switch between equity and debt as your financial situation or market outlook evolves.',
      icon: 'edit',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
    },
    {
      title: 'Partial withdrawal after 5 years',
      desc: 'After the mandatory 5-year lock-in, you can withdraw a portion of your fund value for emergencies without closing the policy.',
      icon: 'clock',
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
    },
    {
      title: 'Goal-based investing',
      desc: "Align your ULIP to a specific milestone — child's education, retirement, or a home — and let systematic investing do the rest.",
      icon: 'heart',
      iconBg: '#fce7f3',
      iconColor: '#db2777',
    },
    {
      title: 'Full transparency on charges',
      desc: 'Every charge — premium allocation, fund management, mortality — is disclosed upfront. IRDAI regulations ensure no hidden costs.',
      icon: 'monitor',
      iconBg: '#d1fae5',
      iconColor: '#10b981',
    },
  ];

  // ---------- ULIP vs TRADITIONAL ----------
  compareHeaders = ['Feature', 'ULIP', 'Endowment Plan', 'Term + Mutual Fund'];
  compareRows: CompareRow[] = [
    {
      feature: 'Return potential',
      cells: [
        { text: 'Market-linked (high)', cls: 'green' },
        { text: 'Low–moderate (4–6%)', cls: 'muted' },
        { text: 'Market-linked (high)', cls: 'green' },
      ],
    },
    {
      feature: 'Life cover',
      cells: [
        { text: 'Included', cls: 'green' },
        { text: 'Included', cls: 'green' },
        { text: 'Separate policy needed', cls: 'muted' },
      ],
    },
    {
      feature: 'Tax benefit (80C)',
      cells: [
        { text: 'Yes', cls: 'green' },
        { text: 'Yes', cls: 'green' },
        { text: 'Only term premium', cls: 'muted' },
      ],
    },
    {
      feature: 'Maturity tax-free',
      cells: [
        { text: 'Yes (Sec 10(10D))', cls: 'green' },
        { text: 'Yes', cls: 'green' },
        { text: 'LTCG applies on MF gains', cls: 'muted' },
      ],
    },
    {
      feature: 'Fund flexibility',
      cells: [
        { text: 'Switch between funds', cls: 'green' },
        { text: 'No choice', cls: 'muted' },
        { text: 'Full MF choice', cls: 'green' },
      ],
    },
    {
      feature: 'Liquidity',
      cells: [
        { text: '5-yr lock-in, then partial', cls: 'muted' },
        { text: 'Surrender charges apply', cls: 'muted' },
        { text: 'Redeem anytime', cls: 'green' },
      ],
    },
    {
      feature: 'Complexity',
      cells: [
        { text: 'Moderate (dual structure)', cls: 'muted' },
        { text: 'Simple', cls: 'green' },
        { text: 'Requires managing two products', cls: 'muted' },
      ],
    },
  ];

  private io?: IntersectionObserver;

  // ---------- Lifecycle ----------
  ngAfterViewInit(): void {
    this.setupReveal();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  private setupReveal(): void {
    const els = document.querySelectorAll(
      '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale'
    );
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.io?.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );
    els.forEach((el) => this.io!.observe(el));
  }

  // ---------- Navigation ----------
  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}