import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {FacturacionRoutingModule} from './facturacion-routing.module';
import { FacturasAutorizadasComponent } from './canal-vittoria/facturas-autorizadas/facturas-autorizadas.component';
import {FacturasLocalesComponent} from './canal-vittoria/facturas-locales/facturas-locales.component';
import {FacturasExternosComponent} from './canal-externo/facturas-externos/facturas-externos.component';
import {FacturasExternasAutorizadasComponent} from './canal-externo/facturas-autorizadas/facturas-externas-autorizadas.component';


@NgModule({
  declarations: [
    FacturasLocalesComponent,
    FacturasExternosComponent,
    FacturasAutorizadasComponent,
    FacturasExternasAutorizadasComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    FacturacionRoutingModule
  ]
})
export class FacturacionModule {
}
