import { TestBed } from '@angular/core/testing';

import { GsGanttService } from './gs-gantt.service';

describe('GsGanttService', () => {
  let service: GsGanttService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GsGanttService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
