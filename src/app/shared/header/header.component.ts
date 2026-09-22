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
        { label: 'Guaranteed Savings', desc: 'Fixed returns, zero market risk', route: '/guaranteed-investment-plans' },
        { label: 'Term Life Insurance', desc: 'Pure protection for your dependents', route: '/term-life-insurance' },
        { label: 'Health Insurance', desc: 'Family floaters and critical illness', route: '/health-insurance-plans' },
        { label: 'Motor Insurance', desc: 'Car, two-wheeler, commercial', route: '/motor-insurance' },
        { label: 'Market-Linked Plans', desc: 'Growth with a life-cover floor', route: '/market-linked-plans' },
      ],
    },
    {
      title: 'Additional Cover',
      items: [
        { label: 'Travel Insurance', route: '/general-insurance' },
        { label: 'Home Insurance', route: '/general-insurance' },
        { label: 'Critical Illness Plans', route: '/critical-illness-plans' },
        { label: 'Personal Accident Plans', route: '/personal-accident-insurance' },
        { label: 'Pet Insurance', route: '/pet-insurance' },
        { label: 'Fire Insurance', route: '/fire-insurance' },
        { label: 'Corporate Insurance', route: '/corporate-insurance' },
        { label: 'Employer-Employee Insurance', route: '/employer-employee-insurance' },
      ],
    },
  ];

  /** Top-level links shown after the Products dropdown. */
  navLinks: NavLink[] = [
    // { label: 'About Us', route: '/about-us' },
    { label: 'Claim Support', route: '/insurance-claim-support' },
    // { label: 'OneInsure Money', href: 'https://www.oneinsure.money/' },    
    { label: 'Become a Partner', route: '/partner-program' },
    // { label: 'Careers', route: '/career-opportunities' },
    {label: 'Explore Insurance', route: '/knowledge-base' }
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