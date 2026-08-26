import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeremployeeinsuranceComponent } from './employeremployeeinsurance.component';

describe('EmployeremployeeinsuranceComponent', () => {
  let component: EmployeremployeeinsuranceComponent;
  let fixture: ComponentFixture<EmployeremployeeinsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeremployeeinsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeremployeeinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
