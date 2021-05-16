import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsGanttComponent } from './gs-gantt.component';

describe('GsGanttComponent', () => {
  let component: GsGanttComponent;
  let fixture: ComponentFixture<GsGanttComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GsGanttComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GsGanttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
