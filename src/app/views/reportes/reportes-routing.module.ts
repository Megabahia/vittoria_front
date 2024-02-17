import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {ReporteFacturasComponent} from './reporte-facturas/reporte-facturas.component';
import {ReporteClientesComponent} from './reporte-clientes/reporte-clientes.component';

const routes: Routes = [
  {path: '', redirectTo: 'productos', pathMatch: 'full'},
  {
    path: 'productos',
    component: ReporteFacturasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    component: ReporteClientesComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
