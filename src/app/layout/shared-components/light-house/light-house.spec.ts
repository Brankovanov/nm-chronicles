import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightHouse } from './light-house';

describe('LightHouse', () => {
  let component: LightHouse;
  let fixture: ComponentFixture<LightHouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightHouse],
    }).compileComponents();

    fixture = TestBed.createComponent(LightHouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
