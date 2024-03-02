import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from 'src/app/guard/auth.guard';
import {ParamsComponent} from '../gde/params/params.component';
import {GestionEntregaComponent} from './gestion-entrega/gestion-entrega.component';
import {GdeComponent} from './gde.component';
import {GestionEntregaWoocoommerceComponent} from './gestion-entrega-woocommerce/gestion-entrega-woocoommerce.component';

const routes: Routes = [
  {
    path: '', component: GdeComponent, children: [
      {path: '', redirectTo: 'parametrizaciones', pathMatch: 'full'},
      {
        path: 'parametrizaciones', children: [
          {
            path: '', redirectTo: 'list', pathMatch: 'full'
          },
          {
            path: 'list', component: ParamsComponent, canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'gestionEntrega', children: [
          {
            path: '', redirectTo: 'list', pathMatch: 'full'
          },
          {
            path: 'list', component: GestionEntregaComponent, canActivate: [AuthGuard]
          },
          {
            path: 'woocommerce/list', component: GestionEntregaWoocoommerceComponent, canActivate: [AuthGuard],
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdeRoutingModule {
}
