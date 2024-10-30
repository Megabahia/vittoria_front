import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../../shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import {PagesRoutingModule} from './pages-routing.module';
import { ProductosComponent } from './productos/productos.component';
import {NgxCaptchaModule} from 'ngx-captcha';
import { CalculadoraComponent } from './calculadora/calculadora.component';
import { PedidoWoocomerceComponent } from './pedido-woocomerce/pedido-woocomerce.component';
import {GdeModule} from '../gde/gde.module';
import {ConsultaProductosComponent} from './consulta-productos/consulta-productos.component';
import { RegistroAsesoresComponent } from './registro-asesores/registro-asesores.component';
import {PedidosWoocommerceComponent} from "./pedidos-woocommerce/pedidos-woocommerce.component";



@NgModule({
  declarations: [
    ProductosComponent,
    CalculadoraComponent,
    PedidoWoocomerceComponent,
    ConsultaProductosComponent,
    RegistroAsesoresComponent,
    PedidosWoocommerceComponent
  ],
    imports: [
        CommonModule,
        NgbModule,
        SharedModule,
        FormsModule,
        ChartsModule,
        ReactiveFormsModule,
        FlatpickrModule.forRoot(),
        PagesRoutingModule,
        NgxCaptchaModule,
        GdeModule,
    ]
})
export class PagesModule { }
