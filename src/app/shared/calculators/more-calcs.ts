/* =============================================================
   Extra calculators for /calculators.
   Each one is a definition (inputs + formula) rendered by
   CalculatorsComponent, so adding or tweaking a calculator only
   touches this file. Everything runs in the browser; no backend.

   Defaults and rules were signed off in Oct 2026. Tax rules are
   FY 2025-26 (AY 2026-27): re-check them after every Budget.
   ============================================================= */

export type FieldFmt = 'money' | 'pct' | 'yrs' | 'age' | 'num';

export type MoreField =
  | { kind: 'range'; key: string; label: string; min: number; max: number; step: number; def: number; fmt: FieldFmt }
  | { kind: 'stepper'; key: string; label: string; min: number; max: number; step: number; def: number; fmt: FieldFmt }
  | { kind: 'select'; key: string; label: string; def: number; options: { v: number; l: string }[] };

export interface MoreResult {
  label: string;
  value: string;
  /** '₹' for money results, '' for text results. */
  unit: string;
  note: string;
  /** Plain sentence used in the pre-filled WhatsApp message. */
  wa: string;
}

export interface MoreCalc {
  id: string;
  group: 'protect' | 'grow' | 'goals' | 'tax';
  /** Colour theme: reuses the existing card variants. */
  theme: 'life' | 'guaranteed' | 'health' | 'fire' | 'tax';
  icon: string;
  title: string;
  sub: string;
  teaser: string;
  fields: MoreField[];
  compute: (v: Record<string, number>) => MoreResult;
}

export const MORE_GROUPS: { id: MoreCalc['group']; title: string }[] = [
  { id: 'protect', title: 'Protect your family' },
  { id: 'grow', title: 'Grow your money' },
  { id: 'goals', title: 'Plan for big goals' },
  { id: 'tax', title: 'Save tax' },
];

/** Shown under every result. */
export const ESTIMATE_NOTE = 'Estimates only, based on the assumptions shown. Not financial or tax advice.';

// ---------------------------------------------------------------- helpers
export function inr(n: number): string {
  const x = Math.round(Math.max(0, n)).toString();
  const last3 = x.slice(-3);
  const other = x.slice(0, -3);
  return other ? other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
}
/** 1,20,00,000 -> '1.20 Cr', 4,50,000 -> '4.5 L', below 1 lakh in full. */
export function money(n: number): string {
  return n >= 1e7 ? (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n / 1e5).toFixed(1) + ' L' : inr(n);
}
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const pct = (n: number) => n / 100;

/** Future value of a monthly SIP (paid at the start of each month). */
function sipFV(monthly: number, annualPct: number, years: number): number {
  const i = pct(annualPct) / 12, n = years * 12;
  if (n <= 0) { return 0; }
  return i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}
/** Monthly SIP needed to reach a target. */
function sipNeeded(target: number, annualPct: number, years: number): number {
  if (target <= 0 || years <= 0) { return 0; }
  return target / sipFV(1, annualPct, years);
}

function slabTax(income: number, slabs: [number, number][]): number {
  let tax = 0, prev = 0;
  for (const [upto, rate] of slabs) {
    if (income <= prev) { break; }
    tax += (Math.min(income, upto) - prev) * rate;
    prev = upto;
  }
  return tax;
}
/** New regime, FY 2025-26: ₹75,000 standard deduction, nil tax up to ₹12 lakh taxable (87A), with marginal relief. */
export function newRegimeTax(gross: number): number {
  const taxable = Math.max(0, gross - 75000);
  let t = slabTax(taxable, [[4e5, 0], [8e5, .05], [12e5, .10], [16e5, .15], [20e5, .20], [24e5, .25], [Infinity, .30]]);
  t = taxable <= 12e5 ? 0 : Math.min(t, taxable - 12e5);
  return t * 1.04;
}
/** Old regime, FY 2025-26, below 60: ₹50,000 standard deduction, nil tax up to ₹5 lakh taxable (87A). */
export function oldRegimeTax(gross: number, deductions: number): number {
  const taxable = Math.max(0, gross - 50000 - deductions);
  let t = slabTax(taxable, [[2.5e5, 0], [5e5, .05], [10e5, .20], [Infinity, .30]]);
  if (taxable <= 5e5) { t = 0; }
  return t * 1.04;
}

// ---------------------------------------------------------------- definitions
const I = 'assets/images/icons/';

export const MORE_CALCS: MoreCalc[] = [
  // ======================= Protect
  {
    id: 'hlv', group: 'protect', theme: 'life', icon: I + '07_Term_Life_Insurance.png',
    title: 'What is my Human Life Value?', sub: 'The income your family would lose.',
    teaser: 'Adds up the income you would earn until retirement, after your own expenses, in today\'s money, then adds loans and subtracts what you already have.',
    fields: [
      { kind: 'range', key: 'inc', label: 'Annual income', min: 200000, max: 20000000, step: 100000, def: 1200000, fmt: 'money' },
      { kind: 'range', key: 'age', label: 'Your age', min: 20, max: 60, step: 1, def: 30, fmt: 'age' },
      { kind: 'range', key: 'ret', label: 'Retirement age', min: 45, max: 70, step: 1, def: 60, fmt: 'age' },
      { kind: 'range', key: 'exp', label: 'Your own expenses (% of income)', min: 10, max: 60, step: 5, def: 30, fmt: 'pct' },
      { kind: 'range', key: 'gr', label: 'Yearly income growth', min: 0, max: 12, step: 1, def: 6, fmt: 'pct' },
      { kind: 'range', key: 'loans', label: 'Outstanding loans', min: 0, max: 20000000, step: 100000, def: 0, fmt: 'money' },
      { kind: 'range', key: 'have', label: 'Existing life cover + savings', min: 0, max: 50000000, step: 100000, def: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const years = Math.max(0, v['ret'] - v['age']);
      const r = 0.07;
      let pv = 0;
      for (let t = 0; t < years; t++) { pv += v['inc'] * (1 - pct(v['exp'])) * Math.pow(1 + pct(v['gr']), t) / Math.pow(1 + r, t + 1); }
      const need = roundTo(Math.max(0, pv + v['loans'] - v['have']), 100000);
      return {
        label: 'Life cover you need', value: money(need), unit: '₹',
        note: `${years} working years of income, discounted at 7%, plus loans, less existing cover and savings.`,
        wa: `the Human Life Value calculator says I need about ₹${money(need)} of life cover`,
      };
    },
  },
  {
    id: 'ci', group: 'protect', theme: 'health', icon: I + '15_Critical_Illness.png',
    title: 'How much critical illness cover?', sub: 'Treatment plus time off work.',
    teaser: 'A lump sum for cancer, heart attack or stroke: the treatment, plus the income you lose while you recover.',
    fields: [
      { kind: 'select', key: 'city', label: 'City', def: 1, options: [{ v: 1, l: 'Metro' }, { v: 2, l: 'Tier 1 city' }, { v: 3, l: 'Tier 2 / smaller city' }] },
      { kind: 'range', key: 'inc', label: 'Annual income', min: 200000, max: 10000000, step: 100000, def: 1200000, fmt: 'money' },
      { kind: 'stepper', key: 'yrs', label: 'Years of income to replace', min: 1, max: 5, step: 1, def: 3, fmt: 'yrs' },
      { kind: 'range', key: 'have', label: 'Existing critical illness cover', min: 0, max: 10000000, step: 100000, def: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const treat = v['city'] === 1 ? 1500000 : v['city'] === 2 ? 1200000 : 1000000;
      const need = roundTo(Math.max(0, treat + v['inc'] * v['yrs'] - v['have']), 100000);
      return {
        label: 'Critical illness cover', value: money(need), unit: '₹',
        note: `₹${money(treat)} for treatment plus ${v['yrs']} years of income, less existing cover.`,
        wa: `the critical illness calculator suggests about ₹${money(need)} of cover`,
      };
    },
  },
  {
    id: 'pa', group: 'protect', theme: 'life', icon: I + '14_Personal_Accident.png',
    title: 'How much accident cover?', sub: 'If an accident stops you working.',
    teaser: 'Based on about 100 months of income, adjusted for how risky your work is, plus any loans.',
    fields: [
      { kind: 'range', key: 'inc', label: 'Monthly income', min: 10000, max: 500000, step: 5000, def: 75000, fmt: 'money' },
      { kind: 'select', key: 'occ', label: 'Type of work', def: 1, options: [{ v: 1, l: 'Desk / office job' }, { v: 2, l: 'Field work or frequent travel' }, { v: 3, l: 'Manual or heavy work' }] },
      { kind: 'range', key: 'loans', label: 'Outstanding loans', min: 0, max: 10000000, step: 100000, def: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const mult = v['occ'] === 1 ? 100 : v['occ'] === 2 ? 110 : 120;
      const need = roundTo(v['inc'] * mult + v['loans'], 50000);
      return {
        label: 'Accident cover', value: money(need), unit: '₹',
        note: `${mult}× monthly income plus outstanding loans.`,
        wa: `the accident cover calculator suggests about ₹${money(need)} of personal accident cover`,
      };
    },
  },
  {
    id: 'medinf', group: 'protect', theme: 'health', icon: I + '08_Health.png',
    title: 'What will a hospital bill cost later?', sub: 'Medical costs rise faster than prices.',
    teaser: 'Shows what today\'s treatment cost becomes with medical inflation, so you can pick cover that keeps up.',
    fields: [
      { kind: 'range', key: 'cost', label: 'Treatment cost today', min: 50000, max: 2500000, step: 50000, def: 500000, fmt: 'money' },
      { kind: 'range', key: 'yrs', label: 'Years from now', min: 1, max: 30, step: 1, def: 10, fmt: 'yrs' },
      { kind: 'range', key: 'inf', label: 'Medical inflation', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
    ],
    compute: (v) => {
      const future = v['cost'] * Math.pow(1 + pct(v['inf']), v['yrs']);
      return {
        label: `Cost in ${v['yrs']} years`, value: money(future), unit: '₹',
        note: `₹${money(v['cost'])} today, growing at ${v['inf']}% a year.`,
        wa: `the medical inflation calculator shows a ₹${money(v['cost'])} hospital bill today could cost ₹${money(future)} in ${v['yrs']} years`,
      };
    },
  },

  // ======================= Grow
  {
    id: 'sip', group: 'grow', theme: 'guaranteed', icon: I + '10_Market_Linked_Investment.png',
    title: 'SIP calculator', sub: 'What a monthly investment grows to.',
    teaser: 'See how a fixed monthly investment could grow at an assumed yearly return. Market returns are not guaranteed.',
    fields: [
      { kind: 'range', key: 'amt', label: 'Monthly investment', min: 500, max: 200000, step: 500, def: 10000, fmt: 'money' },
      { kind: 'range', key: 'yrs', label: 'Investment period', min: 1, max: 40, step: 1, def: 15, fmt: 'yrs' },
      { kind: 'range', key: 'ret', label: 'Expected yearly return', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
    ],
    compute: (v) => {
      const fv = sipFV(v['amt'], v['ret'], v['yrs']);
      const invested = v['amt'] * v['yrs'] * 12;
      return {
        label: 'Expected value', value: money(fv), unit: '₹',
        note: `You invest ₹${money(invested)} · Estimated gains ₹${money(fv - invested)} at ${v['ret']}% a year.`,
        wa: `the SIP calculator shows ₹${inr(v['amt'])} a month for ${v['yrs']} years could grow to about ₹${money(fv)}`,
      };
    },
  },
  {
    id: 'lump', group: 'grow', theme: 'guaranteed', icon: I + '11_Non_Guaranteed_Investment.png',
    title: 'Lump sum calculator', sub: 'Growth of a one-time investment.',
    teaser: 'See how a single investment could grow over time at an assumed yearly return.',
    fields: [
      { kind: 'range', key: 'amt', label: 'Amount invested', min: 10000, max: 10000000, step: 10000, def: 500000, fmt: 'money' },
      { kind: 'range', key: 'yrs', label: 'Investment period', min: 1, max: 40, step: 1, def: 10, fmt: 'yrs' },
      { kind: 'range', key: 'ret', label: 'Expected yearly return', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
    ],
    compute: (v) => {
      const fv = v['amt'] * Math.pow(1 + pct(v['ret']), v['yrs']);
      return {
        label: 'Expected value', value: money(fv), unit: '₹',
        note: `₹${money(v['amt'])} invested once · Estimated gains ₹${money(fv - v['amt'])}.`,
        wa: `the lump sum calculator shows ₹${money(v['amt'])} invested for ${v['yrs']} years could grow to about ₹${money(fv)}`,
      };
    },
  },
  {
    id: 'edu', group: 'goals', theme: 'life', icon: I + '18_Family_Floater.png',
    title: 'Child education planner', sub: 'Save for college, starting now.',
    teaser: 'Works out what your child\'s education will cost when they need it, and the monthly saving to get there.',
    fields: [
      { kind: 'range', key: 'age', label: 'Child\'s age today', min: 0, max: 17, step: 1, def: 3, fmt: 'age' },
      { kind: 'range', key: 'at', label: 'Age when the course starts', min: 16, max: 25, step: 1, def: 18, fmt: 'age' },
      { kind: 'range', key: 'cost', label: 'Course cost today', min: 100000, max: 10000000, step: 100000, def: 2000000, fmt: 'money' },
      { kind: 'range', key: 'inf', label: 'Education cost inflation', min: 6, max: 14, step: 0.5, def: 10, fmt: 'pct' },
      { kind: 'range', key: 'ret', label: 'Expected yearly return', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
      { kind: 'range', key: 'have', label: 'Already saved for this', min: 0, max: 5000000, step: 50000, def: 0, fmt: 'money' },
    ],
    compute: (v) => goalResult(v['at'] - v['age'], v['cost'], v['inf'], v['ret'], v['have'], 'your child\'s education'),
  },
  {
    id: 'wed', group: 'goals', theme: 'fire', icon: I + '02_Term_Insurance_Women.png',
    title: 'Child marriage planner', sub: 'Plan the big day without loans.',
    teaser: 'Works out the future cost of a wedding and how much to save each month.',
    fields: [
      { kind: 'range', key: 'age', label: 'Child\'s age today', min: 0, max: 30, step: 1, def: 5, fmt: 'age' },
      { kind: 'range', key: 'at', label: 'Expected age at marriage', min: 20, max: 35, step: 1, def: 27, fmt: 'age' },
      { kind: 'range', key: 'cost', label: 'Wedding cost today', min: 200000, max: 10000000, step: 100000, def: 1500000, fmt: 'money' },
      { kind: 'range', key: 'inf', label: 'Yearly cost increase', min: 4, max: 12, step: 0.5, def: 7, fmt: 'pct' },
      { kind: 'range', key: 'ret', label: 'Expected yearly return', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
      { kind: 'range', key: 'have', label: 'Already saved for this', min: 0, max: 5000000, step: 50000, def: 0, fmt: 'money' },
    ],
    compute: (v) => goalResult(v['at'] - v['age'], v['cost'], v['inf'], v['ret'], v['have'], 'the wedding'),
  },
  {
    id: 'retire', group: 'grow', theme: 'fire', icon: I + 'calculators/fire-number.png',
    title: 'Retirement planner', sub: 'The corpus you need, and how to get there.',
    teaser: 'Estimates the savings you need at retirement to cover your expenses for life, and the monthly saving to build it.',
    fields: [
      { kind: 'range', key: 'age', label: 'Your age', min: 20, max: 55, step: 1, def: 30, fmt: 'age' },
      { kind: 'range', key: 'ret', label: 'Retirement age', min: 40, max: 70, step: 1, def: 60, fmt: 'age' },
      { kind: 'range', key: 'life', label: 'Plan until age', min: 70, max: 95, step: 1, def: 85, fmt: 'age' },
      { kind: 'range', key: 'exp', label: 'Monthly expenses today', min: 10000, max: 500000, step: 5000, def: 50000, fmt: 'money' },
      { kind: 'range', key: 'inf', label: 'Inflation', min: 3, max: 10, step: 0.5, def: 6, fmt: 'pct' },
      { kind: 'range', key: 'pre', label: 'Return before retirement', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
      { kind: 'range', key: 'post', label: 'Return after retirement', min: 4, max: 10, step: 0.5, def: 7, fmt: 'pct' },
      { kind: 'range', key: 'have', label: 'Retirement savings so far', min: 0, max: 50000000, step: 100000, def: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const n = Math.max(1, v['ret'] - v['age']);
      const m = Math.max(1, v['life'] - v['ret']);
      const yearly = v['exp'] * 12 * Math.pow(1 + pct(v['inf']), n);
      const rr = (1 + pct(v['post'])) / (1 + pct(v['inf'])) - 1;
      const corpus = Math.abs(rr) < 1e-6 ? yearly * m : yearly * (1 - Math.pow(1 + rr, -m)) / rr * (1 + rr);
      const gap = Math.max(0, corpus - v['have'] * Math.pow(1 + pct(v['pre']), n));
      const sip = sipNeeded(gap, v['pre'], n);
      return {
        label: 'Save every month', value: inr(roundTo(sip, 100)), unit: '₹',
        note: `Target corpus ₹${money(corpus)} at ${v['ret']}, to cover ₹${money(yearly)}/yr of expenses for ${m} years.`,
        wa: `the retirement planner says I need a corpus of about ₹${money(corpus)} and should save ₹${inr(roundTo(sip, 100))} a month`,
      };
    },
  },
  {
    id: 'inflation', group: 'grow', theme: 'tax', icon: I + 'general/low-cost.png',
    title: 'Inflation calculator', sub: 'What money is really worth later.',
    teaser: 'See what something that costs ₹X today will cost in future, and what today\'s money will buy then.',
    fields: [
      { kind: 'range', key: 'amt', label: 'Amount today', min: 1000, max: 10000000, step: 1000, def: 100000, fmt: 'money' },
      { kind: 'range', key: 'yrs', label: 'Years from now', min: 1, max: 40, step: 1, def: 10, fmt: 'yrs' },
      { kind: 'range', key: 'inf', label: 'Inflation', min: 3, max: 10, step: 0.5, def: 6, fmt: 'pct' },
    ],
    compute: (v) => {
      const future = v['amt'] * Math.pow(1 + pct(v['inf']), v['yrs']);
      const worth = v['amt'] / Math.pow(1 + pct(v['inf']), v['yrs']);
      return {
        label: `Same thing in ${v['yrs']} years`, value: money(future), unit: '₹',
        note: `And ₹${money(v['amt'])} then will buy only what ₹${money(worth)} buys today.`,
        wa: `the inflation calculator shows ₹${money(v['amt'])} today becomes ₹${money(future)} in ${v['yrs']} years`,
      };
    },
  },
  {
    id: 'goal', group: 'goals', theme: 'guaranteed', icon: I + '16_Travel.png',
    title: 'Goal planner', sub: 'A house, a car, a trip. Any goal.',
    teaser: 'Pick a goal, its cost today and when you need it: see the monthly saving to get there.',
    fields: [
      { kind: 'select', key: 'type', label: 'Your goal', def: 1, options: [{ v: 1, l: 'House down payment' }, { v: 2, l: 'Car' }, { v: 3, l: 'Foreign holiday' }, { v: 4, l: 'Something else' }] },
      { kind: 'range', key: 'cost', label: 'Cost today', min: 50000, max: 10000000, step: 50000, def: 1000000, fmt: 'money' },
      { kind: 'range', key: 'yrs', label: 'Years until you need it', min: 1, max: 30, step: 1, def: 5, fmt: 'yrs' },
      { kind: 'range', key: 'inf', label: 'Inflation', min: 3, max: 10, step: 0.5, def: 6, fmt: 'pct' },
      { kind: 'range', key: 'ret', label: 'Expected yearly return', min: 6, max: 15, step: 0.5, def: 12, fmt: 'pct' },
      { kind: 'range', key: 'have', label: 'Already saved for this', min: 0, max: 5000000, step: 50000, def: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const name = ['your house down payment', 'your car', 'your holiday', 'your goal'][v['type'] - 1] ?? 'your goal';
      return goalResult(v['yrs'], v['cost'], v['inf'], v['ret'], v['have'], name);
    },
  },

  // ======================= Loans, tax, policies
  {
    id: 'emi', group: 'goals', theme: 'tax', icon: I + '17_Home_Cozy.png',
    title: 'Home loan EMI calculator', sub: 'Your EMI and total interest.',
    teaser: 'Monthly EMI, total interest and total payable for any loan amount, rate and tenure.',
    fields: [
      { kind: 'range', key: 'amt', label: 'Loan amount', min: 100000, max: 50000000, step: 100000, def: 5000000, fmt: 'money' },
      { kind: 'range', key: 'rate', label: 'Interest rate', min: 6, max: 15, step: 0.05, def: 8.5, fmt: 'pct' },
      { kind: 'range', key: 'yrs', label: 'Tenure', min: 1, max: 30, step: 1, def: 20, fmt: 'yrs' },
    ],
    compute: (v) => {
      const i = pct(v['rate']) / 12, n = v['yrs'] * 12;
      const emi = i === 0 ? v['amt'] / n : v['amt'] * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
      const total = emi * n;
      return {
        label: 'Monthly EMI', value: inr(emi), unit: '₹',
        note: `Total interest ₹${money(total - v['amt'])} · Total payable ₹${money(total)}.`,
        wa: `the EMI calculator shows an EMI of ₹${inr(emi)} on a ₹${money(v['amt'])} loan for ${v['yrs']} years. I'd like loan protection cover`,
      };
    },
  },
  {
    id: 'regime', group: 'tax', theme: 'tax', icon: I + 'calculators/tax-savings.png',
    title: 'Old vs new tax regime', sub: 'Which one saves you more? (FY 2025-26)',
    teaser: 'Compares your income tax under both regimes, including insurance and other deductions. For salaried individuals below 60.',
    fields: [
      { kind: 'range', key: 'inc', label: 'Annual salary (gross)', min: 300000, max: 5000000, step: 50000, def: 1500000, fmt: 'money' },
      { kind: 'range', key: 'c80', label: '80C: life insurance, PF, ELSS, etc.', min: 0, max: 150000, step: 5000, def: 150000, fmt: 'money' },
      { kind: 'range', key: 'd80', label: '80D: health insurance premiums', min: 0, max: 100000, step: 5000, def: 25000, fmt: 'money' },
      { kind: 'range', key: 'hra', label: 'HRA exemption', min: 0, max: 500000, step: 10000, def: 0, fmt: 'money' },
      { kind: 'range', key: 'home', label: 'Home loan interest (24b)', min: 0, max: 200000, step: 10000, def: 0, fmt: 'money' },
      { kind: 'range', key: 'nps', label: 'NPS 80CCD(1B)', min: 0, max: 50000, step: 5000, def: 0, fmt: 'money' },
    ],
    compute: (v) => {
      const ded = v['c80'] + v['d80'] + v['hra'] + v['home'] + v['nps'];
      const oldT = oldRegimeTax(v['inc'], ded);
      const newT = newRegimeTax(v['inc']);
      const diff = Math.abs(oldT - newT);
      const better = diff < 1 ? 'Both are the same' : newT < oldT ? 'New regime' : 'Old regime';
      return {
        label: diff < 1 ? 'Tax is the same' : `${better} saves you`, value: diff < 1 ? '0' : inr(diff), unit: '₹',
        note: `Old regime: ₹${inr(oldT)} · New regime: ₹${inr(newT)} (incl. 4% cess). Surcharge above ₹50 lakh not included.`,
        wa: diff < 1 ? 'the tax regime calculator shows the same tax under both regimes'
          : `the tax regime calculator says the ${better.toLowerCase()} saves me about ₹${inr(diff)} a year`,
      };
    },
  },
  {
    id: 'taxfree', group: 'tax', theme: 'health', icon: I + 'general/tax-benefit.png',
    title: 'Is my maturity amount tax-free?', sub: 'Section 10(10D) check.',
    teaser: 'Checks the premium limits that decide whether a life policy\'s maturity payout is tax-free. Death benefits are always tax-free.',
    fields: [
      { kind: 'select', key: 'type', label: 'Policy type', def: 1, options: [{ v: 1, l: 'Traditional (endowment, money-back, guaranteed)' }, { v: 2, l: 'ULIP' }] },
      { kind: 'select', key: 'when', label: 'Policy issued', def: 5, options: [
        { v: 1, l: 'Before April 2003' }, { v: 2, l: 'April 2003 – March 2012' }, { v: 3, l: 'April 2012 – January 2021' },
        { v: 4, l: 'February 2021 – March 2023' }, { v: 5, l: 'April 2023 or later' }] },
      { kind: 'range', key: 'prem', label: 'Yearly premium (this policy)', min: 5000, max: 2000000, step: 5000, def: 100000, fmt: 'money' },
      { kind: 'range', key: 'sa', label: 'Sum assured', min: 100000, max: 50000000, step: 100000, def: 1500000, fmt: 'money' },
      { kind: 'range', key: 'agg', label: 'Yearly premium on all such policies', min: 0, max: 3000000, step: 10000, def: 100000, fmt: 'money' },
    ],
    compute: (v) => {
      const reasons: string[] = [];
      const limit = v['when'] === 1 ? 0 : v['when'] === 2 ? 0.20 : 0.10;
      if (limit && v['prem'] > limit * v['sa']) { reasons.push(`the premium is more than ${limit * 100}% of the sum assured`); }
      const agg = Math.max(v['agg'], v['prem']);
      if (v['type'] === 2 && v['when'] >= 4 && agg > 250000) { reasons.push('total ULIP premiums are above ₹2.5 lakh a year (ULIPs issued from Feb 2021)'); }
      if (v['type'] === 1 && v['when'] === 5 && agg > 500000) { reasons.push('total premiums are above ₹5 lakh a year (traditional policies issued from April 2023)'); }
      const free = reasons.length === 0;
      return {
        label: 'Maturity payout', value: free ? 'Likely tax-free' : 'Likely taxable', unit: '',
        note: free ? 'Within the Section 10(10D) premium limits. Death benefits are tax-free either way.'
          : `Because ${reasons.join(', and ')}. Gains would be taxed as income. Death benefits are still tax-free.`,
        wa: `the 10(10D) checker says my policy's maturity payout is ${free ? 'likely tax-free' : 'likely taxable'}`,
      };
    },
  },
];

/** Shared result for "save for a future cost" goals. */
function goalResult(years: number, costToday: number, infPct: number, retPct: number, have: number, name: string): MoreResult {
  if (years <= 0) {
    return {
      label: 'Time to goal', value: 'Due now', unit: '',
      note: 'The goal is due now or has passed. Talk to an advisor about options.',
      wa: `I need help funding ${name}, which is due now`,
    };
  }
  const future = costToday * Math.pow(1 + pct(infPct), years);
  const gap = Math.max(0, future - have * Math.pow(1 + pct(retPct), years));
  const sip = roundTo(sipNeeded(gap, retPct, years), 100);
  return {
    label: 'Save every month', value: inr(sip), unit: '₹',
    note: `${name.charAt(0).toUpperCase() + name.slice(1)} will cost about ₹${money(future)} in ${years} years, at ${infPct}% a year.`,
    wa: `the goal planner says ${name} will cost about ₹${money(future)} in ${years} years and I should save ₹${inr(sip)} a month`,
  };
}
