import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MdpComponent} from '../mdp/mdp.component';
import {AuthGuard} from '../../guard/auth.guard';
import {ParamsComponent} from './params/params.component';
import {PedidosComponent} from './pedidos/pedidos.component';
import {PedidosDevueltosComponent} from './pedidos-devueltos/pedidos-devueltos.component';
import {PedidosRechazadosComponent} from './pedidos-rechazados/pedidos-rechazados.component';
import {PedidoMegabahiaComponent} from './pedidos-canal/pedido-megabahia/pedido-megabahia.component';
import {PedidoMayoristaComponent} from './pedidos-canal/pedido-mayorista/pedido-mayorista.component';
import {PedidoMegadescuentoComponent} from './pedidos-canal/pedido-megadescuento/pedido-megadescuento.component';
import {PedidoTodomegacentroComponent} from './pedidos-canal/pedido-todomegacentro/pedido-todomegacentro.component';
import {
  PedidoTiendamulticomprasComponent
} from './pedidos-canal/pedido-tiendamulticompras/pedido-tiendamulticompras.component';
import {PedidoContraentregaComponent} from './pedidos-canal/pedido-contraentrega/pedido-contraentrega.component';
import {PedidoMaxidescuentoComponent} from './pedidos-canal/pedido-maxidescuento/pedido-maxidescuento.component';
import {PedidoVittoriaComponent} from './pedidos-canal/pedido-vittoria/pedido-vittoria.component';
import {PedidoSuperbaratoComponent} from './pedidos-canal/pedido-superbarato/pedido-superbarato.component';
import {
  ProspectosClientesListComponent
} from '../mdm/prospectos-clientes/prospectos-clientes-list/prospectos-clientes-list.component';
import {
  ProspectosClientesAddCsvComponent
} from '../mdm/prospectos-clientes/prospectos-clientes-add-csv/prospectos-clientes-add-csv.component';
import {
  ProspectosClientesAddXlsxComponent
} from '../mdm/prospectos-clientes/prospectos-clientes-add-xlsx/prospectos-clientes-add-xlsx.component';
import {LandingListComponent} from './pedidos-landing/landing-list/landing-list.component';
import {
  PedidosEntregaLocalComponent
} from "./pedidos-canal/pedido-entrega-local/pedidos/pedidos-entrega-local.component";
import {
  PedidosEntregaLocalEntregadosComponent
} from "./pedidos-canal/pedido-entrega-local/entregados/pedidos-entrega-local-entregados.component";

const routes: Routes = [{
  path: '', component: MdpComponent, children: [
    {path: '', redirectTo: 'parametrizaciones', pathMatch: 'full'},
    {
      path: 'parametrizaciones', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: ParamsComponent, canActivate: [AuthGuard]
        }
      ]
    },
    {
      path: 'pedidos-nuevos', component: PedidosComponent, canActivate: [AuthGuard]
    },
    {
      path: 'pedidos-devueltos', component: PedidosDevueltosComponent, canActivate: [AuthGuard]
    },
    {
      path: 'pedidos-rechazados', component: PedidosRechazadosComponent, canActivate: [AuthGuard]
    },
    {
      path: 'landing', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: LandingListComponent, canActivate: [AuthGuard]
        },
      ]
    },
    {
      path: 'pedido-entrega-local', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: PedidosEntregaLocalComponent, canActivate: [AuthGuard]
        },
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'entregados', component: PedidosEntregaLocalEntregadosComponent, canActivate: [AuthGuard]
        },
      ]
    },
    {
      path: 'pedido-canal', children: [
        {
          path: 'megabahia', component: PedidoMegabahiaComponent, canActivate: [AuthGuard]
        },
        {
          path: 'mayorista', component: PedidoMayoristaComponent, canActivate: [AuthGuard]
        },
        {
          path: 'megadescuento', component: PedidoMegadescuentoComponent, canActivate: [AuthGuard]
        },
        {
          path: 'todomegacentro', component: PedidoTodomegacentroComponent, canActivate: [AuthGuard]
        },
        {
          path: 'tiendamulticompras', component: PedidoTiendamulticomprasComponent, canActivate: [AuthGuard]
        },
        {
          path: 'contraentrega', component: PedidoContraentregaComponent, canActivate: [AuthGuard]
        },
        {
          path: 'maxidescuento', component: PedidoMaxidescuentoComponent, canActivate: [AuthGuard]
        },
        {
          path: 'vittoria', component: PedidoVittoriaComponent, canActivate: [AuthGuard]
        },
        {
          path: 'superbarato', component: PedidoSuperbaratoComponent, canActivate: [AuthGuard]
        },
      ]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MpRoutingModule {
}
