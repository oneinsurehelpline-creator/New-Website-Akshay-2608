export type PolicyCategory = 'Health' | 'Life' | 'Motor';
export type PolicyState = 'active' | 'inactive';

export interface AccountPolicy {
  id: string;
  category: PolicyCategory;
  state: PolicyState;
  insurer: string;
  logo: string;
  planName: string;
  coverAmount: number;
  premium: number;
  policyNo: string;
  termYears: number;
  startDate: string;   // ISO date
  endDate: string;     // ISO date
  bookingDate: string; // ISO date
  proposer: string;
  insuredMembers: string[];
  statusLabel: string; // e.g. "Policy Issued"
  vehicle?: { name: string; regNo: string };
  policyCopyUrl?: string;
}

/** TODO: remove once the policies API is wired up — sample data for the UI only. */
export const SAMPLE_POLICIES: AccountPolicy[] = [
  {
    id: 'p1',
    category: 'Health',
    state: 'active',
    insurer: 'HDFC ERGO',
    logo: 'assets/images/insurers/HDFCErgo.jpg',
    planName: 'Optima Secure',
    coverAmount: 1000000,
    premium: 18450,
    policyNo: '2856/2026/HE/0041872',
    termYears: 1,
    startDate: '2026-04-02',
    endDate: '2027-04-01',
    bookingDate: '2026-03-28',
    proposer: 'Ramakrishnaa Rao Dandanayakula',
    insuredMembers: ['Ramakrishnaa Rao Dandanayakula', 'Lakshmi Dandanayakula'],
    statusLabel: 'Policy Issued',
  },
  {
    id: 'p2',
    category: 'Life',
    state: 'active',
    insurer: 'HDFC Life',
    logo: 'assets/images/insurers/HDFCLife.png',
    planName: 'Click 2 Protect Supreme',
    coverAmount: 10000000,
    premium: 14200,
    policyNo: '24918377',
    termYears: 30,
    startDate: '2025-11-15',
    endDate: '2055-11-14',
    bookingDate: '2025-11-10',
    proposer: 'Ramakrishnaa Rao Dandanayakula',
    insuredMembers: ['Ramakrishnaa Rao Dandanayakula'],
    statusLabel: 'Policy Issued',
  },
  {
    id: 'p3',
    category: 'Motor',
    state: 'active',
    insurer: 'Digit',
    logo: 'assets/images/insurers/Go-Digit.png',
    planName: 'Comprehensive Car Insurance',
    coverAmount: 845000,
    premium: 12366,
    policyNo: 'D104528971',
    termYears: 1,
    startDate: '2026-01-13',
    endDate: '2027-01-12',
    bookingDate: '2026-01-07',
    proposer: 'Ramakrishnaa Rao Dandanayakula',
    insuredMembers: ['Ramakrishnaa Rao Dandanayakula'],
    statusLabel: 'Policy Issued',
    vehicle: { name: 'Hyundai Creta', regNo: 'KA-53-MV-5835' },
  },
  {
    id: 'p4',
    category: 'Health',
    state: 'inactive',
    insurer: 'Care Health',
    logo: 'assets/images/insurers/CareHealth.png',
    planName: 'Care Supreme',
    coverAmount: 500000,
    premium: 9800,
    policyNo: '71240098',
    termYears: 1,
    startDate: '2024-10-13',
    endDate: '2025-10-12',
    bookingDate: '2024-10-07',
    proposer: 'Ramakrishnaa Rao Dandanayakula',
    insuredMembers: ['Ramakrishnaa Rao Dandanayakula'],
    statusLabel: 'Expired',
  },
  {
    id: 'p5',
    category: 'Motor',
    state: 'inactive',
    insurer: 'ICICI Lombard',
    logo: 'assets/images/insurers/ICICILombard.jpg',
    planName: 'Two Wheeler Package Policy',
    coverAmount: 62000,
    premium: 1450,
    policyNo: '3005/A/24569812',
    termYears: 1,
    startDate: '2024-06-20',
    endDate: '2025-06-19',
    bookingDate: '2024-06-18',
    proposer: 'Ramakrishnaa Rao Dandanayakula',
    insuredMembers: ['Ramakrishnaa Rao Dandanayakula'],
    statusLabel: 'Expired',
    vehicle: { name: 'Honda Activa', regNo: 'KA-53-V-5835' },
  },
];
