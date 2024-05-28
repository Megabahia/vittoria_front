import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {FacturasLocalesComponent} from './canal-vittoria/facturas-locales/facturas-locales.component';
import {FacturasExternosComponent} from './canal-externo/facturas-externos/facturas-externos.component';
import {FacturasExternasAutorizadasComponent} from './canal-externo/facturas-autorizadas/facturas-externas-autorizadas.component';
import {FacturasAutorizadasComponent} from './canal-vittoria/facturas-autorizadas/facturas-autorizadas.component';
import {FacturasWoocommerceComponent} from './canal-woocommerce/facturas-locales/facturas-woocommerce.component';

const routes: Routes = [
  {path: '', redirectTo: 'pedidos', pathMatch: 'full'},
  {
    path: 'pedidos', children: [
      {
        path: 'pendiente',
        component: FacturasLocalesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'facturadas',
        component: FacturasAutorizadasComponent,
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: 'canal-externas', children: [
      {
        path: 'pendiente',
        component: FacturasExternosComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'facturadas',
        component: FacturasExternasAutorizadasComponent,
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: 'canal-woocommerce', children: [
      {
        path: 'pendiente',
        component: FacturasWoocommerceComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'facturadas',
        component: FacturasAutorizadasComponent,
        canActivate: [AuthGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule {
}
