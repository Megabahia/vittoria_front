import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosRechazadosComponent } from './pedidos-rechazados.component';

describe('PedidosRechazadosComponent', () => {
  let component: PedidosRechazadosComponent;
  let fixture: ComponentFixture<PedidosRechazadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedidosRechazadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosRechazadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
