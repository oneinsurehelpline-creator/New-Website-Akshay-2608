/* =============================================================
   Site facts: the one source of truth for company numbers.
   Every page reads from here, so a figure is changed once and
   stays consistent everywhere.

   Live figures (policies issued, branches, advisors, employees)
   still come from the companyDetails API; POLICIES_FALLBACK is
   only shown before that loads.
   ============================================================= */

/** Date of incorporation / IRDAI registration (IRDA/DB 407/08). */
export const FOUNDED = new Date('2008-03-27');
export const FOUNDED_YEAR = FOUNDED.getFullYear();

/** Insurers we work with. */
export const INSURER_COUNT = '40+';

/** Cities with a OneInsure branch. */
export const CITY_COUNT = '20+';

/** Total social media following (Instagram, Facebook, YouTube, LinkedIn). */
export const SOCIAL_FOLLOWING = '15 lakh';

/** Shown until the live policies-issued figure arrives. */
export const POLICIES_FALLBACK = '5 lakh+';

/**
 * Counter figures rendered into the HTML (so crawlers, link previews and slow
 * connections never see 0). Replaced by the live companyDetails API values
 * once the page loads. Refresh these when the real numbers move.
 */
export const STATS_FALLBACK = {
  policies: 500000,
  managers: 801,
  branches: 100,
  employees: 1001,
};

/** Counter number format: 500000 → '5L', 1001 → '1,001'. */
export function formatCount(n: number): string {
  return n >= 100000 ? Math.round(n / 100000) + 'L' : n >= 1000 ? n.toLocaleString('en-IN') : String(n);
}

/** Complete years since founding; ticks over on the founding anniversary. */
export function yearsInBusiness(today: Date = new Date()): number {
  let years = today.getFullYear() - FOUNDED.getFullYear();
  const anniversary = new Date(today.getFullYear(), FOUNDED.getMonth(), FOUNDED.getDate());
  if (today < anniversary) { years--; }
  return years;
}

/** Short trust line used in page heroes, e.g. "18 years · 5 lakh+ policies". */
export function trustLine(): string {
  return `${yearsInBusiness()} years · ${POLICIES_FALLBACK} policies`;
}
