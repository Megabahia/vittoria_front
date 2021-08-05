import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdoRoutingModule } from './mdo-routing.module';
import { MdoComponent } from '../mdo/mdo.component';
import { ParamsComponent } from './params/params.component';
import { CrosselingComponent } from './predicciones/crosseling/crosseling.component';
import { RefilComponent } from './predicciones/refil/refil.component';
import { NuevosProdComponent } from './predicciones/nuevos-prod/nuevos-prod.component'; 
import { SharedModule } from '../../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { GenerarComponent } from './oferta/generar/generar.component';


@NgModule({
  declarations: [
    MdoComponent,
    ParamsComponent,
    CrosselingComponent,
    RefilComponent,
    NuevosProdComponent,
    GenerarComponent
  ],
  imports: [
    CommonModule,
    MdoRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    NgxDropzoneModule
  ]
})
export class MdoModule { }
