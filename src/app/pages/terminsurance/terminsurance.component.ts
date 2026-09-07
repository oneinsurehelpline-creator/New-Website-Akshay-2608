import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VideoModalService } from '../../shared/video-modal/video-modal.service';

interface Plan {
  insurer: string;
  plan: string;             // display name
  key: string;              // planData lookup key (insurer|plan)
  logo: string;             // initials (fallback if no logoImg)
  logoImg?: string;         // path to insurer logo image in assets
  logoColor: string;
  claimRatio: string;       // e.g. "99.68%"
  claimRatioSub: string;    // e.g. "FY 2024–25 · IRDAI"
  claimRatioWarn?: boolean; // show the claim ratio in red (below benchmark)
  coverUntil: string;       // e.g. "Age 99"
  coverUntilSub: string;    // e.g. "Whole life option"
  recommended?: boolean;
  hidden?: boolean;         // part of the "show more" set
  tag?: string;             // inline badge next to the insurer name (e.g. "★ Highest CSR")
  tagColor?: string;        // background for that inline badge
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

interface CompareRow {
  label: string;            // keys into planData
  hint?: string;
}

interface CompareSection {
  title: string;
  rows: CompareRow[];
}

@Component({
  selector: 'app-terminsurance',
  templateUrl: './terminsurance.component.html',
  styleUrls: ['./terminsurance.component.scss'],
})
export class TerminsuranceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('vidsTrack', { static: false }) vidsTrack!: ElementRef<HTMLElement>;
  @ViewChildren('sectionRef') sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  private readonly isBrowser: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private videoModal: VideoModalService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
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
    'Claim-assistance included',
    'No spam, ever',
    '18 years · 5 lakh+ policies',
  ];

  stats = [
    { num: '₹650', sup: '/mo', lbl: '₹1 Cr cover at age 30' },
    { num: '99', sup: '%+', lbl: 'Claim settlement — top 3 plans' },
    { num: '11', sup: ' plans', lbl: 'Compared side by side' },
    { num: '80', sup: 'C', lbl: 'Tax benefit every year you pay' },
  ];

  // ---------- SUBNAV ----------
  subnav = [
    { id: 'why', label: 'Why term' },
    { id: 'videos', label: 'Explainer videos' },
    { id: 'compare', label: 'Compare plans' },
  ];
  activeSection = 'why';

  // ---------- WHY ----------
  whyPoints = [
    {
      title: 'Replaces 15–20× your income, instantly.',
      desc: 'Tax-free lump sum to your family — enough to sustain them for decades without changing their lifestyle.',
      icon: 'star',
    },
    {
      title: 'Costs less than your OTT subscriptions.',
      desc: 'A 30-year-old pays roughly ₹650/month for ₹1 crore cover. Lock in young — the premium is fixed for life.',
      icon: 'clock',
    },
    {
      title: 'Section 80C deduction every year.',
      desc: 'Premiums up to ₹1.5 lakh qualify. Payout to nominees is fully exempt under Section 10(10D).',
      icon: 'rupee',
    },
    {
      title: 'Pure protection — no investment confusion.',
      desc: 'Term is the rare insurance that\'s honest about what it does. No maturity bonus, no lock-in, just cover.',
      icon: 'shield',
    },
  ];

  // ---------- EXPLAINER VIDEOS ----------
  // `url` opens a OneInsure-scoped YouTube search for the topic.
  // Replace each with the exact video URL from your channel when you have it.
  videos: VideoItem[] = [
    { num: '01', topic: 'Calculate Term', dur: '1:06', cap: '', title: '', desc: 'The right cover depends on your income, loans, family needs, and future expenses.', url: 'https://www.youtube.com/watch?v=BdxPLZCGaGs', videoId: 'BdxPLZCGaGs' },
    { num: '02', topic: 'CSR', dur: '1:31', cap: '', title: '', desc: 'Compare CSR with claim amount settlement, complaint volume, and solvency ratio before choosing an insurer.', url: 'https://www.youtube.com/watch?v=2JR_5GSJ4q4', videoId: '2JR_5GSJ4q4' },
    { num: '03', topic: 'Policy duration', dur: '2:02', cap: 'Until 60? 65? Whole life? Here\'s the rule.', title: 'Choosing your term length', desc: 'Cover until your last earning year. Why "whole life term" is mostly a marketing trick.', url: 'https://www.youtube.com/results?search_query=OneInsure+term+insurance+policy+term+length' },
    { num: '04', topic: 'Riders', dur: '2:36', cap: 'Critical illness, accident, waiver — what\'s worth it', title: 'Which add-ons actually matter', desc: 'We rank the four most-sold riders by real-world value. Most aren\'t worth the premium.', url: 'https://www.youtube.com/results?search_query=OneInsure+term+insurance+riders+worth+it' },
    { num: '05', topic: 'Claim ratios', dur: '1:55', cap: 'The CSR myth and what to look for instead', title: 'How to read claim-settlement numbers', desc: 'Why the headline ratio lies. The two metrics that matter and where to find them.', url: 'https://www.youtube.com/results?search_query=OneInsure+claim+settlement+ratio+explained' },
    { num: '06', topic: 'Buying right', dur: '2:20', cap: 'Lying on the form is the only thing that gets claims rejected', title: 'Disclosure: the one thing to get right', desc: 'What "material disclosure" means — and why our advisors fill the form with you.', url: 'https://www.youtube.com/results?search_query=OneInsure+term+insurance+disclosure+claim+rejection' },
    { num: '07', topic: 'After you buy', dur: '1:42', cap: 'What your nominee should know on day one', title: 'The nominee handover', desc: 'The four documents your nominee needs. We help you organise this — most brokers don\'t.', url: 'https://www.youtube.com/results?search_query=OneInsure+term+insurance+nominee+documents' },
  ];
  videoCount = 1;
  videoProgress = 14; // %

  // ---------- COMPARER ----------
  filters = [
    { label: 'Cover', options: ['₹ 1 Crore', '₹ 50 Lakh', '₹ 2 Crore', '₹ 5 Crore'] },
    { label: 'Age', options: ['30 years', '25', '35', '40', '45'] },
    { label: 'Cover until', options: ['65 years', '60', '70', '75'] },
    { label: 'Smoker', options: ['Non-tobacco', 'Tobacco user'] },
    { label: 'Pay term', options: ['Regular pay', 'Limited 10 yr', 'Single pay'] },
  ];
  sortOptions = ['Claim ratio ↓', 'Cover term', 'Premium ↑'];
  activeSort = 'Claim ratio ↓';

  plans: Plan[] = [
    // ---- visible set ----
    { insurer: 'HDFC Life', plan: 'Click 2 Protect Super', key: 'HDFC Life|Click 2 Protect Super', logo: 'HD', logoImg: 'assets/images/insurers/HDFCLife.png', logoColor: '#004C97', claimRatio: '99.68%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 99', coverUntilSub: 'Whole life option', recommended: true },
    { insurer: 'Axis Max Life', plan: 'Smart Secure Plus', key: 'Axis Max Life|Smart Secure Plus', logo: 'AM', logoImg: 'assets/images/insurers/axis-max-life.png', logoColor: '#a30000', claimRatio: '99.70%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 100', coverUntilSub: 'Whole life option', tag: '★ Highest CSR', tagColor: '#0071bc' },
    { insurer: 'ICICI Prudential', plan: 'iProtect Smart', key: 'ICICI Prudential|iProtect Smart', logo: 'IC', logoImg: 'assets/images/insurers/ICICIPRUDENTIALLIFEINSURANCE.png', logoColor: '#F58220', claimRatio: '99.34%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 99', coverUntilSub: 'Whole life option', tag: '⚠ Complaints', tagColor: '#dc2626' },
    { insurer: 'Tata AIA', plan: 'Sampoorna Raksha Supreme', key: 'Tata AIA|Sampoorna Raksha Supreme', logo: 'TA', logoImg: 'assets/images/insurers/tata-aia.png', logoColor: '#003087', claimRatio: '99.41%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 100', coverUntilSub: 'Whole life option' },
    { insurer: 'Bajaj Life', plan: 'eTouch II', key: 'Bajaj Life|eTouch II', logo: 'BJ', logoImg: 'assets/images/insurers/bajajallianz_life.png', logoColor: '#0056A2', claimRatio: '99.21%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 99', coverUntilSub: 'Online-only plan', tag: '★ Lowest Premium', tagColor: '#10b981' },

    // ---- "show more" set ----
    { insurer: 'SBI Life', plan: 'eShield Next', key: 'SBI Life|eShield Next', logo: 'SB', logoImg: 'assets/images/insurers/SBIGeneralInsurance.webp', logoColor: '#00508f', claimRatio: '98.20%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 100', coverUntilSub: 'Whole life option', hidden: true },
    { insurer: 'Aditya Birla Sun Life', plan: 'DigiShield Plan', key: 'Aditya Birla Sun Life|DigiShield Plan', logo: 'AB', logoImg: 'assets/images/insurers/ABSLI.png', logoColor: '#c8102e', claimRatio: '98.10%', claimRatioSub: 'FY 2024–25 · IRDAI', coverUntil: 'Age 100', coverUntilSub: 'Whole life option', hidden: true },
  ];

  showAllPlans = false;
  readonly MAX_COMPARE = 3;
  selectedKeys: string[] = [];
  modalOpen = false;

  compareSections: CompareSection[] = [
    {
      title: 'Insurer Strength', rows: [
        { label: 'Claim Settlement Ratio', hint: 'By count; IRDAI FY 2024–25' },
        { label: 'Amount Settlement Ratio', hint: 'By value — more meaningful for large covers' },
        { label: 'Solvency Ratio', hint: 'IRDAI minimum: 1.50x; higher = stronger' },
        { label: 'Complaints per 10K Claims', hint: 'Lower is better; HDFC Life (1.33) is industry best' },
        { label: 'Insurer Reputation' },
        { label: 'Customer Service Quality' },
      ]
    },
    {
      title: 'Coverage & Cost', rows: [
        { label: 'Coverage Amount (Sum Assured)' },
        { label: 'Policy Term' },
        { label: 'Premium (₹1Cr, 30M, 30yr, non-smoker)', hint: 'Indicative for 30-yr-old non-smoking male' },
        { label: 'Online vs Offline Pricing' },
        { label: 'Premium Payment Term' },
      ]
    },
    {
      title: 'Death Benefit & Payout', rows: [
        { label: 'Payout Options' },
        { label: 'Terminal Illness Benefit' },
        { label: 'Instant Claim Payout' },
      ]
    },
    {
      title: 'Riders & Add-ons', rows: [
        { label: 'Critical Illness (CI) Rider' },
        { label: 'Accidental Death Benefit (ADB)' },
        { label: 'Waiver of Premium (WoP)' },
        { label: 'Return of Premium (ROP)' },
        { label: 'Other Riders Available' },
      ]
    },
    {
      title: 'Coverage Features', rows: [
        { label: 'Increasing Cover Option' },
        { label: 'Flexibility to Modify Policy' },
        { label: 'Joint Life Cover' },
        { label: 'Whole Life Cover Option' },
      ]
    },
    {
      title: 'Waiting Periods & Exclusions', rows: [
        { label: 'Suicide Exclusion' },
        { label: 'Standard Exclusions' },
        { label: 'Free-Look Period' },
        { label: 'Revival Period' },
        { label: 'Grace Period' },
      ]
    },
    {
      title: 'Claim Process', rows: [
        { label: 'Claim Process Simplicity' },
      ]
    },
    {
      title: 'Tax Benefits', rows: [
        { label: 'Section 80C — Premium Deduction' },
        { label: 'Section 10(10D) — Death / Maturity Benefit' },
        { label: 'CI Rider Tax Benefit' },
      ]
    },
    {
      title: 'OneInsure View', rows: [
        { label: 'Best Suited For' },
        { label: 'Watch Out For' },
      ]
    },
  ];

  // Full comparison dataset (keyed by "insurer|plan")
  planData: { [key: string]: { [label: string]: string } } = {
    'HDFC Life|Click 2 Protect Super': {
      'Claim Settlement Ratio': '99.68% (3-yr avg 99.55%)', 'Amount Settlement Ratio': '96.72% ★ Best in peer set', 'Solvency Ratio': '~2.00x', 'Complaints per 10K Claims': '1.33 ★ Lowest in industry', 'Insurer Reputation': '★★★★★ Largest private life insurer; 25+ yrs; strong brand', 'Customer Service Quality': 'Excellent — 24×7 digital; lowest complaint volume',
      'Coverage Amount (Sum Assured)': '₹50L – No upper limit (subject to underwriting)', 'Policy Term': '5–85 yrs (age at maturity); Whole life option to age 99', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹13,000–15,000/yr (slightly premium-priced vs market)', 'Online vs Offline Pricing': 'Online ~10–15% cheaper at hdfclife.com', 'Premium Payment Term': 'Single / Limited / Regular (5–40 yrs limited; rolling option)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + monthly income (multiple combinations)', 'Terminal Illness Benefit': '✓ Inbuilt — 50% of SA paid on TI diagnosis (max ₹2 Cr advance)', 'Instant Claim Payout': '✓ Cashless for hospitalisation (Livewell rider)',
      'Critical Illness (CI) Rider': '✓ 60 illnesses (CI Plus Rider); lump sum on diagnosis; 30-day survival clause', 'Accidental Death Benefit (ADB)': '✓ Up to base SA; covered to age 85 (Protect Plus Rider)', 'Waiver of Premium (WoP)': '✓ On CI (60 illnesses, to 85); ✓ On accidental disability (Protect Plus Rider)', 'Return of Premium (ROP)': '✓ Available (Life + Life Plus variants) — all premiums back at maturity', 'Other Riders Available': 'Livewell Rider (wellness+health); Income Benefit on Acc. Disability; Premium Break (skip 1 yr 2×); Joint Life Cover; SA Top-Up option',
      'Increasing Cover Option': '✓ Up to 2× original SA (Life Protect Option)', 'Flexibility to Modify Policy': '✓ Change premium payment mode; Convert to paid-up; Limited to regular switch; Premium break via rider', 'Joint Life Cover': '✗ (separate policy advised)', 'Whole Life Cover Option': '✓ Cover to age 99',
      'Suicide Exclusion': 'Within 12 months of policy purchase / revival', 'Standard Exclusions': 'Intoxicants / drugs; Aviation accidents; Adventurous sports; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★★ Fully digital; 100% cashless for CI rider (Livewell); lowest complaints (1.33/10K)',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP maturity: conditional (premium ≤10% SA + ≤₹5L p.a.)', 'CI Rider Tax Benefit': '✓ Sec 80D deduction (health component of CI rider)',
      'Best Suited For': 'Lowest complaint volume; best amount settlement ratio; flexible payout combinations; Livewell wellness rider', 'Watch Out For': 'Slightly higher premium vs peers; ROP maturity tax exemption conditional on premium limits',
    },
    'Axis Max Life|Smart Secure Plus': {
      'Claim Settlement Ratio': '99.70% (3-yr avg 99.62%) — Industry\'s highest CSR', 'Amount Settlement Ratio': '96.37% (close second)', 'Solvency Ratio': '~2.00x+', 'Complaints per 10K Claims': '7.3 (decent)', 'Insurer Reputation': '★★★★★ Industry-best CSR; now part of Axis Bank group', 'Customer Service Quality': 'Excellent — Digital-first; fast issuance; Axis Bank touch points',
      'Coverage Amount (Sum Assured)': '₹25L – No upper limit', 'Policy Term': '10–85 yrs (age at maturity); Whole life option to age 100', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹10,800–12,000/yr (competitive)', 'Online vs Offline Pricing': 'Online ~10–15% cheaper via website/app', 'Premium Payment Term': 'Single / Limited / Regular (5 / 10 / 15 / 20 yrs limited)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + increasing income', 'Terminal Illness Benefit': '✓ Inbuilt — 100% of SA accelerated on TI diagnosis', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ 64 illnesses (CI & Disability Rider); No survival period ★ best in set', 'Accidental Death Benefit (ADB)': '✓ Up to base SA (Accident Benefit Rider)', 'Waiver of Premium (WoP)': '✓ On CI + Disability (WoP Plus Rider) — all future premiums waived', 'Return of Premium (ROP)': '✓ Available; rider premiums excluded', 'Other Riders Available': 'Premium Break (skip 1 yr 2× in term); SA Top-Up option; Joint life at inception',
      'Increasing Cover Option': '✓ SA top-up at milestones (marriage, child birth, home loan)', 'Flexibility to Modify Policy': '✓ Premium Break (2× in term); SA top-up; Change pay mode; Joint life at inception', 'Joint Life Cover': '✓ Add spouse at inception (ADB not available for spouse)', 'Whole Life Cover Option': '✓ Cover to age 100',
      'Suicide Exclusion': 'Within 12 months of policy purchase', 'Standard Exclusions': 'Self-inflicted injury; Aviation (non-commercial); War / civil unrest; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★★ Fully digital; Axis Bank touch points; seamless; fast issuance + settlement',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D (CI & Disability Rider)',
      'Best Suited For': 'Industry-highest CSR; 64 CI illnesses with no survival period; joint life at inception; competitive pricing', 'Watch Out For': 'No instant claim payout; minimum SA starts at ₹25L',
    },
    'ICICI Prudential|iProtect Smart': {
      'Claim Settlement Ratio': '99.34% (3-yr avg ~99%)', 'Amount Settlement Ratio': '~95% (industry average level)', 'Solvency Ratio': '~2.05x', 'Complaints per 10K Claims': '14.3 ■ Above average — flag', 'Insurer Reputation': '★★★★■ Strong brand; slightly higher complaints', 'Customer Service Quality': 'Good — High complaint volume is a flag; strong digital infrastructure',
      'Coverage Amount (Sum Assured)': '₹50L – No upper limit', 'Policy Term': '18–85 yrs (age at maturity); Whole life option to age 99', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹10,900–11,500/yr; 15% women discount', 'Online vs Offline Pricing': 'Online ~10–15% cheaper; discounts for salaried + online', 'Premium Payment Term': 'Single / Limited / Regular (5 / 7 / 10 / 12 / 15 yrs)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + monthly income | Income for 10/20/30 yrs', 'Terminal Illness Benefit': '✓ Inbuilt — 100% of SA paid on TI', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ 34 illnesses (CI Benefit); No survival period; included in Life & Health + All-in-One variants', 'Accidental Death Benefit (ADB)': '✓ Up to base SA (Life Plus + All-in-One variants)', 'Waiver of Premium (WoP)': '✓ On CI + Disability (All-in-One variant) — all future premiums waived', 'Return of Premium (ROP)': '✓ Available (iProtect Smart ROP variant)', 'Other Riders Available': 'Permanent Disability Cover; Income Benefit on Disability',
      'Increasing Cover Option': '✓ Life stage increases (marriage, child, home loan) +50% or 25% of base SA', 'Flexibility to Modify Policy': '✓ Change pay frequency; Switch variants at renewal; Flexible PPT options', 'Joint Life Cover': '✓ Add spouse (separate cover for spouse)', 'Whole Life Cover Option': '✓ Cover to age 99',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Self-harm; Adventurous activities; War / nuclear; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★■ Digital claim portal; strong infra; higher complaint volume (14.3/10K) is a flag',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D (health rider premium)',
      'Best Suited For': 'Flexible income payout for 10/20/30 yrs; strong brand; competitive pricing with women + salaried discounts', 'Watch Out For': '14.3 complaints per 10K is above average — largest potential friction at claim time',
    },
    'Tata AIA|Sampoorna Raksha Supreme': {
      'Claim Settlement Ratio': '99.41% (FY25); 3-yr avg ~99.3%', 'Amount Settlement Ratio': '~96%', 'Solvency Ratio': '~1.80x (above IRDAI minimum 1.50x)', 'Complaints per 10K Claims': '3.00 (excellent)', 'Insurer Reputation': '★★★★★ Tata brand trust + AIA global backing', 'Customer Service Quality': 'Excellent — ₹3L payout within 4 hours; Tata brand',
      'Coverage Amount (Sum Assured)': '₹50L – No upper limit', 'Policy Term': '10–85 yrs; Whole life option to age 100', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹10,700–12,000/yr (one of lowest; women discount + non-smoker discounts)', 'Online vs Offline Pricing': 'Online ~10–15% cheaper; additional non-smoker discounts', 'Premium Payment Term': 'Single / Limited / Regular (5 / 10 / 12 / 15 / 20 yrs)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + income | Increasing monthly income', 'Terminal Illness Benefit': '✓ Inbuilt — 50% of SA accelerated plus WoP on all future premiums', 'Instant Claim Payout': '✓ ₹3L within 4 hours of claim intimation',
      'Critical Illness (CI) Rider': '✓ 40 illnesses (Comprehensive Protection Rider); Lump sum + WoP', 'Accidental Death Benefit (ADB)': '✓ Up to base SA (Accident & Dismemberment Rider)', 'Waiver of Premium (WoP)': '✓ Inbuilt on terminal illness; ✓ On CI via rider', 'Return of Premium (ROP)': '✗ Not offered', 'Other Riders Available': 'Vitality Health + Protect riders; Joint Life Cover (spouse); Life Stage SA increase',
      'Increasing Cover Option': '✓ Life Stage SA increases (marriage +50%, child +25%, home loan +100%); 5–20% p.a. top-up at anniversary', 'Flexibility to Modify Policy': '✓ Life stage SA increase; Joint life add; Pay frequency change', 'Joint Life Cover': '✓ Add spouse (complete coverage for both)', 'Whole Life Cover Option': '✓ Cover to age 100',
      'Suicide Exclusion': 'Within 12 months of purchase', 'Standard Exclusions': 'Self-inflicted causes; Military action / war; Dangerous activities; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★★ ₹3L payout within 4 hours; digital + WhatsApp claim; instant intimation portal',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free (No ROP; pure term)', 'CI Rider Tax Benefit': '✓ Sec 80D',
      'Best Suited For': '₹3L instant 4-hour payout; best life stage SA increase options; Tata + AIA global brand; no ROP keeps it pure term', 'Watch Out For': 'No ROP option; solvency ratio lowest in peer set at 1.80x (still well above 1.50x minimum)',
    },
    'Bajaj Life|eTouch II': {
      'Claim Settlement Ratio': '99.21% (3-yr avg FY22–25); 93.94% claims within 30 days', 'Amount Settlement Ratio': '~95%', 'Solvency Ratio': '4.37x ★ Highest in peer set (IRDAI min: 1.50x)', 'Complaints per 10K Claims': '3.95 (good)', 'Insurer Reputation': '★★★★■ Solid 25-yr track record; highest solvency ratio in set', 'Customer Service Quality': 'Good — Growing digital infra; decent service',
      'Coverage Amount (Sum Assured)': '₹50L – No upper limit', 'Policy Term': 'Up to age 99 (policy term 10–67 yrs)', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹9,667/yr ★ Most affordable for ₹1 Cr to age 65', 'Online vs Offline Pricing': 'Purely online plan (lowest pricing; no offline variant)', 'Premium Payment Term': 'Single / Limited / Regular (5 / 10 / 15 yrs limited)',
      'Payout Options': 'Lump sum | Monthly income (5/10/15/20 yrs) | Lump sum + income', 'Terminal Illness Benefit': '✓ Inbuilt — 100% of SA on TI diagnosis', 'Instant Claim Payout': '✓ ₹2L within 1 working day of claim intimation',
      'Critical Illness (CI) Rider': '✓ 60 illnesses (CI Rider); up to age 80', 'Accidental Death Benefit (ADB)': '✓ Up to base SA (ADB Rider; to age 99)', 'Waiver of Premium (WoP)': '✓ On terminal illness (inbuilt); ✓ On accidental disability; ✗ No CI waiver', 'Return of Premium (ROP)': '✓ Life Shield ROP variant; Early exit: 2× premiums back (40-yr term + limited pay)', 'Other Riders Available': 'Family Protect Rider (parents); CI Rider (10/25/60 illness tiers); Premium Holiday',
      'Increasing Cover Option': '✓ Life Stage Benefit (marriage, child birth)', 'Flexibility to Modify Policy': '✓ Premium Holiday option; Early Exit with ROP; Switch pay frequency', 'Joint Life Cover': '✗ (base plan only)', 'Whole Life Cover Option': '✓ Cover to age 99',
      'Suicide Exclusion': 'Within 12 months of purchase', 'Standard Exclusions': 'Self-inflicted causes; War / terrorism; Hazardous activities; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★■ Digital tracking; 93.94% claims settled in 30 days; growing digital infra',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D',
      'Best Suited For': 'Lowest premium (₹9,667/yr for ₹1 Cr); highest solvency ratio (4.37×); purely online; ₹2L instant claim payout', 'Watch Out For': 'No joint life cover; CI waiver not available; max policy term to age 99 only',
    },

    // ---------- "show more" set ----------
    'SBI Life|eShield Next': {
      'Claim Settlement Ratio': '98.20% (FY 2024–25)', 'Amount Settlement Ratio': '~94%', 'Solvency Ratio': '~2.20x', 'Complaints per 10K Claims': '~6.0 (good)', 'Insurer Reputation': '★★★★★ SBI + BNP Paribas backing; largest bancassurance reach', 'Customer Service Quality': 'Good — Vast SBI branch network; growing digital claims',
      'Coverage Amount (Sum Assured)': '₹50L – No upper limit', 'Policy Term': '5–80 yrs; Whole life option to age 100', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹11,800–13,500/yr', 'Online vs Offline Pricing': 'Online ~10% cheaper; also sold via SBI branches', 'Premium Payment Term': 'Single / Limited / Regular (5–40 yrs limited)',
      'Payout Options': 'Lump sum | Level/Increasing cover | Lump sum + monthly income', 'Terminal Illness Benefit': '✓ Inbuilt — accelerated on TI diagnosis', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ Accelerated CI Benefit (up to 36 illnesses)', 'Accidental Death Benefit (ADB)': '✓ Up to base SA (Accident Benefit Rider)', 'Waiver of Premium (WoP)': '✓ On CI / disability via rider', 'Return of Premium (ROP)': '✗ (pure term; smart benefit provides increasing cover)', 'Other Riders Available': 'Accelerated CI; Accident Benefit; Increasing/Level cover options built-in',
      'Increasing Cover Option': '✓ Increasing cover variant (SA rises 10% p.a. up to 100%)', 'Flexibility to Modify Policy': '✓ Choose level / increasing cover; change pay mode', 'Joint Life Cover': '✗', 'Whole Life Cover Option': '✓ Cover to age 100',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Self-inflicted injury; Aviation; Hazardous activities; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★■ Branch + digital claim intimation; strong PSU-bank backing',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free', 'CI Rider Tax Benefit': '✓ Sec 80D (CI rider)',
      'Best Suited For': 'Buyers who value SBI-group stability and a large branch network; built-in increasing-cover option', 'Watch Out For': 'Premium slightly higher than pure online players; no ROP variant',
    },
    'LIC|Digi Term': {
      'Claim Settlement Ratio': '98.62% (FY 2024–25)', 'Amount Settlement Ratio': '~93%', 'Solvency Ratio': '~2.00x', 'Complaints per 10K Claims': '~8.0 (average)', 'Insurer Reputation': '★★★★★ Sovereign-backed; largest & most trusted life insurer in India', 'Customer Service Quality': 'Average — Enormous scale; digital experience still maturing',
      'Coverage Amount (Sum Assured)': '₹50L – ₹5 Cr (subject to underwriting)', 'Policy Term': '10–40 yrs; Max maturity age 80', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹12,500–14,500/yr', 'Online vs Offline Pricing': 'Digi Term is online-only; cheaper than LIC offline plans', 'Premium Payment Term': 'Single / Limited / Regular',
      'Payout Options': 'Lump sum | Level / Increasing sum assured', 'Terminal Illness Benefit': '✗ (not offered on this plan)', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✗ (not available on Digi Term)', 'Accidental Death Benefit (ADB)': '✓ Accident Benefit Rider', 'Waiver of Premium (WoP)': '✗', 'Return of Premium (ROP)': '✗ (see LIC New Jeevan Amar / Yugam for variants)', 'Other Riders Available': 'Accident Benefit Rider only',
      'Increasing Cover Option': '✓ Increasing SA option', 'Flexibility to Modify Policy': 'Limited — level vs increasing cover choice at inception', 'Joint Life Cover': '✗', 'Whole Life Cover Option': '✗ (max maturity age 80)',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Suicide clause; Undisclosed PED / material facts', 'Free-Look Period': '30 days (electronic / distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★■ Trusted settlement; process more paperwork-heavy than private peers',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free', 'CI Rider Tax Benefit': 'N/A (no CI rider)',
      'Best Suited For': 'Buyers who prioritise a sovereign-backed insurer and maximum trust over rider flexibility', 'Watch Out For': 'No CI / WoP riders; no terminal-illness benefit; cover only to age 80; slower, more manual claim process',
    },
    'Kotak Life|e-Term': {
      'Claim Settlement Ratio': '98.82% (FY 2024–25)', 'Amount Settlement Ratio': '~95%', 'Solvency Ratio': '~2.80x', 'Complaints per 10K Claims': '~5.0 (good)', 'Insurer Reputation': '★★★★■ Kotak Mahindra group; strong solvency', 'Customer Service Quality': 'Good — Fully digital purchase & servicing',
      'Coverage Amount (Sum Assured)': '₹25L – No upper limit', 'Policy Term': '5–85 yrs; Whole life option to age 85', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹10,200–11,800/yr (competitive)', 'Online vs Offline Pricing': 'Online-first; ~10–15% cheaper than offline', 'Premium Payment Term': 'Single / Limited / Regular (5 / 10 / 15 yrs limited)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + income (Immediate / Recurring / Whole-life plans)', 'Terminal Illness Benefit': '✓ Inbuilt — accelerated on TI diagnosis', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ CI Benefit Rider (up to 37 illnesses)', 'Accidental Death Benefit (ADB)': '✓ Accidental Death Benefit Rider', 'Waiver of Premium (WoP)': '✓ On permanent disability / CI via rider', 'Return of Premium (ROP)': '✓ Available (Kotak e-Term ROP / Saral Jeevan Bima variants)', 'Other Riders Available': 'Permanent Disability Benefit; Life Option / Life Plus / Whole-life plan variants',
      'Increasing Cover Option': '✓ Recurring Payout with level cover; step-up at milestones', 'Flexibility to Modify Policy': '✓ Choose payout structure; add riders; change pay mode', 'Joint Life Cover': '✗', 'Whole Life Cover Option': '✓ Whole-life plan option (to age 85+)',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Self-inflicted injury; Aviation; Hazardous pursuits; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★■ Fully digital intimation; responsive service; strong solvency',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D (CI rider)',
      'Best Suited For': 'Very high solvency; flexible payout structures; competitive pricing with rider choice', 'Watch Out For': 'No joint-life cover; whole-life cover caps around age 85 vs age 99/100 peers',
    },
    'Bandhan Life|iTerm Prime': {
      'Claim Settlement Ratio': '99.17% (FY 2024–25)', 'Amount Settlement Ratio': '~95%', 'Solvency Ratio': '~1.90x', 'Complaints per 10K Claims': '~6.5 (good)', 'Insurer Reputation': '★★★■ Formerly Aegon Life; rebranded under Bandhan Financial; smaller but improving', 'Customer Service Quality': 'Good — Digital-native insurer; quick online issuance',
      'Coverage Amount (Sum Assured)': '₹25L – No upper limit', 'Policy Term': '5–40 yrs; Max maturity age 80', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹9,900–11,000/yr (among the lowest online)', 'Online vs Offline Pricing': 'Purely online plan — lowest pricing tier', 'Premium Payment Term': 'Single / Limited / Regular (5 / 10 yrs limited)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + monthly income', 'Terminal Illness Benefit': '✓ Inbuilt — accelerated on TI diagnosis', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ Accelerated CI Rider (up to 20 illnesses)', 'Accidental Death Benefit (ADB)': '✓ Accidental Death Benefit Rider', 'Waiver of Premium (WoP)': '✓ On disability / CI via rider', 'Return of Premium (ROP)': '✓ iTerm Prime ROP variant available', 'Other Riders Available': 'Accidental Death; CI; Waiver of Premium riders',
      'Increasing Cover Option': '✓ Increasing cover option at inception', 'Flexibility to Modify Policy': '✓ Choose payout mode; add riders online', 'Joint Life Cover': '✗', 'Whole Life Cover Option': '✗ (max maturity age 80)',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Self-inflicted injury; Aviation; Hazardous activities; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★■ Fully digital; improving CSR trend; smaller claims book',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D (CI rider)',
      'Best Suited For': 'Value-seekers wanting very low online premiums with ROP and rider options', 'Watch Out For': 'Newer brand post-rebrand; smaller insurer; cover only to age 80; no joint life / whole life',
    },
    'Aditya Birla Sun Life|DigiShield Plan': {
      'Claim Settlement Ratio': '98.10% (FY 2024–25)', 'Amount Settlement Ratio': '~94%', 'Solvency Ratio': '~1.85x', 'Complaints per 10K Claims': '~7.5 (average)', 'Insurer Reputation': '★★★★■ Aditya Birla + Sun Life backing; strong brand', 'Customer Service Quality': 'Good — Digital servicing; wide distribution',
      'Coverage Amount (Sum Assured)': '₹30L – No upper limit', 'Policy Term': '5–85 yrs; Whole life option to age 100', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹11,500–13,000/yr', 'Online vs Offline Pricing': 'Online ~10–15% cheaper', 'Premium Payment Term': 'Single / Limited / Regular (5–40 yrs limited)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + income | Increasing income (10 payout options)', 'Terminal Illness Benefit': '✓ Inbuilt — accelerated on TI diagnosis', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ CI Rider (up to 42 illnesses)', 'Accidental Death Benefit (ADB)': '✓ Up to base SA (Accident Benefit Rider)', 'Waiver of Premium (WoP)': '✓ On CI / disability via rider', 'Return of Premium (ROP)': '✓ Survival / ROP benefit variants available', 'Other Riders Available': 'Surgical Care; Hospital Care; Waiver of Premium; Accident/CI riders',
      'Increasing Cover Option': '✓ Increasing cover + life-stage top-ups', 'Flexibility to Modify Policy': '✓ Multiple payout structures; add/remove riders; change pay mode', 'Joint Life Cover': '✓ Joint-life option available', 'Whole Life Cover Option': '✓ Cover to age 100',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Self-inflicted injury; Aviation; Hazardous activities; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★★■ Digital + assisted claim; 10 payout options add flexibility',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D (CI rider)',
      'Best Suited For': 'Buyers wanting many payout options, joint-life cover, and whole-life protection under one plan', 'Watch Out For': 'CSR slightly below the top cluster; premium mid-to-high vs online-only players',
    },
    'PNB MetLife|Mera Term Plan Plus': {
      'Claim Settlement Ratio': '97.31% (FY 2024–25)', 'Amount Settlement Ratio': '~92%', 'Solvency Ratio': '~1.90x', 'Complaints per 10K Claims': '~9.0 ■ Above average', 'Insurer Reputation': '★★★■ PNB + MetLife JV; mid-tier private insurer', 'Customer Service Quality': 'Average — PNB branch reach; digital experience improving',
      'Coverage Amount (Sum Assured)': '₹10L – No upper limit', 'Policy Term': '10–40 yrs; Whole life option to age 99', 'Premium (₹1Cr, 30M, 30yr, non-smoker)': '~₹11,200–12,800/yr', 'Online vs Offline Pricing': 'Online ~10% cheaper; also sold via PNB branches', 'Premium Payment Term': 'Single / Limited / Regular (5 / 10 / 15 yrs limited)',
      'Payout Options': 'Lump sum | Monthly income | Lump sum + income | Increasing cover', 'Terminal Illness Benefit': '✓ Inbuilt — accelerated on TI diagnosis', 'Instant Claim Payout': '✗',
      'Critical Illness (CI) Rider': '✓ Serious Illness Rider (up to 50 illnesses)', 'Accidental Death Benefit (ADB)': '✓ Accidental Death Benefit Rider', 'Waiver of Premium (WoP)': '✓ On CI / disability via rider', 'Return of Premium (ROP)': '✓ Return of Premium variant available', 'Other Riders Available': 'Serious Illness; Accidental Death; Waiver of Premium riders',
      'Increasing Cover Option': '✓ Increasing cover + life-stage protection', 'Flexibility to Modify Policy': '✓ Choose cover / payout structure; add riders', 'Joint Life Cover': '✓ Joint-life (couple) option', 'Whole Life Cover Option': '✓ Cover to age 99',
      'Suicide Exclusion': 'Within 12 months of purchase / revival', 'Standard Exclusions': 'Self-inflicted injury; Aviation; Hazardous activities; Undisclosed PED', 'Free-Look Period': '15 days (30 days: distance marketing)', 'Revival Period': 'Within 5 years of first unpaid premium', 'Grace Period': '30 days (annual/Q/H-Y); 15 days (monthly)',
      'Claim Process Simplicity': '★★★■ Branch + digital claim; higher complaint volume is a flag',
      'Section 80C — Premium Deduction': '✓ Up to ₹1.5L p.a.', 'Section 10(10D) — Death / Maturity Benefit': 'Death benefit ✓ 100% tax-free; ROP variant: conditional', 'CI Rider Tax Benefit': '✓ Sec 80D (serious illness rider)',
      'Best Suited For': 'Customers with a PNB banking relationship who want joint-life and whole-life options', 'Watch Out For': 'CSR ~97.3% and complaint volume are below the top cluster — more potential friction at claim time',
    },
  };

  private io?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    this.enrichVideos();
  }

  ngAfterViewInit(): void {
    this.setupReveal();
    this.setupSectionSpy();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.sectionObserver?.disconnect();
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  private setupReveal(): void {
    if (!this.isBrowser) {
      return;
    }
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

  private setupSectionSpy(): void {
    if (!this.isBrowser) {
      return;
    }
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            this.activeSection = (e.target as HTMLElement).id;
          }
        });
      },
      { threshold: 0.4 }
    );
    this.subnav.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        this.sectionObserver!.observe(el);
      }
    });
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
  //
  // NOTE: oEmbed only returns title + thumbnail + author. It does NOT return
  // the description or the video duration. Those two require the YouTube Data
  // API v3 (which needs an API key) — so `desc` and `dur` stay as the text
  // written in the `videos` array, acting as the fallback.
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

  // ---------- Comparer ----------
  get visiblePlans(): Plan[] {
    return this.showAllPlans ? this.plans : this.plans.filter((p) => !p.hidden);
  }

  get hasHiddenPlans(): boolean {
    return this.plans.some((p) => p.hidden);
  }

  isSelected(key: string): boolean {
    return this.selectedKeys.includes(key);
  }

  toggleCompare(key: string): void {
    const idx = this.selectedKeys.indexOf(key);
    if (idx > -1) {
      this.selectedKeys.splice(idx, 1);
    } else if (this.selectedKeys.length < this.MAX_COMPARE) {
      this.selectedKeys.push(key);
    }
  }

  removeSelected(key: string): void {
    this.selectedKeys = this.selectedKeys.filter((k) => k !== key);
    if (this.modalOpen && this.selectedKeys.length < 2) {
      this.closeModal();
    }
  }

  get selectedPlans(): Plan[] {
    return this.selectedKeys
      .map((k) => this.plans.find((p) => p.key === k))
      .filter((p): p is Plan => !!p);
  }

  get compareBtnLabel(): string {
    return this.selectedKeys.length < 2
      ? 'Pick at least 2 plans →'
      : `Compare ${this.selectedKeys.length} plans →`;
  }

  get hiddenPlanCount(): number {
    return this.plans.filter((p) => p.hidden).length;
  }

  get showMoreLabel(): string {
    return this.showAllPlans ? 'Show fewer plans ↑' : `Show ${this.hiddenPlanCount} more plans ↓`;
  }

  openModal(): void {
    if (this.selectedKeys.length < 2) {
      return;
    }
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.modalOpen = false;
    document.body.style.overflow = '';
  }

  cellValue(plan: Plan, label: string): string {
    return this.planData[plan.key]?.[label] ?? '—';
  }

  cellClass(plan: Plan, label: string): string {
    const val = this.planData[plan.key]?.[label];
    if (!val) {
      return 'is-empty';
    }
    if (val === '✓') {
      return 'is-yes';
    }
    if (val === '✗') {
      return 'is-no';
    }
    if (val.startsWith('✓')) {
      return 'is-pos';
    }
    if (val.startsWith('✗')) {
      return 'is-no';
    }
    return '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }
}