import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductosComponent} from './productos/productos.component';
import {CalculadoraComponent} from './calculadora/calculadora.component';
import {PedidoWoocomerceComponent} from './pedido-woocomerce/pedido-woocomerce.component';
import {ConsultaProductosComponent} from './consulta-productos/consulta-productos.component';
import {RegistroAsesoresComponent} from './registro-asesores/registro-asesores.component';

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
  {
    path: 'consulta/producto',
    component: ConsultaProductosComponent,
  },
  {
    path: 'registro/asesores',
    component: RegistroAsesoresComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
