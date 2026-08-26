import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriticalillnessplansComponent } from './criticalillnessplans.component';

describe('CriticalillnessplansComponent', () => {
  let component: CriticalillnessplansComponent;
  let fixture: ComponentFixture<CriticalillnessplansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CriticalillnessplansComponent]
    });
    fixture = TestBed.createComponent(CriticalillnessplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
