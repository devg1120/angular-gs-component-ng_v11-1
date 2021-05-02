import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsIconComponent } from './gs-icon.component';

describe('GsIconComponent', () => {
  let component: GsIconComponent;
  let fixture: ComponentFixture<GsIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
