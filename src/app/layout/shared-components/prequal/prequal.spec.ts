import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prequal } from './prequal';

describe('Prequal', () => {
  let component: Prequal;
  let fixture: ComponentFixture<Prequal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prequal],
    }).compileComponents();

    fixture = TestBed.createComponent(Prequal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
