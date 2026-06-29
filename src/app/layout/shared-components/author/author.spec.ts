import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Author } from './author';

describe('Author', () => {
  let component: Author;
  let fixture: ComponentFixture<Author>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Author],
    }).compileComponents();

    fixture = TestBed.createComponent(Author);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
