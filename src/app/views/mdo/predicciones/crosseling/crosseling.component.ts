import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CrossService, PrediccionesCross } from '../../../../services/mdo/predicciones/cross/cross.service';
import { DatePipe } from '@angular/common';

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
  fecha="";
  inicio="";
  fin="";
  constructor(
    private crossService: CrossService,
    private datePipe:DatePipe) { }

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
    this.inicio = fecha[0] ? fecha[0]: "";
    this.fin = fecha[1] ? fecha[1]: "";
    this.crossService.obtenerListaPredicciones(
      {
        page:this.page-1,
        page_size: this.pageSize,
        inicio:this.inicio,
        fin:this.fin
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
}
