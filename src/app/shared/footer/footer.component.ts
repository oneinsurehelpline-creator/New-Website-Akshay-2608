import { Component, HostListener } from '@angular/core';

interface FooterLink {
  label: string;
  route?: string;       // internal Angular route
  fragment?: string;    // scroll to a section id (uses appScrollTo)
  href?: string;        // external / tel: / mailto: link
  action?: 'grievance'; // opens an in-page modal
  newTab?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  year = new Date().getFullYear();

  grievanceOpen = false;
  openGrievance(e: Event): void { e.preventDefault(); this.grievanceOpen = true; }
  closeGrievance(): void { this.grievanceOpen = false; }
  onGrvBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('grv')) { this.closeGrievance(); }
  }

  isScheduleLink(href?: string): boolean {
    return !!href && href.includes('schedule.oneinsure.com');
  }
  @HostListener('document:keydown.escape') onEsc(): void {
    if (this.grievanceOpen) { this.closeGrievance(); }
  }

  /** Edit the footer link structure here — the template renders it automatically. */
  columns: FooterColumn[] = [
    {
      title: 'Products',
      links: [
        { label: 'Guaranteed Savings', route: '/guaranteed-investment-plans' },
        { label: 'Term Life', route: '/term-life-insurance' },
        { label: 'Health Insurance', route: '/health-insurance-plans' },
        // { label: 'Health Insurance', route: 'http://www.oneinsure.com/1sbsso/ssoredirect?email=sagar.kulkarni%40oneinsure.com.DUM&mobile=8591416559&name=SAGAR%20SATISH%20KULKARNI&roleId=1&userId=6561DUM&lob=Health&BranchId=220260729783', newTab: true },
        { label: 'Motor Insurance', route: '/motor-insurance' },
        { label: 'Market-Linked Plans', route: '/market-linked-plans' },
        { label: 'Travel & Home', route: '/general-insurance' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Claim assistance', route: '/insurance-claim-support' },
        { label: 'Renew a policy', fragment: 'consult' },
        { label: 'Calculators', fragment: 'calc' },
        { label: 'Knowledge base', route: '/knowledge-base' },
        { label: 'Grievance redressal', action: 'grievance' },
        { label: 'Contact us', href: 'https://schedule.oneinsure.com/book/get-expert-guidance-web' },
      ],
    },
    {
      title: 'Company',
      links: [
        // { label: 'About Us', route: '/about-us' },
        { label: 'Careers', route: '/career-opportunities' },
        { label: 'Partnerships', route: '/partner-program' },
        { label: 'Regulatory Disclosures', route: '/regulatory-disclosures' },
      ],
    },
    {
      title: 'Talk to us',
      links: [
        { label: '+91 86559 86559', href: 'tel:+918655986559' },
        { label: 'WhatsApp us', href: 'https://wa.me/918655986559' },
        { label: 'support@oneinsure.com', href: 'mailto:support@oneinsure.com' },
        { label: 'Find a branch', route: '/branch-locator' },
      ],
    },
  ];

  socials = [
    { label: 'Facebook', href: 'https://www.facebook.com/OneInsureOfficial' },
    { label: 'Instagram', href: 'https://www.instagram.com/getoneinsure/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/oneinsure-robinhood/' },
    { label: 'YouTube', href: 'https://www.youtube.com/@getoneinsure' },
  ];
}