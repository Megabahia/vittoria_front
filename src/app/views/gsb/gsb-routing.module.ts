import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GsbComponent} from "./gsb.component";
import {GsbProductosListarComponent} from "./inventario/productos-listar/gsb-productos-listar.component";
import {GsbGenerarPedidoComponent} from "./gsb_pedido/gsb-generar-pedido.component";
import {GsbReporteVentasComponent} from "./gsb_reportes/gsb-reporte-ventas.component";

const routes: Routes = [{
  path: '', component: GsbComponent, children: [
    {
      path: 'inventario', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: GsbProductosListarComponent, canActivate: [AuthGuard],
        }
      ],
    },
    {
      path: 'pedido', component: GsbGenerarPedidoComponent, canActivate: [AuthGuard],
    },
    {
      path: 'reportes', component: GsbReporteVentasComponent, canActivate: [AuthGuard],
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GsbRoutingModule {
}
