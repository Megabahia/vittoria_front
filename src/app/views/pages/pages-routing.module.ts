import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductosComponent} from './productos/productos.component';
import {CalculadoraComponent} from './calculadora/calculadora.component';
import {PedidoWoocomerceComponent} from './pedido-woocomerce/pedido-woocomerce.component';
import {ConsultaProductosComponent} from './consulta-productos/consulta-productos.component';
import {RegistroAsesoresComponent} from './registro-asesores/registro-asesores.component';
import {AuthGuard} from "../../guard/auth.guard";
import {PedidosWoocommerceComponent} from "./pedidos-woocommerce/pedidos-woocommerce.component";
import {ReporteProductosComponent} from "./reporte-productos/reporte_productos.component";

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
    canActivate: [AuthGuard],
  },
  {
    path: 'pedidos/woocommerce',
    component: PedidosWoocommerceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'reporte/productos',
    component: ReporteProductosComponent,
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
