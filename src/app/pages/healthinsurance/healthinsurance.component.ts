import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { VideoModalService } from '../../shared/video-modal/video-modal.service';

interface Plan {
  insurer: string;
  plan: string;            // display name
  key: string;             // planData lookup key (insurer|plan)
  logo: string;            // initials (fallback if no logoImg)
  logoImg?: string;        // path to insurer logo image in assets
  logoColor: string;
  claimRatio: string;      // e.g. "~97%"
  claimRatioSub: string;   // e.g. "FY 2024–25 · IRDAI"
  claimRatioWarn?: boolean;// show the claim ratio in red (below benchmark)
  network: string;         // e.g. "10,000+"
  networkSub: string;      // e.g. "hospitals"
  restore: string;         // restore/recharge badge text
  restoreBadge: 'green' | 'orange';
  recommended?: boolean;
  hidden?: boolean;        // part of the "show more" set
  tag?: string;            // inline badge next to the insurer name (e.g. "Top-Up")
  tagColor?: string;       // background for that inline badge
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
  label: string;           // keys into planData
  hint?: string;
}

interface CompareSection {
  title: string;
  rows: CompareRow[];
}

@Component({
  selector: 'app-healthinsurance',
  templateUrl: './healthinsurance.component.html',
  styleUrls: ['./healthinsurance.component.scss'],
})
export class HealthinsuranceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('vidsTrack', { static: false }) vidsTrack!: ElementRef<HTMLElement>;
  @ViewChildren('sectionRef') sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  // ---------- HERO ----------
  trust = [
    'IRDAI-licensed broker',
    'Claim-assistance included',
    'No spam, ever',
    '18 years · 5 lakh+ policies',
  ];

  stats = [
    { num: '₹500', sup: '/mo', lbl: '₹5L family cover from' },
    { num: '10K', sup: '+', lbl: 'Cashless hospitals' },
    { num: 'Day', sup: ' 1', lbl: 'Cover for accidents' },
    { num: '80', sup: 'D', lbl: 'Tax benefit up to ₹75K' },
  ];

  // ---------- SUBNAV ----------
  subnav = [
    { id: 'why', label: 'Why health cover' },
    { id: 'videos', label: 'Explainer videos' },
    // { id: 'compare', label: 'Compare plans' },
  ];
  activeSection = 'why';

  // ---------- WHY ----------
  whyPoints = [
    {
      title: 'Cashless treatment at 10,000+ hospitals.',
      desc: 'No upfront payment, no reimbursement paperwork. Your insurer settles the bill directly with the hospital.',
      icon: 'activity',
    },
    {
      title: 'One policy covers your whole family.',
      desc: 'Floater plans cover spouse, children and parents under one sum insured — often cheaper than individual policies.',
      icon: 'users',
    },
    {
      title: 'Pre- and post-hospitalisation covered.',
      desc: 'Diagnostic tests, specialist fees, medicines — 60 days before and 90 days after hospitalisation are all included.',
      icon: 'heart',
    },
    {
      title: 'Section 80D tax benefit up to ₹75,000/year.',
      desc: '₹25K for self + family, ₹50K extra for senior-citizen parents. The premium practically pays for itself.',
      icon: 'rupee',
    },
  ];

  // ---------- EXPLAINER VIDEOS ----------
  // `url` opens a OneInsure-scoped YouTube search for the topic.
  // Replace each with the exact video URL from your channel when you have it.
  videos: VideoItem[] = [
    { num: '01', topic: 'Health Insurance', dur: '1:07', cap: 'Hindi', title: '', desc: 'Learn how to choose the right health insurance coverage based on your city, age, family size, and health history.', url: 'https://www.youtube.com/watch?v=2lFtjh0SaBc', videoId: '2lFtjh0SaBc' },
    { num: '02', topic: 'Cashless Claim', dur: '1:16', cap: 'Hindi', title: '', desc: 'Understand how cashless health insurance claims work, from pre-authorization to hospital payment, and what you may still need to pay.', url: 'https://www.youtube.com/watch?v=5_bj9ABfKAo', videoId: '5_bj9ABfKAo' },
    { num: '03', topic: 'Individual vs Family', dur: '1:31', cap: 'Hindi', title: '', desc: 'Understand the key differences between individual and family floater health insurance plans and which option may be better for your family.', url: 'https://www.youtube.com/watch?v=7ILmoaWe2v8', videoId: '7ILmoaWe2v8' },
    { num: '04', topic: 'Top-Up Strategy', dur: '1:41', cap: 'Hindi', title: '', desc: 'How to get higher health insurance coverage with a lower premium using a base policy and super top-up.', url: 'https://www.youtube.com/watch?v=anH0_Zs1JyQ', videoId: 'anH0_Zs1JyQ' },
    { num: '05', topic: 'Parents Health', dur: '1:16', cap: 'Hindi', title: '', desc: 'Why parents may need separate senior citizen health insurance and what to check before choosing a plan.', url: 'https://www.youtube.com/watch?v=ZXbZMyua9nQ', videoId: 'ZXbZMyua9nQ' },
    { num: '06', topic: 'Claim Reject', dur: '1:51', cap: 'Hindi', title: '', desc: 'Step-by-step process to challenge a rejected health insurance claim and get it reviewed.', url: 'https://www.youtube.com/watch?v=Wl1n4NSCukA', videoId: 'Wl1n4NSCukA' },
    { num: '07', topic: 'Claim disputes', dur: '1:16', cap: 'Hindi', title: '', desc: 'IRDAI grievance portal, ombudsman, consumer forum. The escalation path our advisors walk you through.', url: 'https://www.youtube.com/watch?v=5_bj9ABfKAo', videoId: '5_bj9ABfKAo' },
  ];
  videoCount = 1;
  videoProgress = 14; // %

  // ---------- COMPARER ----------
  filters = [
    { label: 'Cover amount', options: ['₹ 5 Lakh', '₹ 10 Lakh', '₹ 25 Lakh', '₹ 50 Lakh', '₹ 1 Crore'] },
    { label: 'Plan type', options: ['Family Floater', 'Individual', 'Senior Citizen', 'Super Top-up'] },
    { label: 'Age (eldest)', options: ['30 years', '25', '35', '40', '50', '60'] },
    { label: 'Members', options: ['Self + Spouse', 'Self only', 'Self + Spouse + 2 kids', 'Self + Parents'] },
  ];
  sortOptions = ['Network ↓', 'Claim ratio'];
  activeSort = 'Network ↓';

  plans: Plan[] = [
    // ---- visible set ----
    { insurer: 'Niva Bupa', plan: 'ReAssure 2.0', key: 'Niva Bupa|ReAssure 2.0', logo: 'NB', logoImg: 'assets/images/insurers/nivabupa.png', logoColor: '#004b8d', claimRatio: '~97%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '10,000+', networkSub: 'hospitals', restore: 'Unlimited auto', restoreBadge: 'green', recommended: true },
    { insurer: 'HDFC ERGO', plan: 'Optima Secure', key: 'HDFC ERGO|Optima Secure', logo: 'HE', logoImg: 'assets/images/insurers/HDFCErgo.jpg', logoColor: '#e2001a', claimRatio: '99%+', claimRatioSub: 'FY 2024–25 · IRDAI', network: '16,000+', networkSub: 'hospitals — largest', restore: '100% once/yr', restoreBadge: 'orange' },
    { insurer: 'ManipalCigna', plan: 'Sarvah Uttam', key: 'ManipalCigna|Sarvah Uttam', logo: 'MC', logoImg: 'assets/images/insurers/Cigna.jpg', logoColor: '#f47920', claimRatio: '~99.9%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '10,000+', networkSub: 'hospitals', restore: 'Unlimited + Anant∞', restoreBadge: 'green' },
    { insurer: 'TATA AIG', plan: 'Medicare Premier', key: 'TATA AIG|Medicare Premier', logo: 'TA', logoImg: 'assets/images/insurers/tata-aia.png', logoColor: '#003087', claimRatio: '~100%', claimRatioSub: 'IRDAI Rank 1 FY24', network: '10,000+', networkSub: 'hospitals', restore: 'Unlimited', restoreBadge: 'green' },
    { insurer: 'Care Health', plan: 'Care Supreme', key: 'Care Health|Care Supreme', logo: 'CH', logoImg: 'assets/images/insurers/CareHealth.png', logoColor: '#00953b', claimRatio: '~98–100%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '11,400+', networkSub: 'hospitals', restore: 'Unlimited auto', restoreBadge: 'green' },
    { insurer: 'Aditya Birla Health', plan: 'Activ One', key: 'Aditya Birla Health|Activ One', logo: 'AB', logoImg: 'assets/images/insurers/AdityaBirla.jpeg', logoColor: '#c8102e', claimRatio: '~96%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '12,000+', networkSub: 'hospitals', restore: 'Super Reload 150%', restoreBadge: 'green' },

    // ---- "show more" set ----
    { insurer: 'Niva Bupa', plan: 'ReAssure 3.0', key: 'Niva Bupa|ReAssure 3.0', logo: 'NB', logoImg: 'assets/images/insurers/nivabupa.png', logoColor: '#004b8d', claimRatio: '~97%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '10,000+', networkSub: 'hospitals', restore: 'Same-illness recharge', restoreBadge: 'green', hidden: true },
    { insurer: 'ICICI Lombard', plan: 'Elevate', key: 'ICICI Lombard|Elevate', logo: 'IL', logoImg: 'assets/images/insurers/ICICILombard.jpg', logoColor: '#003087', claimRatio: '~96%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '9,500+', networkSub: 'hospitals', restore: 'Unlimited/yr', restoreBadge: 'green', hidden: true },
    { insurer: 'Care Health', plan: 'Care Advantage', key: 'Care Health|Care Advantage', logo: 'CH', logoImg: 'assets/images/insurers/CareHealth.png', logoColor: '#00953b', claimRatio: '~98–100%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '11,400+', networkSub: 'hospitals', restore: '100% unlimited', restoreBadge: 'green', hidden: true },
    { insurer: 'Care Health', plan: 'Care', key: 'Care Health|Care', logo: 'CH', logoImg: 'assets/images/insurers/CareHealth.png', logoColor: '#00953b', claimRatio: '~98–100%', claimRatioSub: 'FY 2024–25 · IRDAI', network: '11,400+', networkSub: 'hospitals', restore: '100% once/yr', restoreBadge: 'orange', hidden: true },
    { insurer: 'TATA AIG', plan: 'Medicare Plus', key: 'TATA AIG|Medicare Plus', logo: 'TA', logoImg: 'assets/images/insurers/tata-aia.png', logoColor: '#003087', claimRatio: '~100%', claimRatioSub: 'IRDAI Rank 1 FY24', network: '10,000+', networkSub: 'hospitals', restore: 'Above deductible', restoreBadge: 'orange', hidden: true, tag: 'Top-Up', tagColor: '#0071bc' },
    { insurer: 'Star Health', plan: 'Super Star Value', key: 'Star Health|Super Star Value', logo: 'SH', logoImg: 'assets/images/insurers/Star_Health_and_Allied_Insurance.png', logoColor: '#00539b', claimRatio: '~88%', claimRatioSub: 'Below 90% benchmark', claimRatioWarn: true, network: '14,000+', networkSub: 'hospitals', restore: 'Unlimited auto', restoreBadge: 'green', hidden: true, tag: '⚠ CSR 88%', tagColor: '#dc2626' },
  ];

  showAllPlans = false;
  readonly MAX_COMPARE = 3;
  selectedKeys: string[] = [];
  modalOpen = false;

  compareSections: CompareSection[] = [
    {
      title: 'Plan Basics', rows: [
        { label: 'Plan Type' },
        { label: 'Sum Insured Range' },
        { label: 'Entry Age — Adults' },
        { label: 'Entry Age — Children' },
        { label: 'Family Size' },
      ]
    },
    {
      title: 'Hospitalisation Coverage', rows: [
        { label: 'Room Rent' },
        { label: 'Co-Pay' },
        { label: 'Pre-Hospitalisation', hint: 'Days covered before admission' },
        { label: 'Post-Hospitalisation', hint: 'Days covered after discharge' },
        { label: 'Day Care Procedures' },
        { label: 'AYUSH Cover' },
        { label: 'Modern Treatments', hint: 'Robotic surgery, oral chemo, stem cell etc.' },
        { label: 'Domiciliary / Home Care' },
      ]
    },
    {
      title: 'Waiting Periods', rows: [
        { label: 'Initial Waiting Period' },
        { label: 'Pre-Existing Diseases (PED)', hint: 'Standard wait; add-ons can reduce this' },
        { label: 'Specific Illness Waiting' },
        { label: 'Maternity Cover', hint: 'Base plan or add-on; includes waiting period' },
      ]
    },
    {
      title: 'No-Claim Bonus & Restoration', rows: [
        { label: 'No-Claim Bonus (NCB)', hint: 'Annual SI boost for claim-free years' },
        { label: 'NCB Protected on Claim?' },
        { label: 'Restore / Recharge SI', hint: 'How the sum insured is replenished after a claim' },
      ]
    },
    {
      title: 'OPD, Wellness & Extras', rows: [
        { label: 'OPD Cover' },
        { label: 'Annual Health Check-Up' },
        { label: 'Wellness / Reward Programme' },
        { label: 'International Cover' },
      ]
    },
    {
      title: 'Insurer Metrics (FY 2024–25)', rows: [
        { label: 'Claim Settlement Ratio', hint: 'By count; IRDAI FY 2024–25' },
        { label: 'Incurred Claims Ratio', hint: '50–80% is the healthy range' },
        { label: 'Network Hospitals' },
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
    'Niva Bupa|ReAssure 2.0': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹5 Cr', 'Entry Age — Adults': '18 yrs – no limit', 'Entry Age — Children': '91 days', 'Family Size': 'Flexible',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Platinum+; 24 months; newborn Day 1',
      'No-Claim Bonus (NCB)': '25% p.a.; Lock the Bonus — NCB preserved post-claim', 'NCB Protected on Claim?': '✓ Lock the Bonus', 'Restore / Recharge SI': '✓ Unlimited auto-recharge',
      'OPD Cover': 'Add-on (Platinum+)', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ Health app rewards', 'International Cover': '✗',
      'Claim Settlement Ratio': '~97% (FY 2024–25)', 'Incurred Claims Ratio': '~65%', 'Network Hospitals': '10,000+',
      'Best Suited For': 'NCB preserved post-claim; unlimited auto-recharge; strong brand reliability', 'Watch Out For': 'No international cover; OPD only in Platinum+ variant',
    },
    'Niva Bupa|ReAssure 3.0': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹1 Cr (Unlimited option)', 'Entry Age — Adults': '18 yrs – no limit', 'Entry Age — Children': '91 days', 'Family Size': 'Flexible',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months (reducible w/ add-on)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Black+; 12 months waiting (improved)',
      'No-Claim Bonus (NCB)': '25% p.a.; Lock the Bonus + enhanced in Black+', 'NCB Protected on Claim?': '✓ Lock the Bonus + enhanced', 'Restore / Recharge SI': '✓ Enhanced — covers SAME illness too',
      'OPD Cover': '✓ OPD in Black+', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ Enhanced wellness rewards', 'International Cover': '✓ Add-on',
      'Claim Settlement Ratio': '~97% (FY 2024–25)', 'Incurred Claims Ratio': '~65%', 'Network Hospitals': '10,000+',
      'Best Suited For': 'Same-illness recharge; maternity 12 months in Black+; stronger wellness vs 2.0', 'Watch Out For': 'Full features only in Black+ variant; higher premium',
    },
    'HDFC ERGO|Optima Secure': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹1 Cr', 'Entry Age — Adults': '18–65 yrs; no upper limit at renewal', 'Entry Age — Children': '91 days', 'Family Size': 'Up to 6 Adults',
      'Room Rent': 'No cap — no co-pay on room upgrade', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '60 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓ (incl. robotic)', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months → 30 days (ABCD Chronic Care add-on)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✗ (base plan)',
      'No-Claim Bonus (NCB)': '50% p.a. up to 100% of base SI', 'NCB Protected on Claim?': 'Reduces; add-on available', 'Restore / Recharge SI': '✓ 100% once/yr (Plus plan adds a layer)',
      'OPD Cover': '✓ Optima Wellbeing add-on', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ App; renewal discounts', 'International Cover': '✓ Global Plus add-on',
      'Claim Settlement Ratio': '99%+ 3-yr avg — Best in set', 'Incurred Claims Ratio': '~79%', 'Network Hospitals': '16,000+ (largest)',
      'Best Suited For': 'Best CSR (99%+); 2× effective cover Day 1; ABCD 30-day PED; largest hospital network', 'Watch Out For': 'Maternity not in base plan; restoration only once per year',
    },
    'ICICI Lombard|Elevate': {
      'Plan Type': 'Individual / Floater (modular add-ons)', 'Sum Insured Range': '₹5L – ₹3 Cr (Unlimited w/ add-on)', 'Entry Age — Adults': '18 yrs – no limit', 'Entry Age — Children': '91 days', 'Family Size': 'Flexible multi-member',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months → reducible (Sarathi add-on)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Waiting period applies',
      'No-Claim Bonus (NCB)': '20% p.a. up to 100%; Power Booster: 100% guaranteed p.a. regardless of claims', 'NCB Protected on Claim?': '✓ Power Booster (guaranteed)', 'Restore / Recharge SI': '✓ Unlimited resets/yr',
      'OPD Cover': '✓ Cashless OPD add-on', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ Up to 30% renewal discount', 'International Cover': '✓ Worldwide cashless up to ₹3 Cr (add-on)',
      'Claim Settlement Ratio': '~96% (FY 2024–25)', 'Incurred Claims Ratio': '~70%', 'Network Hospitals': '9,500+',
      'Best Suited For': 'Most customisable plan; Power Booster guaranteed NCB; worldwide cashless; Jumpstart 30-day PED', 'Watch Out For': 'Most features need add-ons; plan selection can be complex',
    },
    'ManipalCigna|Sarvah Uttam': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹2 Cr', 'Entry Age — Adults': '18–65 yrs; lifetime renewal', 'Entry Age — Children': '91 days', 'Family Size': 'Self + Spouse + Children + Parents',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓ (robotic, stem cell)', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months → 30 days (Jumpstart add-on)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Add-on; incl. IVF; newborn Day 1',
      'No-Claim Bonus (NCB)': 'Gullak: 100% guaranteed every year (even after claims) up to 10× base SI', 'NCB Protected on Claim?': '✓ Gullak — regardless of claims', 'Restore / Recharge SI': '✓ Unlimited; Anant Benefit: INFINITE SI for critical illness',
      'OPD Cover': '✓ OPD included', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ Healthy Lifestyle rewards', 'International Cover': '✓ Add-on',
      'Claim Settlement Ratio': '~99.9% (FY 2024–25)', 'Incurred Claims Ratio': '~65%', 'Network Hospitals': '10,000+',
      'Best Suited For': 'Gullak: guaranteed 100% SI boost every year up to 10×; Anant INFINITE SI for critical illness — unique in market', 'Watch Out For': 'Maternity via add-on; entry age limit 65 (lifetime renewal after)',
    },
    'TATA AIG|Medicare Premier': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹3 Cr', 'Entry Age — Adults': '18–65 yrs (parents 65+)', 'Entry Age — Children': '91 days', 'Family Size': 'Self + Spouse + Children + Parents/PIL (65+)',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Add-on',
      'No-Claim Bonus (NCB)': '25% p.a. up to 100%; Super Credit add-on: guaranteed boost regardless of claims', 'NCB Protected on Claim?': 'Reduces; Super Credit add-on protects', 'Restore / Recharge SI': '✓ Unlimited restorations',
      'OPD Cover': '✓ Add-on', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ TATA AIG app; wellness points', 'International Cover': '✓ Add-on',
      'Claim Settlement Ratio': '~100% — IRDAI Rank 1 FY24', 'Incurred Claims Ratio': '~78%', 'Network Hospitals': '10,000+',
      'Best Suited For': 'IRDAI Rank 1 CSR; covers parents 65+ in floater; 3-yr policy option; Super Credit boosts SI annually', 'Watch Out For': 'PED at 36 months; maternity via add-on only',
    },
    'TATA AIG|Medicare Plus': {
      'Plan Type': 'Super Top-Up', 'Sum Insured Range': '₹5L – ₹3 Cr', 'Entry Age — Adults': '18 yrs – no limit', 'Entry Age — Children': '91 days', 'Family Size': 'Individual or Floater',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✗',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✗',
      'No-Claim Bonus (NCB)': 'N/A (top-up plan)', 'NCB Protected on Claim?': 'N/A', 'Restore / Recharge SI': '✓ Restores above deductible',
      'OPD Cover': '✗', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': 'Limited', 'International Cover': '✗',
      'Claim Settlement Ratio': '~100% — IRDAI Rank 1 FY24', 'Incurred Claims Ratio': '~78%', 'Network Hospitals': '10,000+',
      'Best Suited For': 'Best value top-up to augment a weak base policy; unlimited restore above deductible', 'Watch Out For': 'Requires an existing base policy; no maternity or domiciliary cover',
    },
    'Care Health|Care Supreme': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹1 Cr', 'Entry Age — Adults': '18–65 yrs; no upper limit at renewal', 'Entry Age — Children': '91 days', 'Family Size': 'Up to 6 Adults',
      'Room Rent': 'No cap (any room)', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '60 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓ (incl. robotic)', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months (reducible w/ add-on)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Add-on; 24 months waiting',
      'No-Claim Bonus (NCB)': '25% p.a. up to 100%', 'NCB Protected on Claim?': '✓ (add-on)', 'Restore / Recharge SI': '✓ Unlimited auto-recharge',
      'OPD Cover': '✓ Add-on; unlimited e-consults', 'Annual Health Check-Up': '✓ Day 1', 'Wellness / Reward Programme': '✓ Discounts for healthy habits', 'International Cover': '✗',
      'Claim Settlement Ratio': '~98–100% (FY 2024–25)', 'Incurred Claims Ratio': '~58%', 'Network Hospitals': '11,400+',
      'Best Suited For': 'Unlimited recharge + NCB doesn\'t reduce; best all-round family plan; healthy ICR of ~58%', 'Watch Out For': 'No international cover; maternity via add-on',
    },
    'Care Health|Care Advantage': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹25L – ₹6 Cr', 'Entry Age — Adults': '18 yrs – no limit', 'Entry Age — Children': '91 days', 'Family Size': 'Self + Spouse + 4 Children',
      'Room Rent': 'No cap', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '60 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '12 months — best in set', 'Specific Illness Waiting': '12 months', 'Maternity Cover': '✗ (base plan)',
      'No-Claim Bonus (NCB)': '10% p.a. up to 50%', 'NCB Protected on Claim?': '✗', 'Restore / Recharge SI': '✓ 100% unlimited',
      'OPD Cover': '✗ (base)', 'Annual Health Check-Up': '✓ Day 1', 'Wellness / Reward Programme': 'Basic', 'International Cover': '✗',
      'Claim Settlement Ratio': '~98–100% (FY 2024–25)', 'Incurred Claims Ratio': '~58%', 'Network Hospitals': '11,400+',
      'Best Suited For': 'Best for seniors — PED from Year 1 (12 months); no room cap; very high SI up to ₹6 Cr', 'Watch Out For': 'No maternity in base plan; limited wellness features; lower NCB cap',
    },
    'Care Health|Care': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹3L – ₹75L', 'Entry Age — Adults': '18–65 yrs', 'Entry Age — Children': '91 days', 'Family Size': 'Self + Spouse + 4 Children',
      'Room Rent': 'Single private room (sub-limit)', 'Co-Pay': '20% if entry ≥ 61 yrs', 'Pre-Hospitalisation': '30 days', 'Post-Hospitalisation': '60 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✗ (base plan)',
      'No-Claim Bonus (NCB)': '10% p.a. up to 50%', 'NCB Protected on Claim?': '✗', 'Restore / Recharge SI': '✓ 100% once/yr',
      'OPD Cover': '✗', 'Annual Health Check-Up': '✓ Day 1', 'Wellness / Reward Programme': 'Basic', 'International Cover': '✗',
      'Claim Settlement Ratio': '~98–100% (FY 2024–25)', 'Incurred Claims Ratio': '~58%', 'Network Hospitals': '11,400+',
      'Best Suited For': 'Affordable entry plan; wide SI range ₹3L–₹75L', 'Watch Out For': 'Room rent sub-limit; 20% co-pay for seniors; post-hosp only 60 days',
    },
    'Aditya Birla Health|Activ One': {
      'Plan Type': 'Individual / Floater (7 variants)', 'Sum Insured Range': '₹5L – ₹6 Cr', 'Entry Age — Adults': '18 yrs – no limit', 'Entry Age — Children': '91 days', 'Family Size': 'Flexible; multi-generation',
      'Room Rent': 'No cap (SI ≥ ₹7L); 1% per day for ₹5L SI', 'Co-Pay': 'Zero', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months (VYTL: Day 1 for 7 chronic conditions)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ VIP/VIP+ variants; VIP+ covers intl. delivery',
      'No-Claim Bonus (NCB)': 'NCB non-erosive; grows up to 100% base SI', 'NCB Protected on Claim?': '✓ Non-erosive NCB', 'Restore / Recharge SI': '✓ Super Reload — 150% unrelated; unlimited in MAX+',
      'OPD Cover': '✓ Tele-OPD + Chronic Care OPD (VYTL)', 'Annual Health Check-Up': '✓', 'Wellness / Reward Programme': '✓ HealthReturns — up to 100% premium back', 'International Cover': '✓ VIP (excl. USA/CAN); VIP+ (incl. USA/CAN)',
      'Claim Settlement Ratio': '~96% (FY 2024–25)', 'Incurred Claims Ratio': '~65%', 'Network Hospitals': '12,000+',
      'Best Suited For': 'HealthReturns up to 100% premium back; VYTL Day 1 chronic cover; VIP+ global cover incl. USA/CAN', 'Watch Out For': 'Room rent cap at ₹5L SI; best features available in higher variants only',
    },
    'Star Health|Super Star Value': {
      'Plan Type': 'Individual / Floater', 'Sum Insured Range': '₹5L – ₹1 Cr (+ Unlimited Limitless Care)', 'Entry Age — Adults': '18 yrs – no limit; max SI ₹50L for 65+', 'Entry Age — Children': '91 days', 'Family Size': '2 Adults + 4 Children',
      'Room Rent': 'No cap (Premium variant)', 'Co-Pay': 'Zero (entry before 61); voluntary co-pay add-on available', 'Pre-Hospitalisation': '90 days', 'Post-Hospitalisation': '180 days', 'Day Care Procedures': '✓', 'AYUSH Cover': '✓', 'Modern Treatments': '✓ (robotic, oral chemo)', 'Domiciliary / Home Care': '✓',
      'Initial Waiting Period': '30 days', 'Pre-Existing Diseases (PED)': '36 months → Day 31 (Quick Shield add-on)', 'Specific Illness Waiting': '24 months', 'Maternity Cover': '✓ Add-on; max 4 deliveries; newborn Day 1',
      'No-Claim Bonus (NCB)': '50% p.a.; Super Star Bonus add-on: NCB never reduces on claim', 'NCB Protected on Claim?': '✓ Super Star Bonus add-on', 'Restore / Recharge SI': '✓ Unlimited auto after every claim',
      'OPD Cover': '✓ Annual check-up 1% SI; unlimited tele-consults', 'Annual Health Check-Up': '✓ Day 1', 'Wellness / Reward Programme': '✓ Freeze Your Age: premium locked to entry age until claim (entry ≤ 50)', 'International Cover': '✗',
      'Claim Settlement Ratio': '~88% — below 90% benchmark ⚠', 'Incurred Claims Ratio': '~65%', 'Network Hospitals': '14,000+',
      'Best Suited For': 'Freeze Your Age premium lock (entry ≤ 50); Limitless Care one unlimited lifetime claim; 21 add-on options', 'Watch Out For': 'CSR ~88% — notably below the 90% benchmark; higher probability of claim disputes on large claims',
    },
  };

  private io?: IntersectionObserver;
  private sectionObserver?: IntersectionObserver;

  constructor(private cdr: ChangeDetectorRef, private videoModal: VideoModalService) { }

  /** Opens the explainer video inline; falls back to a new tab when there's no known videoId. */
  openVideo(v: VideoItem, event: Event): void {
    event.preventDefault();
    if (v.videoId) {
      this.videoModal.open(v.videoId, v.title || v.topic);
    } else {
      window.open(v.url, '_blank', 'noopener');
    }
  }

  // ---------- Lifecycle ----------
  ngAfterViewInit(): void {
    this.setupReveal();
    this.setupSectionSpy();
    this.enrichVideos();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
    this.sectionObserver?.disconnect();
    document.body.style.overflow = '';
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

  get showMoreLabel(): string {
    return this.showAllPlans ? 'Show fewer plans ↑' : 'Show 6 more plans ↓';
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
    return '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }
}