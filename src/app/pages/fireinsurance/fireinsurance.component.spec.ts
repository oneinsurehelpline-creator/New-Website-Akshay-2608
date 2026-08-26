import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireinsuranceComponent } from './fireinsurance.component';

describe('FireinsuranceComponent', () => {
  let component: FireinsuranceComponent;
  let fixture: ComponentFixture<FireinsuranceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FireinsuranceComponent]
    });
    fixture = TestBed.createComponent(FireinsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
