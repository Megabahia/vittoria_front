import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MdrpComponent} from './mdrp.component';
import {AuthGuard} from '../../guard/auth.guard';
import {RecepcionProductosComponent} from "./productos/recepcion/recepcion-productos.component";
import {ConfirmacionRecepcionComponent} from "./productos/confirmacion-recepcion/confirmacion-recepcion.component";
import {AprobacionComponent} from "./productos/aprobacion/aprobacion.component";
import {ListProductosComponent} from "./productos/list/list-productos.component";

const routes: Routes = [{
  path: '', component: MdrpComponent, children: [
    {
      path: 'productos', children: [
        {path: '', redirectTo: 'recepcion', pathMatch: 'full'},
        {
          path: 'recepcion', component: RecepcionProductosComponent, canActivate: [AuthGuard]
        },
        {
          path: 'confirmacion/recepcion', component: ConfirmacionRecepcionComponent, canActivate: [AuthGuard]
        },
        {
          path: 'aprobacion', component: AprobacionComponent, canActivate: [AuthGuard]
        },
        {
          path: 'list', component: ListProductosComponent, canActivate: [AuthGuard]
        },
      ]
    },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdrpRoutingModule {
}
