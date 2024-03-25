import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosDevueltosComponent } from './pedidos-devueltos.component';

describe('PedidosDevueltosComponent', () => {
  let component: PedidosDevueltosComponent;
  let fixture: ComponentFixture<PedidosDevueltosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedidosDevueltosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosDevueltosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
