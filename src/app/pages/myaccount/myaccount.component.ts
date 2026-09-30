import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserProfile } from '../../services/auth.service';

type AccountTab = 'dashboard' | 'policies' | 'claims' | 'profile';

interface AccountNavItem {
  key: AccountTab;
  label: string;
}

interface ProductCard {
  title: string;
  desc: string;
  img: string;
  route: string;
}

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyaccountComponent implements OnInit, OnDestroy {
  isBrowser: boolean;
  tab: AccountTab = 'dashboard';
  mobile = '';
  profile: UserProfile;
  profileSaved = false;

  navItems: AccountNavItem[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'policies', label: 'Your policies' },
    { key: 'claims', label: 'Claims' },
    { key: 'profile', label: 'Profile' },
  ];

  /** "Let's find the right insurance for you" cards on the dashboard. */
  products: ProductCard[] = [
    { title: 'Term Life Insurance', desc: "Secure your family's finances forever", img: 'assets/images/icons/07_Term_Life_Insurance.png', route: '/term-life-insurance' },
    { title: 'Investment Plans', desc: 'Grow your wealth & become financially independent', img: 'assets/images/icons/06_Guaranteed_Savings.png', route: '/guaranteed-investment-plans' },
    { title: 'Health Insurance', desc: 'You focus on your health while your policy pays the bill', img: 'assets/images/icons/08_Health.png', route: '/health-insurance-plans' },
    { title: 'Car Insurance', desc: 'Protect your car & wallet for stress-free drives', img: 'assets/images/icons/09_Car_Bike_Motor.png', route: '/motor-insurance' },
    { title: 'Market-Linked Plans', desc: 'Growth with a life-cover floor', img: 'assets/images/icons/10_Market_Linked_Investment.png', route: '/market-linked-plans' },
    { title: 'Critical Illness', desc: 'A lump sum when a serious diagnosis hits', img: 'assets/images/icons/15_Critical_Illness.png', route: '/critical-illness-plans' },
  ];

  /** TODO: load from the backend once the policies / claims APIs are available. */
  policies: any[] = [];
  claims: any[] = [];

  private sub?: Subscription;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.profile = this.auth.getProfile();
  }

  ngOnInit(): void {
    this.mobile = this.auth.mobile || '';
    this.sub = this.route.paramMap.subscribe((params) => {
      const tab = params.get('tab') as AccountTab | null;
      this.tab = tab && this.navItems.some((n) => n.key === tab) ? tab : 'dashboard';
      this.profileSaved = false;
    });
  }

  get firstName(): string {
    return (this.profile.name || '').trim().split(/\s+/)[0] || 'there';
  }

  tabLink(key: AccountTab): string[] {
    return key === 'dashboard' ? ['/my-account'] : ['/my-account', key];
  }

  saveProfile(): void {
    this.auth.saveProfile({ ...this.profile, name: this.profile.name.trim(), email: this.profile.email.trim() });
    this.profile = this.auth.getProfile();
    this.profileSaved = true;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
