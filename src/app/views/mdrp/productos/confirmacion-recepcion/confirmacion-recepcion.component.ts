import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
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
  public productoRecepcionForm: FormGroup;
  archivo: FormData = new FormData();
  @ViewChild('fileInput') fileInput: ElementRef;

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
  imageUrlPrincipal: string | ArrayBuffer | null = null;
  imagenPrinciplSeleccionada: File | null = null;
  mostrarSpinner = false;

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

  ngOnInit(): void {
    this.obtenerProductosRecepcion();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
  }

  iniciarNotaRecepcionProducto(): void {
    this.productoRecepcionForm = this.formBuilder.group({
      id: [''],
      codigo_barras: ['', [Validators.required]],
      lote: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required]],
      stock: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]],
      descripcion: ['', [Validators.required]],
      verificarProducto: [1],
    });
  }

  get notaRecepcionProductoForm() {
    return this.productoRecepcionForm['controls'];
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

  obtenerProducto(id): void {
    this.mdrpProductosService.obtenerProducto(id).subscribe((info) => {
      this.productoRecepcionForm.patchValue({...info});
    });
  }

  actualizar(estadoConfirmacion, id): void {
    if (confirm('¿Esta seguro de confirmar los datos?') === true) {
      this.mostrarSpinner = true;
      this.mdrpProductosService.actualizarProducto({
        estado: estadoConfirmacion,
        fecha_confirmacion: new Date(),
      }, id).subscribe((info) => {
        this.toaster.open('Producto confirmado', {type: 'success'});
        this.obtenerProductosRecepcion();
        this.mostrarSpinner = false;
      }, error => {
        this.toaster.open('Error al confirmar producto', {type: 'danger'});
        this.mostrarSpinner = false;
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

  abrirModalAprobaion(modal, id): void {
    this.imageUrlPrincipal = null;
    this.imagenPrinciplSeleccionada = null;
    this.iniciarNotaRecepcionProducto();
    this.obtenerProducto(id);
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imagenPrinciplSeleccionada = input.files[0]; // Almacena el archivo seleccionado globalmente

      // Verificar tamaño del archivo (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (this.imagenPrinciplSeleccionada.size > maxSize) {
        this.imagenPrinciplSeleccionada = null;
        this.imageUrlPrincipal = null;
        this.toaster.open('El archivo supera el tamaño máximo permitido de 5MB', {type: 'danger'});
        this.fileInput.nativeElement.value = ''; // Resetea el input

        return;
      }
      this.cargarImagenPrincipal(this.imagenPrinciplSeleccionada); // Carga la imagen para su visualización
    }
  }

  private cargarImagenPrincipal(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrlPrincipal = e.target.result; // Almacena la URL de la imagen para visualización
    };
    reader.readAsDataURL(file);
  }

  verificarInforProducto() {
    if (this.productoRecepcionForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'danger'});
      return;
    }

    this.productoRecepcionForm.get('verificarProducto').setValue(1);
    const llaves: string[] = Object.keys(this.productoRecepcionForm.value);
    const valores: string[] = Object.values(this.productoRecepcionForm.value);
    llaves.map((llave, index) => {
      if (valores[index]) {
        this.archivo.delete(llave);
        this.archivo.append(llave, valores[index]);
      }
    });
    this.archivo.delete('imagen');
    if (this.imagenPrinciplSeleccionada != null) {
      this.archivo.append('imagen', this.imagenPrinciplSeleccionada);
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.mostrarSpinner = true;
      this.mdrpProductosService.actualizarProducto(this.archivo, this.productoRecepcionForm.value.id).subscribe((info) => {
        this.modalService.dismissAll();
        this.toaster.open('Producto verificado', {type: 'success'});
        this.obtenerProductosRecepcion();
        this.mostrarSpinner = false;
      }, error => {
        this.toaster.open('Error al verificar producto', {type: 'danger'});
        this.mostrarSpinner = false;
      });
    }
  }
}
