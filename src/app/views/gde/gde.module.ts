import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GdeRoutingModule } from './gde-routing.module';
import { GdeComponent } from './gde.component';
import { ParamsComponent } from './params/params.component';
import { GestionEntregaComponent } from './gestion-entrega/gestion-entrega.component';


@NgModule({
  declarations: [
    GdeComponent,
    ParamsComponent,
    GestionEntregaComponent
  ],
  imports: [
    CommonModule,
    GdeRoutingModule
  ]
})
export class GdeModule { }
