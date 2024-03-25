import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from 'src/app/guard/auth.guard';
import {ParamsComponent} from '../gde/params/params.component';
import {GestionEntregaComponent} from './gestion-entrega/gestion-entrega.component';
import {GdeComponent} from './gde.component';
import {GestionEntregaNuevosComponent} from './woocommerce/gestion-entrega-nuevos/gestion-entrega-nuevos.component';
import {GestionEntregaDespachoComponent} from './woocommerce/gestion-entrega-despacho/gestion-entrega-despacho.component';
import {GestionEntregaEnviadosComponent} from './woocommerce/gestion-entrega-enviados/gestion-entrega-enviados.component';

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
            path: 'woocommerce', children: [
              {
                path: '', redirectTo: 'empacado', pathMatch: 'full'
              },
              {path: 'empacado', component: GestionEntregaNuevosComponent, canActivate: [AuthGuard]},
              {path: 'despacho', component: GestionEntregaDespachoComponent, canActivate: [AuthGuard]},
              {path: 'enviado', component: GestionEntregaEnviadosComponent, canActivate: [AuthGuard]},
            ],
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
