import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerprogramComponent } from './partnerprogram.component';

describe('PartnerprogramComponent', () => {
  let component: PartnerprogramComponent;
  let fixture: ComponentFixture<PartnerprogramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerprogramComponent]
    });
    fixture = TestBed.createComponent(PartnerprogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
