import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type ConsentKind = 'customer' | 'partner' | 'careers';

/* ---------------------------------------------------------------
   Consent wording, in one place for compliance to edit.
   The checkbox always starts unticked (DPDP: consent must be an
   affirmative act). Forms must block submission until it's ticked.
   --------------------------------------------------------------- */
const TEXT: Record<ConsentKind, string> = {
  customer: 'I agree to be contacted by OneInsure by call, SMS, email or WhatsApp about my request, even if my '
    + 'number is registered on DND/NCPR.',
  partner: 'I agree to OneInsure processing my details to review my partner application, and to be contacted by '
    + 'call, SMS, email or WhatsApp about it.',
  careers: 'I agree to OneInsure processing my details and CV to assess my job application, and to be contacted '
    + 'about it.',
};

export const CONSENT_ERROR = 'Please tick the box to agree before submitting.';

/** One-line consent record to attach to the lead / request sent to the CRM. */
export function consentRecord(): string {
  return `Consent: Yes (${new Date().toISOString()})`;
}

@Component({
  selector: 'app-consent',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ConsentComponent), multi: true }],
  template: `
    <label class="cns" [class.cns--err]="showError && !value" [class.cns--dark]="dark">
      <input type="checkbox" [checked]="value" [disabled]="disabled" (change)="toggle($any($event.target).checked)"
        (blur)="onTouched()" [attr.aria-invalid]="showError && !value">
      <span class="cns__box" aria-hidden="true"></span>
      <span class="cns__txt">{{ text }} I have read the
        <a routerLink="/privacy-policy" target="_blank">Privacy Policy</a> and
        <a routerLink="/terms-conditions" target="_blank">Terms</a>.</span>
    </label>
    <div class="cns__msg" *ngIf="showError && !value" role="alert">{{ errorText }}</div>`,
  styles: [`
    :host { display: block; text-align: left; }
    .cns { position: relative; display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
    .cns input { position: absolute; opacity: 0; width: 18px; height: 18px; margin: 0; cursor: pointer; }
    .cns__box {
      flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px; border-radius: 5px;
      border: 1.5px solid #9FB3C8; background: #fff; transition: background .15s, border-color .15s;
    }
    .cns input:checked + .cns__box {
      border-color: var(--blue); background: var(--blue) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12l5 5L20 7'/%3E%3C/svg%3E") no-repeat center / 12px;
    }
    .cns input:focus-visible + .cns__box { box-shadow: 0 0 0 3px rgba(0, 176, 255, .25); }
    .cns--err .cns__box { border-color: #E5484D; }
    .cns__txt { font: 500 12px/1.5 var(--sans); color: var(--g600); }
    .cns__txt a { color: var(--blue); text-decoration: underline; text-underline-offset: 2px; }
    .cns--dark .cns__txt { color: rgba(255, 255, 255, .78); }
    .cns--dark .cns__txt a { color: #7FD3FF; }
    .cns__msg { margin: 6px 0 0 28px; font: 600 12px/1.4 var(--sans); color: #D93036; }
  `],
})
export class ConsentComponent implements ControlValueAccessor {
  @Input() kind: ConsentKind = 'customer';
  /** Show the red error state (set when the user tries to submit unticked). */
  @Input() showError = false;
  /** Light text for dark backgrounds. */
  @Input() dark = false;

  readonly errorText = CONSENT_ERROR;
  value = false;
  disabled = false;

  get text(): string { return TEXT[this.kind]; }

  private onChange: (v: boolean) => void = () => { };
  onTouched: () => void = () => { };

  toggle(v: boolean): void { this.value = v; this.onChange(v); this.onTouched(); }

  writeValue(v: boolean): void { this.value = !!v; }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}
