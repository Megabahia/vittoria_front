import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MdmComponent } from './mdm.component';

const routes: Routes = [{
  path: '', component: MdmComponent, children: [
    {path: '', redirectTo: 'management', pathMatch: 'full'},
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdmRoutingModule { }
