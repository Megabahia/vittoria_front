import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { ManagementComponent } from './management/management.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { UsersListComponent } from './users/users-list/users-list.component';
// import { UsersComponent } from './users/users.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminComponent,
    ManagementComponent,
    UsersEditComponent,
    UsersListComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
  ]
})
export class AdminModule { }
