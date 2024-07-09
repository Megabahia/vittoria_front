import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GmbComponent} from './gmb.component';
import {EntregadosMegabahiaComponent} from './entregados/entregados.component';
import {MegabahiaComponent} from './megabahia/megabahia.component';

const routes: Routes = [{
  path: '', component: GmbComponent, children: [
    {
      path: 'megabahia', component: MegabahiaComponent, canActivate: [AuthGuard]
    },
    {
      path: 'entregados', component: EntregadosMegabahiaComponent, canActivate: [AuthGuard]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GmbRoutingModule {
}
