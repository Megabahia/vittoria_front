import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { ParamsComponent } from '../gdo/params/params.component';
import { GestionOfertaComponent } from './gestion-oferta/gestion-oferta.component';
import { GdoComponent } from './gdo.component';

const routes: Routes = [{
  path: '', component: GdoComponent, children: [
    { path: '', redirectTo: 'parametrizaciones', pathMatch: 'full' },
    {
      path: 'parametrizaciones', children: [
        { path: '', redirectTo: 'list', pathMatch: 'full' }, {
          path: 'list', component: ParamsComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'gestionOferta', children: [
        { path: '', redirectTo: 'list', pathMatch: 'full' }, {
          path: 'list', component: GestionOfertaComponent, canActivate: [AuthGuard]
        }
      ]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GdoRoutingModule { }
