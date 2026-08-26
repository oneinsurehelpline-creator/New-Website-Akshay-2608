import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { HealthinsuranceComponent } from './pages/healthinsurance/healthinsurance.component';
import { TerminsuranceComponent } from './pages/terminsurance/terminsurance.component';
import { MotorinsuranceComponent } from './pages/motorinsurance/motorinsurance.component';
import { MarketlinkedplansComponent } from './pages/marketlinkedplans/marketlinkedplans.component';
import { GuaranteedinvestmentplansComponent } from './pages/guaranteedinvestmentplans/guaranteedinvestmentplans.component';
import { GeneralinsuranceComponent } from './pages/generalinsurance/generalinsurance.component';
import { ClaimsupportComponent } from './pages/claimsupport/claimsupport.component';
import { PartnerprogramComponent } from './pages/partnerprogram/partnerprogram.component';
import { CareersComponent } from './pages/careers/careers.component';
import { PrivacypolicyComponent } from './pages/privacypolicy/privacypolicy.component';
import { BranchComponent } from './shared/branch/branch.component';
import { KnowledgebaseComponent } from './pages/knowledgebase/knowledgebase.component';
import { RegulatorydisclosuresComponent } from './pages/regulatorydisclosures/regulatorydisclosures.component';
import { CriticalillnessplansComponent } from './pages/criticalillnessplans/criticalillnessplans.component';
import { PersonalaccidentplansComponent } from './pages/personalaccidentplans/personalaccidentplans.component';
import { PetinsuranceComponent } from './pages/petinsurance/petinsurance.component';
import { FireinsuranceComponent } from './pages/fireinsurance/fireinsurance.component';
import { CorporateinsuranceComponent } from './pages/corporateinsurance/corporateinsurance.component';
import { EmployeremployeeinsuranceComponent } from './pages/employeremployeeinsurance/employeremployeeinsurance.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'AboutUs', component: AboutusComponent },
  { path: 'HealthInsurance', component: HealthinsuranceComponent },
  { path: 'TermInsurance', component: TerminsuranceComponent },
  { path: 'MotorInsurance', component: MotorinsuranceComponent },
  { path: 'MarketLinkedPlans', component: MarketlinkedplansComponent },
  { path: 'GuaranteedInvestmentPlans', component: GuaranteedinvestmentplansComponent },
  { path: 'GeneralInsurance', component: GeneralinsuranceComponent },
  { path: 'ClaimSupport', component: ClaimsupportComponent },
  { path: 'PartnerProgram', component: PartnerprogramComponent },
  { path: 'Careers', component: CareersComponent },
  { path: 'PrivacyPolicy', component: PrivacypolicyComponent },
  {path: 'KnowledgeBase', component: KnowledgebaseComponent},
  { path: 'RegulatoryDisclosures', component: RegulatorydisclosuresComponent },
  { path: 'CriticalIllnessPlans', component: CriticalillnessplansComponent },
  { path: 'PersonalAccidentPlans', component: PersonalaccidentplansComponent },
  { path: 'PetInsurance', component: PetinsuranceComponent },
  { path: 'FireInsurance', component: FireinsuranceComponent },
  { path: 'CorporateInsurance', component: CorporateinsuranceComponent },
  { path: 'EmployerEmployeeInsurance', component: EmployeremployeeinsuranceComponent },
  // Full branch-finder page. `branchPage: true` puts BranchComponent into page mode.
  { path: 'BranchLocator', component: BranchComponent, data: { branchPage: true } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', scrollOffset: [0, 96] })],
  exports: [RouterModule]
})
export class AppRoutingModule { }