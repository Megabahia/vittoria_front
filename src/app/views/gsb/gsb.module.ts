import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {GsbRoutingModule} from './gsb-routing.module';
import {GdeModule} from '../gde/gde.module';
import {GsbComponent} from "./gsb.component";
import {GsbProductosListarComponent} from "./inventario/productos-listar/gsb-productos-listar.component";
import {GsbProductosEditarComponent} from "./inventario/productos-editar/gsb-productos-editar.component";

@NgModule({
  declarations: [
    GsbComponent,
    GsbProductosListarComponent,
    GsbProductosEditarComponent
  ],
  imports: [
    CommonModule,
    GsbRoutingModule,
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
export class GsbModule {
}
