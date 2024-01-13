import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CiudadesComponent} from './ciudades/ciudades.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ServientregaRoutingModule} from './servientrega-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import { GuiasComponent } from './guias/guias.component';


@NgModule({
  declarations: [
    CiudadesComponent,
    GuiasComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    ServientregaRoutingModule,
  ]
})
export class ServientregaModule {
}
