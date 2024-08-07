import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from './admin.component';
import {ManagementComponent} from './management/management.component';
import {UsersListComponent} from './users/users-list/users-list.component';
import {UsersEditComponent} from './users/users-edit/users-edit.component';
import {RolesListComponent} from './roles/roles-list/roles-list.component';
import {ParamsListComponent} from './params/params-list/params-list.component';
import {AuthGuard} from 'src/app/guard/auth.guard';
import {RolesAddComponent} from './roles/roles-add/roles-add.component';
import {ProfileComponent} from './users/profile/profile.component';
import {IntegracionWoocommerceComponent} from './integracion-woocommerce/integracion-woocommerce.component';
import {IntegracionEnvioComponent} from "./integracion-envio/integracion-envio.component";

const routes: Routes = [
    {path: '', redirectTo: 'management', pathMatch: 'full'},
    {
      path: 'management', component: ManagementComponent, canActivate: [AuthGuard], data: {
        module: 'ADM'
      }
    },
    {
      path: 'user', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: UsersListComponent, canActivate: [AuthGuard]
        },
        {
          path: 'edit', component: UsersEditComponent
        },
        {
          path: 'profile', component: ProfileComponent
        },
        ]
    }, {
      path: 'roles', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: RolesListComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'param', children: [
        {path: '', redirectTo: 'list', pathMatch: 'full'}, {
          path: 'list', component: ParamsListComponent, canActivate: [AuthGuard]
        }]
    },
    {
      path: 'integraciones-woocommerce', component: IntegracionWoocommerceComponent, canActivate: [AuthGuard]
    },
  {
      path: 'integraciones-envio', component: IntegracionEnvioComponent, canActivate: [AuthGuard]
    },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
