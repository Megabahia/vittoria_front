import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from 'src/app/services/mdp/productos/productos.service';

@Component({
  selector: 'app-rotacion',
  templateUrl: './rotacion.component.html',
  providers:[DatePipe]
})
export class RotacionComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  inicio = "";
  fin = "";
  categoria = "";
  categoriasOpciones;
  subcategoria = "";
  subcategoriasOpciones;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  listaProductos;
  infoExportar;
  constructor(
    private productosService:ProductosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "rotaRep"
    };
  }
  async ngAfterViewInit() {
    this.obtenerListaProductos();
    this.iniciarPaginador();
  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProductos();
    });
  }

  obtenerListaProductos() {
    this.productosService.obtenerListaRotacion({
      inicio: this.inicio,
      fin: this.fin,
      categoria: this.categoria,
      subCategoria: this.subcategoria,
      page: this.page - 1,
      page_size: this.pageSize
    }).subscribe((info) => {
      this.listaProductos = info.info;
      this.collectionSize = info.cont;
    });
  }

  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }

}
