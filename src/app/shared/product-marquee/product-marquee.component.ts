import { Component, Input, OnChanges } from '@angular/core';
import { INSURERS } from '../../pages/servicesupport/servicesupport.data';
import { WHATSAPP_URL } from '../site-facts';
import { MarqueeCategory, POPULAR_PLANS } from './product-marquee.data';

interface Card { plan: string; insurer: string; logo?: string; initials: string; wa: string; }

/**
 * Scrolling band of popular plans from leading insurers, shown at the end of each
 * product page. Tapping a plan opens WhatsApp with a question about it.
 */
@Component({
  selector: 'app-product-marquee',
  template: `
    <section class="pm" aria-labelledby="pm-title">
      <div class="container pm__head">
        <span class="eyebrow">Popular plans</span>
        <h2 id="pm-title">Plans we help families <span class="accent">choose every day</span></h2>
        <p>From India's leading insurers. Tap a plan to ask an advisor if it suits you.</p>
      </div>
      <div class="pm__viewport">
        <ul class="pm__track" [style.animation-duration.s]="cards.length * 4">
          <li *ngFor="let c of loop; let i = index" [attr.aria-hidden]="i >= cards.length ? 'true' : null">
            <a class="pm__card" [href]="c.wa" target="_blank" rel="noopener noreferrer"
              [attr.tabindex]="i >= cards.length ? -1 : null">
              <span class="pm__logo">
                <img *ngIf="c.logo; else ini" [src]="c.logo" [alt]="c.insurer" loading="lazy">
                <ng-template #ini><b>{{ c.initials }}</b></ng-template>
              </span>
              <span class="pm__txt">
                <strong>{{ c.plan }}</strong>
                <small>{{ c.insurer }}</small>
              </span>
            </a>
          </li>
        </ul>
      </div>
      <p class="container pm__fine">Plan names are trademarks of their respective insurers. Listing a plan is not a
        recommendation; an advisor will check what fits your needs.</p>
    </section>`,
  styles: [`
    :host { display: block; }
    .pm { padding: clamp(56px, 7vw, 84px) 0 clamp(40px, 5vw, 56px); background: #fff; overflow: hidden; }
    .pm__head { text-align: center; max-width: 720px; margin-bottom: 28px; }
    .pm__head h2 { margin-top: 14px; font-size: clamp(26px, 3.2vw, 36px); letter-spacing: -1px; }
    .pm__head p { margin-top: 8px; font: 400 15px/1.6 var(--sans); color: var(--g600); }
    .pm__viewport {
      overflow: hidden;
      -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
      mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
    }
    .pm__track {
      display: flex; gap: 14px; width: max-content; margin: 0; padding: 6px 0; list-style: none;
      animation: pmScroll linear infinite;
    }
    .pm__viewport:hover .pm__track, .pm__viewport:focus-within .pm__track { animation-play-state: paused; }
    @keyframes pmScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    .pm__card {
      display: flex; align-items: center; gap: 12px; min-width: 250px; height: 76px; padding: 10px 18px 10px 10px;
      background: #fff; border: 1px solid #E4ECF4; border-radius: 16px; text-decoration: none;
      box-shadow: 0 14px 30px -24px rgba(13, 43, 85, .35);
      transition: border-color .2s, transform .2s var(--ease);
    }
    .pm__card:hover { border-color: rgba(0, 176, 255, .45); transform: translateY(-2px); }
    .pm__logo {
      flex-shrink: 0; display: grid; place-items: center; width: 74px; height: 54px;
      border-radius: 10px; background: #F7FAFD;
    }
    .pm__logo img { max-width: 64px; max-height: 40px; object-fit: contain; }
    .pm__logo b {
      display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, var(--blue-deep), #0B4A8F); font: 800 13px/1 var(--display); color: #fff;
    }
    .pm__txt { display: flex; flex-direction: column; gap: 4px; }
    .pm__txt strong { font: 700 14.5px/1.25 var(--display); color: var(--blue-deep); white-space: nowrap; }
    .pm__txt small { font: 500 12px/1 var(--sans); color: var(--g500); white-space: nowrap; }
    .pm__fine { margin-top: 18px; text-align: center; font: 500 11.5px/1.5 var(--sans); color: var(--g500); }
    @media (prefers-reduced-motion: reduce) {
      .pm__track { animation: none; }
      .pm__viewport { overflow-x: auto; }
    }
  `],
})
export class ProductMarqueeComponent implements OnChanges {
  @Input() category: MarqueeCategory = 'health';

  cards: Card[] = [];
  /** Cards twice over, so the scroll loops seamlessly. */
  loop: Card[] = [];

  ngOnChanges(): void {
    this.cards = (POPULAR_PLANS[this.category] ?? []).map((p) => {
      const ins = p.id ? INSURERS.find((i) => i.id === p.id) : undefined;
      const insurer = ins?.name ?? p.name ?? '';
      return {
        plan: p.plan,
        insurer,
        logo: ins?.logo,
        initials: insurer.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join(''),
        wa: WHATSAPP_URL + '?text=' + encodeURIComponent(`Hi, I'd like to know if ${insurer} ${p.plan} is right for me.`),
      };
    });
    this.loop = [...this.cards, ...this.cards];
  }
}
