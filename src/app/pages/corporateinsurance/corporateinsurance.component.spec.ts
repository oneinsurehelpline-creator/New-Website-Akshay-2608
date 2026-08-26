import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateinsuranceComponent } from './corporateinsurance.component';

describe('CorporateinsuranceComponent', () => {
  let component: CorporateinsuranceComponent;
  let fixture: ComponentFixture<CorporateinsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorporateinsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorporateinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
