import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../../services/gdp/productos/productos.service';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  vista = 'lista';
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  listaProductos;
  idProducto = 0;

  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal
  ) {
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdp',
      seccion: 'prodList'
    };

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

  obtenerListaProductos(): void {
    this.productosService.obtenerListaProductos(
      {
        page: this.page - 1,
        page_size: this.pageSize
      }
    ).subscribe((info) => {
      this.listaProductos = info.info;
      this.collectionSize = info.cont;
    });
  }

  crearProducto(): void {
    this.vista = 'editar';
    this.idProducto = 0;
  }

  editarProducto(id): void {
    this.idProducto = id;
    this.vista = 'editar';
  }

  abrirModal(modal, id): void {
    this.idProducto = id;
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
    this.productosService.eliminarProducto(this.idProducto).subscribe(() => {
      this.obtenerListaProductos();
    });
  }

  recibirVista($event): void {
    this.vista = $event;
    this.obtenerListaProductos();
  }

  copiarURL(inputTextValue): void {
    const selectBox = document.createElement('textarea');
    selectBox.style.position = 'fixed';
    selectBox.value = `${environment.apiUrlFront}/pages/productos/${inputTextValue}`;
    document.body.appendChild(selectBox);
    selectBox.focus();
    selectBox.select();
    document.execCommand('copy');
    document.body.removeChild(selectBox);
  }
}
