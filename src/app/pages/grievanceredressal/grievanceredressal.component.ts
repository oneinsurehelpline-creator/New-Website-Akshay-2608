import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Contact { label: string; value: string; href?: string; }

interface EscalationLevel {
  step: string;
  title: string;
  who: string;
  when: string;
  /** Promised response time. Empty string = still to be confirmed by compliance. */
  timeline: string;
  contacts: Contact[];
}

/** Shown wherever compliance hasn't supplied a value yet. Must be gone before go-live. */
export const TBC = 'To be confirmed';

@Component({
  selector: 'app-grievanceredressal',
  templateUrl: './grievanceredressal.component.html',
  styleUrls: ['./grievanceredressal.component.scss'],
})
export class GrievanceredressalComponent implements AfterViewInit, OnDestroy {
  readonly TBC = TBC;

  /* ---------------------------------------------------------------
     Edit officer details and timelines here. Leave '' for anything
     not yet confirmed; the page shows "To be confirmed" in its place.
     --------------------------------------------------------------- */
  readonly levels: EscalationLevel[] = [
    {
      step: 'Level 1',
      title: 'Customer support',
      who: 'OneInsure support team',
      when: 'Start here for any complaint about our service or your policy.',
      timeline: 'Acknowledged in 3 working days, resolved in 14',
      contacts: [
        { label: 'Email', value: 'support@oneinsure.com', href: 'mailto:support@oneinsure.com' },
        { label: 'Call', value: '+91 86559 86559', href: 'tel:+918655986559' },
        { label: 'WhatsApp', value: '+91 86559 86559', href: 'https://wa.me/918655986559?text=' + encodeURIComponent('Hi, I want to raise a complaint.') },
      ],
    },
    {
      step: 'Level 2',
      title: 'Grievance Officer',
      who: 'Ms. Rochelle Mascarenhas',
      when: 'If you\'re not satisfied with the response, or haven\'t heard back in time.',
      timeline: 'Written reply in 15 days',
      contacts: [
        { label: 'Email', value: 'rochelle.mascarenhas@oneinsure.com', href: 'mailto:rochelle.mascarenhas@oneinsure.com' },
      ],
    },
    {
      step: 'Level 3',
      title: 'Principal Officer',
      who: 'Mrs. Mukta Bansal',
      when: 'If the Grievance Officer\'s resolution doesn\'t settle the matter.',
      timeline: 'Written reply in 15 days',
      contacts: [
        { label: 'Email', value: 'mukta.bansal@oneinsure.com', href: 'mailto:mukta.bansal@oneinsure.com' },
      ],
    },
  ];

  /** Postal address for written complaints. */
  readonly postalAddress = 'Grievance Officer, Robinhood Insurance Broker Ltd., 501–503, Sigma Building, Hiranandani Gardens, Powai, Mumbai, Maharashtra 400076';

  private isBrowser: boolean;
  private observer?: IntersectionObserver;

  constructor(@Inject(PLATFORM_ID) platformId: object, private host: ElementRef<HTMLElement>) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) { return; }
    const els = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal-up'));
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    this.observer = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); this.observer?.unobserve(e.target); }
    }), { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}
