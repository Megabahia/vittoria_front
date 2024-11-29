import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Toaster} from 'ngx-toast-notifications';
import {MdrpService} from "../../../../services/mdrp/mdrp_productos.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-recepcion-productos',
  templateUrl: './recepcion-productos.component.html',
  providers: [DatePipe]
})
export class RecepcionProductosComponent implements OnInit {
  @Input() paises;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('video', {
    read: ElementRef
  }) video: ElementRef;
  public notaRecepcionProducto: FormGroup;
  @ViewChild('eliminarImagenMdl') eliminarImagenMdl;

  page = 1;
  pageSize = 3;
  collectionSize;
  listaContactos;
  inicio = new Date();
  fin = new Date();
  invalidoTamanoVideo = false;
  archivos: File[] = [];
  imagenes = [];
  idImagen = 0;
  productoEncontrado = false;
  imagenesEncontradas;
  archivo: FormData = new FormData();
  imagenPrinciplSeleccionada: File | null = null;
  imageUrlPrincipal: string | ArrayBuffer | null = null;
  mostrarSpinner = false;

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private mdrpProductosService: MdrpService,
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private modalService: NgbModal,
  ) {

    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaRecepcionProducto();

  }

  ngOnInit(): void {

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

  iniciarNotaRecepcionProducto(): void {
    this.notaRecepcionProducto = this.formBuilder.group({
      codigo_barras: ['', [Validators.required]],
      lote: ['', [Validators.required, Validators.maxLength(10)]],
      imagen: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      estado: ['Nuevo', [Validators.required]],
      stock: [1, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]],
      descripcion: ['', [Validators.required]],
      video: [''],
      modulo: ['MDRP']
    });
  }

  get notaRecepcionProductoForm() {
    return this.notaRecepcionProducto['controls'];
  }

  crearProducto() {

    if (this.notaRecepcionProducto.invalid || this.invalidoTamanoVideo) {
      this.toaster.open('Llenar campos', {type: 'danger'});
      return;
    }

    const llaves: string[] = Object.keys(this.notaRecepcionProducto.value);
    const valores: string[] = Object.values(this.notaRecepcionProducto.value);
    llaves.map((llave, index) => {
      if (valores[index]) {
        this.archivo.delete(llave);
        this.archivo.append(llave, valores[index]);
      }
    });

    //VIDEO E IMAGENES
    this.archivo.delete('video');
    if (this.video.nativeElement.files[0]) {
      this.archivo.append('video', this.video.nativeElement.files[0]);
    }

    if (this.imagenPrinciplSeleccionada != null) {
      this.archivo.delete('imagen');
      this.archivo.append('imagen', this.imagenPrinciplSeleccionada);
    }
    //if (this.archivos.length < 0){
    this.archivos.map((valor, pos) => {
      this.archivo.append('imagenes[' + pos + ']id', pos.toString());
      this.archivo.append('imagenes[' + pos + ']imagen', valor);
    });
    //}


    if (confirm('Esta seguro de guardar los datos') === true) {
      this.mostrarSpinner = true;
      this.mdrpProductosService.crearProducto(this.archivo).subscribe((info) => {
        this.imageUrlPrincipal = null;
        this.imagenPrinciplSeleccionada = null;
        this.archivo.delete('imagen_principal');
        if (this.fileInput.nativeElement) {
          this.fileInput.nativeElement.value = '';
        }
        this.toaster.open("Producto guardado", {type: 'success'});
        this.removeAll();
        this.iniciarNotaRecepcionProducto();
        this.mostrarSpinner = false;
      }, error => {
        this.toaster.open("Error al guardar", {type: 'danger'});
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

  limpiar() {
    this.imageUrlPrincipal = null;
    this.imagenPrinciplSeleccionada = null;
    this.archivo.delete('imagen_principal');
    if (this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    this.iniciarNotaRecepcionProducto();
  }

  verificarPesoArchivo(event): void {
    const file: File = event.target.files[0];
    this.invalidoTamanoVideo = false;
    if (10485760 < file.size) {
      this.invalidoTamanoVideo = true;
      this.toaster.open('Archivo pesado', {type: 'warning'});
    }
  }

  eliminarImagenModal(id): void {
    this.idImagen = id;
    this.modalService.open(this.eliminarImagenMdl);
  }
}

