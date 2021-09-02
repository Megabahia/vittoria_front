import { Component, OnInit } from '@angular/core';
import { GestionOfertaService } from '../../../services/gdo/gestionOferta/gestion-oferta.service';

@Component({
  selector: 'app-gestion-oferta',
  templateUrl: './gestion-oferta.component.html'
})
export class GestionOfertaComponent implements OnInit {
  menu;
  tipoCliente="";
  identificacion;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  fecha = "";
  inicio = "";
  fin = "";
  listaOfertas;
  constructor(private gestionOfertaService:GestionOfertaService) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "gdo",
      seccion: "gestionOferta"
    };
  }
  
  obtenerListaGestionOferta() {
    let fecha = this.fecha.split(' to ');
    this.inicio = fecha[0] ? fecha[0] : "";
    this.fin = fecha[1] ? fecha[1] : "";
    let busqueda: any = {
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin
    };
    if (this.tipoCliente == 'negocio') {
      busqueda = { ...busqueda, negocio: 1, identificacion: this.identificacion }
    } else if (this.tipoCliente == 'cliente') {
      busqueda = { ...busqueda, cliente: 1, identificacion: this.identificacion }
    }
    this.gestionOfertaService.obtenerListaGestionOferta(
      busqueda
    ).subscribe((info) => {
      this.listaOfertas = info.info;
      this.collectionSize = info.cont;
    });
  }
}
