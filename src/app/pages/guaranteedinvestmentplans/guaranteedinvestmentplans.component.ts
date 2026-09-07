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
  plan: string;        // display name
  key: string;         // PLAN_DATA lookup key (insurer|plan)
  logo: string;        // initials (fallback if no logoImg)
  logoImg?: string;    // path to insurer logo image in assets
  logoColor: string;
  returnType: string;  // badge text
  returnBadge: 'green' | 'orange' | 'blue';
  incomePeriod: string;
  recommended?: boolean;
  hidden?: boolean;    // part of the "show more" set
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

interface CompareSection {
  title: string;
  rows: string[];      // labels that key into PLAN_DATA
}

@Component({
  selector: 'app-guaranteedinvestmentplans',
  templateUrl: './guaranteedinvestmentplans.component.html',
  styleUrls: ['./guaranteedinvestmentplans.component.scss'],
})
export class GuaranteedinvestmentplansComponent implements OnInit, AfterViewInit, OnDestroy {
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

  // ---------- SUBNAV ----------
  subnav = [
    { id: 'why', label: 'Why guaranteed plans' },
    { id: 'plantypes', label: 'Plan types' },
    { id: 'videos', label: 'Explainer videos' },
    { id: 'compare', label: 'Compare plans' },
  ];
  activeSection = 'why';

  // ---------- WHY ----------
  whyPoints = [
    {
      title: 'Return locked in before you sign.',
      desc: 'The maturity amount is in your policy document from inception. Zero surprises.',
      icon: 'shield',
    },
    {
      title: 'Maturity payout is completely tax-free.',
      desc: 'Under Sec 10(10D), your full maturity amount — including gains — is income-tax-free.',
      icon: 'smile',
    },
    {
      title: 'Regular income or lump sum — your choice.',
      desc: 'Choose a guaranteed monthly income stream, or a single lump-sum payout. Your goal, your structure.',
      icon: 'rupee',
    },
    {
      title: 'Life cover protects your family throughout.',
      desc: 'Your family gets the full sum assured even if premiums can\'t be completed. No deductions.',
      icon: 'users',
    },
  ];

  // ---------- PLAN TYPE CARDS ----------
  planTypes = [
    {
      tag: 'Regular Income',
      tagClass: 'income',
      title: 'Guaranteed Income Plans',
      desc: 'Pay for 5–12 years, earn a guaranteed monthly or annual income for up to 30. A second salary, on schedule.',
      cta: 'See income plans',
      icon: 'activity',
    },
    {
      tag: 'Lump Sum',
      tagClass: 'lumpsum',
      title: 'Guaranteed Savings Plans',
      desc: 'Your maturity amount is locked in from day one. Use it for a home, business, or retirement — zero market risk.',
      cta: 'See savings plans',
      icon: 'clock',
    },
    {
      tag: "Child's Future",
      tagClass: 'child',
      title: 'Child Savings Plans',
      desc: 'Lock in your child\'s education or wedding corpus years in advance. Premium waiver keeps the goal intact, no matter what.',
      cta: 'See child plans',
      icon: 'home',
    },
  ];

  // ---------- EXPLAINER VIDEOS ----------
  // `url` opens a OneInsure-scoped YouTube search for the topic.
  // Replace each with the exact video URL from your channel when you have it.
  videos: VideoItem[] = [
    { num: '01', topic: 'Guaranteed Return Plans', dur: '1:38', cap: 'Hindi', title: '', desc: 'How guaranteed return plans work and their key benefits, including fixed returns, life cover, and tax benefits.', url: 'https://www.youtube.com/watch?v=fVQGlQSMhLM', videoId: 'fVQGlQSMhLM' },
    { num: '02', topic: 'Income vs Savings', dur: '1:47', cap: 'Hindi', title: '', desc: 'Savings plans give a lump sum for major life goals, while income plans provide regular payouts for ongoing income needs like retirement.', url: 'https://www.youtube.com/watch?v=q6ifH2KMy2w', videoId: 'q6ifH2KMy2w' },
    { num: '03', topic: 'Tax benefits', dur: '1:56', cap: 'Why tax-free maturity is more powerful than it looks', title: 'Section 10(10D) — the real advantage', desc: 'How a 6.5% guaranteed return beats a 7.5% FD after tax in the 30% bracket. The maths most advisors skip.', url: 'https://www.youtube.com/results?search_query=OneInsure+section+10+10D+tax+free+maturity' },
    { num: '04', topic: 'Comparison', dur: '2:48', cap: 'Guaranteed plan vs FD vs mutual fund — the honest comparison', title: 'Is this better than an FD?', desc: 'After-tax returns, liquidity, flexibility — where guaranteed plans win, where they don\'t, and who they\'re best for.', url: 'https://www.youtube.com/results?search_query=OneInsure+guaranteed+plan+vs+FD+vs+mutual+fund' },
    { num: '05', topic: 'Riders', dur: '1:44', cap: 'Premium waiver: why it\'s the most important rider on a savings plan', title: 'Premium waiver benefit — explained', desc: 'What happens to the plan if you die or become disabled mid-term. Why waiver isn\'t optional on a long-horizon plan.', url: 'https://www.youtube.com/results?search_query=OneInsure+premium+waiver+benefit+rider' },
    { num: '06', topic: 'Liquidity', dur: '2:08', cap: 'What surrender value actually means — and when to never surrender', title: 'Surrender, loans & partial withdrawals', desc: 'Guaranteed plans aren\'t very liquid — here\'s exactly what you can access, when, and what it costs you.', url: 'https://www.youtube.com/results?search_query=OneInsure+surrender+value+guaranteed+plan' },
    { num: '07', topic: 'Timing', dur: '1:38', cap: 'The right age to buy — why waiting costs more than you think', title: 'When to start a guaranteed plan', desc: 'Premiums lock in at your current age. Every year you wait, the same maturity benefit costs you more.', url: 'https://www.youtube.com/results?search_query=OneInsure+best+age+to+start+guaranteed+savings+plan' },
  ];
  videoCount = 1;
  videoProgress = 14; // %

  // ---------- COMPARER ----------
  filters = [
    { label: 'Annual premium', options: ['₹ 1 Lakh', '₹ 50,000', '₹ 2 Lakh', '₹ 5 Lakh'] },
    { label: 'Premium paying term', options: ['10 years', '5 years', '7 years', '12 years'] },
    { label: 'Policy term', options: ['20 years', '15 years', '25 years', '30 years'] },
    { label: 'Payout type', options: ['Lump sum', 'Regular income', 'Both'] },
    { label: 'Age', options: ['30 years', '25', '35', '40', '45'] },
  ];
  sortOptions = ['IRR ↓', 'Payout flexibility'];
  activeSort = 'IRR ↓';

  plans: Plan[] = [
    { insurer: 'HDFC Life', plan: 'Sanchay Plus', key: 'HDFC Life|Sanchay Plus', logo: 'HD', logoImg: 'assets/images/insurers/HDFCLife.png', logoColor: '#004c97', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: 'Up to Life-Long (to age 99)', recommended: true },
    { insurer: 'HDFC Life', plan: 'SAGA', key: 'HDFC Life|SAGA', logo: 'HD', logoImg: 'assets/images/insurers/HDFCLife.png', logoColor: '#004c97', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: 'Lifelong (to age 99)' },
    { insurer: 'Axis Max Life', plan: 'SWAG (Par)', key: 'Axis Max Life|Smart Wealth Advantage Growth Par (SWAG)', logo: 'AX', logoImg: 'assets/images/insurers/axis-max-life.png', logoColor: '#e31837', returnType: 'Guaranteed + Par', returnBadge: 'orange', incomePeriod: 'To 100 yrs (Whole Life)' },
    { insurer: 'Bajaj Life', plan: 'Guaranteed Wealth Goal', key: 'Bajaj Life|Guaranteed Wealth Goal', logo: 'BJ', logoImg: 'assets/images/insurers/bajajallianz_life.png', logoColor: '#0056a2', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: 'Up to 40 yrs' },
    { insurer: 'ICICI Prudential', plan: 'GIFT Pro', key: 'ICICI Prudential|GIFT Pro', logo: 'IC', logoImg: 'assets/images/insurers/ICICIPRUDENTIALLIFEINSURANCE.png', logoColor: '#f58220', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: 'Flexible (choose duration)' },
    { insurer: 'Tata AIA', plan: 'FortuneGuarantee Plus', key: 'Tata AIA|FortuneGuarantee Plus', logo: 'TA', logoImg: 'assets/images/insurers/tata-aia.png', logoColor: '#003087', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: 'Up to 45 yrs' },
    { insurer: 'HDFC Life', plan: 'Click 2 Achieve', key: 'HDFC Life|Click 2 Achieve', logo: 'HD', logoImg: 'assets/images/insurers/HDFCLife.png', logoColor: '#004c97', returnType: 'Guaranteed + Par', returnBadge: 'orange', incomePeriod: 'Varies (3 yrs to Whole Life)', hidden: true },
    { insurer: 'Axis Max Life', plan: 'Smart Wealth Plan (SWP)', key: 'Axis Max Life|Smart Wealth Plan (SWP)', logo: 'AX', logoImg: 'assets/images/insurers/axis-max-life.png', logoColor: '#e31837', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: 'Whole Life (to 100)', hidden: true },
    { insurer: 'ICICI Prudential', plan: 'GIFT', key: 'ICICI Prudential|GIFT', logo: 'IC', logoImg: 'assets/images/insurers/ICICIPRUDENTIALLIFEINSURANCE.png', logoColor: '#f58220', returnType: 'Guaranteed', returnBadge: 'green', incomePeriod: '15 / 20 / 25 / 30 yrs', hidden: true },
  ];

  showAllPlans = false;
  readonly MAX_COMPARE = 3;
  selectedKeys: string[] = [];
  modalOpen = false;

  compareSections: CompareSection[] = [
    { title: 'Plan Classification', rows: ['Plan Type', 'Return Nature', 'Risk Profile'] },
    { title: 'Policy & Premium Terms', rows: ['Policy Term', 'Premium Payment Term', 'Premium Frequency'] },
    { title: 'Entry & Maturity Age', rows: ['Entry Age', 'Maturity Age'] },
    { title: 'Life Cover', rows: ['Life Cover Options', 'Death Benefit'] },
    { title: 'Benefits & Returns', rows: ['Maturity Benefit', 'Guaranteed Benefits', 'Non-Guaranteed Benefits', 'Bonus Structure'] },
    { title: 'Income & Wealth', rows: ['Income Options', 'Income Payout Duration', 'Wealth Accumulation Potential'] },
    { title: 'Liquidity & Flexibility', rows: ['Liquidity / Withdrawal', 'Loan Facility', 'Surrender Benefit', 'Paid-Up Option'] },
    { title: 'Tax & Riders', rows: ['Tax Benefit Eligibility', 'Rider Options', 'Free-Look Period'] },
    { title: 'OneInsure View', rows: ['Key Differentiator / USP'] },
  ];

  // Full comparison dataset (keyed by "insurer|plan")
  planData: { [key: string]: { [label: string]: string } } = {
    'HDFC Life|Sanchay Plus': {
      'Plan Type': 'Non-linked, Non-par Savings (4 options)',
      'Return Nature': 'Guaranteed — fully locked at inception',
      'Risk Profile': 'Low — zero market risk; ideal for conservative investors',
      'Policy Term': 'Single Pay: 5–20 yrs; Limited Pay: 15–40 yrs (option-dependent)',
      'Premium Payment Term': 'Single Pay; Limited: 5/6/8/10/12 yrs; Regular Pay',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '0 – 60 yrs (option-dependent)',
      'Maturity Age': '18 – 99 yrs (Life-Long Income: to 99)',
      'Life Cover Options': 'Throughout policy term and payout period for income options',
      'Death Benefit': 'Sum Assured on Death + Accrued Guaranteed Additions (Higher of: 10× AP / 105% premiums / SA)',
      'Maturity Benefit': 'Guaranteed Maturity: SA + Guaranteed Additions; income options: income continues / ROP included',
      'Guaranteed Benefits': 'All returns 100% guaranteed — lump sum / income fully fixed at inception',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': '4 options: Guaranteed Maturity / Guaranteed Income (10/12 yrs) / Long-Term Income (25–30 yrs) / Life-Long Income (to age 99)',
      'Income Payout Duration': '10 or 12 yrs / 25–30 yrs / To age 99 (Life-Long Income)',
      'Wealth Accumulation Potential': 'Moderate (~5–6% IRR; better than FD for long terms)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs (GSV or SSV, whichever higher)',
      'Loan Facility': '✓ After 2 full premiums paid (up to 80–90% of SV)',
      'Surrender Benefit': 'After 2 yrs: GSV = 30–90% of premiums paid; Special SV may be higher',
      'Paid-Up Option': '✓ After 2 yrs (reduced paid-up benefits)',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) maturity/death benefit tax-free (conditions apply)',
      'Rider Options': 'Income Benefit on Accidental Disability; Critical Illness Plus; Protect Plus; Livewell Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': '4 payout flavours in one plan; Life-Long Income to age 99; fully guaranteed returns; widest range of payout combos',
    },
    'HDFC Life|SAGA': {
      'Plan Type': 'Non-linked, Non-par Savings / Pension (SAGA = Sanchay Aajeevan Guaranteed Advantage)',
      'Return Nature': 'Guaranteed — locked at inception; lifelong income',
      'Risk Profile': 'Low — zero market risk; ideal for retirement / pension seekers',
      'Policy Term': 'Flexible — based on maturity age (up to 85) and deferment period chosen',
      'Premium Payment Term': 'Single Pay or Limited Pay (5/7/10/12 yrs); Deferred / Immediate variants',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '0 – 70 yrs (single/joint life options)',
      'Maturity Age': 'Up to 85 yrs (vesting age for pension / income start)',
      'Life Cover Options': 'Throughout; joint life option available; Waiver of Premium on 1st death',
      'Death Benefit': 'Higher of: 105% of total premiums paid OR Sum Assured on Death',
      'Maturity Benefit': 'Maturity Value (corpus) + lifelong guaranteed income stream (rates locked at inception)',
      'Guaranteed Benefits': 'Guaranteed income rates locked at inception; lifelong payout assured',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': 'Immediate Income (starts at policy inception); Deferred Income (after deferment period); Joint Life option; Lifelong income stream',
      'Income Payout Duration': 'Lifelong — from vesting age until death (★ key differentiator)',
      'Wealth Accumulation Potential': 'Moderate (guaranteed + lifelong income; suited for retirement corpus)',
      'Liquidity / Withdrawal': 'Partial withdrawal available (after specified period); Surrender allowed',
      'Loan Facility': '✓ After specified lock-in (up to 80% of SV)',
      'Surrender Benefit': 'After 2 yrs: GSV + any guaranteed additions accrued (partial surrender on pension variant)',
      'Paid-Up Option': '✓ After 2 yrs (paid-up value retained)',
      'Tax Benefit Eligibility': '✓ Sec 80CCC pension contribution (up to ₹1.5L under 80CCE limit); ✓ Sec 10(10A) commutation; Death benefit tax-free',
      'Rider Options': 'HDFC Life WoP Rider (joint life on 1st death); CI Rider; Protect Plus Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': '★ Lifelong guaranteed income locked at inception — unique; Joint Life option with WoP; Pension/savings hybrid; Partial withdrawal available',
    },
    'HDFC Life|Click 2 Achieve': {
      'Plan Type': 'Non-linked, Non-par Savings (Dream Achiever) OR Non-linked, Participating Savings (Par Advantage variant)',
      'Return Nature': 'Non-par: Guaranteed; Par variant: Guaranteed + Non-guaranteed bonus',
      'Risk Profile': 'Non-par: Low; Par: Low–Medium (bonus variable, not guaranteed)',
      'Policy Term': 'Non-par: based on child age (age 16/18 target); Par: 20–40 yrs; whole life (to 100)',
      'Premium Payment Term': 'Non-par: Single/Limited/Regular; Par: 5/7/8/10/12 yrs',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': 'Non-par: 0 – 55 yrs (child plan: 0–12 for child); Par: 0 – 65 yrs',
      'Maturity Age': 'Non-par: age 16/18 (child); Par: up to 100 (whole life)',
      'Life Cover Options': 'Throughout; Proposer life cover (child plan: proposer dies → WoP)',
      'Death Benefit': 'Non-par: Higher of SA / 10× AP / 105% total premiums; Par: SA on death + accrued bonus',
      'Maturity Benefit': 'Non-par: Survival benefits + final installment; Par: SA on maturity + cash bonus + terminal bonus (if declared)',
      'Guaranteed Benefits': 'Non-par: 100% guaranteed; Par: guaranteed base + non-guaranteed cash bonus',
      'Non-Guaranteed Benefits': 'Non-par: None; Par: Cash bonus (declared annually) + Terminal bonus on maturity/death',
      'Bonus Structure': 'Non-par: N/A; Par: Reversionary Cash Bonus (p.a. from yr 1) + Terminal Bonus at exit',
      'Income Options': 'Non-par: Survival benefits in last 3/4/5 yrs; Par: 5 variants incl. lump sum, balanced, early income, enhanced, guaranteed income',
      'Income Payout Duration': 'Non-par: 3/4/5 yrs; Par: varies by variant (up to whole life)',
      'Wealth Accumulation Potential': 'Non-par: Moderate (guaranteed ~5–6%); Par: Moderate–Good (bonus upside if fund performs well)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs (GSV or SSV)',
      'Loan Facility': '✓ After 2 full premiums paid (up to 80–90% of SV)',
      'Surrender Benefit': 'Non-par: after 2 yrs — GSV; Par: after 2 yrs — GSV + paid-up bonus (if applicable)',
      'Paid-Up Option': '✓ After 2 yrs (non-par + par both)',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) tax-free maturity (conditions); Child plan: proposer premium eligible',
      'Rider Options': 'Non-par: CI Rider; Protect Plus Rider; Par: WoP Plus Rider; CI Plus Rider; Accidental Disability Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': 'Child plan with Proposer WoP — premiums waived on proposer death; Dream Achiever bonus (2× AP for top university / Olympics); Par: Early income from yr 1; 5 plan variants',
    },
    'Axis Max Life|Smart Wealth Plan (SWP)': {
      'Plan Type': 'Non-linked, Non-par Guaranteed Savings',
      'Return Nature': 'Guaranteed — fully locked at inception',
      'Risk Profile': 'Low — zero market risk; ideal for conservative investors',
      'Policy Term': '5 yrs (Short Term); 10–30 yrs (regular); Whole Life (to 100)',
      'Premium Payment Term': 'Single / 5/6/8/10/12/15 yrs Limited / Regular Pay',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '18 – 65 yrs',
      'Maturity Age': 'Up to 100 yrs (Whole Life variant)',
      'Life Cover Options': 'Throughout; Joint Life Cover available (spouse can be added)',
      'Death Benefit': 'Higher of Sum Assured on Death or 105% of total premiums (+50% ADB if accidental death after PPT)',
      'Maturity Benefit': 'Lump sum at maturity = SA on Maturity + Guaranteed Additions (income options: income stream)',
      'Guaranteed Benefits': 'Guaranteed lump sum / income locked at inception',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': 'Whole Life Income (WLI); Long-Term Income (LTI); Short-Term Guaranteed Income (STGI); Lump Sum; Joint Life Income option',
      'Income Payout Duration': 'Policy term based (Whole Life: to 100); LTI: as chosen; STGI: short term',
      'Wealth Accumulation Potential': 'Moderate (non-par; guaranteed returns; good for conservative planners)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs (paid-up value available)',
      'Loan Facility': '✓ After 2 full premiums paid (up to 80–90% of SV)',
      'Surrender Benefit': 'After 2 yrs: GSV (30% of premiums paid from yr 3) or Paid-Up Value',
      'Paid-Up Option': '✓ After 2 yrs',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) tax-free maturity (conditions apply)',
      'Rider Options': 'Axis Max WoP Plus Rider; Accidental Death & Dismemberment Rider; CI & Disability Rider; Term Plus Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': 'Joint Life Cover; Whole Life income option; Guaranteed returns; Simple, flexible non-par plan; good for conservative retirement planners',
    },
    'Axis Max Life|Smart Wealth Advantage Growth Par (SWAG)': {
      'Plan Type': 'Non-linked, Participating Savings',
      'Return Nature': 'Guaranteed + Non-guaranteed (cash bonus + terminal bonus from par)',
      'Risk Profile': 'Low–Medium (par bonus adds upside potential)',
      'Policy Term': '20–40 yrs or Whole Life (cover to age 100; with PCB: max maturity 85)',
      'Premium Payment Term': 'Single / Limited (5/7/8/10/12) / Regular Pay',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '1 – 65 yrs',
      'Maturity Age': 'Up to 100 yrs (without PCB); up to 85 (with PCB)',
      'Life Cover Options': 'Throughout; Policy Continuance Benefit keeps benefits flowing on death',
      'Death Benefit': 'During PPT: 100% Sum Assured; After PPT: 110% Sum Assured (survival benefits continue for nominee via PCB)',
      'Maturity Benefit': 'SA on Maturity + accrued cash bonus (if not paid earlier) + terminal bonus (if declared)',
      'Guaranteed Benefits': 'Guaranteed base income payout (par bonus is non-guaranteed; base SA and income are guaranteed)',
      'Non-Guaranteed Benefits': 'Cash bonus (declared annually; not guaranteed) + Terminal bonus on maturity/death',
      'Bonus Structure': 'Cash Bonus (par; declared annually; paid from yr 1 of income start) + Terminal Bonus at maturity',
      'Income Options': '4 variants: Insta Income (from yr 1); Balanced Income; Future Income (deferred); Lifelong Income (to 100)',
      'Income Payout Duration': '20–40 yrs (policy-term based); Whole Life option: to 100 yrs',
      'Wealth Accumulation Potential': 'Moderate–Good (par bonus adds upside; whole life cover enhances value) IRR ~5.5–6.5%',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs (GSV/SSV whichever higher)',
      'Loan Facility': '✓ After 2 full premiums paid (up to 80% of SV)',
      'Surrender Benefit': 'After 2 yrs: GSV + accrued bonus (if applicable); Paid-up option available',
      'Paid-Up Option': '✓ After 2 yrs (reduced paid-up + par bonus continues at reduced level)',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) tax-free maturity (conditions; bonuses also covered)',
      'Rider Options': 'Axis Max WoP Plus Rider (CI + Disability + Death); Accidental Death & Dismemberment Rider; CI & Disability Rider; Term Plus Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': '★ Policy Continuance Benefit: benefits continue to nominee without further premium; Par upside via cash bonus; +50% ADB inbuilt; women: extra 10% SA at maturity',
    },
    'Bajaj Life|Guaranteed Wealth Goal': {
      'Plan Type': 'Non-linked, Non-par Guaranteed Savings',
      'Return Nature': 'Guaranteed — fully locked at inception',
      'Risk Profile': 'Low — zero market risk; ideal for conservative / income seekers',
      'Policy Term': 'Wealth Creation: 15/20/25 yrs; Assured Income: PPT + Income Period (15–40 yrs)',
      'Premium Payment Term': 'Single / Limited (5/7/10/12) / Regular Pay',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '1 month – 60 yrs',
      'Maturity Age': 'Up to 75 yrs (Wealth Creation); Up to 75 yrs + income period (Assured Income)',
      'Life Cover Options': 'Throughout (death triggers income payout for nominee)',
      'Death Benefit': 'Higher of: 10× AP or 105% total premiums or Basic Sum Assured (income continues for nominee)',
      'Maturity Benefit': 'Wealth Creation: Guaranteed lump sum + Guaranteed Additions; Assured Income: last income instalment at end of income period',
      'Guaranteed Benefits': 'Guaranteed maturity benefit + accrued Guaranteed Additions (both fully locked at inception)',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': 'Wealth Creation (lump sum); Assured Income (regular income for 15/20/25/30/35/40 yrs); Step-Up income option (+5%)',
      'Income Payout Duration': '15/20/25/30/35/40 yrs (Assured Income sub-option) — longest in peer set at 40 yrs',
      'Wealth Accumulation Potential': 'Moderate (guaranteed; predictable; 40-yr income option adds long-term value)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs (GSV: 30% of premiums from yr 3)',
      'Loan Facility': '✓ After 2 full premiums paid (up to 70% of SV)',
      'Surrender Benefit': 'After 2 yrs: GSV (30–70% of premiums depending on policy year); Special SV may be higher',
      'Paid-Up Option': '✓ After 2 yrs (paid-up benefits apply)',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) maturity & death benefit tax-free (conditions apply)',
      'Rider Options': 'Bajaj Life Accidental Death Benefit Rider; CI Rider (10/25/60 illness tiers); Accidental Disability Rider; WoP Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': 'Income period up to 40 yrs (longest in peer set); Step-Up income (+5% p.a.); Wealth Creation + Assured Income sub-options under one plan',
    },
    'ICICI Prudential|GIFT': {
      'Plan Type': 'Non-linked, Non-par Guaranteed Savings',
      'Return Nature': 'Guaranteed — fully locked at inception',
      'Risk Profile': 'Low — zero market risk; ideal for goal-linked income seekers',
      'Policy Term': 'PPT + Income Period (Income period: 15/20/25/30 yrs); Policy term = PPT + IP',
      'Premium Payment Term': '7 or 10 yrs (GIFT); Choose PPT + Income Period',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '0 – 65 yrs (varies by PPT + option)',
      'Maturity Age': 'Depends on PPT + IP combo (up to age 101 in some combos)',
      'Life Cover Options': 'Throughout (death triggers guaranteed income continues to nominee)',
      'Death Benefit': 'Sum Assured on Death + Guaranteed Income continues for family till end of income period',
      'Maturity Benefit': 'Guaranteed Income for chosen income period (no separate lump sum) + 110% ROP (with ROP option)',
      'Guaranteed Benefits': 'Guaranteed income stream for entire income period (100% guaranteed)',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': '4 options: Income; Income + 110% ROP; Assured Income; Assured Income + 110% ROP',
      'Income Payout Duration': '15 / 20 / 25 / 30 yrs',
      'Wealth Accumulation Potential': 'Moderate (guaranteed income, no growth; suited for regular income goal)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs (GSV available; policy lapses if not revived)',
      'Loan Facility': '✓ After 2 full premiums paid',
      'Surrender Benefit': 'After 2 yrs: GSV (premiums × surrender factor); No additional bonuses',
      'Paid-Up Option': '✓ After 2 yrs',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) income & death benefit tax-free (conditions; premium ≤₹5L aggregate p.a.)',
      'Rider Options': 'ICICI Pru Accidental Death Benefit Rider; WoP Rider (permanent disability); Terminal Illness Rider',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': 'In-built WoP (Future Secure) — future premiums waived on death; Guaranteed income starts from Day 7 of policy; Flexible income start date',
    },
    'ICICI Prudential|GIFT Pro': {
      'Plan Type': 'Non-linked, Non-par Guaranteed Savings / Income',
      'Return Nature': 'Guaranteed (income locked; MoneyBack flexible)',
      'Risk Profile': 'Low — zero market risk; ideal for long-term income seekers',
      'Policy Term': 'PPT + Deferment + Income Period (10–40 yrs total policy term)',
      'Premium Payment Term': '5/7/10/12 yrs (GIFT Pro); Choose PPT + Income Period',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '0 – 65 yrs (varies by PPT + income period)',
      'Maturity Age': 'Up to 75 yrs or beyond (based on PPT + IP selection)',
      'Life Cover Options': 'Throughout; Guaranteed income continues to nominee on death',
      'Death Benefit': 'Sum Assured on Death + Guaranteed Income continues for nominee till end of income period',
      'Maturity Benefit': 'Guaranteed Income for income period + MoneyBack benefit (0–100% of premiums) at chosen year + 0–200% ROP option',
      'Guaranteed Benefits': 'Guaranteed income (level or +5% p.a. increasing) + MoneyBack % locked at inception',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': 'Level Income (constant); Increasing Income (+5% p.a.); Low Cover Income Booster; MoneyBack % (0–200%); Income can start at any chosen date',
      'Income Payout Duration': 'Flexible — choose income period; policyholder decides duration (based on PPT combination)',
      'Wealth Accumulation Potential': 'Moderate–Good (increasing income +5% p.a. hedges inflation; MoneyBack adds flexibility)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender after 2 yrs',
      'Loan Facility': '✓ After surrender value is acquired',
      'Surrender Benefit': 'After 2 yrs: GSV available (surrender factors per brochure)',
      'Paid-Up Option': '✓ After 2 yrs',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) income & death benefit tax-free (conditions; IT Act 2025 Sec 11)',
      'Rider Options': 'ICICI Pru Accidental Death Rider; WoP on Disability Rider; Terminal Illness cover (limited rider suite)',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': '★ Most flexible in GIFT family: Level OR Increasing income; MoneyBack 0–200% of premiums; choose any year to take lump sum; Low Cover Income Booster option',
    },
    'Tata AIA|FortuneGuarantee Plus': {
      'Plan Type': 'Non-linked, Non-par Guaranteed Savings / Income',
      'Return Nature': 'Guaranteed (income rate fixed at inception)',
      'Risk Profile': 'Low — zero market risk; ideal for income + protection seekers',
      'Policy Term': 'PPT 10 yrs; Policy 15 yrs + Income period up to 45 yrs',
      'Premium Payment Term': 'Single / Limited (5/7/10/12/15) / Regular Pay',
      'Premium Frequency': 'Annual / Half-yearly / Quarterly / Monthly',
      'Entry Age': '1 – 60 yrs',
      'Maturity Age': 'Up to 80 yrs (policy term); Income can continue to 85+',
      'Life Cover Options': 'Throughout; Joint life cover available (spouse insured)',
      'Death Benefit': 'Sum Assured on Death + income continues for nominee for remaining income period',
      'Maturity Benefit': 'Last income instalment + any maturity lump sum (if income booster applicable) + 100% premium return options available',
      'Guaranteed Benefits': 'Guaranteed Annual Income (fixed % of premium at inception) + optional Large Premium Booster',
      'Non-Guaranteed Benefits': 'None — fully non-par plan',
      'Bonus Structure': 'N/A — no bonus (non-par plan)',
      'Income Options': 'Regular Income; Income + Return of Premium; Income + Spouse Cover; Large Premium Income Booster (for higher SA / premium slabs)',
      'Income Payout Duration': 'Income period up to 45 yrs — longest in peer set; income continues post maturity',
      'Wealth Accumulation Potential': 'Moderate (guaranteed rate fixed; Income Booster helps on high premiums; longest income period of 45 yrs)',
      'Liquidity / Withdrawal': 'No partial withdrawal; Surrender allowed after 2 full premiums paid',
      'Loan Facility': '✓ After 2 full premiums paid (up to 80% of SV)',
      'Surrender Benefit': 'After 2 yrs: GSV (% of premiums per surrender value table)',
      'Paid-Up Option': '✓ After 2 yrs',
      'Tax Benefit Eligibility': '✓ Sec 80C up to ₹1.5L p.a.; ✓ Sec 10(10D) income & death benefit tax-free (conditions; GST = 0% from Sep 2025)',
      'Rider Options': 'Tata AIA Non-Linked Comprehensive Protection Rider (40 critical illnesses); Tata AIA Vitality Protect Rider; Tata AIA Vitality Health Rider (wellness rewards + CI)',
      'Free-Look Period': '15 days (30 days: distance marketing)',
      'Key Differentiator / USP': 'Income period up to 45 yrs (longest in peer set for non-par); Large Premium Income Booster; Joint life cover with spouse; Income Booster for high-SA policies',
    },
  };

  private io?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    this.enrichVideos();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.setupReveal();
      this.setupSectionSpy();
    }
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.sectionObserver?.disconnect();
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
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

  private setupSectionSpy(): void {
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
    if (!this.isBrowser) {
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- Videos ----------
  // Pulls live title + thumbnail for any card that has a `videoId`, using
  // YouTube's public oEmbed endpoint (no API key needed). 
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
            v.title = data.title;           // real video title from YouTube
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

  openModal(): void {
    if (this.selectedKeys.length < 2) {
      return;
    }
    this.modalOpen = true;
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(): void {
    this.modalOpen = false;
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
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
    return '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }
}