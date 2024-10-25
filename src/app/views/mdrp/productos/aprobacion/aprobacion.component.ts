import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {MdrpService} from '../../../../services/mdrp/mdrp_productos.service';
import {MdpProveedoresService} from "../../../../services/mdp/reportes/mdp_proveedores.service";

@Component({
  selector: 'app-aprobacion',
  templateUrl: './aprobacion.component.html',
  providers: [DatePipe]
})
export class AprobacionComponent implements OnInit, AfterViewInit {
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
  listaProveedores;
  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private mdrpProductosService: MdrpService,
    private modalService: NgbModal,
    private proveedoresService: MdpProveedoresService,

  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.obtenerListaProveedores();

  }

  iniciarAprobacionProducto(): void {
    this.productoRecepcionForm = this.formBuilder.group({
      id: [''],
      proveedor: ['', [Validators.required]],
      comentario: ['', [Validators.required]],
      costoCompra: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      fecha_aprobacion: [''],
      fecha_confirmacion: [''],
      estado: [''],
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
      estado: ['Confirmado']
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

    if (confirm('¿Esta seguro de confirmar los datos?') === true) {
      this.mdrpProductosService.actualizarProducto(this.productoRecepcionForm.value, this.productoRecepcionForm.value.id).subscribe((info) => {
        this.toaster.open('Producto aprobado', {type: 'success'});
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

  obtenerProducto(id): void {
    this.mdrpProductosService.obtenerProducto(id).subscribe((info) => {
      this.productoRecepcionForm.patchValue({...info});
      this.productoRecepcionForm.get('fecha_aprobacion').setValue(this.fechaActual);
      this.productoRecepcionForm.get('estado').setValue('Aprobado');
    });
  }

  abrirModalAprobaion(modal, id): void {
    this.iniciarAprobacionProducto();
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
    this.obtenerProducto(id);

  }

  obtenerListaProveedores(): void {
    this.proveedoresService.obtenerListaProveedores({
      page: this.page - 1,
      page_size: this.pageSize,
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
    }).subscribe((info) => {
      this.listaProveedores = info.data;
    });
  }
}
