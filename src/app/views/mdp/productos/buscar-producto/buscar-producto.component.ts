import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {ExportService} from '../../../../services/admin/export.service';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-buscar-producto',
  templateUrl: './buscar-producto.component.html'
})
export class BuscarProductoComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  listaProductos;
  page = 1;
  pageSize: any = 3;
  maxSize;
  collectionSize;
  codigoBarras = '';
  nombre = '';
  infoExportar;

  constructor(
    private productosService: ProductosService,
    private exportFile: ExportService
  ) {
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdp',
      seccion: 'prodBusq'
    };
    this.obtenerListaProductos();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerListaProductos();
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProductos();
    });
  }

  obtenerListaProductos() {
    this.productosService.buscarListaProductos({
      nombre: this.nombre,
      codigoBarras: this.codigoBarras,
      page: this.page - 1,
      page_size: this.pageSize
    }).subscribe((info) => {
      this.listaProductos = info.info;
      this.collectionSize = info.cont;
    });
  }

  exportarExcel() {
    this.infoExportar = [];
    const headers = ['Código de Barras', 'Nombre', 'Categoría', 'Subcategoría', 'Stock', 'Estado'];
    this.listaProductos.forEach((row: any) => {

      const values = [];
      values.push(row['codigoBarras']);
      values.push(row['nombre']);
      values.push(row['categoria']);
      values.push(row['subCategoria']);
      values.push(row['stock']);
      values.push(row['estado']);
      this.infoExportar.push(values);
    });
    const reportData = {
      title: 'Reporte de Productos',
      data: this.infoExportar,
      headers
    };

    this.exportFile.exportExcel(reportData);
  }
}
