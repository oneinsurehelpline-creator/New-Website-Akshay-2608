import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ScrollToDirective } from './scroll-to.directive';
import { BranchComponent } from './branch/branch.component';
import { VideoModalComponent } from './video-modal/video-modal.component';
import { ScheduleModalComponent } from './schedule-modal/schedule-modal.component';
import { ScheduleCtaDirective } from './schedule-modal/schedule-cta.directive';
import { PlanNudgeComponent } from './plan-nudge/plan-nudge.component';
import { RegDisclaimerComponent } from './reg-disclaimer/reg-disclaimer.component';
import { ConsentComponent } from './consent/consent.component';
import { MobileBarComponent } from './mobile-bar/mobile-bar.component';
import { CalculatorsComponent } from './calculators/calculators.component';
import { ProductMarqueeComponent } from './product-marquee/product-marquee.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ScrollToDirective,
    BranchComponent,
    VideoModalComponent,
    ScheduleModalComponent,
    ScheduleCtaDirective,
    PlanNudgeComponent,
    RegDisclaimerComponent,
    ConsentComponent,
    MobileBarComponent,
    CalculatorsComponent,
    ProductMarqueeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ScrollToDirective,
    BranchComponent,
    VideoModalComponent,
    ScheduleModalComponent,
    ScheduleCtaDirective,
    PlanNudgeComponent,
    RegDisclaimerComponent,
    ConsentComponent,
    MobileBarComponent,
    CalculatorsComponent,
    ProductMarqueeComponent
  ]
})
export class SharedModule { }