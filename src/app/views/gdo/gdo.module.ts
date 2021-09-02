import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GdoRoutingModule } from './gdo-routing.module';
import { GdoComponent } from './gdo.component';
import { ParamsComponent } from './params/params.component';
import { GestionOfertaComponent } from './gestion-oferta/gestion-oferta.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ChartsModule } from 'ng2-charts';
import { FlatpickrModule } from 'angularx-flatpickr';


@NgModule({
  declarations: [
    GdoComponent,
    ParamsComponent,
    GestionOfertaComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    GdoRoutingModule
  ]
})
export class GdoModule { }
