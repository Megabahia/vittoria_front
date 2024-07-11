import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductosComponent} from './productos/productos.component';
import {CalculadoraComponent} from './calculadora/calculadora.component';
import {PedidoWoocomerceComponent} from './pedido-woocomerce/pedido-woocomerce.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'productos', pathMatch: 'full'
  },
  {
    path: 'productos/:id',
    component: ProductosComponent
  },
  {
    path: 'calculadora',
    component: CalculadoraComponent
  },
  {
    path: 'pedido',
    component: PedidoWoocomerceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
