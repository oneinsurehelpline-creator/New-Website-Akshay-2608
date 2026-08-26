import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuranteedCarouselComponent } from './guranteed-carousel.component';

describe('GuranteedCarouselComponent', () => {
  let component: GuranteedCarouselComponent;
  let fixture: ComponentFixture<GuranteedCarouselComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuranteedCarouselComponent]
    });
    fixture = TestBed.createComponent(GuranteedCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
