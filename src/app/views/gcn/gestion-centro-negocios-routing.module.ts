import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';

import {VentasVendedorComponent} from './reportes/ventas-vendedor/ventas-vendedor.component';
import {CentroNegocioComponent} from './reportes/centro-negocio/centro-negocio.component';
import {
  VentasVendedorMetodoEnvioComponent
} from "./reportes/ventas-vendedor-metodo-envio/ventas-vendedor-metodo-envio.component";
import {
  CentroNegocioMetodoEnvioComponent
} from "./reportes/centro-negocio-metodo-envio/centro-negocio-metodo-envio.component";

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
    path: 'reporte-ventas-vendedor-metodo-envio', children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list', component: VentasVendedorMetodoEnvioComponent, canActivate: [AuthGuard]
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
  {
    path: 'reporte-ventas-centro-negocio-metodo-envio', children: [
      {
        path: '', redirectTo: 'list', pathMatch: 'full'
      },
      {
        path: 'list', component: CentroNegocioMetodoEnvioComponent, canActivate: [AuthGuard]
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
