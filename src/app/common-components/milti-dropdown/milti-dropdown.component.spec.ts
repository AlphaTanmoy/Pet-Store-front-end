import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiltiDropdownComponent } from './milti-dropdown.component';

describe('MiltiDropdownComponent', () => {
  let component: MiltiDropdownComponent;
  let fixture: ComponentFixture<MiltiDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiltiDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiltiDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
