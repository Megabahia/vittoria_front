import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GsbComponent} from './gsb.component';
import {GsbProductosListarComponent} from './inventario/productos-listar/gsb-productos-listar.component';
import {GsbGenerarPedidoComponent} from './gsb_pedido/gsb-generar-pedido.component';
import {GsbReporteVentasComponent} from './gsb_reportes/gsb-reporte-ventas.component';
import {SuperbaratoComponent} from './gsb_superbarato/superbarato.component';
import {GsbProductosReporteComponent} from './inventario/productos-reporte/gsb-productos-reporte.component';
import {GsbGenerarContactoComponent} from './gsb_contactos/contactos_crear/gsb-generar-contacto.component';
import {ContactosListarComponent} from './gsb_contactos/contactos_listar/contactos-listar.component';
import {
  ReporteContactosListarComponent
} from './gsb_contactos/reporte_contactos_listar/reporte_contactos-listar.component';
import {GdParamsComponent} from './gd_params/gd_params.component';

const routes: Routes = [{
  path: '', component: GsbComponent, children: [
    {
      path: 'gd_params', component: GdParamsComponent, canActivate: [AuthGuard],
    },
    {
      path: 'inventario', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: GsbProductosListarComponent, canActivate: [AuthGuard],
        },
        {
          path: 'reporte', component: GsbProductosReporteComponent, canActivate: [AuthGuard],
        }
      ],
    },
    {
      path: 'pedido', component: GsbGenerarPedidoComponent, canActivate: [AuthGuard],
    },
    {
      path: 'contacto', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: ContactosListarComponent, canActivate: [AuthGuard],
        },
        {
          path: 'list/reporte', component: ReporteContactosListarComponent, canActivate: [AuthGuard],
        },
        {
          path: 'create', component: GsbGenerarContactoComponent, canActivate: [AuthGuard],
        }
      ],
    },
    {
      path: 'reportes', component: GsbReporteVentasComponent, canActivate: [AuthGuard],
    },
    {
      path: 'superbarato', component: SuperbaratoComponent, canActivate: [AuthGuard],
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GsbRoutingModule {
}
