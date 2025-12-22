import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChallenge } from './create-challenge';

describe('CreateChallenge', () => {
  let component: CreateChallenge;
  let fixture: ComponentFixture<CreateChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateChallenge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
