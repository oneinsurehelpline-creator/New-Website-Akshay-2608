import { Component } from '@angular/core';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.scss'],
})
export class NotfoundComponent {
  links = [
    { label: 'Health Insurance', path: '/health-insurance-plans' },
    { label: 'Term Life Insurance', path: '/term-life-insurance' },
    { label: 'Motor Insurance', path: '/motor-insurance' },
    { label: 'Claim Support', path: '/insurance-claim-support' },
    { label: 'Contact Us', path: '/contact-us' },
  ];
}
