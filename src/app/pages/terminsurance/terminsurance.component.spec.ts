import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminsuranceComponent } from './terminsurance.component';

describe('TerminsuranceComponent', () => {
  let component: TerminsuranceComponent;
  let fixture: ComponentFixture<TerminsuranceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TerminsuranceComponent]
    });
    fixture = TestBed.createComponent(TerminsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
