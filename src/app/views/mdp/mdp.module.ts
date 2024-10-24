import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdpRoutingModule } from './mdp-routing.module';
import { MdpComponent } from './mdp.component';
import { ParamsComponent } from './params/params.component';

import { ActualizarStockComponent } from './productos/actualizar-stock/actualizar-stock.component';
import { AbastecimientoComponent } from './reportes/abastecimiento/abastecimiento.component';
import { StockComponent } from './reportes/stock/stock.component';
import { CaducidadComponent } from './reportes/caducidad/caducidad.component';
import { RotacionComponent } from './reportes/rotacion/rotacion.component';
import { RefilComponent } from './reportes/refil/refil.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ProductosEditarComponent } from './productos/listado/productos-editar/productos-editar.component';
import { ProductosListarComponent } from './productos/listado/productos-listar/productos-listar.component';
import { BuscarProductoComponent } from './productos/buscar-producto/buscar-producto.component';
import { SubcategoriasProductosComponent } from './productos/subcategorias-productos/subcategorias-productos.component';
import { CategoriasProductosComponent } from './productos/categorias-productos/categorias-productos.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {StockVirtualListarComponent} from "./stock-virtual/listado/stock-virtual-listar/stock-virtual-listar.component";
import {GdeModule} from "../gde/gde.module";
import {ProveedoresComponent} from "./proveedores/proveedores.component";


@NgModule({
  declarations: [
    MdpComponent,
    ParamsComponent,

    ActualizarStockComponent,
    AbastecimientoComponent,
    StockComponent,
    CaducidadComponent,
    RotacionComponent,
    RefilComponent,

    StockVirtualListarComponent,

    ProductosEditarComponent,
    ProductosListarComponent,
    BuscarProductoComponent,
    SubcategoriasProductosComponent,
    CategoriasProductosComponent,

    ProveedoresComponent
  ],
  imports: [
    CommonModule,
    MdpRoutingModule,
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
export class MdpModule { }
