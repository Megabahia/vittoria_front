import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEntregaEnviadosComponent } from './gestion-entrega-enviados.component';

describe('GestionEntregaEnviadosComponent', () => {
  let component: GestionEntregaEnviadosComponent;
  let fixture: ComponentFixture<GestionEntregaEnviadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionEntregaEnviadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionEntregaEnviadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
