import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { ManagementComponent } from './management/management.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolesListComponent } from './roles/roles-list/roles-list.component';
import { RolesAddComponent } from './roles/roles-add/roles-add.component';
import { ParamsListComponent } from './params/params-list/params-list.component';
import { NgxCaptchaModule } from 'ngx-captcha';


@NgModule({
  declarations: [
    AdminComponent,
    ManagementComponent,
    UsersEditComponent,
    UsersListComponent,
    RolesListComponent,
    RolesAddComponent,
    ParamsListComponent,
    
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdminModule { }
