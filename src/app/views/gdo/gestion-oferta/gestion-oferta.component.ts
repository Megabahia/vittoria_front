import { Component, OnInit } from '@angular/core';
import { GestionOfertaService, GestionOferta } from '../../../services/gdo/gestionOferta/gestion-oferta.service';
import { DatePipe } from '@angular/common';
import { ParamService as ParamServiceADM } from 'src/app/services/admin/param.service';

@Component({
  selector: 'app-gestion-oferta',
  templateUrl: './gestion-oferta.component.html',
  providers: [DatePipe]
})
export class GestionOfertaComponent implements OnInit {
  menu;
  tipoCliente = "";
  identificacion;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  fecha = "";
  inicio = "";
  fin = "";
  listaOfertas;
  ultimosProductos;
  oferta;
  constructor(
    private gestionOfertaService: GestionOfertaService,
    private datePipe: DatePipe,
    private globalParam: ParamServiceADM
  ) {
    this.oferta = this.gestionOfertaService.inicializarGestionOferta();
  }

  ngOnInit(): void {
    this.menu = {
      modulo: "gdo",
      seccion: "gestOferta"
    };
    this.obtenerListaGestionOferta();
  }
  ngAfterViewInit() {

  }
  obternerGestionOferta(id) {
    this.gestionOfertaService.obtenerGestionOferta(id).subscribe((info) => {
      this.oferta = info;
    });
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
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  primeraLetra(nombre, apellido) {
    let iniciales = nombre.charAt(0) + apellido.charAt(0);
    return iniciales;
  }
  obtenerUltimosProductos(id) {
    this.gestionOfertaService.obtenerUltimosProductos(id).subscribe((info) => {
      info.map((prod) => {
        prod.imagen = this.obtenerURLImagen(prod.imagen);
      });
      this.ultimosProductos = info;
    });
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  actualizarGestionOferta(){
    this.gestionOfertaService.actualizarGestionOferta(this.oferta).subscribe(()=>{
      this.obtenerListaGestionOferta();
    });
  }
}
