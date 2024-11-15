import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {NgxDropzoneModule} from 'ngx-dropzone';
import {GestionInventarioRoutingModule} from './gestion-inventario-routing.module';
import { CargarProveedoresProductosComponent } from './cargar-proveedores-productos/cargar-proveedores-productos.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { CargarStockComponent } from './cargar-stock/cargar-stock.component';
import { ProductosComponent } from './productos/productos.component';
import {CargarStockMegabahiaComponent} from "./cargar-stock-megabahia/cargar-stock-megabahia.component";
import {CargarStockCanalesComponent} from "./cargar-stock-canales/cargar-stock-canales.component";
import {GdeModule} from "../../gde/gde.module";
import {CargarInventarioCatalogoComponent} from "./cargar-inventario-catalogo/cargar-inventario-catalogo.component";
import {ActualizarInventarioComponent} from "./actualizacion-inventario/actualizar-inventario.component";


@NgModule({
  declarations: [
    CargarProveedoresProductosComponent,
    ProveedoresComponent,
    CargarStockComponent,
    ProductosComponent,
    CargarStockMegabahiaComponent,
    CargarStockCanalesComponent,
    CargarInventarioCatalogoComponent,
    ActualizarInventarioComponent
  ],
  imports: [
    GestionInventarioRoutingModule,
    CommonModule,
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
export class GestionInventarioModule {
}
