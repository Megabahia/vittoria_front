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
import {GdConsultaProductosComponent} from './gd_consultar_productos/gd-consulta-productos.component';
import {
  ReporteContactosVentasComponent
} from './gsb_contactos/reporte_contactos_ventas/reporte_contactos-ventas.component';
import {CrearPedidoWoocomerceComponent} from './crear-pedido-woocommerce/crear-pedido-woocomerce.component';
import {RegistroAsesoresComponent} from '../pages/registro-asesores/registro-asesores.component';
import {GdRegistrosAsesoresComponent} from './gd_asesores_comerciales/registros/gd_registros_asesores.component';
import {
  GdBilleteraDigitalAsesoresComponent
} from './gd_asesores_comerciales/billetera_digital/movimientos/gd_billetera_digital_asesores.component';
import {
  GdRegistroAsesoresComponent
} from './gd_asesores_comerciales/registro_asesores/registro-asesores.component';
import {GdAsesoresConfirmadosComponent} from './gd_asesores_comerciales/confirmados/gd_asesores_confirmados.component';
import {
  GdCargarSaldoBilleteraDigitalComponent
} from "./gd_asesores_comerciales/billetera_digital/cargar-saldo/gd_cargar_saldo_billetera_digital.component";

const routes: Routes = [{
  path: '', component: GsbComponent, children: [
    {
      path: 'gd_params', component: GdParamsComponent, canActivate: [AuthGuard],
    },
    {
      path: 'gd_consulta_productos', component: GdConsultaProductosComponent, canActivate: [AuthGuard],
    },
    {
      path: 'pedido_woocommerce/crear', component: CrearPedidoWoocomerceComponent, canActivate: [AuthGuard],
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
          path: 'list/reporte/venta', component: ReporteContactosVentasComponent, canActivate: [AuthGuard],
        },
        {
          path: 'create', component: GsbGenerarContactoComponent, canActivate: [AuthGuard],
        }
      ],
    },
    {
      path: 'asesor', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: GdRegistrosAsesoresComponent, canActivate: [AuthGuard],
        },
        {
          path: 'list/confirmados', component: GdAsesoresConfirmadosComponent, canActivate: [AuthGuard],
        },
        {
          path: 'list/billetera/digital/movimientos', component: GdBilleteraDigitalAsesoresComponent, canActivate: [AuthGuard],
        },
        {
          path: 'billetera/digital/cargar_saldo', component: GdCargarSaldoBilleteraDigitalComponent, canActivate: [AuthGuard],
        },
        {
          path: 'resgistro', component: GdRegistroAsesoresComponent, canActivate: [AuthGuard],
        },
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
