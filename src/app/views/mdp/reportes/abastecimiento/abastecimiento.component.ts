import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from 'src/app/services/mdp/productos/productos.service';
import { SubcategoriasService } from '../../../../services/mdp/productos/subcategorias/subcategorias.service';
import { CategoriasService } from '../../../../services/mdp/productos/categorias/categorias.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-productos-abastecimiento',
  templateUrl: './abastecimiento.component.html',
  providers:[DatePipe]
})
export class AbastecimientoComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;

  menu;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  inicio= "";
  fin = "";
  categoria= "";
  categoriasOpciones;
  subcategoria = "";
  subcategoriasOpciones;
  listaAbastecimiento;
  constructor(
    private categoriasService: CategoriasService,
    private subcategoriasService: SubcategoriasService,
    private productosService: ProductosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "abastRep"
    };
    this.obtenerListaProductos();
  }
  async ngAfterViewInit() {
    this.iniciarPaginador();
  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProductos();
    });
  }
  obtenerListaProductos() {
    this.productosService.obtenerListaAbastecimiento(
      {
        inicio: this.inicio,
        fin: this.fin,
        categoria: this.categoria,
        subCategoria: this.subcategoria,
        page: this.page - 1,
        page_size: this.pageSize
      }
    ).subscribe((info) => {
      console.log(info);
    });
  }


  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
}
