import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {GsbComponent} from "./gsb.component";
import {GsbProductosListarComponent} from "./inventario/productos-listar/gsb-productos-listar.component";

const routes: Routes = [{
  path: '', component: GsbComponent, children: [
    {
      path: 'inventario', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: GsbProductosListarComponent, canActivate: [AuthGuard],
        }
      ]
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GsbRoutingModule {
}
