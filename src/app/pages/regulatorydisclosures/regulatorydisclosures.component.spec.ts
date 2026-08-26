import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RegulatorydisclosuresComponent } from './regulatorydisclosures.component';

describe('RegulatorydisclosuresComponent', () => {
  let component: RegulatorydisclosuresComponent;
  let fixture: ComponentFixture<RegulatorydisclosuresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [RegulatorydisclosuresComponent]
    });
    fixture = TestBed.createComponent(RegulatorydisclosuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
