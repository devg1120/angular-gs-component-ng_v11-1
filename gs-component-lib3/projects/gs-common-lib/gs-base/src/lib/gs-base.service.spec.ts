import { TestBed } from '@angular/core/testing';

import { GsBaseService } from './gs-base.service';

describe('GsBaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GsBaseService = TestBed.get(GsBaseService);
    expect(service).toBeTruthy();
  });
});
