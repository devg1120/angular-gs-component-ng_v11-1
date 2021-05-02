import { TestBed } from '@angular/core/testing';

import { GsAngularBaseService } from './gs-angular-base.service';

describe('GsAngularBaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GsAngularBaseService = TestBed.get(GsAngularBaseService);
    expect(service).toBeTruthy();
  });
});
