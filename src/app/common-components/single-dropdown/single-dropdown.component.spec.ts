import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleDropdownComponent } from './single-dropdown.component';

describe('SingleDropdownComponent', () => {
  let component: SingleDropdownComponent;
  let fixture: ComponentFixture<SingleDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
