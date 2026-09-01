import { Directive, HostListener, Input } from '@angular/core';
import { ScheduleModalService } from './schedule-modal.service';

/**
 * Drop onto any <a> that points at the schedule-a-call link to open it in the
 * inline booking modal instead of navigating away. The href stays intact so
 * middle-click / right-click "open in new tab" and no-JS fallback still work.
 *
 * Usage:
 *   <a href="https://schedule.oneinsure.com/..." appScheduleLink>Book a call</a>
 *   <a [href]="link.href" [appScheduleLink]="isScheduleLink">...</a>  (conditional)
 */
@Directive({
  selector: '[appScheduleLink]',
})
export class ScheduleCtaDirective {
  @Input() appScheduleLink: boolean | string = true;

  constructor(private svc: ScheduleModalService) {}

  @HostListener('click', ['$event'])
  onClick(e: Event): void {
    const enabled = this.appScheduleLink !== false
      && this.appScheduleLink !== null
      && this.appScheduleLink !== undefined;
    if (!enabled) {
      return;
    }
    e.preventDefault();
    this.svc.open();
  }
}
