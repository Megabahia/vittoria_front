import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GdeRoutingModule } from './gde-routing.module';
import { GdeComponent } from './gde.component';
import { ParamsComponent } from './params/params.component';
import { GestionEntregaComponent } from './gestion-entrega/gestion-entrega.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { FlatpickrModule } from 'angularx-flatpickr';
import {GestionEntregaNuevosComponent} from './woocommerce/gestion-entrega-nuevos/gestion-entrega-nuevos.component';
import { GestionEntregaDespachoComponent } from './woocommerce/gestion-entrega-despacho/gestion-entrega-despacho.component';
import { GestionEntregaEnviadosComponent } from './woocommerce/gestion-entrega-enviados/gestion-entrega-enviados.component';
import {ShortenPipe} from '../../pipes/shorten-pipe.pipe';
import {NgxPrintModule} from 'ngx-print';


@NgModule({
  declarations: [
    GdeComponent,
    ParamsComponent,
    GestionEntregaComponent,
    GestionEntregaNuevosComponent,
    GestionEntregaDespachoComponent,
    GestionEntregaEnviadosComponent,
    ShortenPipe,
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    GdeRoutingModule,
    NgxPrintModule
  ]
})
export class GdeModule { }
