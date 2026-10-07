/* =============================================================
   Service Support content.
   Unified from the old oneinsure.com/service pages (one page per
   service × insurer): the documents and tips below are the ones most
   insurers ask for, rewritten in plain language. Insurer contacts are
   the most common website / helpline / email seen across those pages,
   updated for insurers that have since been renamed. Verify contacts
   periodically; they change.
   ============================================================= */

export type ServiceCategory = 'life' | 'health' | 'motor';
export type ServiceWay = 'website' | 'email' | 'call' | 'branch';

export interface ServiceCase {
  label: string;
  needs: string[];
  note?: string;
}

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  group: string;
  title: string;
  short: string;
  /** What to keep ready. Omitted when `cases` carries its own lists. */
  needs?: string[];
  /** Variants of the same request with different requirements (e.g. how long a policy has lapsed). */
  cases?: ServiceCase[];
  ways: ServiceWay[];
  tips: string[];
  /** Catch-all card: no checklist, just "talk to us". */
  other?: boolean;
}

export interface InsurerContact {
  id: string;
  name: string;
  formerly?: string;
  categories: ServiceCategory[];
  logo?: string;
  website: string;
  phone?: string;
  email?: string;
}

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; icon: string; blurb: string }[] = [
  { id: 'life', label: 'Life insurance', icon: 'assets/images/icons/calculators/life-cover.png', blurb: 'Term, savings and ULIP policies' },
  { id: 'health', label: 'Health insurance', icon: 'assets/images/icons/calculators/health-cover.png', blurb: 'Individual and family health cover' },
  { id: 'motor', label: 'Motor insurance', icon: 'assets/images/icons/09_Car_Bike_Motor.png', blurb: 'Car and two-wheeler policies' },
];

export const WAY_LABELS: Record<ServiceWay, string> = {
  website: 'Insurer website',
  email: 'Email',
  call: 'Phone',
  branch: 'Branch visit',
};

export const SERVICES: ServiceItem[] = [
  // ---------------------------------------------------------------- LIFE
  {
    id: 'life-tax-certificate', category: 'life', group: 'Documents & certificates',
    title: 'Tax certificate', short: 'Premium paid certificate to claim your tax deduction.',
    needs: ['Policy number', 'Date of birth of the life assured', 'Insurer website login (to download it yourself)', 'At a branch: request letter and ID proof of the policyholder'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: [
      'Most insurers can email it to your registered email ID.',
      'Life insurance premiums qualify under Section 80C, up to ₹1.5 lakh a year, if you file under the old tax regime.',
    ],
  },
  {
    id: 'life-lost-policy', category: 'life', group: 'Documents & certificates',
    title: 'Duplicate of a lost policy', short: 'Replace a lost or damaged policy document.',
    needs: ['Indemnity bond, notarised on stamp paper', 'ID proof of the policyholder', 'Address proof of the policyholder', 'Cheque for reprinting charges, if your insurer charges one'],
    ways: ['branch'],
    tips: [
      'The original policy document is needed for claims and most policy benefits.',
      'To avoid this in future, you can hold your policy electronically in an e-Insurance account.',
    ],
  },
  {
    id: 'life-policy-not-received', category: 'life', group: 'Documents & certificates',
    title: 'Policy document not received', short: 'Bought a policy but the document never arrived.',
    needs: ['Request letter or the insurer\'s service request form', 'ID proof of the policyholder', 'Policy or application number'],
    ways: ['branch', 'email'],
    tips: ['Keep the original safe once it arrives: it\'s needed for claims and most policy benefits.'],
  },
  {
    id: 'life-revive', category: 'life', group: 'Revive a lapsed policy',
    title: 'Revive a lapsed policy', short: 'Restart your cover after missed premiums.',
    cases: [
      { label: 'Lapsed under 6 months', needs: ['Policy number', 'Date of birth of the life assured', 'Payment for the due premiums'], note: 'Usually you just pay the due premiums online or at a branch.' },
      { label: '6 months to 1 year', needs: ['Declaration of good health form', 'ID proof of the policyholder', 'Payment for the due premiums'] },
      { label: 'Over 1 year', needs: ['Declaration of good health form', 'ID proof of the policyholder', 'Medical tests, if the insurer asks for them', 'Payment for the due premiums'] },
    ],
    ways: ['website', 'branch'],
    tips: [
      'A lapsed policy pays neither the base benefit nor any rider benefit.',
      'After the grace period a policy lapses or turns paid-up, depending on how many years of premium were paid.',
      'The insurer will tell you any interest or late fee due. Longer lapses may need medical tests.',
      'Cheques must be marked "A/c Payee". Cash is accepted only up to ₹49,999.',
    ],
  },
  {
    id: 'life-statement', category: 'life', group: 'Statements & status',
    title: 'Policy status or fund statement', short: 'Check if your policy is active, or see your fund value and bonus.',
    needs: ['Policy number', 'Date of birth of the life assured', 'Insurer website login (to check online)', 'At a branch: request letter and ID proof'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: [
      'Fund value shows how your ULIP investments are doing. Check it before switching funds.',
      'In some plans, if the fund value drops below a set minimum, the policy can be closed automatically.',
    ],
  },
  {
    id: 'life-freelook', category: 'life', group: 'Payouts',
    title: 'Cancel in the free-look period', short: 'Return a new policy you\'re not happy with.',
    needs: ['Service request form', 'Original policy document (or an indemnity bond if it\'s lost)', 'ID proof of the policyholder', 'Cancelled cheque, if your bank details aren\'t on record'],
    ways: ['branch'],
    tips: [
      'Apply within the free-look period stated in your policy, counted from the day you received it.',
      'For ULIPs the refund uses the NAV on the day you apply, so the amount can move with the market.',
    ],
  },
  {
    id: 'life-partial-withdrawal', category: 'life', group: 'Payouts',
    title: 'Partial withdrawal', short: 'Take out part of your fund value from a ULIP.',
    needs: ['Service request form', 'Cancelled cheque', 'ID proof of the policyholder', 'Copy of the policy schedule'],
    ways: ['branch'],
    tips: [
      'Allowed only when all due premiums are paid and the policy is active.',
      'Check how the withdrawal affects your cover and fund value before you apply.',
      'For policies under the Married Women\'s Property Act, the appointed trustee signs the form.',
    ],
  },
  {
    id: 'life-maturity', category: 'life', group: 'Payouts',
    title: 'Maturity or survival benefit', short: 'Receive the payout when your policy matures.',
    needs: ['Service request or discharge form', 'Original policy document (or an indemnity bond if it\'s lost)', 'Cancelled cheque', 'ID proof and PAN'],
    ways: ['branch'],
    tips: [
      'TDS may apply on the taxable part: 2% with a valid PAN, 20% without one.',
      'If you also asked for an address or bank change, that is processed first, then the payout.',
    ],
  },
  {
    id: 'life-cco', category: 'life', group: 'Changes to your policy',
    title: 'Continue cover without premiums', short: 'Use the cover continuance option in your ULIP.',
    needs: ['Request letter or service request form', 'ID proof of the policyholder'],
    ways: ['branch', 'email'],
    tips: [
      'Keeps your life and rider cover going even after you stop paying premiums. Only some plans offer it.',
      'Charges are deducted from your fund, and no further premiums are accepted once it starts.',
      'If the fund value falls to the minimum, the policy closes and the surrender value is paid.',
    ],
  },
  {
    id: 'life-rider', category: 'life', group: 'Changes to your policy',
    title: 'Add a rider', short: 'Add extra cover such as critical illness or accident.',
    needs: ['Request letter or service request form', 'ID proof of the policyholder', 'Medical tests, if the insurer asks for them'],
    ways: ['branch'],
    tips: [
      'Depends on your plan and the insurer\'s underwriting.',
      'Riders can\'t be added if the life assured is a minor, and some insurers don\'t allow them for NRI customers.',
    ],
  },
  {
    id: 'life-reduce-premium', category: 'life', group: 'Changes to your policy',
    title: 'Reduce your premium', short: 'Lower what you pay, with a matching change in cover.',
    needs: ['Request letter or service request form', 'ID proof of the policyholder', 'Assignee\'s signature, if the policy is assigned'],
    ways: ['branch'],
    tips: [
      'A lower premium reduces the sum assured and your future benefits.',
      'Apply at least 15 days before the premium due date. Not allowed once the policy is paid-up.',
      'The premium can\'t go below the plan\'s minimum.',
    ],
  },
  {
    id: 'life-sum-assured', category: 'life', group: 'Changes to your policy',
    title: 'Increase or decrease sum assured', short: 'Change how much cover your policy gives.',
    needs: ['Service request form', 'ID proof of the policyholder', 'Medical tests, if you\'re increasing cover'],
    ways: ['branch'],
    tips: ['Depends on your plan and the insurer\'s underwriting.'],
  },
  {
    id: 'life-fund-switch', category: 'life', group: 'Changes to your policy',
    title: 'Switch funds', short: 'Move your ULIP money between funds.',
    needs: ['Insurer website login (quickest)', 'Or: service request form and ID proof at a branch', 'Policy number and date of birth, if you call'],
    ways: ['website', 'call', 'branch'],
    tips: [
      'The fund you switch to must be different from the current one.',
      'Percentages across funds must add up to 100%, or the request is rejected.',
    ],
  },
  {
    id: 'life-other', category: 'life', group: 'Something else', other: true,
    title: 'Something else', short: 'A request that isn\'t listed here.',
    ways: [], tips: [],
  },

  // -------------------------------------------------------------- HEALTH
  {
    id: 'health-policy-copy', category: 'health', group: 'Policy documents',
    title: 'Policy copy not received', short: 'Bought or renewed, but no policy document yet.',
    needs: ['Policy number', 'Registered mobile number', 'Date of birth of an insured member', 'At a branch: request letter, photo ID and payment proof'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: [
      'You need the policy copy to file a claim or request cashless treatment.',
      'Check that any medical condition you declared appears correctly. Omissions can affect claims.',
    ],
  },
  {
    id: 'health-id-card', category: 'health', group: 'Policy documents',
    title: 'Health or cashless card not received', short: 'Get the card hospitals ask for at admission.',
    needs: ['Policy number', 'Registered mobile number or email ID', 'At a branch: request letter and photo ID'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: [
      'The card makes cashless claims smoother. It doesn\'t replace the policy.',
      'Name, age and gender on the card must match the policy. Get any errors corrected.',
    ],
  },
  {
    id: 'health-lost-policy', category: 'health', group: 'Policy documents',
    title: 'Duplicate of a lost policy', short: 'Replace a lost or damaged policy document.',
    needs: ['Policy number', 'Registered mobile number', 'Date of birth of an insured member', 'At a branch: request letter and photo ID'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: ['Asking for a soft copy by email is usually the quickest way to get a replacement.'],
  },
  {
    id: 'health-tax-certificate', category: 'health', group: 'Policy documents',
    title: 'Tax certificate', short: 'Premium certificate to claim your health insurance deduction.',
    needs: ['Policy number', 'Date of birth of an insured member', 'Registered mobile number', 'At a branch: request letter and photo ID'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: [
      'Most insurers can email it to your registered email ID.',
      'Health premiums qualify under Section 80D: up to ₹25,000 for yourself and family, plus up to ₹50,000 for senior-citizen parents, under the old tax regime.',
    ],
  },
  {
    id: 'health-renewal', category: 'health', group: 'Renewal & cover',
    title: 'Renew your policy', short: 'Renew on time so your cover and benefits continue.',
    needs: ['Policy number', 'Date of birth of an insured member', 'Registered mobile number', 'Renewal notice and payment, if renewing at a branch'],
    ways: ['website', 'call', 'branch'],
    tips: [
      'Renew on or before the expiry date.',
      'You can still renew in the grace period, but illnesses or injuries during that time aren\'t covered.',
    ],
  },
  {
    id: 'health-add-member', category: 'health', group: 'Renewal & cover',
    title: 'Add a family member', short: 'Add your spouse, a child or a parent to your policy.',
    needs: ['Proposal form', 'Request letter', 'Marriage, birth or adoption certificate, as applicable', 'Payment for the extra premium'],
    ways: ['branch'],
    tips: [
      'Spouse, children and parents can usually be added.',
      'Additions generally happen at renewal, and new members start fresh waiting periods.',
    ],
  },
  {
    id: 'health-remove-member', category: 'health', group: 'Renewal & cover',
    title: 'Remove a family member', short: 'Take someone off your family policy.',
    needs: ['Request letter', 'Details of the member to be removed', 'Death certificate, if applicable'],
    ways: ['branch'],
    tips: ['Members can be removed at any time, unlike additions.'],
  },
  {
    id: 'health-increase-si', category: 'health', group: 'Renewal & cover',
    title: 'Increase your sum insured', short: 'Raise your cover amount.',
    needs: ['Proposal form', 'Request letter', 'Photo ID', 'Copy of the expiring policy', 'Payment for the extra premium'],
    ways: ['branch'],
    tips: [
      'Only possible at renewal, and may be declined if a chronic condition developed during the year.',
      'The extra cover comes with fresh waiting periods for pre-existing and specific conditions.',
      'Claim-free policies are better placed for an increase.',
    ],
  },
  {
    id: 'health-port', category: 'health', group: 'Renewal & cover',
    title: 'Port to another insurer', short: 'Move your policy without losing waiting-period credit.',
    needs: ['Portability form', 'Proposal form for the new insurer', 'Latest renewal notice', 'Policy copies for the last 4 years', 'KYC of all insured members', 'Premium payment'],
    ways: ['branch'],
    tips: [
      'Apply at least 45 days before your renewal date.',
      'If accepted, waiting periods already served for pre-existing conditions carry over.',
      'If the request is still pending near renewal, take a short extension from your current insurer so you\'re never uncovered.',
    ],
  },
  {
    id: 'health-checkup', category: 'health', group: 'Renewal & cover',
    title: 'Book a free health check-up', short: 'Use the check-up included with many policies.',
    needs: ['Policy number', 'Date of birth of the insured member', 'For reimbursement: original bills and reports, claim form and a cancelled cheque'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: [
      'The number of tests and how often you can take them vary by insurer.',
      'Results don\'t affect your current cover.',
    ],
  },
  {
    id: 'health-name', category: 'health', group: 'Corrections & updates',
    title: 'Correct a name', short: 'Fix a misspelt name or record a change of name.',
    needs: ['Request letter', 'Photo ID', 'Marriage certificate or gazette notification, if the name has changed'],
    ways: ['website', 'email', 'branch'],
    tips: ['A name mismatch can delay claim settlement.'],
  },
  {
    id: 'health-age-gender', category: 'health', group: 'Corrections & updates',
    title: 'Correct age or gender', short: 'Fix a wrong age or gender on the policy.',
    needs: ['Request letter', 'Photo ID', 'Age proof'],
    ways: ['website', 'email', 'branch'],
    tips: ['A mismatch can delay claim settlement.'],
  },
  {
    id: 'health-address', category: 'health', group: 'Corrections & updates',
    title: 'Change address', short: 'Update the address on your policy.',
    needs: ['Request letter', 'Address proof', 'Policy number'],
    ways: ['website', 'email', 'branch'],
    tips: ['Claims above ₹1 lakh need KYC, and the address must match the policy.'],
  },
  {
    id: 'health-contact', category: 'health', group: 'Corrections & updates',
    title: 'Update mobile number or email', short: 'Change your registered or alternate contact details.',
    needs: ['Policy number', 'Date of birth of an insured member', 'Your new mobile number or email ID', 'At a branch: request letter and photo ID'],
    ways: ['website', 'email', 'call', 'branch'],
    tips: ['Insurers send claim and renewal updates here, so keep it current.'],
  },
  {
    id: 'health-nominee', category: 'health', group: 'Corrections & updates',
    title: 'Change nominee', short: 'Add or change who receives benefits.',
    needs: ['Request letter', 'Nominee\'s photo ID', 'Policy number'],
    ways: ['website', 'email', 'branch'],
    tips: ['Any immediate family member can be a nominee.'],
  },
  {
    id: 'health-proposer', category: 'health', group: 'Corrections & updates',
    title: 'Change the proposer', short: 'Transfer the policy to a new policyholder.',
    needs: ['Request letter', 'New proposal form', 'Photo ID of the new proposer'],
    ways: ['website', 'branch'],
    tips: [
      'Usually done after the proposer\'s death, a marriage or a loss of income.',
      'Any insured member or immediate family member can become the proposer. The tax benefit goes to the proposer.',
    ],
  },
  {
    id: 'health-other', category: 'health', group: 'Something else', other: true,
    title: 'Something else', short: 'A request that isn\'t listed here.',
    ways: [], tips: [],
  },

  // --------------------------------------------------------------- MOTOR
  {
    id: 'motor-policy-copy', category: 'motor', group: 'Policy documents',
    title: 'Policy copy not received', short: 'Get your motor policy document.',
    needs: ['Policy number', 'Vehicle number, or engine and chassis number', 'Payment details', 'At a branch: request letter'],
    ways: ['email', 'call', 'branch'],
    tips: [
      'The policy copy is mandatory for any claim.',
      'Keep a copy in the vehicle. A digital copy works too.',
    ],
  },
  {
    id: 'motor-lost-policy', category: 'motor', group: 'Policy documents',
    title: 'Duplicate of a lost policy', short: 'Replace a lost or damaged policy document.',
    needs: ['Policy number', 'Vehicle details', 'At a branch: request letter'],
    ways: ['email', 'call', 'branch'],
    tips: ['Asking for a soft copy by email is usually the quickest way to get a replacement.'],
  },
  {
    id: 'motor-covernote', category: 'motor', group: 'Policy documents',
    title: 'Convert a cover note into a policy', short: 'Get the final policy for a temporary cover note.',
    needs: ['Cover note number and vehicle details', 'Payment details'],
    ways: ['call', 'branch'],
    tips: ['A cover note is only temporary. You need the actual policy to make a claim.'],
  },
  {
    id: 'motor-renew-expired', category: 'motor', group: 'Policy documents',
    title: 'Renew an expired policy', short: 'Get covered again after your policy lapsed.',
    needs: ['Previous policy copy', 'Registration certificate (RC)', 'Vehicle inspection, if the insurer asks for one'],
    ways: ['website', 'call', 'branch'],
    tips: [
      'Driving without at least third-party cover is against the law.',
      'Your No Claim Bonus is kept only if you renew within 90 days of expiry.',
    ],
  },
  {
    id: 'motor-vehicle-details', category: 'motor', group: 'Corrections & updates',
    title: 'Correct vehicle details', short: 'Engine or chassis number, registration number, year, CC, make, model or fuel type.',
    needs: ['Registration certificate (RC)', 'Request letter', 'Payment, if the change affects the premium'],
    ways: ['email', 'branch'],
    tips: [
      'A mismatch delays claims: repairs start only after the correction is endorsed on the policy.',
      'CC, model and fuel type affect the premium, so these changes may cost extra.',
    ],
  },
  {
    id: 'motor-name', category: 'motor', group: 'Corrections & updates',
    title: 'Correct owner\'s name', short: 'Match the name on the policy to the RC.',
    needs: ['Registration certificate (RC)', 'Request letter', 'Photo ID'],
    ways: ['email', 'branch'],
    tips: ['A name mismatch with the RC delays claims, especially third-party claims.'],
  },
  {
    id: 'motor-address', category: 'motor', group: 'Corrections & updates',
    title: 'Change address', short: 'Update the registered or communication address.',
    needs: ['RC, for the registered address', 'Address proof under 3 months old, for the communication address', 'Request letter', 'Policy number'],
    ways: ['email', 'call', 'branch'],
    tips: ['Claims above ₹1 lakh need KYC, and the address must match the policy.'],
  },
  {
    id: 'motor-contact', category: 'motor', group: 'Corrections & updates',
    title: 'Update mobile number or email', short: 'Change your registered or alternate contact details.',
    needs: ['Policy number', 'Vehicle details', 'Your new mobile number or email ID', 'At a branch: request letter'],
    ways: ['email', 'call', 'branch'],
    tips: ['Insurers send claim and renewal updates here, so keep it current.'],
  },
  {
    id: 'motor-nominee', category: 'motor', group: 'Corrections & updates',
    title: 'Change nominee', short: 'Add or change the nominee on your policy.',
    needs: ['Request letter', 'Nominee details', 'Policy copy'],
    ways: ['email', 'branch'],
    tips: ['A nominee on the policy speeds up payment if the owner dies.'],
  },
  {
    id: 'motor-ownership', category: 'motor', group: 'Vehicle & ownership changes',
    title: 'Transfer policy to a new owner', short: 'After selling or inheriting a vehicle.',
    needs: ['Transferred RC, or Form 29/30', 'Consent letter from the previous owner', 'Fresh proposal form', 'Old policy documents', 'Payment, if required', 'If the owner has died: death certificate and legal heir certificate'],
    ways: ['branch'],
    tips: ['Apply within 14 days of the transfer to keep your own-damage cover.'],
  },
  {
    id: 'motor-cng', category: 'motor', group: 'Vehicle & ownership changes',
    title: 'Add a CNG or LPG kit', short: 'Get a fitted gas kit covered.',
    needs: ['RC endorsed with the CNG/LPG kit', 'Kit invoice', 'Request letter', 'Payment, if required'],
    ways: ['branch'],
    tips: [
      'Update the RC first, then the policy. If you don\'t, a claim can be rejected.',
      'Keep the original invoice until the endorsement is done.',
    ],
  },
  {
    id: 'motor-hypothecation', category: 'motor', group: 'Vehicle & ownership changes',
    title: 'Remove or add a loan (hypothecation)', short: 'Update the policy after closing or taking a vehicle loan.',
    needs: ['NOC from the lender', 'RC with the hypothecation updated', 'Request letter'],
    ways: ['email', 'branch'],
    tips: [
      'A mismatch with the RC can delay claims.',
      'If a closed loan isn\'t removed, a theft or total-loss payout goes to the lender.',
    ],
  },
  {
    id: 'motor-accessories', category: 'motor', group: 'Vehicle & ownership changes',
    title: 'Insure new accessories', short: 'Cover a music system, upholstery or other fittings.',
    needs: ['Invoice of the accessories', 'Request letter', 'Payment for the extra premium'],
    ways: ['branch'],
    tips: ['Accessories are covered only once they\'re endorsed on the policy.'],
  },
  {
    id: 'motor-ncb', category: 'motor', group: 'Vehicle & ownership changes',
    title: 'Transfer your No Claim Bonus', short: 'Carry your NCB to a new vehicle or policy.',
    needs: ['NCB certificate or previous policy', 'Request letter'],
    ways: ['branch'],
    tips: ['NCB belongs to you, not the vehicle, so it can move with you to a new one.'],
  },
  {
    id: 'motor-other', category: 'motor', group: 'Something else', other: true,
    title: 'Something else', short: 'A request that isn\'t listed here.',
    ways: [], tips: [],
  },
];

const L = 'assets/images/insurers/';
const S = 'assets/images/insurers/service/';

export const INSURERS: InsurerContact[] = [
  // ---- Life
  { id: 'lic', name: 'LIC of India', categories: ['life'], logo: S + 'lic-of-india.png', website: 'https://licindia.in' },
  { id: 'absli', name: 'Aditya Birla Sun Life', categories: ['life'], logo: L + 'ABSLI.png', website: 'https://lifeinsurance.adityabirlacapital.com', phone: '1800 270 7000', email: 'care.lifeinsurance@adityabirlacapital.com' },
  { id: 'hdfc-life', name: 'HDFC Life', categories: ['life'], logo: L + 'HDFCLife.png', website: 'https://www.hdfclife.com', phone: '1860 267 9999', email: 'service@hdfclife.com' },
  { id: 'icici-pru', name: 'ICICI Prudential Life', categories: ['life'], logo: L + 'ICICIPRUDENTIALLIFEINSURANCE.png', website: 'https://www.iciciprulife.com', phone: '1860 266 7766', email: 'lifeline@iciciprulife.com' },
  { id: 'axis-max', name: 'Axis Max Life', formerly: 'Max Life', categories: ['life'], logo: L + 'axis-max-life.png', website: 'https://www.axismaxlife.com', phone: '1860 120 5577' },
  { id: 'bajaj-life', name: 'Bajaj Life', formerly: 'Bajaj Allianz Life', categories: ['life'], logo: L + 'bajajallianz_life.png', website: 'https://www.bajajlifeinsurance.com', phone: '1800 209 7272' },
  { id: 'sbi-life', name: 'SBI Life', categories: ['life'], logo: S + 'sbi-life-insurance.png', website: 'https://www.sbilife.co.in', phone: '1800 22 9090', email: 'info@sbilife.co.in' },
  { id: 'tata-aia', name: 'Tata AIA Life', categories: ['life'], logo: L + 'tata-aia.png', website: 'https://www.tataaia.com', phone: '1860 266 9966', email: 'customercare@tataaia.com' },
  { id: 'kotak-life', name: 'Kotak Life', categories: ['life'], logo: S + 'kotak-life-insurance.png', website: 'https://www.kotaklife.com', phone: '1800 209 8800', email: 'clientservicedesk@kotak.com' },
  { id: 'canara-hsbc', name: 'Canara HSBC Life', categories: ['life'], logo: L + 'CanaraHSBC.jpg', website: 'https://www.canarahsbclife.com', phone: '1800 103 0003', email: 'customerservice@canarahsbclife.in' },
  { id: 'bandhan-life', name: 'Bandhan Life', formerly: 'Aegon Life', categories: ['life'], logo: L + 'BandhanLife.svg', website: 'https://www.bandhanlife.com', phone: '1800 209 9090' },
  { id: 'bharti-axa-life', name: 'Bharti AXA Life', categories: ['life'], logo: S + 'bharti-axa-life-insurance.png', website: 'https://www.bhartiaxa.com', phone: '1800 102 4444', email: 'service@bharti-axalife.com' },
  { id: 'aviva', name: 'Aviva Life', categories: ['life'], logo: S + 'aviva-life-insurance.png', website: 'https://www.avivaindia.com', phone: '1800 103 7766', email: 'customerservices@avivaindia.com' },
  { id: 'indusind-nippon', name: 'IndusInd Nippon Life', formerly: 'Reliance Nippon Life', categories: ['life'], logo: L + 'IndusIndNipponLife.png', website: 'https://www.indusindnipponlife.com', phone: '1800 102 1010' },
  { id: 'edelweiss-life', name: 'Edelweiss Life', formerly: 'Edelweiss Tokio Life', categories: ['life'], logo: L + 'EdelweissLife.png', website: 'https://www.edelweisslife.in', phone: '1800 212 1212' },
  { id: 'generali-central-life', name: 'Generali Central Life', formerly: 'Future Generali Life', categories: ['life'], logo: L + 'GeneraliCentralLife.svg', website: 'https://www.generalicentrallife.com', phone: '1800 102 2355' },
  { id: 'ageas-federal', name: 'Ageas Federal Life', formerly: 'IDBI Federal Life', categories: ['life'], logo: L + 'AgeasFederalLife.svg', website: 'https://www.ageasfederal.com', phone: '1800 209 0502' },
  { id: 'pramerica', name: 'Pramerica Life', formerly: 'DHFL Pramerica Life', categories: ['life'], logo: L + 'PramericaLife.svg', website: 'https://pramericalife.in', phone: '1800 102 7070' },

  // ---- Standalone health insurers
  { id: 'star', name: 'Star Health', categories: ['health'], logo: L + 'Star_Health_and_Allied_Insurance.png', website: 'https://www.starhealth.in', phone: '1800 425 2255', email: 'support@starhealth.in' },
  { id: 'care', name: 'Care Health', categories: ['health'], logo: L + 'CareHealth.png', website: 'https://www.careinsurance.com', phone: '1800 102 6655', email: 'customerfirst@careinsurance.com' },
  { id: 'niva-bupa', name: 'Niva Bupa', formerly: 'Max Bupa', categories: ['health'], logo: L + 'nivabupa.png', website: 'https://www.nivabupa.com', phone: '1860 500 8888' },
  { id: 'abhi', name: 'Aditya Birla Health', categories: ['health'], logo: S + 'aditya-birla-health-insurance.png', website: 'https://www.adityabirlahealth.com', phone: '1800 270 7000', email: 'care.healthinsurance@adityabirlacapital.com' },
  { id: 'manipalcigna', name: 'ManipalCigna Health', categories: ['health'], logo: S + 'manipalcigna-health-insurance.png', website: 'https://www.manipalcigna.com', phone: '1800 102 4462', email: 'mychangerequest@manipalcigna.com' },

  // ---- General insurers (health and motor)
  { id: 'hdfc-ergo', name: 'HDFC ERGO', categories: ['health', 'motor'], logo: L + 'HDFCErgo.jpg', website: 'https://www.hdfcergo.com', phone: '022 6234 6234', email: 'care@hdfcergo.com' },
  { id: 'icici-lombard', name: 'ICICI Lombard', categories: ['health', 'motor'], logo: L + 'ICICILombard.jpg', website: 'https://www.icicilombard.com', phone: '1800 2666', email: 'customersupport@icicilombard.com' },
  { id: 'bajaj-general', name: 'Bajaj General', formerly: 'Bajaj Allianz General', categories: ['health', 'motor'], logo: L + 'bajaj-allianz-general-insurance.26359adcd0f.png', website: 'https://www.bajajgeneralinsurance.com', phone: '1800 209 5858' },
  { id: 'tata-aig', name: 'Tata AIG', categories: ['health', 'motor'], logo: S + 'tata-aig-general-insurance.png', website: 'https://www.tataaig.com', phone: '1800 266 7780', email: 'customersupport@tataaig.com' },
  { id: 'sbi-general', name: 'SBI General', categories: ['health', 'motor'], logo: L + 'SBIGeneralInsurance.png', website: 'https://www.sbigeneral.in', phone: '1800 102 1111', email: 'customer.care@sbigeneral.in' },
  { id: 'new-india', name: 'New India Assurance', categories: ['health', 'motor'], logo: L + 'NewIndia.png', website: 'https://www.newindia.co.in', phone: '1800 209 1415' },
  { id: 'national', name: 'National Insurance', categories: ['health', 'motor'], logo: S + 'national-insurance.png', website: 'https://nationalinsurance.nic.co.in', phone: '1800 200 7710', email: 'customer.support@nic.co.in' },
  { id: 'oriental', name: 'Oriental Insurance', categories: ['health', 'motor'], logo: S + 'oriental-insurance.png', website: 'https://orientalinsurance.org.in', phone: '1800 11 8485' },
  { id: 'united-india', name: 'United India Insurance', categories: ['health', 'motor'], logo: S + 'united-india-insurance.png', website: 'https://uiic.co.in', phone: '1800 425 33333' },
  { id: 'royal-sundaram', name: 'Royal Sundaram', categories: ['health', 'motor'], logo: L + 'RoyalSundaram.png', website: 'https://www.royalsundaram.in', phone: '1860 425 0000', email: 'customer.services@royalsundaram.in' },
  { id: 'chola-ms', name: 'Chola MS', categories: ['health', 'motor'], logo: L + 'Cholamandalaminsurance.png', website: 'https://www.cholainsurance.com', phone: '1800 200 5544', email: 'customercare@cholams.murugappa.com' },
  { id: 'iffco-tokio', name: 'IFFCO Tokio', categories: ['health', 'motor'], logo: S + 'iffco-tokio-general-insurance.png', website: 'https://www.iffcotokio.co.in', phone: '1800 103 5499', email: 'support@iffcotokio.co.in' },
  { id: 'indusind-general', name: 'IndusInd General', formerly: 'Reliance General', categories: ['health', 'motor'], logo: L + 'IndusIndGeneral.png', website: 'https://www.indusindinsurance.com', phone: '1800 3009' },
  { id: 'generali-central', name: 'Generali Central Insurance', formerly: 'Future Generali India', categories: ['health', 'motor'], logo: L + 'GeneraliCentral.png', website: 'https://www.generalicentralinsurance.com', phone: '1800 220 233' },
  { id: 'liberty', name: 'Liberty General', formerly: 'Liberty Videocon', categories: ['health', 'motor'], logo: L + 'Libertyinsurance.jpg', website: 'https://www.libertyinsurance.in', phone: '1800 266 5844' },
  { id: 'zurich-kotak', name: 'Zurich Kotak General', formerly: 'Kotak General', categories: ['health', 'motor'], logo: L + 'Zurich-Kotak.png', website: 'https://www.zurichkotak.com' },

  // ---- Motor-only
  { id: 'shriram', name: 'Shriram General', categories: ['motor'], logo: S + 'shriram-general-insurance.png', website: 'https://www.shriramgi.com', phone: '1800 300 30000' },
  { id: 'magma', name: 'Magma General', formerly: 'Magma HDI', categories: ['motor'], logo: L + 'MagmaGeneral.svg', website: 'https://www.magmainsurance.com', phone: '1800 3002 3202' },
  { id: 'digit', name: 'Go Digit', categories: ['motor'], logo: L + 'Go-Digit.png', website: 'https://www.godigit.com' },
];
