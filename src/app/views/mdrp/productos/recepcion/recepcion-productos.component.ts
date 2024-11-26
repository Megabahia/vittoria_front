import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Toaster} from 'ngx-toast-notifications';
import {MdrpService} from "../../../../services/mdrp/mdrp_productos.service";

@Component({
  selector: 'app-recepcion-productos',
  templateUrl: './recepcion-productos.component.html',
  providers: [DatePipe]
})
export class RecepcionProductosComponent implements OnInit {
  @Input() paises;
  @ViewChild('fileInput') fileInput: ElementRef;

  public notaRecepcionProducto: FormGroup;

  page = 1;
  pageSize = 3;
  collectionSize;
  listaContactos;
  inicio = new Date();
  fin = new Date();

  archivo: FormData = new FormData();
  imagenPrinciplSeleccionada: File | null = null;
  imageUrlPrincipal: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private mdrpProductosService: MdrpService,
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
  ) {

    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaRecepcionProducto();

  }

  ngOnInit(): void {

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
    });
  }

  get notaRecepcionProductoForm() {
    return this.notaRecepcionProducto['controls'];
  }

  crearProducto() {

    if (this.notaRecepcionProducto.invalid) {
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

    if (this.imagenPrinciplSeleccionada != null) {
      this.archivo.delete('imagen');
      this.archivo.append('imagen', this.imagenPrinciplSeleccionada);
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.mdrpProductosService.crearProducto(this.archivo).subscribe((info) => {
        this.imageUrlPrincipal = null;
        this.imagenPrinciplSeleccionada = null;
        this.archivo.delete('imagen_principal');
        if (this.fileInput.nativeElement) {
          this.fileInput.nativeElement.value = '';
        }
        this.toaster.open("Producto guardado", {type: 'success'});

        this.iniciarNotaRecepcionProducto();
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
}

