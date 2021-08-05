import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MdoComponent } from './mdo.component';
import { ParamsComponent } from './params/params.component';
import { AuthGuard } from '../../guard/auth.guard';
import { CrosselingComponent } from './predicciones/crosseling/crosseling.component';
import { RefilComponent } from './predicciones/refil/refil.component';
import { NuevosProdComponent } from './predicciones/nuevos-prod/nuevos-prod.component';
import { GenerarComponent } from './oferta/generar/generar.component';

const routes: Routes = [{
  path: '', component: MdoComponent, children: [
    { path: '', redirectTo: 'parametrizaciones', pathMatch: 'full' },
    {
      path: 'parametrizaciones', children: [
        { path: '', redirectTo: 'list', pathMatch: 'full' }, {
          path: 'list', component: ParamsComponent, canActivate: [AuthGuard]
        }]
    },{
      path: 'predicciones', children: [
        { path: '', redirectTo: 'cross', pathMatch: 'full' }, 
        {
          path: 'cross', component: CrosselingComponent, canActivate: [AuthGuard]
        },
        {
          path: 'refil', component: RefilComponent, canActivate: [AuthGuard]
        },
        {
          path: 'nuevos', component: NuevosProdComponent, canActivate: [AuthGuard]
        }
      ]
    },
    {
      path: 'oferta', children: [
        { path: '', redirectTo: 'generar', pathMatch: 'full' }, {
          path: 'generar', component: GenerarComponent, canActivate: [AuthGuard]
        }]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdoRoutingModule { }
