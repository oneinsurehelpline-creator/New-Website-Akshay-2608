import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ScrollToDirective } from './scroll-to.directive';
import { BranchComponent } from './branch/branch.component';
import { VideoModalComponent } from './video-modal/video-modal.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ScrollToDirective,
    BranchComponent,
    VideoModalComponent
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
    VideoModalComponent
  ]
})
export class SharedModule { }