import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {MdrpService} from "../../../../services/mdrp/mdrp_productos.service";

@Component({
  selector: 'app-confirmacion-recepcion',
  templateUrl: './confirmacion-recepcion.component.html',
  providers: [DatePipe]
})
export class ConfirmacionRecepcionComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;

  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
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

  fileToUpload: File | null = null;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  listaProductos;
  codigoBarrasBuscar;

  mostrarSpinner = false;

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private mdrpProductosService: MdrpService,

  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
  }

  ngOnInit(): void {
    this.obtenerProductosRecepcion();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerProductosRecepcion();
    });
  }

  obtenerProductosRecepcion(): void {
    this.mdrpProductosService.obtenerListaProductos({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.transformarFecha(this.fin),
      codigoBarras: this.codigoBarrasBuscar,
      estado: ['Nuevo']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaProductos = info.info;
    });
  }

  actualizar(estadoConfirmacion, id): void {
    if (confirm('¿Esta seguro de confirmar los datos?') === true) {
      this.mdrpProductosService.actualizarProducto({
        estado: estadoConfirmacion,
        fecha_confirmacion: new Date(),
      }, id).subscribe((info) => {
        this.toaster.open('Producto confirmado', { type: 'success'});
        this.obtenerProductosRecepcion();
      });
    }
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  formatearFecha(): string {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mes}-${anio}`;
  }
}
