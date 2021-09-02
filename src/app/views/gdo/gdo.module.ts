import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GdoRoutingModule } from './gdo-routing.module';
import { GdoComponent } from './gdo.component';
import { ParamsComponent } from './params/params.component';
import { GestionOfertaComponent } from './gestion-oferta/gestion-oferta.component';


@NgModule({
  declarations: [
    GdoComponent,
    ParamsComponent,
    GestionOfertaComponent
  ],
  imports: [
    CommonModule,
    GdoRoutingModule
  ]
})
export class GdoModule { }
