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
import { TermsconditionsComponent } from './pages/termsconditions/termsconditions.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about-us', component: AboutusComponent },
  { path: 'health-insurance-plans', component: HealthinsuranceComponent },
  { path: 'term-life-insurance', component: TerminsuranceComponent },
  { path: 'motor-insurance', component: MotorinsuranceComponent },
  { path: 'market-linked-plans', component: MarketlinkedplansComponent },
  { path: 'guaranteed-investment-plans', component: GuaranteedinvestmentplansComponent },
  { path: 'general-insurance', component: GeneralinsuranceComponent },
  { path: 'insurance-claim-support', component: ClaimsupportComponent },
  { path: 'partner-program', component: PartnerprogramComponent },
  { path: 'career-opportunities', component: CareersComponent },
  { path: 'privacy-policy', component: PrivacypolicyComponent },
  { path: 'knowledge-base', component: KnowledgebaseComponent},
  { path: 'terms-conditions', component: TermsconditionsComponent},
  { path: 'regulatory-disclosures', component: RegulatorydisclosuresComponent },
  { path: 'critical-illness-plans', component: CriticalillnessplansComponent },
  { path: 'personal-accident-insurance', component: PersonalaccidentplansComponent },
  { path: 'pet-insurance', component: PetinsuranceComponent },
  { path: 'fire-insurance', component: FireinsuranceComponent },
  { path: 'corporate-insurance', component: CorporateinsuranceComponent },
  { path: 'employer-employee-insurance', component: EmployeremployeeinsuranceComponent },
  // Full branch-finder page. `branchPage: true` puts BranchComponent into page mode.
  { path: 'branch-locator', component: BranchComponent, data: { branchPage: true } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', scrollOffset: [0, 96] })],
  exports: [RouterModule]
})
export class AppRoutingModule { }