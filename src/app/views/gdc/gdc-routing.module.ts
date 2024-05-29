import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GdcComponent} from "./gdc.component";
import {ContactoComponent} from "./contactos/contacto.component";
import {VentasComponent} from "./ventas/ventas.component";
import {EntregadosComponent} from "./entregados/entregados.component";

const routes: Routes = [{
  path: '', component: GdcComponent, children: [
    {
      path: 'contacto', component: ContactoComponent, canActivate: [AuthGuard]
    },
    {
      path: 'ventas', component: VentasComponent, canActivate: [AuthGuard]
    },
    {
      path: 'entregados', component: EntregadosComponent, canActivate: [AuthGuard]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdcRoutingModule {
}
