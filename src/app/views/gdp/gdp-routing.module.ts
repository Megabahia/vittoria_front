import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GdpComponent} from "./gdp.component";
import {GenerarPedidosComponent} from "./pedidos/generar-pedidos.component";

const routes: Routes = [{
  path: '', component: GdpComponent, children: [
    {
      path: 'pedidos', component: GenerarPedidosComponent, canActivate: [AuthGuard]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdpRoutingModule {
}
