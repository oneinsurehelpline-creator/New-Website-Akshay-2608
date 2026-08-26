import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuaranteedinvestmentplansComponent } from './guaranteedinvestmentplans.component';

describe('GuaranteedinvestmentplansComponent', () => {
  let component: GuaranteedinvestmentplansComponent;
  let fixture: ComponentFixture<GuaranteedinvestmentplansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuaranteedinvestmentplansComponent]
    });
    fixture = TestBed.createComponent(GuaranteedinvestmentplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
