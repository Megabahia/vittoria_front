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
import {GestionEntregaWoocoommerceComponent} from './gestion-entrega-woocommerce/gestion-entrega-woocoommerce.component';


@NgModule({
  declarations: [
    GdeComponent,
    ParamsComponent,
    GestionEntregaComponent,
    GestionEntregaWoocoommerceComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    GdeRoutingModule
  ]
})
export class GdeModule { }
