import { AccountClaim, ClaimDetail, ClaimStep } from './account-claims.model';

/**
 * Maps the Health / Motor / Life claim-details API responses onto an AccountClaim.
 * Only human-readable fields with a real value are shown — internal ids/codes
 * (TreatmentType, Organ, PlanName, HospitalID…) and empty values are skipped.
 */

/* ---------------- helpers ---------------- */

/** API dates come as ISO strings; null and "0001-01-01…" mean "not set". */
function validDate(d: string | null | undefined): string | null {
  return d && !d.startsWith('0001-') ? d : null;
}

function text(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s && s !== '0' ? s : null;
}

function amount(v: unknown): number | null {
  const n = Number(v);
  return n > 0 ? n : null;
}

function yesNo(v: unknown): string {
  return v === true || Number(v) === 1 ? 'Yes' : 'No';
}

/** Collects only the rows that have a value. */
class Details {
  readonly rows: ClaimDetail[] = [];

  text(label: string, v: unknown): this {
    const s = text(v);
    if (s) this.rows.push({ label, value: s });
    return this;
  }

  date(label: string, v: string | null | undefined): this {
    const d = validDate(v);
    if (d) this.rows.push({ label, value: d, type: 'date' });
    return this;
  }

  amount(label: string, v: unknown): this {
    const n = amount(v);
    if (n) this.rows.push({ label, value: n, type: 'amount' });
    return this;
  }

  /** Yes/No questions are always shown, like the app. */
  yesNo(label: string, v: unknown): this {
    this.rows.push({ label, value: yesNo(v) });
    return this;
  }
}

/**
 * Builds the 3-stage timeline from `TimelineStatus`.
 * Assumed: 0 = initiated, 1 = approved, 2 = settled. A rejection replaces the remaining stages.
 */
function buildTimeline(filedOn: string, status: number, rejected: string | null): ClaimStep[] {
  const steps: ClaimStep[] = [
    { label: 'Claim initiated', date: filedOn, done: true },
    { label: 'Claim approved', done: status >= 1 },
    { label: 'Claim settled', done: status >= 2 },
  ];
  if (rejected) {
    return [steps[0], { label: 'Claim rejected', failed: true, note: rejected }];
  }
  return steps;
}

function remarks(...parts: (string | null)[]): string | undefined {
  const r = parts.filter(Boolean).join(' ');
  return r || undefined;
}

/* ---------------- Health ---------------- */

export function applyHealthDetails(c: AccountClaim, r: any): void {
  const doctor = text(r.DoctorName) || text([r.DoctorFName, r.DoctorLName].filter(Boolean).join(' '));
  const place = [text(r.City), text(r.State)].filter(Boolean).join(', ');
  const rejection = text(r.RejectionReason);

  c.srNumber = text(r.FriendlySR) || undefined;
  c.policyNo = text(r.PolicyID) || undefined;
  c.claimNumber = text(r.ClaimNumber) || undefined;
  c.claimAmount = amount(r.ClaimAmount) ?? undefined;
  c.approvedAmount = amount(r.ApprovedAmount) ?? undefined;

  c.details = new Details()
    .text('Patient Name', r.PatientName)
    .text('Hospital Name', r.HospitalName)
    .text('Hospital Location', place)
    .text('Doctor Name', doctor)
    .text('Treatment Name', r.TreatmentName)
    .date('Treatment Date', r.TreatmentDate)
    .amount('Treatment Cost', r.TreatmentCost)
    .date('When did you identify this issue?', r.HealthIssuestartDate)
    .date('Date of Admission', r.DateofAdmission)
    .date('Date of Discharge', r.DischargeDate)
    .text('Hospitalisation (days)', r.HospitalizationDuration)
    .date('Pre-authorisation Sent On', r.PreAuthSentDate)
    .text('Intimation Number', r.IntimationNumber)
    .date('Final Submission Date', r.FinalSubmissiondate)
    .text('Deduction Reason', r.DeductionReason)
    .rows;

  c.timeline = buildTimeline(c.filedOn, Number(r.TimelineStatus) || 0, rejection);
  c.remarks = remarks(text(r.QueryfromCustomer));
}

/* ---------------- Motor ---------------- */

export function applyMotorDetails(c: AccountClaim, r: any): void {
  const driver = r.IsDrivertheowner ? 'Owner' : text(r.DriverName);
  const damage = text(r.DamagePortions)?.split(',').map((s) => s.trim()).filter(Boolean).join(', ');

  c.srNumber = text(r.FriendlySR) || undefined;
  c.policyNo = text(r.PolicyID) || undefined;
  c.claimAmount = amount(r.ClaimAmount) ?? amount(r.RepairAmount) ?? undefined;
  c.approvedAmount = amount(r.ApprovedAmount) ?? undefined;

  c.details = new Details()
    .date('Accident Date', r.AccidentDate)
    .text('Accident Location', r.AccidentLocation)
    .text('Accident Area', r.AccidentArea)
    .text('Driver', driver)
    .text('Damaged Parts', damage)
    .text('Damage Description', r.DamageDescription)
    .yesNo('Property Damage', r.IsPropertyDamage)
    .yesNo('Any Injury To Third Party Lead To Death?', r.anyInjuryToThirdPartyLeadToDeath)
    .yesNo('Only Injury To Third Party', r.onlyInjuryToThirdParty)
    .yesNo('FIR Filed', r.ISFIR)
    .yesNo('Vehicle Movable', r.IsVehicleMovable)
    .text('Workshop Name', r.WorkShopName)
    .text('Workshop Address', r.WorkShopAddress)
    .date('Repair Date', r.FutureRepairDate)
    .amount('Repair Estimate', r.RepairAmount)
    .text('Intimation Number', r.IntimationNumber)
    .date('Intimation Date', r.IntimationDate)
    .text('Surveyor Name', r.SurveyorName)
    .text('Surveyor Contact', r.SurveyorContact)
    .date('Survey Date', r.SurveyDate)
    .date('Theft Date', r.TheftDate)
    .text('Theft Description', r.TheftDescription)
    .rows;

  c.timeline = buildTimeline(c.filedOn, Number(r.TimelineStatus) || 0, null);
  c.remarks = remarks(text(r.ClaimStatus), text(r.DocumentFailReason));
}

/* ---------------- Life ---------------- */

export function applyLifeDetails(c: AccountClaim, r: any): void {
  const declined = Number(r.IsDeclineLetter) === 1 ? 'Decline letter received from the insurer' : null;

  c.policyNo = text(r.PolicyID) || undefined;
  c.settledAmount = amount(r.ReceivedAmount) ?? undefined;

  c.details = new Details()
    .date('Date Of Maturity', r.DateofMaturity)
    .date('Documentation Date', r.DocumentaionDate)
    .date('Date Of Death', r.DateofDeath)
    .date('Claim Filing Date', r.FillingDate)
    .yesNo('Acknowledgement Received', r.IsAcknowledgment)
    .yesNo('Original Policy Copy Submitted', r.IsOGpolicyCopy)
    .yesNo('Query Letter Received', r.IsQueryLetter)
    .rows;

  c.timeline = buildTimeline(c.filedOn, Number(r.TimelineStatus) || 0, declined);
}
