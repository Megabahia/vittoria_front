import {NgModule} from '@angular/core';
import {AuthGuard} from '../../../guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {CargarProveedoresProductosComponent} from './cargar-proveedores-productos/cargar-proveedores-productos.component';
import {ProveedoresComponent} from './proveedores/proveedores.component';
import {CargarStockComponent} from './cargar-stock/cargar-stock.component';
import {ProductosComponent} from './productos/productos.component';
import {CargarStockMegabahiaComponent} from "./cargar-stock-megabahia/cargar-stock-megabahia.component";
import {CargarStockCanalesComponent} from "./cargar-stock-canales/cargar-stock-canales.component";
import {CargarInventarioCatalogoComponent} from "./cargar-inventario-catalogo/cargar-inventario-catalogo.component";
import {ActualizarInventarioComponent} from "./actualizacion-inventario/actualizar-inventario.component";

const routes: Routes = [
  {path: '', redirectTo: 'cargar-productos', pathMatch: 'full'},
  {
    path: 'cargar-productos', component: CargarProveedoresProductosComponent, canActivate: [AuthGuard]
  },
  {
    path: 'buscar-productos', component: ProveedoresComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cargar-stock-productos', component: CargarStockComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cargar-stock-megabahia', component: CargarStockMegabahiaComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cargar-stock-canales', component: CargarStockCanalesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'actualizar-inventario', component: ActualizarInventarioComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cargar-inventario-catalogo', component: CargarInventarioCatalogoComponent, canActivate: [AuthGuard]
  },
  {
    path: 'productos', component: ProductosComponent, canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionInventarioRoutingModule {
}
