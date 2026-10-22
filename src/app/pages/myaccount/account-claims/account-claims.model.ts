export type ClaimCategory = 'Health' | 'Life' | 'Motor';
export type ClaimDocStatus = 'pending' | 'uploaded' | 'verified' | 'rejected';

/** One row of `OneinsureApi/customerClaimsList`. */
export interface ClaimListItem {
  Insurerid: number | null;
  Category: string;
  CategoryID: number;
  IssueId: number;
  Title: string;
  InsurerStatus: string | null;
  IssueStatus: string;
  FiledOn: string;
}

/** One stage of the claim timeline. A stage with a date is complete. */
export interface ClaimStep {
  label: string;
  date?: string;    // ISO date
  done?: boolean;   // reached, even when the API has no date for it
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
  remark?: string;
}

export interface AccountClaim {
  issueId: number;
  category: string;         // "Health" | "Life" | "Motor" (as sent by the API)
  categoryId: number;
  claimType: string;        // "Health Claim"
  title: string;            // cleaned-up API title
  situation: string[];      // title split on " - ", e.g. ['Maturity', 'Don’t Know What To Do']
  insurerId: number | null;
  logo: string | null;
  insurerStatus: string | null;
  issueStatus: string;
  closed: boolean;
  filedOn: string;          // ISO date

  /* ---- filled from the Health / Life / Motor details APIs (by IssueId) when opened ---- */
  detailsState: 'idle' | 'loading' | 'loaded' | 'error';
  srNumber?: string;        // FriendlySR
  claimNumber?: string;     // insurer claim number
  insurer?: string;
  policyNo?: string;
  insuredName?: string;
  claimAmount?: number;
  approvedAmount?: number;
  settledAmount?: number;
  timeline: ClaimStep[];
  details: ClaimDetail[];
  documents: ClaimDocument[];
  remarks?: string;
  advisor?: { name: string; phone?: string };
}

const INSURER_IMG = 'https://www.oneinsure.com/assets/bi/images/FlutterOneinsureimg/flutterinsurerimg/';

/**
 * IssueStatus codes that mean the claim is closed.
 * TODO: confirm the codes with the backend — '8' is assumed to be "closed" for now.
 */
export const CLOSED_ISSUE_STATUSES = ['8'];

export function insurerLogo(insurerId: number | null): string | null {
  return insurerId != null ? `${INSURER_IMG}${insurerId}.png` : null;
}

function clean(s: string): string {
  return s.trim().replace(/\s+/g, ' ').replace(/\bDont\b/gi, 'Don’t');
}

/** Maps a `customerClaimsList` row to the claim shape the UI renders. */
export function toAccountClaim(r: ClaimListItem): AccountClaim {
  const situation = (r.Title || '').split(' - ').map(clean).filter(Boolean);
  const category = (r.Category || '').trim();

  return {
    issueId: r.IssueId,
    category,
    categoryId: r.CategoryID,
    claimType: category ? `${category} Claim` : 'Claim',
    title: situation.join(' – ') || 'Claim',
    situation,
    insurerId: r.Insurerid,
    logo: insurerLogo(r.Insurerid),
    insurerStatus: r.InsurerStatus?.trim() || null,
    issueStatus: r.IssueStatus,
    closed: CLOSED_ISSUE_STATUSES.includes(r.IssueStatus),
    filedOn: r.FiledOn,
    // Default timeline until the details API provides the real one.
    timeline: [
      { label: 'Claim initiated', date: r.FiledOn, done: true },
      { label: 'Claim approved' },
      { label: 'Claim settled' },
    ],
    details: [],
    documents: [],
    detailsState: 'idle',
  };
}
