import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {GdbRoutingModule} from './gdb-routing.module';
import {GdeModule} from '../gde/gde.module';
import {GdbComponent} from "./gdb.component";
import {BodegaComponent} from "./bodega/bodega.component"
import {VittoriaComponent} from "./canal-vittoria/vittoria.component";


@NgModule({
  declarations: [
    GdbComponent,
    BodegaComponent,
    VittoriaComponent
  ],
  imports: [
    CommonModule,
    GdbRoutingModule,
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
export class GdbModule { }
