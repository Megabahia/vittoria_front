import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {CiudadesComponent} from './ciudades/ciudades.component';
import {GuiasComponent} from './guias/guias.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'ciudades', pathMatch: 'full'
  },
  {
    path: 'ciudades',
    component: CiudadesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'guias',
    children: [
      {
        path: '', redirectTo: 'crear', pathMatch: 'full'
      },
      {
        path: 'crear',
        component: GuiasComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServientregaRoutingModule {
}
