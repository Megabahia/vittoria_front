import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../guard/auth.guard';
import {CiudadesComponent} from './ciudades/ciudades.component';
import {GuiasComponent} from './guias/guias.component';
import {GuiaRetornoComponent} from './guia-retorno/guia-retorno.component';
import {GuiaRecaudoComponent} from './guia-recaudo/guia-recaudo.component';
import {GuiaPdfA4Component} from './guia-pdf-a4/guia-pdf-a4.component';
import {GuiaDigitalPdfComponent} from './guia-digital-pdf/guia-digital-pdf.component';
import {GuiaStickerComponent} from './guia-sticker/guia-sticker.component';
import {GuiaManifiestoPdfComponent} from './guia-manifiesto-pdf/guia-manifiesto-pdf.component';
import {GuiaRotulosFormatoPdfComponent} from './guia-rotulos-formato-pdf/guia-rotulos-formato-pdf.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'ciudades', pathMatch: 'full'
  },
  {
    path: 'ciudades',
    component: CiudadesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'guias',
    children: [
      {
        path: '', redirectTo: 'crear', pathMatch: 'full'
      },
      {
        path: 'crear',
        component: GuiasComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'retorno',
        component: GuiaRetornoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'recaudo',
        component: GuiaRecaudoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'pdf-a4',
        component: GuiaPdfA4Component,
        canActivate: [AuthGuard]
      },
      {
        path: 'digital-pdf',
        component: GuiaDigitalPdfComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'sticker',
        component: GuiaStickerComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'manifiesto-pdf',
        component: GuiaManifiestoPdfComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'rotulos-formato-pdf',
        component: GuiaRotulosFormatoPdfComponent,
        canActivate: [AuthGuard]
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServientregaRoutingModule {
}
