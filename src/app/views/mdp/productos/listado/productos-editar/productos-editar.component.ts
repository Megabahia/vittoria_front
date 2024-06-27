import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {NgbPagination, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CategoriasService} from '../../../../../services/mdp/productos/categorias/categorias.service';
import {Producto, ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {SubcategoriasService} from '../../../../../services/mdp/productos/subcategorias/subcategorias.service';
import {ParamService} from 'src/app/services/mdp/param/param.service';
import {ParamService as AdmParamService} from '../../../../../services/admin/param.service';
import {HttpClient} from '@angular/common/http';

import {ParamService as MDMParamService} from 'src/app/services/mdm/param/param.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-productos-editar',
  templateUrl: './productos-editar.component.html'
})
export class ProductosEditarComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<string>();
  @ViewChild('video', {
    read: ElementRef
  }) video: ElementRef;
  @Input() idProducto;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('eliminarImagenMdl') eliminarImagenMdl;
  @ViewChild('fileInput') fileInput: ElementRef;

  idImagen = 0;
  imagenes = [];
  cantImagenes = 0;
  @ViewChild('aviso') aviso;
  producto: Producto;
  datosProducto: FormData = new FormData();
  productoForm: FormGroup;
  fichaTecnicaForm: FormGroup;
  submittedProductoForm = false;
  submittedFichaTecnicaForm = false;
  opcion;
  categoriasOpciones;
  canalOpciones;
  subcategoriasOpciones;
  fichaTecnica;
  fichaTecnicaLista;
  idFichaTecnica;
  abastecimientoOpciones;
  archivos: File[] = [];
  mensaje: string;
  numRegex = /^-?\d*[.,]?\d{0,2}$/;
  couriers = [];
  provincias = [];
  ciudadOpciones = [];
  habilitarEnvio = false;
  invalidoTamanoVideo = false;
  mostrarSpinner = false;
  canalUsuario
  listaProductos;
  codigoBarras: string;
  page = 1;
  pageSize: any = 3;
  tiposOpciones = '';
  nombreBuscar;
  imageUrlPrincipal: string | ArrayBuffer | null = null;
  imagenPrinciplSeleccionada: File | null = null;
  disabledSelectCanal = false;

  constructor(
    private categoriasService: CategoriasService,
    private subcategoriasService: SubcategoriasService,
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramService: ParamService,
    private paramServiceAdm: AdmParamService,
    private MDMparamService: MDMParamService,
    private _formBuilder: FormBuilder,
    private toaster: Toaster,
    private http: HttpClient
  ) {
    this.producto = this.productosService.inicializarProducto();
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
    this.obtenerListaParametros();
    this.obtenerUsuarioActual();
  }

  get fp() {
    return this.productoForm.controls;
  }

  get fft() {
    return this.fichaTecnicaForm.controls;
  }

  ngOnInit(): void {
    this.productoForm = this._formBuilder.group({
      categoria: ['', [Validators.required]],
      subCategoria: ['', [Validators.required]],
      idPadre: [''],
      canal: [''],
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', [Validators.required]],
      codigoBarras: ['', [Validators.required, Validators.maxLength(150)]],
      refil: [0, []],
      stock: ['', [Validators.required, Validators.min(1), ValidacionesPropias.numeroEntero]],
      //parametrizacion: [0, [Validators.required, Validators.min(1)]],
      parametrizacion: [null, []],
      costoCompra: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaA: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaB: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaC: ['', []],
      precioVentaD: ['', []],
      precioVentaE: ['', []],
      precioVentaF: ['', []],
      precioVentaBultos: [0, []],
      estado: ['', [Validators.required]],
      //variableRefil: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      variableRefil: ['', []],
      fechaCaducidad: ['', []],
      fechaElaboracion: ['', []],
      caracteristicas: ['', [Validators.required]],
      proveedor: ['', [Validators.required]],
      precioOferta: [0, []],
      envioNivelNacional: [true, []],
      lugarVentaProvincia: ['', []],
      lugarVentaCiudad: ['', []],
      courier: ['', []],
      estadoLanding: [true, []],
      precioLanding: [0, []],
      //precioLanding: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioLandingOferta: [0, []],
      woocommerceId: ['', []],
      imagen_principal: ['', [Validators.required]],
      stockVirtual: ['', []],
    });
    this.fichaTecnicaForm = this._formBuilder.group({
      codigo: ['', [Validators.required]],
      nombreAtributo: ['', [Validators.required]],
      valor: ['', [Validators.required]]
    });
    this.obtenerAbastecimientoOpciones();
    this.obtenerCategoriasOpciones();
    if (this.idProducto !== 0) {
      this.obtenerProducto();
      this.obtenerFichasTecnicas();
    } else {
      this.obtenerUsuarioActual()
    }
    this.obtenerCourierOpciones();
    this.obtenerProvinciasOpciones();
  }

  obtenerProducto(): void {
    this.productosService.obtenerProducto(this.idProducto).subscribe((info) => {
      const producto = info;
      this.imagenes = info.imagenes;
      delete producto.imagenes;
      this.producto = producto;
      this.habilitarEnvio = !producto.envioNivelNacional;
      console.log('INFO', info)
      this.imageUrlPrincipal = info.imagen_principal;

      this.productoForm.patchValue(info);

      if (!this.producto.envioNivelNacional) {
        this.productoForm.get('lugarVentaProvincia').setValue(this.producto.lugarVentaProvincia);
        this.obtenerCiudad();
        this.productoForm.get('lugarVentaCiudad').setValue(this.producto.lugarVentaCiudad);
      }
      if (info.canales == '') {

        this.obtenerListaParametros();
      }
      this.obtenerListaSubcategorias();
    });
  }

  async obtenerCourierOpciones() {
    await this.paramService.obtenerListaPadres('COURIER').subscribe((info) => {
      this.couriers = info;
    });
  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar).subscribe((result) => {
      this.canalOpciones = result.data;
    });
  }

  async obtenerProvinciasOpciones() {
    await this.MDMparamService.obtenerListaHijos('Ecuador', 'PAIS').subscribe((info) => {
      this.provincias = info;
    });
  }

  async obtenerAbastecimientoOpciones() {
    await this.paramService.obtenerListaPadres('ALERTA_ABASTECIMIENTO').subscribe((info) => {
      this.abastecimientoOpciones = info;
    });
  }

  obtenerFichasTecnicas(): void {
    this.productosService.obtenerFichasTecnicas(this.idProducto).subscribe((info) => {
      this.fichaTecnicaLista = info.info;
    });
  }

  async obtenerCategoriasOpciones() {
    await this.categoriasService.obtenerListaCategorias().subscribe((info) => {
      this.categoriasOpciones = info;
    });
  }

  async obtenerListaSubcategorias() {
    await this.subcategoriasService.obtenerListaSubcategoriasHijas(this.producto.categoria).subscribe((info) => {
      this.subcategoriasOpciones = info;
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
    this.producto.stockVirtual = JSON.stringify(this.producto.stockVirtual.map(item => {
      if (item.canal === this.producto.canal) {
        return {...item, estado: true};
      } else {
        return item;
      }
    }));
    let llaves = Object.keys(this.producto);
    let valores = Object.values(this.producto);
    this.datosProducto = new FormData();
    valores.map((valor, pos) => {
      if (llaves[pos] !== 'imagen_principal' && valor !== null) {
        this.datosProducto.append(llaves[pos], valor);
      }
    });
    if (this.imagenPrinciplSeleccionada != null) {
      this.datosProducto.delete('imagen_principal');
      this.datosProducto.append('imagen_principal', this.imagenPrinciplSeleccionada);
    }

    // this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
    //   console.log(info);
    // });
    this.submittedProductoForm = true;
    if (this.productoForm.invalid || this.invalidoTamanoVideo) {
      this.toaster.open('Llenar campos', {type: 'warning'});
      return;
    }
    const fechaCaducidad = moment(this.producto.fechaCaducidad, 'YYYY-MM-DD');
    const fechaElaboracion = moment(this.producto.fechaElaboracion, 'YYYY-MM-DD');
    const diferenciaDiasElabCad = fechaCaducidad.diff(fechaElaboracion, 'days');
    const diferenciaDiasHoyCad = fechaCaducidad.diff(moment(), 'days');
    /*if (diferenciaDiasElabCad < 0) {
      this.mensaje = 'La fecha de caducidad debe ser mayor a la de elaboración';
      this.abrirModal(this.aviso);
      return;
    }
    if (diferenciaDiasHoyCad < 0) {
      this.mensaje = 'La fecha de caducidad debe ser mayor a la fecha actual';
      this.abrirModal(this.aviso);
      return;
    }*/
    this.datosProducto.delete('video');
    if (this.video.nativeElement.files[0]) {
      this.datosProducto.append('video', this.video.nativeElement.files[0]);
    }
    this.archivos.map((valor, pos) => {
      this.datosProducto.append('imagenes[' + pos + ']id', pos.toString());
      this.datosProducto.append('imagenes[' + pos + ']imagen', valor);
    });
    this.mostrarSpinner = true;
    if (this.idProducto !== 0) {
      this.datosProducto.delete('stockVirtual');
      this.productosService.actualizarProducto(this.datosProducto, this.idProducto).subscribe((info) => {
          this.mensaje = 'Producto actualizado';
          this.abrirModal(this.aviso);
          this.messageEvent.emit('lista');
          this.mostrarSpinner = false;
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.aviso);
          this.mostrarSpinner = false;
        });
    } else {
      this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
          this.idProducto = info.id;
          this.mensaje = 'Producto guardado';
          this.abrirModal(this.aviso);
          this.messageEvent.emit('lista');
          this.mostrarSpinner = false;
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.aviso);
          this.mostrarSpinner = false;
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

  crearFichaTecnica(): void {
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
    this.opcion = 'insertar';
    this.submittedFichaTecnicaForm = false;
    this.fichaTecnica.producto = this.idProducto;


  }

  editarFichaTecnica(id): void {
    this.productosService.obtenerFichaTecnica(id).subscribe((info) => {
      this.fichaTecnica = info;
      this.submittedFichaTecnicaForm = false;
      this.opcion = 'editar';
    });
  }

  eliminarFichaTecnica(id): void {
    this.productosService.eliminarFichaTecnica(id).subscribe(() => {
    });
  }

  guardarFichaTecnica(): void {
    this.submittedFichaTecnicaForm = true;
    if (this.fichaTecnicaForm.invalid) {
      return;
    }
    if (this.opcion === 'insertar') {
      if (this.idProducto !== 0) {
        this.productosService.crearFichaTecnica(this.fichaTecnica).subscribe((info) => {
            this.obtenerFichasTecnicas();
            this.dismissModal.nativeElement.click();
            this.submittedFichaTecnicaForm = false;
            this.mensaje = 'Ficha técnica guardada';
            this.abrirModal(this.aviso);
          },
          (error) => {
            let errores = Object.values(error);
            let llaves = Object.keys(error);
            this.mensaje = '';
            errores.map((infoErrores, index) => {
              this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
            });
            this.abrirModal(this.aviso);
          });
      } else {
        this.mensaje = 'Es necesario ingresar un producto primero';
        this.abrirModal(this.aviso);
      }
    } else if (this.opcion === 'editar') {
      this.productosService.editarFichaTecnica(this.fichaTecnica).subscribe((info) => {
          this.obtenerFichasTecnicas();
          this.dismissModal.nativeElement.click();
          this.submittedFichaTecnicaForm = false;
          this.mensaje = 'Ficha técnica guardada';
          this.abrirModal(this.aviso);
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.aviso);
        });
    }
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
    this.productosService.eliminarFichaTecnica(this.idFichaTecnica).subscribe(() => {
      this.obtenerFichasTecnicas();
    });
  }

  seleccionarEnvio(event): void {
    this.habilitarEnvio = !event.currentTarget.checked;
    if (this.habilitarEnvio) {
      this.productoForm.get('lugarVentaProvincia').setValidators([Validators.required]);
      this.productoForm.get('lugarVentaCiudad').setValidators([Validators.required]);
    } else {
      this.productoForm.get('lugarVentaProvincia').setValidators([]);
      this.productoForm.get('lugarVentaCiudad').setValidators([]);
      this.productoForm.get('lugarVentaProvincia').setValue('');
      this.productoForm.get('lugarVentaCiudad').setValue('');
    }
    this.productoForm.get('lugarVentaProvincia').updateValueAndValidity();
    this.productoForm.get('lugarVentaCiudad').updateValueAndValidity();
  }

  seleccionarEstadoLanding(event): void {
    this.producto.estadoLanding = event.currentTarget.checked;
  }

  obtenerCiudad(): void {
    this.MDMparamService.obtenerListaHijos(this.productoForm.value.lugarVentaProvincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  volver(): void {
    this.messageEvent.emit('lista');
  }

  verificarPesoArchivo(event): void {
    const file: File = event.target.files[0];
    this.invalidoTamanoVideo = false;
    if (10485760 < file.size) {
      this.invalidoTamanoVideo = true;
      this.toaster.open('Archivo pesado', {type: 'warning'});
    }
  }


  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imagenPrinciplSeleccionada = input.files[0]; // Almacena el archivo seleccionado globalmente
      console.log('onflieselect', input.files[0]);
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


  eliminarImagenPrincipal(): void {
    this.imageUrlPrincipal = null;
    this.imagenPrinciplSeleccionada = null;
    this.datosProducto.delete('imagen_principal');
    // Si también necesitas limpiar el input file, aquí una manera de hacerlo usando ViewChild
    // Debes asegurarte de tener el ViewChild para el input file
    if (this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  obtenerUsuarioActual(): void {
    const usuarioJSON = localStorage.getItem('currentUser');
    if (usuarioJSON) {
      const usuarioObjeto = JSON.parse(usuarioJSON);
      if (usuarioObjeto.usuario.idRol === 60) {
        this.producto.canal = usuarioObjeto.usuario.canal;
        this.disabledSelectCanal = true;
      }
      //console.log('Usuario obtenido como objeto:', usuarioObjeto.usuario);
    } else {
      console.log('No hay datos de usuario en localStorage');
    }
  }
}
