import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ManagementComponent } from './management/management.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { AuthGuard } from 'src/app/guard/auth.guard';

const routes: Routes = [{
  path: '', component: AdminComponent, children: [
    {path: '', redirectTo: 'management', pathMatch: 'full'},
    {path: 'management', component: ManagementComponent, canActivate: [AuthGuard]},
    {
      path: 'user' , children:[
        {path: '', redirectTo: 'list', pathMatch: 'full'},{
          path:'list', component:UsersListComponent,canActivate: [AuthGuard]
      },{
        path:'edit', component:UsersEditComponent
      }]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
