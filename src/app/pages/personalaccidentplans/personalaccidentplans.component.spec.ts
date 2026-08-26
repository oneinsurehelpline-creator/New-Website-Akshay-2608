import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalaccidentplansComponent } from './personalaccidentplans.component';

describe('PersonalaccidentplansComponent', () => {
  let component: PersonalaccidentplansComponent;
  let fixture: ComponentFixture<PersonalaccidentplansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalaccidentplansComponent]
    });
    fixture = TestBed.createComponent(PersonalaccidentplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
