import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroNegocioComponent } from './centro-negocio.component';

describe('CentroNegocioComponent', () => {
  let component: CentroNegocioComponent;
  let fixture: ComponentFixture<CentroNegocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentroNegocioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentroNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
