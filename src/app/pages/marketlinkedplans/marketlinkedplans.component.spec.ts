import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketlinkedplansComponent } from './marketlinkedplans.component';

describe('MarketlinkedplansComponent', () => {
  let component: MarketlinkedplansComponent;
  let fixture: ComponentFixture<MarketlinkedplansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MarketlinkedplansComponent]
    });
    fixture = TestBed.createComponent(MarketlinkedplansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
