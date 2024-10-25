import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {MdrpService} from '../../../../services/mdrp/mdrp_productos.service';

@Component({
  selector: 'app-list-productos',
  templateUrl: './list-productos.component.html',
  providers: [DatePipe]
})
export class ListProductosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  productoRecepcionForm: FormGroup;

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
  fechaActual = new Date();
  mostrarSpinner = false;
  idProductoEnviar;
  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private mdrpProductosService: MdrpService,
    private modalService: NgbModal,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
  }

  iniciarAprobacionProducto(): void {
    this.productoRecepcionForm = this.formBuilder.group({
      id: [''],
      precioVentaA: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioVentaB: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioVentaC: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioVentaD: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioVentaE: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioVentaF: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioLanding: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioLandingOferta: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioVentaBultos: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      precioOferta: [0, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      porcentaje_comision: [null, [Validators.min(0), Validators.max(100), Validators.pattern('^[0-9]*$')]],
      valor_comision: [null, [Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      estado: ['Enviado'],
    });
  }

  get notaAprobacionProductoForm() {
    return this.productoRecepcionForm['controls'];
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
      estado: ['Aprobado']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaProductos = info.info;
    });
  }

  actualizar(): void {
    if (this.productoRecepcionForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'danger'});
      return;
    }

    if (!this.productoRecepcionForm.value.porcentaje_comision && !this.productoRecepcionForm.value.valor_comision) {
      this.toaster.open('Debe completar uno de los dos campos de comisión', {type: 'warning'});
      return;
    }

    if (this.productoRecepcionForm.value.porcentaje_comision && this.productoRecepcionForm.value.valor_comision) {
      this.toaster.open('Debe completar solo un campo de comisión', {type: 'warning'});
      return;
    }

    if (confirm('¿Esta seguro de guardar los datos?') === true) {
      this.mdrpProductosService.actualizarProducto(this.productoRecepcionForm.value, this.idProductoEnviar).subscribe((info) => {
        this.toaster.open('Producto enviado', {type: 'success'});
        this.obtenerProductosRecepcion();
        this.modalService.dismissAll();
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

  abrirModalPrecios(modal, id): void {
    this.iniciarAprobacionProducto();
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
    this.idProductoEnviar = id;

  }
}
