import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GdcComponent} from "./gdc.component";
import {PedidosComponent} from "../mp/pedidos/pedidos.component";

const routes: Routes = [{
  path: '', component: GdcComponent, children: [

    {
      path: 'pedidos-nuevos', component: PedidosComponent, canActivate: [AuthGuard]
    },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdcRoutingModule {
}
