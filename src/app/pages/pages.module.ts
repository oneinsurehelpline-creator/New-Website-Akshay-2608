import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { HomeComponent } from './home/home.component'; 
import { CarouselHeaderComponent } from './home/carousel-header/carousel-header.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { CareersComponent } from './careers/careers.component';
import { ClaimsupportComponent } from './claimsupport/claimsupport.component';
import { GuaranteedinvestmentplansComponent } from './guaranteedinvestmentplans/guaranteedinvestmentplans.component';
import { GuranteedCarouselComponent } from './guaranteedinvestmentplans/guranteed-carousel/guranteed-carousel.component';
import { GeneralinsuranceComponent } from './generalinsurance/generalinsurance.component';
import { HealthinsuranceComponent } from './healthinsurance/healthinsurance.component';
import { TerminsuranceComponent } from './terminsurance/terminsurance.component';
import { MotorinsuranceComponent } from './motorinsurance/motorinsurance.component';
import { MarketlinkedplansComponent } from './marketlinkedplans/marketlinkedplans.component';
import { PartnerprogramComponent } from './partnerprogram/partnerprogram.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { KnowledgebaseComponent } from './knowledgebase/knowledgebase.component';
import { RegulatorydisclosuresComponent } from './regulatorydisclosures/regulatorydisclosures.component';
import { CriticalillnessplansComponent } from './criticalillnessplans/criticalillnessplans.component';
import { PersonalaccidentplansComponent } from './personalaccidentplans/personalaccidentplans.component';
import { PetinsuranceComponent } from './petinsurance/petinsurance.component';
import { FireinsuranceComponent } from './fireinsurance/fireinsurance.component';
import { CorporateinsuranceComponent } from './corporateinsurance/corporateinsurance.component';
import { EmployeremployeeinsuranceComponent } from './employeremployeeinsurance/employeremployeeinsurance.component';
import { TermsconditionsComponent } from './termsconditions/termsconditions.component';



@NgModule({
  declarations: [
    HomeComponent,
    CarouselHeaderComponent,
    AboutusComponent,
    CareersComponent,
    ClaimsupportComponent,
    GuaranteedinvestmentplansComponent,
    GuranteedCarouselComponent,
    GeneralinsuranceComponent,
    HealthinsuranceComponent,
    TerminsuranceComponent,
    MotorinsuranceComponent,
    MarketlinkedplansComponent,
    PartnerprogramComponent,
    PrivacypolicyComponent,
    KnowledgebaseComponent,
    RegulatorydisclosuresComponent,
    CriticalillnessplansComponent,
    PersonalaccidentplansComponent,
    PetinsuranceComponent,
    FireinsuranceComponent,
    CorporateinsuranceComponent,
    EmployeremployeeinsuranceComponent,
    TermsconditionsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class PagesModule { }