import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {MpRoutingModule} from './mp-routing.module';
import {ParamsComponent} from './params/params.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidosDevueltosComponent } from './pedidos-devueltos/pedidos-devueltos.component';
import { PedidosRechazadosComponent } from './pedidos-rechazados/pedidos-rechazados.component';
import {GdeModule} from '../gde/gde.module';
import {PedidoMegabahiaComponent} from "./pedidos-canal/pedido-megabahia/pedido-megabahia.component";



@NgModule({
  declarations: [
    ParamsComponent,
    PedidosComponent,
    PedidosDevueltosComponent,
    PedidosRechazadosComponent,
    PedidoMegabahiaComponent
  ],
  imports: [
    CommonModule,
    MpRoutingModule,
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
export class MpModule { }
