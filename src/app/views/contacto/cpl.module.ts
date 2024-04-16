import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { FlatpickrModule } from 'angularx-flatpickr';

import {NgxPrintModule} from 'ngx-print';
import {CplComponent} from './cpl.component';
import {CplRoutingModule} from "./cpl.routing.module";
import {GenerarContactoComponent} from "./generadorContacto/generar-contacto.component";
import {ShortenPipe} from "../../pipes/shorten-pipe.pipe";
import {GdeModule} from "../gde/gde.module";
import {FeatherModule} from "angular-feather";


@NgModule({
  declarations: [
    CplComponent,
    GenerarContactoComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    NgxPrintModule,
    CplRoutingModule,
    GdeModule,
    FeatherModule,
  ]
})
export class CplModule { }
