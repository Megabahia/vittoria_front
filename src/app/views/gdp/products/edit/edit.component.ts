import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Producto, ProductosService} from '../../../../services/gdp/productos/productos.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  @Output() vistaEvent = new EventEmitter<string>();
  @ViewChild('video', {
    read: ElementRef
  }) video: ElementRef;
  @Input() idProducto;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('eliminarImagenMdl') eliminarImagenMdl;
  idImagen = 0;
  imagenes = [];
  @ViewChild('aviso') aviso;
  producto: Producto;
  datosProducto: FormData = new FormData();
  productoForm: FormGroup;
  submittedProductoForm = false;
  idFichaTecnica;
  archivos: File[] = [];
  mensaje: string;
  numRegex = /^-?\d*[.,]?\d{0,2}$/;

  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
  ) {
    this.producto = this.productosService.inicializarProducto();
  }

  get fp() {
    return this.productoForm.controls;
  }

  ngOnInit(): void {
    this.productoForm = this._formBuilder.group({
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      subtitulo: ['', [Validators.required, Validators.maxLength(150)]],
      precio: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      codigo: ['', [Validators.required]],
      stock: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      precioOferta: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      video: ['', []],
      descripcion: ['', [Validators.required]],
      caracteristicas: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      imagenes: ['', []],
    });
    if (this.idProducto !== 0) {
      this.obtenerProducto();
    }
  }

  obtenerProducto(): void {
    this.productosService.obtenerProducto(this.idProducto).subscribe((info) => {
      const producto = info;
      this.imagenes = info.imagenes ?? [];
      delete producto.imagenes;
      delete producto.video;
      this.productoForm.patchValue({...producto});
    });
  }

  onSelect(event): void {
    if (this.archivos && this.archivos.length - this.imagenes.length > 0) {
      this.onRemove(this.archivos[0]);
    }
    this.archivos.push(...event.addedFiles);
  }

  onRemove(event): void {
    this.archivos.splice(this.archivos.indexOf(event), 1);
  }

  removeAll(): void {
    this.archivos = [];
  }

  guardarProducto(): void {
    this.submittedProductoForm = true;
    if (this.productoForm.invalid) {
      console.log('this.productoForm', this.productoForm);
      return;
    }

    const llaves = Object.keys(this.productoForm.value);
    let valores = Object.values(this.productoForm.value);
    this.datosProducto = new FormData();

    valores.map((valor: any, pos) => {
      this.datosProducto.append(llaves[pos], valor);
    });

    this.archivos.map((valor, pos) => {
      this.datosProducto.append('imagenes[' + pos + ']id', pos.toString());
      this.datosProducto.append('imagenes[' + pos + ']archivo', valor);
      this.datosProducto.append('imagenes[' + pos + ']tipo', 'imagen');
    });
    this.datosProducto.delete('video');
    if (this.video.nativeElement.files[0]) {
      this.datosProducto.append('imagenes[' + this.archivos.length + ']id', this.archivos.length.toString());
      this.datosProducto.append('imagenes[' + this.archivos.length + ']archivo', this.video.nativeElement.files[0]);
      this.datosProducto.append('imagenes[' + this.archivos.length + ']tipo', 'video');
    }
    if (this.idProducto !== 0) {
      this.productosService.actualizarProducto(this.datosProducto, this.idProducto).subscribe((info) => {
          this.mensaje = 'Producto actualizado';
          this.abrirModal(this.aviso);
          this.vistaEvent.emit('lista');
        },
        (error) => {
          const errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.aviso);
        });
    } else {
      this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
          this.idProducto = info.id;
          this.mensaje = 'Producto guardado';
          this.abrirModal(this.aviso);
          this.vistaEvent.emit('lista');
        },
        (error) => {
          const errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.aviso);
        });
    }
  }

  eliminarImagenModal(id): void {
    this.idImagen = id;
    this.modalService.open(this.eliminarImagenMdl);
  }

  eliminarImagen(): void {
    this.productosService.eliminarImagen(this.idImagen).subscribe((info) => {
      this.obtenerProducto();
      this.modalService.dismissAll();

    });
  }

  abrirModal(modal, id = null): void {
    this.idFichaTecnica = id;
    this.modalService.open(modal);
  }

  cerrarModalMensaje(): void {
    this.modalService.dismissAll();
  }

  abrirModalMensaje(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  cerrarModalEliminar(): void {
    this.modalService.dismissAll();
  }

  cambiarVista() {
    this.vistaEvent.emit('lista');
  }

}
