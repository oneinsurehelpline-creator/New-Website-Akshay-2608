import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorinsuranceComponent } from './motorinsurance.component';

describe('MotorinsuranceComponent', () => {
  let component: MotorinsuranceComponent;
  let fixture: ComponentFixture<MotorinsuranceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MotorinsuranceComponent]
    });
    fixture = TestBed.createComponent(MotorinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
