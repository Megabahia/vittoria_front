import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from 'src/app/guard/auth.guard';
import {CplComponent} from './cpl.component';
import {GenerarContactoComponent} from './generadorContacto/generar-contacto.component';

const routes: Routes = [
  {   path: '', redirectTo: '/generarContacto', pathMatch: 'full'
          },
          {
            path: 'generarContacto', component: GenerarContactoComponent, canActivate: [AuthGuard]
          },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CplRoutingModule {
}
