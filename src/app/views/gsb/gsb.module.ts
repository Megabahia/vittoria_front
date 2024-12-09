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
import {GsbComponent} from './gsb.component';
import {GsbProductosListarComponent} from './inventario/productos-listar/gsb-productos-listar.component';
import {GsbProductosEditarComponent} from './inventario/productos-editar/gsb-productos-editar.component';
import {GsbGenerarPedidoComponent} from './gsb_pedido/gsb-generar-pedido.component';
import {GsbReporteVentasComponent} from './gsb_reportes/gsb-reporte-ventas.component';
import {QRCodeModule} from 'angularx-qrcode';
import {SuperbaratoComponent} from './gsb_superbarato/superbarato.component';
import {GsbProductosReporteComponent} from './inventario/productos-reporte/gsb-productos-reporte.component';
import {GsbGenerarContactoComponent} from './gsb_contactos/contactos_crear/gsb-generar-contacto.component';
import {ContactosListarComponent} from './gsb_contactos/contactos_listar/contactos-listar.component';
import {
  ReporteContactosListarComponent
} from './gsb_contactos/reporte_contactos_listar/reporte_contactos-listar.component';
import {GdParamsComponent} from './gd_params/gd_params.component';
import {GdConsultaProductosComponent} from './gd_consultar_productos/gd-consulta-productos.component';
import {
  ReporteContactosVentasComponent
} from './gsb_contactos/reporte_contactos_ventas/reporte_contactos-ventas.component';
import {CrearPedidoWoocomerceComponent} from './crear-pedido-woocommerce/crear-pedido-woocomerce.component';
import {GdRegistrosAsesoresComponent} from './gd_asesores_comerciales/registros/gd_registros_asesores.component';
import {GdAsesoresConfirmadosComponent} from './gd_asesores_comerciales/confirmados/gd_asesores_confirmados.component';
import {
  GdBilleteraDigitalAsesoresComponent
} from './gd_asesores_comerciales/billetera_digital/movimientos/gd_billetera_digital_asesores.component';
import {GdRegistroAsesoresComponent} from './gd_asesores_comerciales/registro_asesores/registro-asesores.component';
import {
  GdCargarSaldoBilleteraDigitalComponent
} from "./gd_asesores_comerciales/billetera_digital/cargar-saldo/gd_cargar_saldo_billetera_digital.component";
import {GdPedidosWoocommerceComponent} from "./gd_pedidos_woocommerce/gd-pedidos-woocommerce.component";
import {GdReporteAsesoresComponent} from "./gd_asesores_comerciales/reporte_asesores/gd_reporte_asesores.component";

@NgModule({
  declarations: [
    GsbComponent,
    GsbProductosListarComponent,
    GsbProductosEditarComponent,
    GsbGenerarPedidoComponent,
    GsbReporteVentasComponent,
    SuperbaratoComponent,
    GsbProductosReporteComponent,
    GsbGenerarContactoComponent,
    ContactosListarComponent,
    ReporteContactosListarComponent,
    GdParamsComponent,
    GdConsultaProductosComponent,
    ReporteContactosVentasComponent,
    CrearPedidoWoocomerceComponent,
    GdRegistrosAsesoresComponent,
    GdAsesoresConfirmadosComponent,
    GdBilleteraDigitalAsesoresComponent,
    GdRegistroAsesoresComponent,
    GdCargarSaldoBilleteraDigitalComponent,
    GdPedidosWoocommerceComponent,
    GdReporteAsesoresComponent
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
