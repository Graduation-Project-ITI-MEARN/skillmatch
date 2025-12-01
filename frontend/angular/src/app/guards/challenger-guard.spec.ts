import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { challengerGuard } from './challenger-guard';

describe('challengerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => challengerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
