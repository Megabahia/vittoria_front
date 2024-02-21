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
  productos;
  tiposOpciones = '';
  tipos;
  nombreBuscar;
  proveedor = '';
  valor;
  currentUserValue;

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
    this.obtenerProveedores();
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
      codigoBarras: this.nombreBuscar,
      proveedor: this.proveedor,
    }).subscribe((result) => {
      this.productos = result.info;
      this.collectionSize = result.cont;
    });

  }

  obtenerProveedores(): void {
    this.gestionInventarioService.obtenerProveedores().subscribe((result) => {
      this.tipos = result;
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
