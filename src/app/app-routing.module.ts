import { NgModule, inject } from '@angular/core';
import { Router, RouterModule, Routes, UrlMatchResult, UrlSegment } from '@angular/router';

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
import { MyaccountComponent } from './pages/myaccount/myaccount.component';
import { authGuard } from './services/auth.guard';
import { ServicesupportComponent } from './pages/servicesupport/servicesupport.component';
import { GrievanceredressalComponent } from './pages/grievanceredressal/grievanceredressal.component';
import { CalculatorspageComponent } from './pages/calculatorspage/calculatorspage.component';
import { ContactusComponent } from './pages/contactus/contactus.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';

/** Old site's /service and /Service/<service>/<insurer> URLs (any case). */
export function oldServiceMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  return segments.length && segments[0].path.toLowerCase() === 'service' ? { consumed: segments } : null;
}

/** Per-route SEO metadata, applied by SeoService (title, description, self-referencing canonical, og:*). */
const seo = (title: string, description: string, noindex = false) => ({ seo: { title, description, noindex } });

const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'about-us', component: AboutusComponent },
  { path: 'health-insurance-plans', component: HealthinsuranceComponent, data: seo('Health Insurance Plans: Compare & Buy Online | OneInsure', 'Compare health insurance plans from 40+ insurers, check premiums and coverage, and buy or renew online with OneInsure.') },
  { path: 'term-life-insurance', component: TerminsuranceComponent, data: seo('Term Life Insurance: Compare Plans & Premiums | OneInsure', 'Compare term life insurance plans, get high cover at low premiums, and buy online with OneInsure.') },
  { path: 'motor-insurance', component: MotorinsuranceComponent, data: seo('Motor Insurance: Car & Bike Insurance Online | OneInsure', 'Compare and renew car and two-wheeler insurance from top insurers with OneInsure.') },
  { path: 'market-linked-plans', component: MarketlinkedplansComponent, data: seo('Market Linked Plans (ULIP): Compare & Invest | OneInsure', 'Explore market linked insurance plans (ULIPs) from leading insurers and invest with OneInsure.') },
  { path: 'guaranteed-investment-plans', component: GuaranteedinvestmentplansComponent, data: seo('Guaranteed Investment Plans: Compare & Buy | OneInsure', 'Compare guaranteed return insurance and investment plans from top insurers with OneInsure.') },
  { path: 'general-insurance', component: GeneralinsuranceComponent, data: seo('General Insurance: Travel, Home & More | OneInsure', 'Compare general insurance plans including travel, home and more from leading insurers with OneInsure.') },
  { path: 'insurance-claim-support', component: ClaimsupportComponent, data: seo('Insurance Claim Support: File & Track Claims | OneInsure', "Get help filing and tracking health, motor and life insurance claims with OneInsure's claim support team.") },
  { path: 'service-support', component: ServicesupportComponent, data: seo('Insurance Service Support: Policy Help | OneInsure', 'Get help with policy renewals, endorsements, documents and other insurance service requests from OneInsure.') },
  { matcher: oldServiceMatcher, redirectTo: 'service-support' },
  { path: 'grievance-redressal', component: GrievanceredressalComponent, data: seo('Grievance Redressal | OneInsure', 'Raise a complaint or grievance with OneInsure and learn how we resolve it.') },
  { path: 'calculators', component: CalculatorspageComponent, data: seo('Insurance Calculators: Premium & Cover Tools | OneInsure', 'Use free insurance calculators to estimate premiums, cover and returns before you buy.') },
  { path: 'contact-us', component: ContactusComponent, data: seo('Contact Us | OneInsure', 'Contact OneInsure for help buying, renewing or claiming insurance. Call, email or request a callback.') },
  // OneInsure AI (ai.oneinsure.com) links here for 'Talk to an advisor': send it to the callback section.
  { path: 'assistance/talk-to-an-advisor', redirectTo: () => inject(Router).createUrlTree(['/'], { fragment: 'consult' }) },
  { path: 'partner-program', component: PartnerprogramComponent, data: seo('Become an Insurance Partner (POSP) | OneInsure', 'Join the OneInsure partner program and sell insurance from 40+ insurers with training and support.') },
  { path: 'career-opportunities', component: CareersComponent, data: seo('Careers at OneInsure | Open Roles', 'Explore open roles and build your career with OneInsure.') },
  { path: 'privacy-policy', component: PrivacypolicyComponent, data: seo('Privacy Policy | OneInsure', 'Read how OneInsure collects, uses and protects your personal information.') },
  { path: 'knowledge-base', component: KnowledgebaseComponent, data: seo('Insurance Knowledge Base: Guides & Articles | OneInsure', 'Read guides and articles on health, term, motor and investment insurance from OneInsure.') },
  { path: 'terms-conditions', component: TermsconditionsComponent, data: seo('Terms & Conditions | OneInsure', 'Read the terms and conditions of using the OneInsure website and services.') },
  { path: 'my-account', component: MyaccountComponent, canActivate: [authGuard], data: seo('My Account | OneInsure', 'Manage your OneInsure policies and claims.', true) },
  { path: 'my-account/:tab', component: MyaccountComponent, canActivate: [authGuard], data: seo('My Account | OneInsure', 'Manage your OneInsure policies and claims.', true) },
  { path: 'regulatory-disclosures', component: RegulatorydisclosuresComponent, data: seo('Regulatory Disclosures | OneInsure', "View OneInsure's IRDAI registration details and regulatory disclosures.") },
  { path: 'critical-illness-plans', component: CriticalillnessplansComponent, data: seo('Critical Illness Insurance: Compare Plans | OneInsure', 'Compare critical illness insurance plans that pay a lump sum on diagnosis, with OneInsure.') },
  { path: 'personal-accident-insurance', component: PersonalaccidentplansComponent, data: seo('Personal Accident Insurance: Compare Plans | OneInsure', 'Compare personal accident insurance plans covering injury, disability and accidental death with OneInsure.') },
  { path: 'pet-insurance', component: PetinsuranceComponent, data: seo('Pet Insurance: Cover for Dogs & Cats | OneInsure', 'Compare pet insurance plans for vet bills and care with OneInsure.') },
  { path: 'fire-insurance', component: FireinsuranceComponent, data: seo('Fire Insurance for Home & Business | OneInsure', 'Protect your home, shop or business against fire and allied perils with OneInsure.') },
  { path: 'corporate-insurance', component: CorporateinsuranceComponent, data: seo('Corporate Insurance for Businesses | OneInsure', 'Group health, liability and property insurance solutions for businesses from OneInsure.') },
  { path: 'employer-employee-insurance', component: EmployeremployeeinsuranceComponent, data: seo('Employer-Employee Insurance: Group Benefits | OneInsure', 'Group health and benefits insurance for employers and employees with OneInsure.') },
  // Full branch-finder page. `branchPage: true` puts BranchComponent into page mode.
  { path: 'branch-locator', component: BranchComponent, data: { branchPage: true, ...seo('Branch Locator: Find a OneInsure Branch Near You', 'Find the nearest OneInsure branch and contact details.') } },
  { path: '**', component: NotfoundComponent, data: seo('Page Not Found | OneInsure', 'The page you are looking for does not exist.', true) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', scrollOffset: [0, 96] })],
  exports: [RouterModule]
})
export class AppRoutingModule { }