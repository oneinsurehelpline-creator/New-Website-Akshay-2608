import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';

/**
 * Smoothly scrolls to a section id.
 *  - If we're already on the target route, scrolls directly (fixes the
 *    "same-route fragment doesn't scroll" problem the Angular router has).
 *  - Otherwise navigates to the route with a fragment, and the router's
 *    anchorScrolling takes over once the page loads.
 *
 * Usage:  <a appScrollTo="consult">Book a Free Call</a>
 *         <a [appScrollTo]="'calc'" route="/">Calculators</a>
 */
@Directive({ selector: '[appScrollTo]' })
export class ScrollToDirective {
  @Input('appScrollTo') anchor = '';
  @Input() route = '/';

  constructor(private router: Router, private vps: ViewportScroller) {}

  @HostListener('click', ['$event'])
  onClick(e: Event): void {
    e.preventDefault();
    if (!this.anchor) { return; }
    const current = this.router.url.split(/[?#]/)[0] || '/';
    if (current === this.route) {
      this.vps.scrollToAnchor(this.anchor);
    } else {
      this.router.navigate([this.route], { fragment: this.anchor });
    }
  }
}