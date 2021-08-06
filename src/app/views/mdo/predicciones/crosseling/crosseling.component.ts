import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CrossService, PrediccionesCross, Prediccion } from '../../../../services/mdo/predicciones/cross/cross.service';
import { DatePipe } from '@angular/common';
import { ParamService } from 'src/app/services/admin/param.service';

@Component({
  selector: 'app-crosseling',
  templateUrl: './crosseling.component.html',
  providers: [DatePipe]
})
export class CrosselingComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  listaPredicciones: PrediccionesCross;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  fecha = "";
  inicio = "";
  fin = "";
  ultimosProductos;
  prediccion: Prediccion;
  cliente;
  constructor(
    private crossService: CrossService,
    private datePipe: DatePipe,
    private globalParam: ParamService
  ) {
    this.prediccion = crossService.inicializarPrediccion();
  }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdo",
      seccion: "predCross"
    };
  }
  async ngAfterViewInit() {
    this.iniciarPaginador();
    this.obtenerListaPredicciones();
  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaPredicciones();
    });
  }
  obtenerListaPredicciones() {
    let fecha = this.fecha.split(' to ');
    this.inicio = fecha[0] ? fecha[0] : "";
    this.fin = fecha[1] ? fecha[1] : "";
    this.crossService.obtenerListaPredicciones(
      {
        page: this.page - 1,
        page_size: this.pageSize,
        inicio: this.inicio,
        fin: this.fin
      }
    ).subscribe((info) => {
      this.listaPredicciones = info.info;
      this.collectionSize = info.cont;
    });
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  obtenerUltimosProductos(id) {
    return this.crossService.obtenerUltimosProductos(id).subscribe((info) => {
      info.map((prod) => {
        prod.imagen = this.obtenerURLImagen(prod.imagen);
      });
      this.ultimosProductos = info;
    });
  }
  obtenerProductosPrediccion(id) {
    return this.crossService.obtenerProductosPrediccion(id).subscribe((info) => {
      info.cliente.imagen = this.obtenerURLImagen(info.cliente.imagen);
      info.productos.map((prod) => {
        prod.imagen = this.obtenerURLImagen(prod.imagen);
        prod.predicciones.map((pred) => {
          pred.imagen = this.obtenerURLImagen(pred.imagen);
        });
      });
      this.prediccion = info;
    });
  }
}
