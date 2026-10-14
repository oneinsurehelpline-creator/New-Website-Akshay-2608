export type ClaimCategory = 'Health' | 'Life' | 'Motor';
export type ClaimStatus = 'initiated' | 'in-review' | 'approved' | 'settled' | 'rejected' | 'cancelled';
export type ClaimDocStatus = 'pending' | 'uploaded' | 'verified' | 'rejected';

/** One stage of the claim timeline. A stage with a date is complete. */
export interface ClaimStep {
  label: string;
  date?: string;    // ISO date
  note?: string;    // optional line shown under the stage
  failed?: boolean; // rejected / cancelled stage
}

/** A question/answer captured while raising the claim (varies by claim type). */
export interface ClaimDetail {
  label: string;
  value: string | number | null;
  type?: 'text' | 'amount' | 'date';
}

export interface ClaimDocument {
  name: string;
  status: ClaimDocStatus;
  fileName?: string;
  uploadedOn?: string; // ISO date
  remark?: string;     // e.g. why it was rejected
}

export interface AccountClaim {
  id: string;
  claimNo: string;
  category: ClaimCategory;
  claimType: string;        // "Health Claim", "Life Claim", "Four Wheeler Claim"…
  status: ClaimStatus;
  raisedOn: string;         // ISO date
  situation: string[];      // path chosen while raising, e.g. ['Maturity', 'Dont Know What To Do']
  insurer?: string;
  logo?: string;
  policyNo?: string;
  insuredName?: string;
  claimAmount?: number;
  approvedAmount?: number;
  settledAmount?: number;
  timeline: ClaimStep[];
  details: ClaimDetail[];
  documents: ClaimDocument[];
  remarks?: string;         // latest update from the claims team / insurer
  advisor?: { name: string; phone?: string };
}

/** TODO: remove once the claims API is wired up — sample data for the UI only. */
export const SAMPLE_CLAIMS: AccountClaim[] = [
  {
    id: 'c1',
    claimNo: 'OIC-HL-2026-00418',
    category: 'Health',
    claimType: 'Health Claim',
    status: 'initiated',
    raisedOn: '2026-09-27',
    situation: ['Planning For Treatment'],
    insurer: 'Chola MS',
    logo: 'assets/images/insurers/Cholamandalaminsurance.png',
    policyNo: '2856/2026/HE/0041872',
    insuredName: 'Ramakrishnaa Rao Dandanayakula',
    claimAmount: 500000,
    timeline: [
      { label: 'Claim initiated', date: '2026-09-27' },
      { label: 'Claim approved' },
      { label: 'Claim settled' },
    ],
    details: [
      { label: 'Doctor Name', value: 'Dr. Abhishek Rao' },
      { label: 'Hospital Name', value: 'Manipal Hospital, Old Airport Road' },
      { label: 'Treatment Date', value: '2026-10-24', type: 'date' },
      { label: 'Treatment Cost', value: 500000, type: 'amount' },
      { label: 'When did you identify this issue?', value: '2026-09-22', type: 'date' },
      { label: 'Cashless or Reimbursement?', value: 'Cashless' },
    ],
    documents: [
      { name: 'Doctor’s prescription', status: 'verified', fileName: 'prescription.pdf', uploadedOn: '2026-09-27' },
      { name: 'Treatment cost estimate', status: 'pending' },
      { name: 'ID proof of patient', status: 'pending' },
    ],
    remarks: 'Upload the cost estimate from the hospital so we can request pre-authorisation from the insurer.',
    advisor: { name: 'Priya Sharma', phone: '+91 80 4718 2210' },
  },
  {
    id: 'c2',
    claimNo: 'OIC-LF-2026-00107',
    category: 'Life',
    claimType: 'Life Claim',
    status: 'initiated',
    raisedOn: '2026-08-28',
    situation: ['Maturity', 'Dont Know What To Do'],
    policyNo: '24918377',
    timeline: [
      { label: 'Claim initiated', date: '2026-08-28' },
      { label: 'Claim approved' },
      { label: 'Claim settled' },
    ],
    details: [
      { label: 'Date Of Maturity', value: null, type: 'date' },
    ],
    documents: [
      { name: 'Policy document', status: 'pending' },
      { name: 'Cancelled cheque / bank proof', status: 'rejected', fileName: 'cheque.jpg', uploadedOn: '2026-08-30', remark: 'Image is blurred, please re-upload.' },
    ],
  },
  {
    id: 'c3',
    claimNo: 'OIC-MT-2026-00233',
    category: 'Motor',
    claimType: 'Four Wheeler Claim',
    status: 'in-review',
    raisedOn: '2026-07-22',
    situation: ['Only TP Claim'],
    insurer: 'Bajaj Allianz',
    logo: 'assets/images/insurers/bajaj-allianz-general-insurance.26359adcd0f.png',
    policyNo: 'OG-27-1901-1801-00012345',
    insuredName: 'Ramakrishnaa Rao Dandanayakula',
    timeline: [
      { label: 'Claim initiated', date: '2026-07-22' },
      { label: 'Surveyor assigned', date: '2026-07-25', note: 'Surveyor: Mahesh K' },
      { label: 'Claim approved' },
      { label: 'Claim settled' },
    ],
    details: [
      { label: 'Vehicle', value: 'Hyundai Creta · KA-53-MV-5835' },
      { label: 'Property Damage', value: 'No' },
      { label: 'Any Injury To Third Party Lead To Death?', value: 'No' },
      { label: 'Only Injury To Third Party', value: 'No' },
      { label: 'FIR Filed', value: 'Yes' },
    ],
    documents: [
      { name: 'FIR copy', status: 'uploaded', fileName: 'fir_copy.pdf', uploadedOn: '2026-07-22' },
      { name: 'Driving licence', status: 'verified', fileName: 'dl.pdf', uploadedOn: '2026-07-22' },
      { name: 'RC copy', status: 'pending' },
    ],
    advisor: { name: 'Rahul Verma', phone: '+91 80 4718 2211' },
  },
  {
    id: 'c4',
    claimNo: 'OIC-HL-2025-00961',
    category: 'Health',
    claimType: 'Health Claim',
    status: 'settled',
    raisedOn: '2025-12-03',
    situation: ['Already Hospitalised', 'Cashless'],
    insurer: 'HDFC ERGO',
    logo: 'assets/images/insurers/HDFCErgo.jpg',
    policyNo: '2856/2025/HE/0039911',
    insuredName: 'Lakshmi Dandanayakula',
    claimAmount: 185000,
    approvedAmount: 172500,
    settledAmount: 172500,
    timeline: [
      { label: 'Claim initiated', date: '2025-12-03' },
      { label: 'Claim approved', date: '2025-12-05', note: '₹12,500 deducted for non-payable items' },
      { label: 'Claim settled', date: '2025-12-09' },
    ],
    details: [
      { label: 'Hospital Name', value: 'Apollo Hospitals, Bannerghatta Road' },
      { label: 'Date of Admission', value: '2025-12-02', type: 'date' },
      { label: 'Date of Discharge', value: '2025-12-06', type: 'date' },
      { label: 'Diagnosis', value: 'Appendicitis' },
      { label: 'Final Bill Amount', value: 185000, type: 'amount' },
    ],
    documents: [
      { name: 'Discharge summary', status: 'verified', fileName: 'discharge.pdf', uploadedOn: '2025-12-06' },
      { name: 'Final hospital bill', status: 'verified', fileName: 'bill.pdf', uploadedOn: '2025-12-06' },
    ],
  },
  {
    id: 'c5',
    claimNo: 'OIC-MT-2025-00412',
    category: 'Motor',
    claimType: 'Two Wheeler Claim',
    status: 'rejected',
    raisedOn: '2025-06-11',
    situation: ['Own Damage', 'Accident'],
    insurer: 'ICICI Lombard',
    logo: 'assets/images/insurers/ICICILombard.jpg',
    policyNo: '3005/A/24569812',
    claimAmount: 18000,
    timeline: [
      { label: 'Claim initiated', date: '2025-06-11' },
      { label: 'Claim rejected', date: '2025-06-18', failed: true, note: 'Policy had lapsed on the date of accident' },
    ],
    details: [
      { label: 'Vehicle', value: 'Honda Activa · KA-53-V-5835' },
      { label: 'Date of Accident', value: '2025-06-10', type: 'date' },
      { label: 'Estimated Repair Cost', value: 18000, type: 'amount' },
    ],
    documents: [
      { name: 'Repair estimate', status: 'verified', fileName: 'estimate.pdf', uploadedOn: '2025-06-11' },
    ],
  },
];
