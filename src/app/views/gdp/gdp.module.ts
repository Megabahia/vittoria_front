import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {GdpRoutingModule} from './gdp-routing.module';
import {EditComponent} from './products/edit/edit.component';
import {ListComponent} from './products/list/list.component';
import {NgxDropzoneModule} from 'ngx-dropzone';


@NgModule({
  declarations: [
    EditComponent,
    ListComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    GdpRoutingModule,
    NgxDropzoneModule
  ]
})
export class GdpModule {
}
