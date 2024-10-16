import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {MpRoutingModule} from './mp-routing.module';
import {ParamsComponent} from './params/params.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidosDevueltosComponent } from './pedidos-devueltos/pedidos-devueltos.component';
import { PedidosRechazadosComponent } from './pedidos-rechazados/pedidos-rechazados.component';
import {GdeModule} from '../gde/gde.module';
import {PedidoMegabahiaComponent} from './pedidos-canal/pedido-megabahia/pedido-megabahia.component';
import {PedidoMayoristaComponent} from './pedidos-canal/pedido-mayorista/pedido-mayorista.component';
import {PedidoContraentregaComponent} from './pedidos-canal/pedido-contraentrega/pedido-contraentrega.component';
import {PedidoMaxidescuentoComponent} from './pedidos-canal/pedido-maxidescuento/pedido-maxidescuento.component';
import {PedidoMegadescuentoComponent} from './pedidos-canal/pedido-megadescuento/pedido-megadescuento.component';
import {PedidoSuperbaratoComponent} from './pedidos-canal/pedido-superbarato/pedido-superbarato.component';
import {
  PedidoTiendamulticomprasComponent
} from './pedidos-canal/pedido-tiendamulticompras/pedido-tiendamulticompras.component';
import {PedidoTodomegacentroComponent} from './pedidos-canal/pedido-todomegacentro/pedido-todomegacentro.component';
import {PedidoVittoriaComponent} from './pedidos-canal/pedido-vittoria/pedido-vittoria.component';
import {LandingEditComponent} from './pedidos-landing/landing-edit/landing-edit.component';
import {LandingListComponent} from './pedidos-landing/landing-list/landing-list.component';
import {
  PedidosEntregaLocalComponent
} from "./pedidos-canal/pedido-entrega-local/pedidos/pedidos-entrega-local.component";
import {
  PedidosEntregaLocalEntregadosComponent
} from "./pedidos-canal/pedido-entrega-local/entregados/pedidos-entrega-local-entregados.component";



@NgModule({
  declarations: [
    ParamsComponent,
    PedidosComponent,
    PedidosDevueltosComponent,
    PedidosRechazadosComponent,
    PedidoMegabahiaComponent,
    PedidoMayoristaComponent,
    PedidoContraentregaComponent,
    PedidoMaxidescuentoComponent,
    PedidoMegadescuentoComponent,
    PedidoSuperbaratoComponent,
    PedidoTiendamulticomprasComponent,
    PedidoTodomegacentroComponent,
    PedidoVittoriaComponent,
    LandingEditComponent,
    LandingListComponent,
    PedidosEntregaLocalComponent,
    PedidosEntregaLocalEntregadosComponent
  ],
  imports: [
    CommonModule,
    MpRoutingModule,
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
export class MpModule { }
