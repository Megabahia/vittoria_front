import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {GdcRoutingModule} from './gdc-routing.module';
import {GdeModule} from '../gde/gde.module';
import {GdcComponent} from "./gdc.component";
import {ContactoComponent} from "./contactos/contacto.component";



@NgModule({
  declarations: [
    GdcComponent,
    ContactoComponent
  ],
  imports: [
    CommonModule,
    GdcRoutingModule,
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
export class GdcModule { }
