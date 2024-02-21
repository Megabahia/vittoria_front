import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder} from '@angular/forms';
import {AuthService} from '../../../../services/admin/auth.service';
import {GestionInventarioService} from '../../../../services/mdp/gestion-inventario/gestion-inventario.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedoresComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  vista;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  parametros;
  tiposOpciones = '';
  tipos;
  nombreBuscar;
  nombre;
  nombreTipo = '';
  descripcion;
  funcion;
  tipoPadre = '';
  idPadre = 0;
  tipoVariable;
  minimo;
  maximo;
  valor;
  padres;
  currentUserValue;
  archivo: FormData = new FormData();

  constructor(
    private gestionInventarioService: GestionInventarioService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.currentUserValue = this.authService.currentUserValue;
  }


  ngOnInit(): void {
    this.menu = {
      modulo: 'mdp',
      seccion: 'param'
    };
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerListaParametros();
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaParametros();
    });

  }

  obtenerListaParametros(): void {
    this.gestionInventarioService.filtrarProductosProveedores({
      page: this.page - 1,
      page_size: this.pageSize,
      tipo: this.tiposOpciones,
      nombre: this.nombreBuscar
    }).subscribe((result) => {
      this.parametros = result.info;
      this.collectionSize = result.cont;
    });

  }

  export(): void {
    this.gestionInventarioService.exportar().subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'productos.xls';
      link.click();
    });
  }

}
