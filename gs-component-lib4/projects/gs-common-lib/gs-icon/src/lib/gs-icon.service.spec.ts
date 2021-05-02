import { TestBed } from '@angular/core/testing';

import { GsIconService } from './gs-icon.service';

describe('GsIconService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GsIconService = TestBed.get(GsIconService);
    expect(service).toBeTruthy();
  });
});
