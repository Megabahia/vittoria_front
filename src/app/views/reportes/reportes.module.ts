import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {ReportesRoutingModule} from './reportes-routing.module';
import { ReporteFacturasComponent } from './reporte-facturas/reporte-facturas.component';
import { ReporteClientesComponent } from './reporte-clientes/reporte-clientes.component';
import {ReporteTransaccionesListComponent} from './reporte-transacciones-list/reporte-transacciones-list.component';



@NgModule({
  declarations: [
    ReporteFacturasComponent,
    ReporteClientesComponent,
    ReporteTransaccionesListComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    ReportesRoutingModule,
  ]
})
export class ReportesModule { }
