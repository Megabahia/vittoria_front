import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IntegracionesService} from '../../../services/admin/integraciones.service';
import {Toaster} from 'ngx-toast-notifications';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';

@Component({
  selector: 'app-integracion-woocommerce',
  templateUrl: './integracion-woocommerce.component.html',
  styleUrls: ['./integracion-woocommerce.component.css']
})

export class IntegracionWoocommerceComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;
  archivo: FormData = new FormData();

  cargando = false;
  mensaje = '';
  paramForm: FormGroup;
  menu;
  vista;
  page = 1;
  pageSize = 3;
  maxSize;
  collectionSize;
  parametros;
  tiposOpciones = '';
  tipos;
  nombreBuscar;
  nombre;
  nombreTipo = '';
  descripcion;
  funcion = '';
  idParametro;
  tipoPadre = '';
  idPadre = 0;
  tipoVariable;
  valor;
  padres;

  habilitarDatosPedido;
  habilitarDatosDespacho;
  pedidoOmniglobal;
  despachoOmniglobal;
  sectorOpciones;

  pais = 'Ecuador';
  ciudadOpciones;
  provinciaOpciones;
  provincia = '';
  imageUrlPrincipal: string | ArrayBuffer | null = null;
  fotoLocal: string | ArrayBuffer | null = null;
  imagenPrinciplSeleccionada: File | null = null;
  fotoLocalSeleccionada: File | null = null;
  // @ViewChild('padres') padres;
  constructor(
    private integracionesService: IntegracionesService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private toaster: Toaster,
    private paramServiceAdm: ParamServiceAdm,
  ) {

  }

  get f() {
    return this.paramForm.controls;
  }

  insertarParametro(): void {
    this.funcion = 'insertar';
    this.paramForm.reset();
    this.paramForm.get('pais').setValue(this.pais);
    this.imageUrlPrincipal = null;
    this.fotoLocal = null;
    this.obtenerProvincias();

  }


  ngOnInit(): void {
    this.paramForm = this._formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required]],
      pedidos_local: this._formBuilder.group({
        estado: [0, []],
        nombre: [''],
        correo: [''],
        telefono: [''],
      }),
      pedidos_omniglobal: [0, []],
      despachos_local: this._formBuilder.group({
        estado: [0, []],
        nombre: [''],
        correo: [''],
        telefono: [''],
      }),
      despachos_omniglobal: [0, []],
      valor: ['', [Validators.required]],
      tipoCanal: ['', [Validators.required]],
      pais: [this.pais, [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      sector: [''],
      latitud: [''],
      longitud: [''],
      prefijo: ['', [Validators.required, Validators.maxLength(4)]],
      bodega_central: [0, []],
      descripcion_direccion: ['', [Validators.required]],
      direccion_mapa: ['', [Validators.required]],
      hora_atencion: ['', [Validators.required]],
      descuento: [0, [Validators.required, Validators.max(100), Validators.pattern('^[0-9]+$')]],
      imagen_principal: [''],
      foto_local: [''],
      whatsapp: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
    });
    this.menu = {
      modulo: 'adm',
      seccion: 'param'
    };
    this.obtenerProvincias();
  }

  get pedidosLocalForm() {
    return this.paramForm.get('pedidos_local')['controls'];
  }

  get despachosLocalForm() {
    return this.paramForm.get('despachos_local')['controls'];
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerListaParametros();
  }

  async iniciarPaginador(): Promise<void> {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaParametros();
    });

  }

  async obtenerListaParametros(): Promise<void> {
    const datos = {
      page: this.page,
      page_size: this.pageSize
    };
    await this.integracionesService.obtenerListaIntegraciones(datos).subscribe((result) => {
      this.collectionSize = result.cont;
      this.parametros = result.info;
    });
  }

  async editarParametro(id): Promise<void> {
    this.paramForm.reset();
    this.imageUrlPrincipal = null;
    this.fotoLocal = null;
    this.idParametro = id;
    this.funcion = 'editar';
    await this.integracionesService.obtenerIntegracion(id).subscribe((result) => {
      this.imageUrlPrincipal = result.imagen_principal;
      this.fotoLocal = result.foto_local;
      this.paramForm.patchValue({...result});
      this.obtenerCiudad();
      this.obtenerSector();
    });
  }

  async gestionarParametro(): Promise<void> {
    if (this.paramForm.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    const canalLlaves: string[] = Object.keys(this.paramForm.value);
    const canalValores: string[] = Object.values(this.paramForm.value);

    canalLlaves.map((llave, index) => {
      if (llave !== 'imagen_principal' && llave !== 'foto_local') {
        if (llave === 'pedidos_local' || llave === 'despachos_local') {
          this.archivo.delete(llave);
          this.archivo.append(llave, JSON.stringify(canalValores[index]));
        } else {
          this.archivo.delete(llave);
          this.archivo.append(llave, canalValores[index]);
        }
      }
    });

    this.archivo.delete('bodega_central');
    this.archivo.delete('despachos_omniglobal');

    if (this.imagenPrinciplSeleccionada != null) {
      this.archivo.delete('imagen_principal');
      this.archivo.append('imagen_principal', this.imagenPrinciplSeleccionada);
    }
    if (this.fotoLocalSeleccionada != null) {
      this.archivo.delete('foto_local');
      this.archivo.append('foto_local', this.fotoLocalSeleccionada);
    }

    this.cargando = true;
    if (this.funcion === 'insertar') {
      await this.integracionesService.insertarIntegracion(this.archivo).subscribe((result) => {
          this.obtenerListaParametros();
          this.dismissModal.nativeElement.click();
          this.cargando = false;
          this.mensaje = 'Parámetro guardado';
          this.abrirModalMensaje(this.mensajeModal);
          this.paramForm.reset();
        },
        (error) => {
          const errores = Object.values(error);
          const llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModalMensaje(this.mensajeModal);
        });
    } else if (this.funcion === 'editar') {
      await this.integracionesService.editarIntegracionFormData(this.archivo).subscribe((result) => {
          this.obtenerListaParametros();
          this.dismissModal.nativeElement.click();
          this.cargando = false;
          this.mensaje = 'Parámetro guardado';
          this.abrirModalMensaje(this.mensajeModal);
        },
        (error) => {
          const errores = Object.values(error);
          const llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModalMensaje(this.mensajeModal);
        });
    }
  }

  abrirModal(modal, id): void {
    this.idParametro = id;
    this.modalService.open(modal);
  }

  async cerrarModal(): Promise<void> {
    this.modalService.dismissAll();
    if (this.funcion !== 'editar' && this.funcion !== 'insertar') {
      await this.integracionesService.eliminarIntegracion(this.idParametro).subscribe((result) => {
        this.obtenerListaParametros();
      });
    }
    this.funcion = '';
  }

  abrirModalMensaje(modal): void {
    this.modalService.open(modal);
  }

  onSelectCheckPedido(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    this.habilitarDatosPedido = inputElement.checked ? 1 : 0;
    if (this.habilitarDatosPedido === 1) {
      this.paramForm.get('pedidos_local').get('estado').setValue(1);
      this.paramForm.get('pedidos_local').get('nombre').setValidators([Validators.required]);
      this.paramForm.get('pedidos_local').get('correo').setValidators([Validators.required, Validators.email]);
      this.paramForm.get('pedidos_local').get('telefono').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]);
    } else {
      this.paramForm.get('pedidos_local').get('estado').setValue(0);
      this.paramForm.get('pedidos_local').get('nombre').setValidators([]);
      this.paramForm.get('pedidos_local').get('correo').setValidators([]);
      this.paramForm.get('pedidos_local').get('telefono').setValidators([]);
    }
    this.paramForm.get('pedidos_local').get('nombre').updateValueAndValidity();
    this.paramForm.get('pedidos_local').get('correo').updateValueAndValidity();
    this.paramForm.get('pedidos_local').get('telefono').updateValueAndValidity();

  }

  onSelectCheckPedidoOmniglobal(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    this.pedidoOmniglobal = inputElement.checked ? 1 : 0;
    this.paramForm.get('pedidos_omniglobal').setValue(this.pedidoOmniglobal);

  }

  onSelectCheckBodegaCentral(datos, event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const bodegaCentral = inputElement.checked ? 1 : 0;
    this.paramForm.patchValue({...datos});
    this.paramForm.get('bodega_central').setValue(bodegaCentral);
    this.integracionesService.editarIntegracion(this.paramForm.value).subscribe((result) => {
        this.obtenerListaParametros();
        this.toaster.open('Parámetro actualizado', {type: 'success'});
      },
      (error) => {
        this.toaster.open(error, {type: 'danger'});
      });
  }

  onSelectCheckDespacho(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    this.habilitarDatosDespacho = inputElement.checked ? 1 : 0;
    if (this.habilitarDatosDespacho === 1) {
      this.paramForm.get('despachos_local').get('estado').setValue(1);
      this.paramForm.get('despachos_local').get('nombre').setValidators([Validators.required]);
      this.paramForm.get('despachos_local').get('correo').setValidators([Validators.required, Validators.email]);
      this.paramForm.get('despachos_local').get('telefono').setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]);
    } else {
      this.paramForm.get('despachos_local').get('estado').setValue(0);
      this.paramForm.get('despachos_local').get('nombre').setValidators([]);
      this.paramForm.get('despachos_local').get('correo').setValidators([]);
      this.paramForm.get('despachos_local').get('telefono').setValidators([]);
    }
    this.paramForm.get('despachos_local').get('nombre').updateValueAndValidity();
    this.paramForm.get('despachos_local').get('correo').updateValueAndValidity();
    this.paramForm.get('despachos_local').get('telefono').updateValueAndValidity();
  }

  onSelectCheckDespachoOmniglobal(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    this.despachoOmniglobal = inputElement.checked ? 1 : 0;
    this.paramForm.get('despachos_omniglobal').setValue(this.despachoOmniglobal);

  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.paramForm.value.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerSector(): void {
    this.paramServiceAdm.obtenerListaHijos(this.paramForm.value.ciudad, 'CIUDAD').subscribe((info) => {
      this.sectorOpciones = info;
    });
  }

  onFileSelect(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imagenPrinciplSeleccionada = input.files[0]; // Almacena el archivo seleccionado globalmente
      this.cargarImagenPrincipal(this.imagenPrinciplSeleccionada); // Carga la imagen para su visualización

    }
  }
  onFileSelectFotoLocal(event: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fotoLocalSeleccionada = input.files[0]; // Almacena el archivo seleccionado globalmente
      this.cargarFotoLocal(this.fotoLocalSeleccionada); // Carga la imagen para su visualización

    }
  }

  private cargarImagenPrincipal(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrlPrincipal = e.target.result; // Almacena la URL de la imagen para visualización
    };
    reader.readAsDataURL(file);
  }

  private cargarFotoLocal(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fotoLocal = e.target.result; // Almacena la URL de la imagen para visualización
    };
    reader.readAsDataURL(file);
  }

}
