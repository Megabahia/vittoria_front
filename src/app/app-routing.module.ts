import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'admin', pathMatch: 'full'
  },
  {
    path: 'admin', loadChildren: () => import('./views/vittoria/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'auth', loadChildren: () => import('./views/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'mdm', loadChildren: () => import('./views/mdm/mdm.module').then(m => m.MdmModule)
  },
  {
    path: 'mdp', loadChildren: () => import('./views/mdp/mdp.module').then(m => m.MdpModule)
  },
  {
    path: 'mdo', loadChildren: () => import('./views/mdo/mdo.module').then(m => m.MdoModule)
  },
  {
    path: 'gdo', loadChildren: () => import('./views/gdo/gdo.module').then(m => m.GdoModule)
  },
  {
    path: 'gde', loadChildren: () => import('./views/gde/gde.module').then(m => m.GdeModule)
  },
  {
    path: 'servientrega', loadChildren: () => import('./views/servientrega/servientrega.module').then(m => m.ServientregaModule)
  },
  {
    path: 'facturacion', loadChildren: () => import('./views/facturacion/facturacion.module').then(m => m.FacturacionModule)
  },
  {
    path: 'reportes', loadChildren: () => import('./views/reportes/reportes.module').then(m => m.ReportesModule)
  },
  {
    path: 'todomegacentro', loadChildren: () => import('./views/todomegacentro/todomegacentro.module').then(m => m.TodomegacentroModule)
  },
  {
    path: 'pages', loadChildren: () => import('./views/pages/pages.module').then(m => m.PagesModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
