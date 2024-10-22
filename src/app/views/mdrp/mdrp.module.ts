import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdrpRoutingModule } from './mdrp-routing.module';
import { MdrpComponent } from './mdrp.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {RecepcionProductosComponent} from './productos/recepcion/recepcion-productos.component';
import {ConfirmacionRecepcionComponent} from './productos/confirmacion-recepcion/confirmacion-recepcion.component';
import {AprobacionComponent} from './productos/aprobacion/aprobacion.component';
import {ListProductosComponent} from './productos/list/list-productos.component';


@NgModule({
  declarations: [
    MdrpComponent,
    RecepcionProductosComponent,
    ConfirmacionRecepcionComponent,
    AprobacionComponent,
    ListProductosComponent
  ],
  imports: [
    CommonModule,
    MdrpRoutingModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    NgxDropzoneModule,
  ]
})
export class MdrpModule { }
