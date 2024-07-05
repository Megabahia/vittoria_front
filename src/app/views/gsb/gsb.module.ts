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
import {GsbGenerarPedidoComponent} from "./gsb_pedido/gsb-generar-pedido.component";
import {GsbReporteVentasComponent} from "./gsb_reportes/gsb-reporte-ventas.component";
import {QRCodeModule} from "angularx-qrcode";
import {SuperbaratoComponent} from "./gsb_superbarato/superbarato.component";
import {GsbProductosReporteComponent} from "./inventario/productos-reporte/gsb-productos-reporte.component";

@NgModule({
  declarations: [
    GsbComponent,
    GsbProductosListarComponent,
    GsbProductosEditarComponent,
    GsbGenerarPedidoComponent,
    GsbReporteVentasComponent,
    SuperbaratoComponent,
    GsbProductosReporteComponent
  ],
  exports: [
    GsbProductosListarComponent
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
    GdeModule,
    QRCodeModule
  ]
})
export class GsbModule {
}
