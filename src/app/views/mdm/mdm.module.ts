import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdmRoutingModule } from './mdm-routing.module';
import { MdmComponent } from './mdm.component';
import { ParamsComponent } from './params/params.component';


@NgModule({
  declarations: [
    MdmComponent,
    ParamsComponent
  ],
  imports: [
    CommonModule,
    MdmRoutingModule
  ]
})
export class MdmModule { }
