import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsupportComponent } from './claimsupport.component';

describe('ClaimsupportComponent', () => {
  let component: ClaimsupportComponent;
  let fixture: ComponentFixture<ClaimsupportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClaimsupportComponent]
    });
    fixture = TestBed.createComponent(ClaimsupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
