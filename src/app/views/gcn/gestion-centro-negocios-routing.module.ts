import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';

import {VentasVendedorComponent} from './reportes/ventas-vendedor/ventas-vendedor.component';
import {CentroNegocioComponent} from './reportes/centro-negocio/centro-negocio.component';

const routes: Routes = [
  {path: '', redirectTo: 'reporte-ventas-vendedor', pathMatch: 'full'},
  {
    path: 'reporte-ventas-vendedor', children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list', component: VentasVendedorComponent, canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'reporte-ventas-centro-negocio', children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list', component: CentroNegocioComponent, canActivate: [AuthGuard]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionCentroNegociosRoutingModule {
}
