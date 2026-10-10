import { FOUNDED_YEAR } from '../site-facts';
import { Component } from '@angular/core';

interface FooterLink {
  label: string;
  route?: string;       // internal Angular route
  fragment?: string;    // scroll to a section id (uses appScrollTo)
  href?: string;        // external / tel: / mailto: link
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
  readonly foundedYear = FOUNDED_YEAR;

  /** IRDAI broker licence. Update the date here as soon as the renewal comes through. */
  readonly irdaiRegNo = 'IRDA/DB 407/08';
  readonly licenceValidThrough = '13 Nov 2026';

  isScheduleLink(href?: string): boolean {
    return !!href && href.includes('schedule.oneinsure.com');
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
        { label: 'Claim Assistance', route: '/insurance-claim-support' },
        { label: 'Services', route: '/service-support' },
        { label: 'Renew a Policy', href: 'https://wa.me/918655986559?text=' + encodeURIComponent('Hi, I want to renew my policy.'), newTab: true },
        { label: 'Calculators', fragment: 'calc' },
        // { label: 'Knowledge base', route: '/knowledge-base' },
        { label: 'Grievance Redressal', route: '/grievance-redressal' },
        { label: 'Contact us', href: 'https://schedule.oneinsure.com/book/get-expert-guidance-web' },
      ],
    },
    {
      title: 'Company',
      links: [
        // { label: 'About Us', route: '/about-us' },
        { label: 'Careers', route: '/career-opportunities' },
        { label: 'Partnerships', route: '/partner-program' },
        { label: 'Knowledge Base', route: '/knowledge-base' },
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