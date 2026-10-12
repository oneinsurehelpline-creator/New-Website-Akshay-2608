import { Component } from '@angular/core';

/** /calculators: the shared calculators on their own page. */
@Component({
  selector: 'app-calculatorspage',
  template: `
    <section class="cp-hero">
      <div class="container">
        <nav aria-label="breadcrumb" class="cp-crumb">
          <a routerLink="/">Home</a><span>/</span><span aria-current="page">Calculators</span>
        </nav>
      </div>
    </section>
    <app-calculators [showMore]="true"></app-calculators>
    <section class="cp-help section--tight">
      <div class="container">
        <div class="cp-help__card">
          <div>
            <h2>Want an advisor to check your numbers?</h2>
            <p>A free 30-minute call to turn your result into a plan that fits your family.</p>
          </div>
          <a class="btn btn--orange btn--big" href="https://schedule.oneinsure.com/book/get-expert-guidance-web"
            appScheduleLink>Book a free call</a>
        </div>
      </div>
    </section>`,
  styles: [`
    :host { display: block; }
    .cp-hero { padding: clamp(110px, 11vw, 130px) 0 0; background: var(--neutral); }
    .cp-crumb { font: 500 13px/1 var(--sans); color: var(--g500); }
    .cp-crumb a { color: var(--g500); text-decoration: none; }
    .cp-crumb a:hover { color: var(--blue); }
    .cp-crumb span { margin: 0 6px; }
    .cp-crumb span[aria-current] { margin: 0; color: var(--blue-deep); font-weight: 600; }
    .cp-help__card {
      max-width: 960px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 18px 30px; padding: 28px 32px; border-radius: 22px;
      background: linear-gradient(115deg, #0D2B55 0%, #0B4A8F 60%, #0A74C9 100%);
    }
    .cp-help__card h2 { font-size: clamp(21px, 2.4vw, 26px); color: #fff; }
    .cp-help__card p { margin-top: 6px; font: 400 15px/1.6 var(--sans); color: rgba(255, 255, 255, .78); }
    @media (max-width: 768px) { .cp-help__card { padding: 24px 22px; } }
  `],
})
export class CalculatorspageComponent { }
