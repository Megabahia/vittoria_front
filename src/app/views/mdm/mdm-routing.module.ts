import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { PersonasListComponent } from './clientes/personas/personas-list/personas-list.component';
import { TransaccionesAddComponent } from './clientes/personas/transacciones-add/transacciones-add.component';
import { TransaccionesListComponent } from './clientes/personas/transacciones-list/transacciones-list.component';
import { MdmComponent } from './mdm.component';
import { ParamsComponent } from './params/params.component';
import { ProspectosClientesAddCsvComponent } from './prospectos-clientes/prospectos-clientes-add-csv/prospectos-clientes-add-csv.component';
import { ProspectosClientesAddXlsxComponent } from './prospectos-clientes/prospectos-clientes-add-xlsx/prospectos-clientes-add-xlsx.component';
import { ProspectosClientesListComponent } from './prospectos-clientes/prospectos-clientes-list/prospectos-clientes-list.component';

const routes: Routes = [{
  path: '', component: MdmComponent, children: [
    { path: '', redirectTo: 'parametrizaciones', pathMatch: 'full' },
    {
      path: 'parametrizaciones', children: [
        { path: '', redirectTo: 'list', pathMatch: 'full' }, {
          path: 'list', component: ParamsComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'prospectosClientes', children: [
        { path: '', redirectTo: 'list', pathMatch: 'full' }, {
          path: 'list', component: ProspectosClientesListComponent, canActivate: [AuthGuard]
        },
        {
          path: 'addCSV', component: ProspectosClientesAddCsvComponent, canActivate: [AuthGuard]
        },
        {
          path: 'addXLSX', component: ProspectosClientesAddXlsxComponent, canActivate: [AuthGuard]
        }
      ]
    },
    {
      path: 'clientes', children: [
        { path: '', redirectTo: 'personas', pathMatch: 'full' }, {
          path: 'personas', children: [
            {
              path: 'list', component: PersonasListComponent, canActivate: [AuthGuard]
            },
            {
              path: 'transacciones', component: TransaccionesListComponent, canActivate: [AuthGuard]
            }
          ]
        },
        {
          path: 'addCSV', component: ProspectosClientesAddCsvComponent, canActivate: [AuthGuard]
        },
        {
          path: 'addXLSX', component: ProspectosClientesAddXlsxComponent, canActivate: [AuthGuard]
        }
      ]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdmRoutingModule { }
