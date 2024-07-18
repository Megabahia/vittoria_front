import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Toaster} from 'ngx-toast-notifications';
import {IntegracionesEnviosService} from '../../../services/admin/integraciones_envios.service';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';
import {UsersService} from '../../../services/admin/users.service';

@Component({
  selector: 'app-integracion-envio-woocommerce',
  templateUrl: './integracion-envio.component.html',
  styleUrls: ['./integracion-envio.component.css'],
  providers: [UsersService]
})

export class IntegracionEnvioComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;

  formasDePago = [
    {nombre: 'Efectivo', estado: false, valor: 0},
    {nombre: 'Transferencia', estado: false, valor: 0},
    {nombre: 'Contra Entrega', estado: false, valor: 0}
  ];

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

  pais = 'Ecuador';
  ciudadOpciones;
  ciudadDestinoOpciones;
  provinciaOpciones;
  provinciaDestinoOpciones;
  provincia = '';
  sectorOpciones;
  sectorDestinoOpciones;

  horas: any[] = [];

  public couriers = [];


  // @ViewChild('padres') padres;
  constructor(
    private integracionesEnviosService: IntegracionesEnviosService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private toaster: Toaster,
    private paramServiceAdm: ParamServiceAdm,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
  ) {
    this.generarHoras();

  }

  get f() {
    return this.paramForm.controls;
  }

  insertarParametro(): void {
    this.funcion = 'insertar';
    this.paramForm.reset();
    this.iniciarParamForm();
    this.paramForm.get('pais').setValue(this.pais);
  }

  iniciarParamForm(): void {
    this.paramForm = this._formBuilder.group({
      id: [''],
      costo: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      distancia: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      // MIGRACION
      pais: [this.pais, [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      sector: ['', [Validators.required]],
      provinciaDestino: ['', [Validators.required]],
      ciudadDestino: ['', [Validators.required]],
      sectorDestino: ['', [Validators.required]],
      courier: ['', [Validators.required]],
      formaPago: this.formBuilder.array([
        this.formBuilder.group({
          nombre: ['Efectivo'],
          estado: [false],
          valor: [0]
        }),
        this.formBuilder.group({
          nombre: ['Transferencia'],
          estado: [false],
          valor: [0]
        }),
        this.formBuilder.group({
          nombre: ['Contra Entrega'],
          estado: [false],
          valor: [0]
        }),
      ], Validators.required),
      tamanio_inicial: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      tamanio_fin: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      peso_inicial: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      peso_fin: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      tiempo_entrega: ['', [Validators.required]],
      latitud: [''],
      longitud: [''],
      latitudDestino: [''],
      longitudDestino: [''],
      nombreCuenta: [''],
      numeroCuenta: ['']
    });
  }

  ngOnInit(): void {
    this.iniciarParamForm();

    this.menu = {
      modulo: 'adm',
      seccion: 'param'
    };
    this.obtenerCouriers(this.paramForm.value.pais, this.paramForm.value.provincia, this.paramForm.value.ciudad);
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

  get detallesArrayFormaPago(): FormArray {
    return this.paramForm.get('formaPago') as FormArray;
  }

  crearDetalleGrupoFormaPago(): any {
    return this.formBuilder.group({
      nombre: [''],
      estad: [''],
      valor: [0]
    });
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
      console.log('resutl', result);
      await this.paramForm.patchValue({...result});
      this.paramForm.get('pais').setValue(this.pais);
      await this.obtenerCiudad();
      await this.obtenerCiudadDestino();
      await this.obtenerSector();
      await this.obtenerSectorDestino();
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

  /*calcularEnvio(){
    const costoEnvio = parseFloat(this.paramForm.get('distancia').value)
      * parseFloat(this.paramForm.get('tamanio').value)
      * parseFloat(this.paramForm.get('peso').value);
    this.paramForm.get('costo').setValue(costoEnvio.toFixed(2));
  }*/

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
      this.provinciaDestinoOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerCiudadDestino(): void {
    this.paramServiceAdm.obtenerListaHijos(this.paramForm.value.provinciaDestino, 'PROVINCIA').subscribe((info) => {
      this.ciudadDestinoOpciones = info;
    });
  }

  obtenerSector(): void {
    this.paramServiceAdm.obtenerListaHijos(this.paramForm.value.ciudad, 'CIUDAD').subscribe((info) => {
      this.sectorOpciones = info;
    });
  }

  obtenerSectorDestino(): void {
    this.paramServiceAdm.obtenerListaHijos(this.paramForm.value.ciudadDestino, 'CIUDAD').subscribe((info) => {
      this.sectorDestinoOpciones = info;
    });
  }

  generarHoras(): void {
    for (let i = 1; i <= 100; i++) {
      this.horas.push({label: i, value: i});
    }
  }

  obtenerCouriers(pais, provincia, ciudad): void {
    this.usersService.obtenerListaUsuarios({
      page: 0, page_size: 10, idRol: 50, estado: 'Activo', pais, provincia, ciudad
    }).subscribe((info) => {
      this.couriers = info.info;
    });
  }

  onChangeCheckPago(nombre: string): void {
    const formaPagoArray = this.paramForm.get('formaPago') as FormArray;

    const pagoIndex = formaPagoArray.controls.findIndex(
      pago => pago.get('nombre').value === nombre
    );
    console.log(formaPagoArray.controls[pagoIndex].value.estado);
    /*if (pagoIndex) {
      // Toggle the estado value
      const estadoActual = pagoIndex.get('estado').value;
      pagoIndex.get('estado').setValue(!estadoActual);
      console.log(`Estado de ${pagoIndex.get('nombre').value}: ${pagoIndex.get('estado').value}`);
    }*/
  }
}
