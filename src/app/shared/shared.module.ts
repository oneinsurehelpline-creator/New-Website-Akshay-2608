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
import { LoginModalComponent } from './login-modal/login-modal.component'; 



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ScrollToDirective,
    BranchComponent,
    VideoModalComponent,
    ScheduleModalComponent,
    ScheduleCtaDirective,
    LoginModalComponent, 
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
    LoginModalComponent
  ]
})
export class SharedModule { }