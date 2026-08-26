import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralinsuranceComponent } from './generalinsurance.component';

describe('GeneralinsuranceComponent', () => {
  let component: GeneralinsuranceComponent;
  let fixture: ComponentFixture<GeneralinsuranceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralinsuranceComponent]
    });
    fixture = TestBed.createComponent(GeneralinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
