import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {GdpRoutingModule} from './gdp-routing.module';
import {GdeModule} from '../gde/gde.module';
import {GdpComponent} from "./gdp.component";
import {GenerarPedidosComponent} from "./pedidos/generar-pedidos.component";


@NgModule({
  declarations: [
    GdpComponent,
    GenerarPedidosComponent
  ],
  imports: [
    CommonModule,
    GdpRoutingModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    NgxDropzoneModule,
    GdeModule
  ]
})
export class GdpModule { }
