import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';

import {DatePipe} from '@angular/common';

import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';

import {AuthService} from "../../../services/admin/auth.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-reporte-producto',
  templateUrl: './reporte_productos.component.html',
  providers: [DatePipe]
})
export class ReporteProductosComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;

  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaContactos;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  verificarContacto = false;
  whatsapp = '';
  correo = ''
  mostrarInputComprobante = false;
  mostrarCargarArchivo = false;
  mostrarInputTransaccion = false;
  mostrarInputCobro = false;
  fileToUpload: File | null = null;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  parametroIva;
  totalIva;
  canalOpciones;
  verificarParametros = false;

  nombre;
  codigoBarras;
  canalProducto;
  imagenPrincipal;
  sinCanal;
  estado;
  listaProductos;
  token;

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private toaster: Toaster,
    private route: ActivatedRoute
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
  }

  cerrarSesion(): void {
    this.authService.signOut();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      //if (Object.keys(params).length === 0) {
      //  this.verificarParametros = false;
      //} else {
      this.verificarParametros = true;
      this.nombre = params['nombre'];
      this.codigoBarras = params['codigoBarras'];
      this.canalProducto = params['canalProducto'];
      this.imagenPrincipal = params['imagen_principal'];
      this.sinCanal = params['sinCanal'];
      this.estado = params['estado'];
      this.token = params['token'];
      //}
    });
    this.obtenerListaProductos();
  }

  /*ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerListaProductos();
  }*/

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProductos();
    });
  }


  obtenerListaProductos(): void {
    this.productosService.obtenerReporteHtmlProductos({
      //page: this.page - 1,
      //page_size: this.pageSize,
      nombre: this.nombre,
      codigoBarras: this.codigoBarras,
      canalProducto: this.canalProducto,
      imagen_principal: this.imagenPrincipal,
      sinCanal: this.sinCanal,
      estado: this.estado,
      token: this.token
    }).subscribe((info) => {
      this.listaProductos = info;
    }, error => this.verificarParametros = false);
  }

}
