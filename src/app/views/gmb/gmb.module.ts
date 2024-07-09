import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {GmbRoutingModule} from './gmb-routing.module';
import {GdeModule} from '../gde/gde.module';
import {GmbComponent} from "./gmb.component";
import {MegabahiaComponent} from "./megabahia/megabahia.component";
import {EntregadosMegabahiaComponent} from "./entregados/entregados.component";
import {QRCodeModule} from "angularx-qrcode";
import {UsersService} from "../../services/admin/users.service";



@NgModule({
  declarations: [
    GmbComponent,
    MegabahiaComponent,
    EntregadosMegabahiaComponent
  ],
  imports: [
    CommonModule,
    GmbRoutingModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    NgxDropzoneModule,
    GdeModule,
    QRCodeModule
  ],
  providers: [
    UsersService
  ]
})
export class GmbModule { }
