import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {NgbPagination, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CategoriasService} from '../../../../../services/mdp/productos/categorias/categorias.service';
import {Producto, ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {SubcategoriasService} from '../../../../../services/mdp/productos/subcategorias/subcategorias.service';
import {ParamService} from 'src/app/services/mdp/param/param.service';
import {ParamService as MDMParamService} from 'src/app/services/mdm/param/param.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';

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

  constructor(
    private categoriasService: CategoriasService,
    private subcategoriasService: SubcategoriasService,
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramService: ParamService,
    private MDMparamService: MDMParamService,
    private _formBuilder: FormBuilder,
  ) {
    this.producto = this.productosService.inicializarProducto();
    this.fichaTecnica = this.productosService.inicializarFichaTecnica();
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
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      descripcion: ['', [Validators.required]],
      codigoBarras: ['', [Validators.required, Validators.maxLength(150)]],
      refil: ['', [Validators.required]],
      stock: ['', [Validators.required, Validators.min(1), ValidacionesPropias.numeroEntero]],
      parametrizacion: [0, [Validators.required, Validators.min(1)]],
      costoCompra: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaA: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaB: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaC: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaD: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaE: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      precioVentaBultos: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      estado: ['', [Validators.required]],
      variableRefil: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      fechaCaducidad: ['', [Validators.required]],
      fechaElaboracion: ['', [Validators.required]],
      caracteristicas: ['', [Validators.required]],
      precioOferta: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      envioNivelNacional: [true, []],
      lugarVentaProvincia: ['', []],
      lugarVentaCiudad: ['', []],
      courier: ['', [Validators.required]],
      estadoLanding: [true, []],
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
      if (!this.producto.envioNivelNacional) {
        this.productoForm.get('lugarVentaProvincia').setValue(this.producto.lugarVentaProvincia);
        this.obtenerCiudad();
        this.productoForm.get('lugarVentaCiudad').setValue(this.producto.lugarVentaCiudad);
      }
      this.obtenerListaSubcategorias();
    });
  }

  async obtenerCourierOpciones() {
    await this.paramService.obtenerListaPadres('COURIER').subscribe((info) => {
      this.couriers = info;
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
    let llaves = Object.keys(this.producto);
    let valores = Object.values(this.producto);
    this.datosProducto = new FormData();

    valores.map((valor, pos) => {
      this.datosProducto.append(llaves[pos], valor);
    });

    // this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
    //   console.log(info);
    // });
    this.submittedProductoForm = true;
    if (this.productoForm.invalid) {
      return;
    }
    const fechaCaducidad = moment(this.producto.fechaCaducidad, 'YYYY-MM-DD');
    const fechaElaboracion = moment(this.producto.fechaElaboracion, 'YYYY-MM-DD');
    const diferenciaDiasElabCad = fechaCaducidad.diff(fechaElaboracion, 'days');
    const diferenciaDiasHoyCad = fechaCaducidad.diff(moment(), 'days');
    if (diferenciaDiasElabCad < 0) {
      this.mensaje = 'La fecha de caducidad debe ser mayor a la de elaboración';
      this.abrirModal(this.aviso);
      return;
    }
    if (diferenciaDiasHoyCad < 0) {
      this.mensaje = 'La fecha de caducidad debe ser mayor a la fecha actual';
      this.abrirModal(this.aviso);
      return;
    }
    this.datosProducto.delete('video');
    if (this.video.nativeElement.files[0]) {
      this.datosProducto.append('video', this.video.nativeElement.files[0]);
    }
    this.archivos.map((valor, pos) => {
      this.datosProducto.append('imagenes[' + pos + ']id', pos.toString());
      this.datosProducto.append('imagenes[' + pos + ']imagen', valor);
    });
    if (this.idProducto !== 0) {
      this.productosService.actualizarProducto(this.datosProducto, this.idProducto).subscribe((info) => {
          this.mensaje = 'Producto actualizado';
          this.abrirModal(this.aviso);
          this.messageEvent.emit('lista');
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
      this.productosService.crearProducto(this.datosProducto).subscribe((info) => {
          this.idProducto = info.id;
          this.mensaje = 'Producto guardado';
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

  cerrarModalEliminar(): void {
    this.modalService.dismissAll();
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
}
