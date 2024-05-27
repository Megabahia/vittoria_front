import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GdbComponent} from "./gdb.component";
import {BodegaComponent} from "./bodega/bodega.component";
import {PedidosBodegaComponent} from "./pedidos-bodega/pedidos-bodega.component";

const routes: Routes = [{
  path: '', component: GdbComponent, children: [
    {
      path: 'bodega', component: BodegaComponent, canActivate: [AuthGuard]
    },
    {
      path: 'pedidos-bodega', component: PedidosBodegaComponent, canActivate: [AuthGuard]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdbRoutingModule {
}
