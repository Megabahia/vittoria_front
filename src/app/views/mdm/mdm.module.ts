import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdmRoutingModule } from './mdm-routing.module';
import { MdmComponent } from './mdm.component';
import { ParamsComponent } from './params/params.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PersonasListComponent } from './clientes/personas/personas-list/personas-list.component';
import { PersonasEditComponent } from './clientes/personas/personas-edit/personas-edit.component';
import { TransaccionesListComponent } from './clientes/personas/transacciones-list/transacciones-list.component';
import { TransaccionesAddComponent } from './clientes/personas/transacciones-add/transacciones-add.component';
import { TransaccionesLoadComponent } from './clientes/personas/transacciones-load/transacciones-load.component';
import { TransaccionesListComponent as TransaccionesListNegocios  } from './clientes/negocios/transacciones-list/transacciones-list.component';
import { TransaccionesAddComponent  as TransaccionesAddNegocios } from './clientes/negocios/transacciones-add/transacciones-add.component';
import { TransaccionesLoadComponent as TransaccionesLoadNegocios } from './clientes/negocios/transacciones-load/transacciones-load.component';
import { PersonasLoadComponent } from './clientes/personas/personas-load/personas-load.component';
import { NegociosListComponent } from './clientes/negocios/negocios-list/negocios-list.component';
import { NegociosEditComponent } from './clientes/negocios/negocios-edit/negocios-edit.component';
import { NegociosLoadComponent } from './clientes/negocios/negocios-load/negocios-load.component';
import { ProspectosClientesListComponent } from './prospectos-clientes/prospectos-clientes-list/prospectos-clientes-list.component';
import { ProspectosClientesAddCsvComponent } from './prospectos-clientes/prospectos-clientes-add-csv/prospectos-clientes-add-csv.component';
import { ProspectosClientesAddXlsxComponent } from './prospectos-clientes/prospectos-clientes-add-xlsx/prospectos-clientes-add-xlsx.component';
import { ProspectosClientesEditComponent } from './prospectos-clientes/prospectos-clientes-edit/prospectos-clientes-edit.component';
import { ChartsModule } from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
@NgModule({
  declarations: [
    MdmComponent,
    ParamsComponent,
    PersonasListComponent,
    PersonasEditComponent,
    TransaccionesListComponent,
    TransaccionesAddComponent,
    TransaccionesLoadComponent,
    PersonasLoadComponent,
    NegociosListComponent,
    NegociosEditComponent,
    NegociosLoadComponent,
    ProspectosClientesListComponent,
    ProspectosClientesEditComponent,
    ProspectosClientesAddCsvComponent,
    ProspectosClientesAddXlsxComponent,
    TransaccionesListNegocios,
    TransaccionesAddNegocios,
    TransaccionesLoadNegocios
  ],
  imports: [
    CommonModule,
    MdmRoutingModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot()
  ]
})
export class MdmModule { }
