import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GsAngularBaseComponent } from './gs-angular-base.component';

describe('GsAngularBaseComponent', () => {
  let component: GsAngularBaseComponent;
  let fixture: ComponentFixture<GsAngularBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GsAngularBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GsAngularBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
