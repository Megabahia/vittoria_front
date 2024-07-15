import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Toaster} from 'ngx-toast-notifications';
import {IntegracionesEnviosService} from "../../../services/admin/integraciones_envios.service";

@Component({
  selector: 'app-integracion-envio-woocommerce',
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

  // @ViewChild('padres') padres;
  constructor(
    private integracionesEnviosService: IntegracionesEnviosService,
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
    await this.integracionesEnviosService.obtenerListaIntegracionesEnvios(this.page - 1, this.page_size).subscribe((result) => {
      this.parametros = result.info;
      this.collectionSize = result.cont;
    });
  }

  async editarParametro(id): Promise<void> {
    this.idParametro = id;
    this.funcion = 'editar';

    await this.integracionesEnviosService.obtenerIntegracionEnvio(id).subscribe(async (result) => {
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

      await this.integracionesEnviosService.insertarIntegracionEnvio(this.paramForm.value).subscribe((result) => {
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
      await this.integracionesEnviosService.editarIntegracionEnvio(this.paramForm.value).subscribe((result) => {
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
      await this.integracionesEnviosService.eliminarIntegracionEnvio(this.idParametro).subscribe((result) => {
        this.obtenerListaParametros();
      });
    }
    this.funcion = '';
  }

  abrirModalMensaje(modal): void {
    this.modalService.open(modal);
  }

  calcularEnvio(){
    const costoEnvio = parseFloat(this.paramForm.get('distancia').value)
      * parseFloat(this.paramForm.get('tamanio').value)
      * parseFloat(this.paramForm.get('peso').value);
    this.paramForm.get('costo').setValue(costoEnvio.toFixed(2));
  }
}
