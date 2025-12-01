import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Challengers } from './challengers';

describe('Challengers', () => {
  let component: Challengers;
  let fixture: ComponentFixture<Challengers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Challengers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Challengers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
