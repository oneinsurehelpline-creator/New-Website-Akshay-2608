import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetinsuranceComponent } from './petinsurance.component';

describe('PetinsuranceComponent', () => {
  let component: PetinsuranceComponent;
  let fixture: ComponentFixture<PetinsuranceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PetinsuranceComponent]
    });
    fixture = TestBed.createComponent(PetinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
