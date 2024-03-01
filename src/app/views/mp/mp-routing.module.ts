import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MdpComponent} from '../mdp/mdp.component';
import {AuthGuard} from '../../guard/auth.guard';
import {ParamsComponent} from './params/params.component';
import {PedidosComponent} from './pedidos/pedidos.component';

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
      path: 'pedidos', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: PedidosComponent, canActivate: [AuthGuard]
        }
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
