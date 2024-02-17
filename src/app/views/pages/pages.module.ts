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



@NgModule({
  declarations: [
    ProductosComponent,
    CalculadoraComponent
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
  ]
})
export class PagesModule { }
