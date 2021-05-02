import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsBaseComponent } from './gs-base.component';

describe('GsBaseComponent', () => {
  let component: GsBaseComponent;
  let fixture: ComponentFixture<GsBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
