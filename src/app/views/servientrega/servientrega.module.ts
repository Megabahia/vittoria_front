import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CiudadesComponent} from './ciudades/ciudades.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ServientregaRoutingModule} from './servientrega-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {ChartsModule} from 'ng2-charts';
import {FlatpickrModule} from 'angularx-flatpickr';
import { GuiasComponent } from './guias/guias.component';
import { GuiaRetornoComponent } from './guia-retorno/guia-retorno.component';
import { GuiaRecaudoComponent } from './guia-recaudo/guia-recaudo.component';
import { GuiaPdfA4Component } from './guia-pdf-a4/guia-pdf-a4.component';
import { GuiaDigitalPdfComponent } from './guia-digital-pdf/guia-digital-pdf.component';
import { GuiaStickerComponent } from './guia-sticker/guia-sticker.component';
import { GuiaManifiestoPdfComponent } from './guia-manifiesto-pdf/guia-manifiesto-pdf.component';
import { GuiaRotulosFormatoPdfComponent } from './guia-rotulos-formato-pdf/guia-rotulos-formato-pdf.component';


@NgModule({
  declarations: [
    CiudadesComponent,
    GuiasComponent,
    GuiaRetornoComponent,
    GuiaRecaudoComponent,
    GuiaPdfA4Component,
    GuiaDigitalPdfComponent,
    GuiaStickerComponent,
    GuiaManifiestoPdfComponent,
    GuiaRotulosFormatoPdfComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    FormsModule,
    ChartsModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
    ServientregaRoutingModule,
  ]
})
export class ServientregaModule {
}
