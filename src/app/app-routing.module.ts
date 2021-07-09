import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'',redirectTo: 'admin' ,pathMatch: 'full' 
},{
  path:'admin', loadChildren:() => import('./views/vittoria/admin.module').then(m => m.AdminModule)
},
{
  path:'auth', loadChildren:() => import('./views/auth/auth.module').then(m => m.AuthModule)
},
{
  path:'mdm', loadChildren:() => import('./views/mdm/mdm.module').then(m => m.MdmModule)
},
{
  path:'mdp', loadChildren:() => import('./views/mdp/mdp.module').then(m => m.MdpModule)
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
