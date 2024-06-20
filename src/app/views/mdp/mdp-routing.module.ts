import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MdpComponent} from './mdp.component';
import {ParamsComponent} from './params/params.component';
import {AuthGuard} from '../../guard/auth.guard';
import {ProductosListarComponent} from './productos/listado/productos-listar/productos-listar.component';
import {BuscarProductoComponent} from './productos/buscar-producto/buscar-producto.component';
import {CategoriasProductosComponent} from './productos/categorias-productos/categorias-productos.component';
import {SubcategoriasProductosComponent} from './productos/subcategorias-productos/subcategorias-productos.component';
import {ActualizarStockComponent} from './productos/actualizar-stock/actualizar-stock.component';
import {AbastecimientoComponent} from './reportes/abastecimiento/abastecimiento.component';
import {StockComponent} from './reportes/stock/stock.component';
import {CaducidadComponent} from './reportes/caducidad/caducidad.component';
import {RotacionComponent} from './reportes/rotacion/rotacion.component';
import {RefilComponent} from './reportes/refil/refil.component';
import {StockVirtualListarComponent} from "./stock-virtual/listado/stock-virtual-listar/stock-virtual-listar.component";

const routes: Routes = [{
  path: '', component: MdpComponent, children: [
    {path: '', redirectTo: 'parametrizaciones', pathMatch: 'full'},
    {
      path: 'parametrizaciones', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: ParamsComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'categorias', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: CategoriasProductosComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'subcategorias', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: SubcategoriasProductosComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'stock-virtual', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: StockVirtualListarComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'productos', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'},
        {
          path: 'list', component: ProductosListarComponent, canActivate: [AuthGuard]
        },
        {
          path: 'search', component: BuscarProductoComponent, canActivate: [AuthGuard]
        },
        {
          path: 'actualizarStock', component: ActualizarStockComponent, canActivate: [AuthGuard]
        }
      ]
    },
    {
      path: 'reportes', children: [
        {path: '', redirectTo: 'abastecimiento', pathMatch: 'full'},
        {
          path: 'abastecimiento', component: AbastecimientoComponent, canActivate: [AuthGuard]
        },
        {
          path: 'stock', component: StockComponent, canActivate: [AuthGuard]
        },
        {
          path: 'caducidad', component: CaducidadComponent, canActivate: [AuthGuard]
        },
        {
          path: 'rotacion', component: RotacionComponent, canActivate: [AuthGuard]
        },
        {
          path: 'refil', component: RefilComponent, canActivate: [AuthGuard]
        }
      ]
    },
    {
      path: 'gestion-proveedores',
      loadChildren: () => import('./gestion-inventario/gestion-inventario.module').then(m => m.GestionInventarioModule)
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdpRoutingModule {
}
