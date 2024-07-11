import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoWoocomerceComponent } from './pedido-woocomerce.component';

describe('PedidoWoocomerceComponent', () => {
  let component: PedidoWoocomerceComponent;
  let fixture: ComponentFixture<PedidoWoocomerceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedidoWoocomerceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidoWoocomerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
