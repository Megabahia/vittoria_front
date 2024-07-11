import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MdpComponent} from '../mdp/mdp.component';
import {AuthGuard} from '../../guard/auth.guard';
import {ParamsComponent} from './params/params.component';
import {PedidosComponent} from './pedidos/pedidos.component';
import {PedidosDevueltosComponent} from './pedidos-devueltos/pedidos-devueltos.component';
import {PedidosRechazadosComponent} from './pedidos-rechazados/pedidos-rechazados.component';
import {PedidoMegabahiaComponent} from './pedidos-canal/pedido-megabahia/pedido-megabahia.component';

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
      path: 'pedido-canal', children: [
        {
          path: 'megabahia', component: PedidoMegabahiaComponent, canActivate: [AuthGuard]
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
