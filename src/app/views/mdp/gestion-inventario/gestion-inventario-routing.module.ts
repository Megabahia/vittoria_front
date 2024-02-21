import {NgModule} from '@angular/core';
import {AuthGuard} from '../../../guard/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {CargarProveedoresProductosComponent} from './cargar-proveedores-productos/cargar-proveedores-productos.component';
import {ProveedoresComponent} from './proveedores/proveedores.component';

const routes: Routes = [
  {path: '', redirectTo: 'cargar-productos', pathMatch: 'full'},
  {
    path: 'cargar-productos', component: CargarProveedoresProductosComponent, canActivate: [AuthGuard]
  },
  {
    path: 'buscar-productos', component: ProveedoresComponent, canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionInventarioRoutingModule {
}
