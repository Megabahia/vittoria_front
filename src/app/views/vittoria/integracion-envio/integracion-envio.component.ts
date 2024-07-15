import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IntegracionesService} from '../../../services/admin/integraciones.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-integracion-woocommerce',
  templateUrl: './integracion-envio.component.html',
  styleUrls: ['./integracion-envio.component.css']
})

export class IntegracionEnvioComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;

  cargando = false;
  mensaje = '';
  paramForm: FormGroup;
  menu;
  vista;
  page = 1;
  page_size: any = 3;
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

  disabledPedidoLocal = false;
  disabledPedidoOmniglobal = false;

  // @ViewChild('padres') padres;
  constructor(
    private integracionesService: IntegracionesService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private toaster: Toaster,
  ) {
  }

  get f() {
    return this.paramForm.controls;
  }

  insertarParametro(): void{
    this.funcion = 'insertar';
    this.paramForm.reset();
  }

  ngOnInit(): void {
    this.paramForm = this._formBuilder.group({
      id: [''],
      ciudad_origen: ['', [Validators.required]],
      ciudad_destino: ['', [Validators.required]],
      distancia: [0, [Validators.required]],
      tamanio: [0, [Validators.required]],
      peso: [0, [Validators.required]],
      costo: [0, [Validators.required]]
    });
    this.menu = {
      modulo: 'adm',
      seccion: 'param'
    };
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
    await this.integracionesService.obtenerListaIntegraciones(this.page - 1, this.page_size).subscribe((result) => {
      this.parametros = result.info;
      this.collectionSize = result.cont;
    });
  }

  async editarParametro(id): Promise<void> {
    this.idParametro = id;
    this.funcion = 'editar';

    await this.integracionesService.obtenerIntegracion(id).subscribe(async (result) => {
      this.paramForm.patchValue({...result});

    });
  }

  async gestionarParametro(): Promise<void> {

    if (this.paramForm.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    this.cargando = true;
    if (this.funcion === 'insertar') {

      await this.integracionesService.insertarIntegracion(this.paramForm.value).subscribe((result) => {
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
      await this.integracionesService.editarIntegracion(this.paramForm.value).subscribe((result) => {
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

  onSelectCheckPedidoOmniglobal(event: any): void{
    const inputElement = event.target as HTMLInputElement;
    this.pedidoOmniglobal = inputElement.checked ? 1 : 0;
    this.paramForm.get('pedidos_omniglobal').setValue(this.pedidoOmniglobal);

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

  onSelectCheckDespachoOmniglobal(event: any): void{
    const inputElement = event.target as HTMLInputElement;
    this.despachoOmniglobal = inputElement.checked ? 1 : 0;
    this.paramForm.get('despachos_omniglobal').setValue(this.despachoOmniglobal);

  }
}
