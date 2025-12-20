import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChallenge } from './edit-challenge';

describe('EditChallenge', () => {
  let component: EditChallenge;
  let fixture: ComponentFixture<EditChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditChallenge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
