import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasVendedorComponent } from './reportes/ventas-vendedor/ventas-vendedor.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {GdeRoutingModule} from '../gde/gde-routing.module';
import {GestionCentroNegociosRoutingModule} from './gestion-centro-negocios-routing.module';
import { CentroNegocioComponent } from './reportes/centro-negocio/centro-negocio.component';
import {GdeModule} from "../gde/gde.module";



@NgModule({
  declarations: [
    VentasVendedorComponent,
    CentroNegocioComponent
  ],
    imports: [
        CommonModule,
        NgbModule,
        SharedModule,
        FormsModule,
        ChartsModule,
        ReactiveFormsModule,
        FlatpickrModule.forRoot(),
        GestionCentroNegociosRoutingModule,
        GdeModule,
    ]
})
export class GestionCentroNegociosModule { }
