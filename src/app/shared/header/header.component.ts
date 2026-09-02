import { Component, HostListener } from '@angular/core';

interface MegaItem {
  label: string;
  /** Omit for a compact link (name only, no description card). */
  desc?: string;
  route?: string;
  href?: string;
}
interface MegaGroup {
  title: string;
  items: MegaItem[];
}
interface NavLink {
  label: string;
  route?: string;
  href?: string;   // external link
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  scrolled = false;
  scrollProgress = 0;
  mobileOpen = false;
  megaOpen = false;
  private megaTimer: ReturnType<typeof setTimeout> | undefined;

  /** Products mega-menu — edit here to add/rename products. */
  productGroups: MegaGroup[] = [
    {
      title: 'Core Plans',
      items: [
        { label: 'Guaranteed Savings', desc: 'Fixed returns, zero market risk', route: '/GuaranteedInvestmentPlans' },
        { label: 'Term Life Insurance', desc: 'Pure protection for your dependents', route: '/TermInsurance' },
        { label: 'Health Insurance', desc: 'Family floaters and critical illness', route: '/HealthInsurance' },
        { label: 'Motor Insurance', desc: 'Car, two-wheeler, commercial', route: '/MotorInsurance' },
        { label: 'Market-Linked Plans', desc: 'Growth with a life-cover floor', route: '/MarketLinkedPlans' },
      ],
    },
    {
      title: 'Additional Cover',
      items: [
        { label: 'Travel Insurance', route: '/GeneralInsurance' },
        { label: 'Home Insurance', route: '/GeneralInsurance' },
        { label: 'Critical Illness Plans', route: '/CriticalIllnessPlans' },
        { label: 'Personal Accident Plans', route: '/PersonalAccidentPlans' },
        { label: 'Pet Insurance', route: '/PetInsurance' },
        { label: 'Fire Insurance', route: '/FireInsurance' },
        { label: 'Corporate Insurance', route: '/CorporateInsurance' },
        { label: 'Employer-Employee Insurance', route: '/EmployerEmployeeInsurance' },
      ],
    },
  ];

  /** Top-level links shown after the Products dropdown. */
  navLinks: NavLink[] = [
    // { label: 'About Us', route: '/AboutUs' },
    { label: 'Claim Support', route: '/ClaimSupport' },
    // { label: 'OneInsure Money', href: 'https://www.oneinsure.money/' },    
    { label: 'Become a Partner', route: '/PartnerProgram' },
    { label: 'Careers', route: '/Careers' },
    {label: 'Explore Insurance', route: '/KnowledgeBase' }
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    this.scrollProgress = max > 0 ? Math.min((window.scrollY / max) * 100, 100) : 0;
    this.scrolled = window.scrollY > 60;
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    // On mobile, show the Products accordion expanded by default when opening.
    this.megaOpen = this.mobileOpen;
  }

  closeMenus(): void {
    this.mobileOpen = false;
    this.megaOpen = false;
  }

  /** Tap on "Products" — toggles the mega menu (accordion on mobile). */
  toggleMega(): void {
    this.megaOpen = !this.megaOpen;
  }

  /** Open immediately on hover (desktop only — ignored while the mobile menu is open). */
  openMega(): void {
    if (this.mobileOpen) { return; }
    clearTimeout(this.megaTimer);
    this.megaOpen = true;
  }

  /** Keep it open for a moment after the pointer leaves, so it doesn't
      vanish when moving from the "Products" link down into the panel. */
  closeMegaSoon(): void {
    if (this.mobileOpen) { return; }
    clearTimeout(this.megaTimer);
    this.megaTimer = setTimeout(() => (this.megaOpen = false), 260);
  }
}