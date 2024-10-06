import {DatePipe} from '@angular/common';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
  ClientesService,
  DatosBasicos,
  DatosFisicos,
  DatosVirtuales,
  Transaccion,
  Pariente
} from '../../../../../services/mdm/personas/clientes/clientes.service';
import {ParamService} from '../../../../../services/mdm/param/param.service';
import {ParamService as ParamServiceADM} from '../../../../../services/admin/param.service';
import * as moment from 'moment';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ChartOptions, ChartType, ChartDataSets} from 'chart.js';
import {Label, Color} from 'ng2-charts';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProspectosService} from '../../../../../services/mdm/prospectosCli/prospectos.service';
import {ValidacionesPropias} from '../../../../../utils/customer.validators';
import { Location } from '@angular/common';

@Component({
  selector: 'app-personas-edit',
  templateUrl: './personas-edit.component.html',
  providers: [DatePipe]
})
export class PersonasEditComponent implements OnInit {
  @Input() idCliente;
  @Input() idProspecto;
  @ViewChild(NgbPagination) paginatorDF: NgbPagination;
  @ViewChild(NgbPagination) paginatorDV: NgbPagination;
  @ViewChild(NgbPagination) paginatorTA: NgbPagination;
  @ViewChild(NgbPagination) paginatorPA: NgbPagination;
  @ViewChild('tab1') tab1;
  @ViewChild('tab2') tab2;
  @ViewChild('tab3') tab3;
  @ViewChild('tab4') tab4;
  // Modals
  @ViewChild('dismissModalDV') dismissModalDV;
  @ViewChild('dismissModalDF') dismissModalDF;
  @ViewChild('mensajeModal') mensajeModal;
  @ViewChild('eliminarDatosVirtMdl') eliminarDatosVirtMdl;
  @ViewChild('eliminarDatosFisiMdl') eliminarDatosFisiMdl;
  @ViewChild('eliminarParienteMdl') eliminarParienteMdl;
  // ------------------------------------
  basicDemoValue = '2017-01-01';
  tabs = 0;
  // forms
  datosBasicosForm: FormGroup;
  datosVirtualesForm: FormGroup;
  datosFisicosForm: FormGroup;
  // ------------------------
  // subbmiteds
  submittedDatosBasicosForm = false;
  submittedDatosVirtualesForm = false;
  submittedDatosFisicosForm = false;
  // ------------------------
  // Mensaje
  mensaje = '';
  // -------------
  // ids Datos
  idDatoVirtual = 0;
  idDatoFisico = 0;
  // ---------------
  numRegex = /^-?\d*[.,]?\d{0,2}$/;

  public barChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'line';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] =
    [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)',
  };
  fechaInicioTransac = new Date();
  fechaFinTransac = new Date();
  pageDF = 1;
  pageSizeDF = 3;
  collectionSizeDF;
  pageDV = 1;
  pageSizeDV = 3;
  collectionSizeDV;
  pageTA = 1;
  pageSizeTA = 3;
  collectionSizeTA;
  pagePA = 1;
  pageSizePA = 3;
  collectionSizePA;
  datosBasicos: DatosBasicos = {
    tipoCliente: '',
    created_at: '',
    cedula: '',
    telefono: '',
    nombres: '',
    apellidos: '',
    genero: '',
    correo: '',
    nacionalidad: '',
    fechaNacimiento: '',
    edad: 0,
    paisNacimiento: '',
    provinciaNacimiento: '',
    ciudadNacimiento: '',
    estadoCivil: '',
    paisResidencia: '',
    provinciaResidencia: '',
    ciudadResidencia: '',
    nivelEstudios: '',
    profesion: '',
    provinciaTrabajo: '',
    ciudadTrabajo: '',
    paisTrabajo: '',
    lugarTrabajo: '',
    ubicacionTrabajo: '',
    mesesUltimoTrabajo: 0,
    mesesTotalTrabajo: 0,
    ingresosPromedioMensual: 0,
    gastosPromedioMensual: 0,
    estado: 0,
    tipoIdentificacion: '',
    callePrincipal: '',
    numero: '',
    calleSecundaria: '',
    referencia: '',
    gps: '',
  };

  datosFisicos: DatosFisicos = {
    id: 0,
    created_at: '',
    tipoDireccion: '',
    pais: '',
    provincia: '',
    ciudad: '',
    callePrincipal: '',
    numero: '',
    calleSecundaria: '',
    edificio: '',
    piso: '',
    oficina: '',
    referencia: '',
    cliente: ''
  };
  datosVirtuales: DatosVirtuales = {
    id: 0,
    tipoContacto: '',
    icono: '',
    informacion: '',
    created_at: '',
    cliente: 0
  };
  transaccion: Transaccion;
  pariente: Pariente;
  // LISTAS DE DATOS
  listaDatosFisicos;
  listaDatosVirtuales;
  listaTransacciones;
  listaParientes;
  // OPCIONES DE DROPDOWNLIST
  estadoOpcion;
  generoOpciones;
  tipoClientesOpciones;
  nacionalidadOpciones;
  paisesOpciones;
  provinciasOpciones;
  provinciaNacimientoOpciones;
  ciudadNacimientoOpciones;
  provinciaResidenciaOpciones;
  ciudadResidenciaOpciones;
  nivelEstudiosOpciones;
  profesionOpciones;
  estadoCivilOpciones;
  provinciaTrabajoOpciones;
  ciudadTrabajoOpciones;
  tipoDireccionOpciones;
  provinciaDatosFisicosOpciones;
  ciudadDatosFisicosOpciones;
  tipoContactoOpciones;
  iconosDatosVirtualOpciones;
  fechaActual = new Date();
  parientesForm;
  parientesVista = 'lista';
  idPariente = 0;
  urlImagen;

  constructor(
    private datePipe: DatePipe,
    private clientesService: ClientesService,
    private prospectosService: ProspectosService,
    private paramService: ParamService,
    private globalParam: ParamServiceADM,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private location: Location,
  ) {
    this.datosFisicos.cliente = this.idCliente;
    this.datosVirtuales.cliente = this.idCliente;
    this.pariente = this.clientesService.inicializarPariente();
    this.fechaInicioTransac.setMonth(this.fechaInicioTransac.getMonth() - 3);
    this.transaccion = this.clientesService.inicializarTransaccion();
  }

  recargarPagina(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.barChartData = [this.datosTransferencias];
    this.barChartLabels = [];

    this.obtenerGeneroOpciones();
    this.obtenerTipoClientesOpciones();
    this.obtenerNacionalidadOpciones();
    this.obtenerPaisOpciones();
    this.obtenerNivelEstudiosOpciones();
    this.obtenerNivelProfesionOpciones();
    this.obtenerEstadoCivilOpciones();
    this.obtenerTipoDireccion();
    this.obtenerTiposContacto();
    this.obtenerIconosDatosVirtuales();
    if (this.idProspecto) {
      this.prospectosService.obtenerProspecto(this.idProspecto).subscribe((info) => {
        this.datosBasicos.apellidos = info.apellidos;
        this.datosBasicos.correo = info.correo1;
        this.datosBasicos.nombres = info.nombres;
        this.datosBasicos.cedula = info.identificacion;
        this.datosBasicos.telefono = info.telefono;
        this.datosBasicos.tipoCliente = info.tipoCliente;
        this.datosBasicos.created_at = this.transformarFecha(this.fechaActual);

        // apellidos: "Álvarez "
        // canal: "Facebook"
        // ciudad: "Ibarra"
        // codigoProducto: "ADB-001"
        // confirmacionProspecto: "En espera"
        // correo1: "alejandroalvara@gmail.com"
        // correo2: "alejandro2@gmail.com"
        // created_at: "2021-05-20T18:15:09.224530-05:00"
        // facebook: "https://www.facebook.com/"
        // identificacion: "1001001001"
        // imagen: "https://vittoria.s3.amazonaws.com/MDM/prospectosClientes/imgProspectosClientes/120_15912219730543.png"
        // instagram: "https://www.instagram.com/?hl=es-la"
        // nombreCompleto: "Alejandro Paúl Álvarez"
        // nombreProducto: "Camiseta XL"
        // nombreVendedor: "Álvaro Cedeño"
        // nombres: "Alejandro Paúl"
        // precio: 12
        // state: 1
        // telefono: "98565213121"
        // tipoCliente: "Cliente por mayor"
        // tipoPrecio: "Efectivo"
        // twitter: "https://twitter.com/?lang=es"
        // updated_at: "2021-10-19T09:10:12.993076-05:00"
        // whatsapp: "984564"
      });
    } else {
      if (this.idCliente === 0) {
        this.datosBasicos.created_at = this.transformarFecha(this.fechaActual);
      } else {
        this.obtenerDatosBasicos();
        this.obtenerDatosFisicos();
        this.obtenerDatosVirtuales();
        this.obtenerTransacciones();
        this.obtenerParientes();
      }
    }

    this.datosBasicosForm = this._formBuilder.group({
      tipoCliente: ['', []],
      created_at: ['', [Validators.required]],
      cedula: ['', [
        Validators.required, Validators.pattern('^[0-9]*$'),
        Validators.minLength(10), Validators.maxLength(10),
        ValidacionesPropias.cedulaValido
      ]],
      telefono: ['', [
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10), Validators.maxLength(10)
      ]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      genero: ['', []],
      correo: ['', [Validators.required, Validators.email]],
      nacionalidad: ['', []],
      fechaNacimiento: ['', []],
      edad: [0, []],
      paisNacimiento: ['', [Validators.required]],
      provinciaNacimiento: ['', [Validators.required]],
      ciudadNacimiento: ['', [Validators.required]],
      estadoCivil: ['', []],
      paisResidencia: ['', []],
      provinciaResidencia: ['', []],
      ciudadResidencia: ['', []],
      nivelEstudios: ['', []],
      profesion: ['', []],
      provinciaTrabajo: ['', []],
      ciudadTrabajo: ['', []],
      paisTrabajo: ['', []],
      lugarTrabajo: ['', []],
      mesesUltimoTrabajo: ['', [Validators.pattern('^[0-9]*$')]],
      mesesTotalTrabajo: ['', [Validators.pattern('^[0-9]*$')]],
      ingresosPromedioMensual: ['', [Validators.pattern(this.numRegex)]],
      gastosPromedioMensual: ['', [Validators.pattern(this.numRegex)]],
      tipoIdentificacion: ['', []],
    });
    this.datosVirtualesForm = this._formBuilder.group({
      tipoContacto: ['', [Validators.required]],
      icono: ['', [Validators.required]],
      informacion: ['', [Validators.required]],
    });
    this.datosFisicosForm = this._formBuilder.group({
      tipoDireccion: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      callePrincipal: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      calleSecundaria: ['', [Validators.required]],
      edificio: ['', [Validators.required]],
      piso: ['', [Validators.required]],
      oficina: ['', [Validators.required]],
      referencia: ['', [Validators.required]]
    });
  }

  async ngAfterViewInit() {
    this.iniciarPaginador();
  }

  async iniciarPaginador() {
    this.paginatorDF.pageChange.subscribe(() => {
      this.obtenerDatosFisicos();
    });
    this.paginatorDV.pageChange.subscribe(() => {
      this.obtenerDatosVirtuales();
    });
    this.paginatorPA.pageChange.subscribe(() => {
      this.obtenerParientes();
    });
    this.paginatorTA.pageChange.subscribe(() => {
      this.obtenerTransacciones();
    });

  }

  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }

  async obtenerDatosBasicos() {
    this.clientesService.obtenerCliente(this.idCliente).subscribe((info) => {
      this.datosBasicos = info;
      console.log('datos basicos', info);
      this.estadoOpcion = info.estado === 'Activo' ? 1 : 0;
      this.urlImagen = info.imagen;
      this.datosBasicos.estado = info.estado;
      this.datosBasicos.created_at = this.transformarFecha(info.created_at);
      this.datosBasicos.fechaNacimiento = this.transformarFecha(info.fechaNacimiento);
      this.obtenerProvinciasNacimiento();
      this.obtenerCiudadNacimiento();
      this.obtenerProvinciasResidencia();
      this.obtenerCiudadResidencia();
      this.obtenerProvinciasTrabajo();
      this.obtenerCiudadTrabajo();
    });
  }

  async obtenerDatosFisicos() {
    this.clientesService.obtenerDatosFisicos(this.idCliente, {
      page: this.pageDF - 1,
      page_size: this.pageSizeDF
    }).subscribe((info) => {
      this.collectionSizeDF = info.cont;
      this.listaDatosFisicos = info.info;
    });
  }

  async obtenerDatosVirtuales() {
    this.clientesService.obtenerDatosVirtuales(this.idCliente, {
      page: this.pageDV - 1,
      page_size: this.pageSizeDV
    }).subscribe((info) => {
      this.collectionSizeDV = info.cont;
      this.listaDatosVirtuales = info.info;
    });
  }

  async obtenerGeneroOpciones() {
    await this.paramService.obtenerListaPadres('GENERO').subscribe((info) => {
      this.generoOpciones = info;
    });
  }

  async obtenerTipoClientesOpciones() {
    await this.paramService.obtenerListaPadres('TIPO_CLIENTE').subscribe((info) => {
      this.tipoClientesOpciones = info;
    });
  }

  async obtenerNacionalidadOpciones() {
    await this.paramService.obtenerListaPadres('NACIONALIDAD').subscribe((info) => {
      this.nacionalidadOpciones = info;
    });
  }

  async obtenerPaisOpciones() {
    await this.paramService.obtenerListaPadres('PAIS').subscribe((info) => {
      this.paisesOpciones = info;
    });
  }

  async obtenerNivelEstudiosOpciones() {
    await this.paramService.obtenerListaPadres('NIVEL_ESTUDIOS').subscribe((info) => {
      this.nivelEstudiosOpciones = info;
    });
  }

  async obtenerNivelProfesionOpciones() {
    await this.paramService.obtenerListaPadres('PROFESION').subscribe((info) => {
      this.profesionOpciones = info;
    });
  }

  async obtenerEstadoCivilOpciones() {
    await this.paramService.obtenerListaPadres('ESTADO_CIVIL').subscribe((info) => {
      this.estadoCivilOpciones = info;
    });
  }

  async obtenerProvinciasNacimiento() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.paisNacimiento, 'PAIS').subscribe((info) => {
      this.provinciaNacimientoOpciones = info;
    });
  }

  async obtenerCiudadNacimiento() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.provinciaNacimiento, 'PROVINCIA').subscribe((info) => {
      this.ciudadNacimientoOpciones = info;
    });
  }

  async obtenerProvinciasResidencia() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.paisResidencia, 'PAIS').subscribe((info) => {
      this.provinciaResidenciaOpciones = info;
    });
  }

  async obtenerCiudadResidencia() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.provinciaResidencia, 'PROVINCIA').subscribe((info) => {
      this.ciudadResidenciaOpciones = info;
    });
  }

  async obtenerProvinciasTrabajo() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.paisTrabajo, 'PAIS').subscribe((info) => {
      this.provinciaTrabajoOpciones = info;
    });
  }

  async obtenerCiudadTrabajo() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.provinciaTrabajo, 'PROVINCIA').subscribe((info) => {
      this.ciudadTrabajoOpciones = info;
    });
  }

  async obtenerTipoDireccion() {
    await this.paramService.obtenerListaPadres('TIPO_DIRECCION').subscribe((info) => {
      this.tipoDireccionOpciones = info;
    });
  }

  async obtenerProvinciasDatosFisicos() {
    await this.paramService.obtenerListaHijos(this.datosFisicos.pais, 'PAIS').subscribe((info) => {
      this.provinciaDatosFisicosOpciones = info;
    });
  }

  async obtenerCiudadDatosFisicos() {
    await this.paramService.obtenerListaHijos(this.datosFisicos.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadDatosFisicosOpciones = info;
    });
  }

  async calcularEdad() {
    this.datosBasicos.edad = moment().diff(this.datosBasicos.fechaNacimiento, 'years');
  }

  async cambiarEstado() {
    this.datosBasicos.estado = this.estadoOpcion === 1 ? 'Activo' : 'Inactivo';
  }

  //gets
  get fdb() {
    return this.datosBasicosForm.controls;
  }

  get dvForm() {
    return this.datosVirtualesForm.controls;
  }

  get dfForm() {
    return this.datosFisicosForm.controls;
  }

  // ------------------
  guardarDatosBasicos(): void {

    this.submittedDatosBasicosForm = true;
    if (this.datosBasicosForm.invalid) {
      return;
    }

    if (this.idCliente !== 0) {
      this.clientesService.editarDatosBasicos(this.idCliente, this.datosBasicos).subscribe((info) => {
          this.tab2.nativeElement.click();
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.mensajeModal);
        }
      );
    } else {
      this.clientesService.crearDatosBasicos(this.datosBasicos).subscribe((info) => {
          this.idCliente = info.id;
          this.datosFisicos.cliente = this.idCliente;
          this.datosVirtuales.cliente = this.idCliente;
          this.tab2.nativeElement.click();
          if (this.idProspecto) {
            this.obtenerDatosVirtuales();

          }
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.mensajeModal);
        });
    }
  }

  cambiarTab(numero) {
    switch (numero) {
      case 1:
        this.tab1.nativeElement.click();
        break;
      case 2:
        this.tab2.nativeElement.click();
        break;
      case 3:
        this.tab3.nativeElement.click();
        break;
      case 4:
        this.tab4.nativeElement.click();
        break;
    }
  }

  async guardarImagen(event) {

    if (this.idCliente !== 0) {
      let nuevaImagen = event.target.files[0];
      let imagen = new FormData();
      imagen.append('imagen', nuevaImagen, nuevaImagen.name);
      this.clientesService.editarImagen(this.idCliente, imagen).subscribe((info) => {
        this.urlImagen = info.imagen;
      });
    } else {
      this.mensaje = 'Es necesario que primero ingrese sus datos básicos';
      this.abrirModal(this.mensajeModal);
    }
  }

  async editarDatoFisico(id) {
    this.clientesService.obtenerDatoFisico(id).subscribe((info) => {
      this.datosFisicos = info;
      this.datosFisicos.created_at = this.transformarFecha(info.created_at);
      this.obtenerProvinciasDatosFisicos();
      this.obtenerCiudadDatosFisicos();
    });
  }

  async crearDatoFisico() {
    this.datosFisicos = {
      id: 0,
      created_at: this.transformarFecha(this.fechaActual),
      tipoDireccion: '',
      pais: '',
      provincia: '',
      ciudad: '',
      callePrincipal: '',
      numero: '',
      calleSecundaria: '',
      edificio: '',
      piso: '',
      oficina: '',
      referencia: '',
      cliente: this.idCliente
    };
  }

  transformarFecha(fecha) {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  async guardarDatosFisicos() {
    this.submittedDatosFisicosForm = true;
    if (this.datosFisicosForm.invalid) {
      return;
    }
    if (this.idCliente !== 0) {
      if (this.datosFisicos.id === 0) {
        this.clientesService.crearDatosFisicos(this.datosFisicos).subscribe((info) => {
            this.obtenerDatosFisicos();
            this.dismissModalDF.nativeElement.click();
          },
          (error) => {
            let errores = Object.values(error);
            let llaves = Object.keys(error);
            this.mensaje = '';
            errores.map((infoErrores, index) => {
              this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
            });
            this.abrirModal(this.mensajeModal);
          });
      } else {
        this.clientesService.editarDatosFisicos(this.datosFisicos).subscribe((info) => {
            this.obtenerDatosFisicos();
            this.dismissModalDF.nativeElement.click();
          },
          (error) => {
            let errores = Object.values(error);
            let llaves = Object.keys(error);
            this.mensaje = '';
            errores.map((infoErrores, index) => {
              this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
            });
            this.abrirModal(this.mensajeModal);
          });
      }
    } else {
      this.mensaje = 'Es necesario que primero ingrese sus datos básicos';
      this.abrirModal(this.mensajeModal);
    }
  }

  async eliminarDatoFisicoModal(id) {
    this.idDatoFisico = id;
    this.abrirModal(this.eliminarDatosFisiMdl);
  }

  eliminarDatoFisico() {
    this.clientesService.eliminarDatosFisicos(this.idDatoFisico).subscribe((info) => {
      this.obtenerDatosFisicos();
      this.cerrarModal();
    });
  }

  async crearDatoVirtual() {
    this.datosVirtuales = {
      id: 0,
      tipoContacto: '',
      icono: '',
      informacion: '',
      created_at: this.transformarFecha(this.fechaActual),
      cliente: this.idCliente
    };
  }

  async obtenerTiposContacto() {
    await this.paramService.obtenerListaPadres('TIPO_CONTACTO').subscribe((info) => {
      this.tipoContactoOpciones = info;
    });
  }

  async obtenerIconosDatosVirtuales() {
    await this.paramService.obtenerListaPadres('ICONO_DATOS_VIRTUALES').subscribe((info) => {
      this.iconosDatosVirtualOpciones = info;
    });
  }

  async editarDatoVirtual(id) {
    this.clientesService.obtenerDatoVirtual(id).subscribe((info) => {
      this.datosVirtuales = info;
      this.datosVirtuales.created_at = this.transformarFecha(info.created_at);
      this.obtenerProvinciasDatosFisicos();
      this.obtenerCiudadDatosFisicos();
    });
  }

  async guardarDatosVirtuales() {
    this.submittedDatosVirtualesForm = true;
    if (this.datosVirtualesForm.invalid) {
      return;
    }
    if (this.idCliente !== 0) {
      if (this.datosVirtuales.id === 0) {
        this.clientesService.crearDatosVirtuales(this.datosVirtuales).subscribe((info) => {
            this.obtenerDatosVirtuales();
            this.dismissModalDV.nativeElement.click();
          },
          (error) => {
            let errores = Object.values(error);
            let llaves = Object.keys(error);
            this.mensaje = '';
            errores.map((infoErrores, index) => {
              this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
            });
            this.abrirModal(this.mensajeModal);
          });
      } else {
        this.clientesService.editarDatosVirtuales(this.datosVirtuales).subscribe((info) => {
            this.obtenerDatosVirtuales();
            this.dismissModalDV.nativeElement.click();
          },
          (error) => {
            let errores = Object.values(error);
            let llaves = Object.keys(error);
            this.mensaje = '';
            errores.map((infoErrores, index) => {
              this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
            });
            this.abrirModal(this.mensajeModal);
          });
      }
    } else {
      this.mensaje = 'Es necesario que primero ingrese sus datos básicos';
      this.abrirModal(this.mensajeModal);
    }

  }

  async eliminarDatoVirtualModal(id) {
    this.idDatoVirtual = id;
    this.abrirModal(this.eliminarDatosVirtMdl);
  }

  async eliminarDatoVirtual() {
    this.clientesService.eliminarDatosVirtuales(this.idDatoVirtual).subscribe((info) => {
      this.obtenerDatosVirtuales();
      this.cerrarModal();
    });
  }

  // async obtenerTransacciones(){
  //   this.clientesService.obtenerTransacciones({
  //     cliente:this.idCliente,
  //     page:this.pageTA-1,
  //     page_size:this.pageSizeTA
  //   }).subscribe((info)=>{
  //     this.collectionSizeTA= info.cont;
  //     this.listaTransacciones=info.info;
  //   });
  // }
  async obtenerTransaccion(id) {
    this.clientesService.obtenerTransaccion(id).subscribe((info) => {
      this.transaccion = info;
      this.transaccion.created_at = this.transformarFecha(info.created_at);
    });
  }

  async obtenerTransacciones() {
    this.clientesService.obtenerTransaccionesCliente(this.idCliente,
      {
        page: this.pageTA - 1,
        page_size: this.pageSizeTA,
        inicio: this.fechaInicioTransac,
        fin: this.fechaFinTransac
      }).subscribe((info) => {
      this.collectionSizeTA = info.cont;
      this.listaTransacciones = info.info;
      this.obtenerGraficos();
    });
  }

  async obtenerGraficos() {
    this.clientesService.obtenerGraficaTransaccionesCliente(this.idCliente, {
        page: this.pageTA - 1,
        page_size: this.pageSizeTA,
        inicio: this.fechaInicioTransac,
        fin: this.fechaFinTransac
      }
    ).subscribe((info) => {
      let etiquetas = [];
      let valores = [];

      info.map((datos) => {
        etiquetas.push(datos.anio + '-' + datos.mes);
        valores.push(datos.cantidad);
      });
      this.datosTransferencias = {
        data: valores, label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
      };
      this.barChartData = [this.datosTransferencias];
      this.barChartLabels = etiquetas;
    });
  }

  crearPariente() {
    if (this.idCliente !== 0) {
      this.idPariente = 0;
      this.parientesVista = 'editar';
    } else {
      this.mensaje = 'Es necesario que primero ingrese sus datos básicos';
      this.abrirModal(this.mensajeModal);
    }

  }

  volver() {
    this.parientesVista = 'lista';
    this.obtenerParientes();
  }

  async obtenerParientes() {
    this.clientesService.obtenerParientes(this.idCliente, {
      page: this.pagePA - 1,
      page_size: this.pageSizePA,
    }).subscribe((info) => {
      this.collectionSizePA = info.cont;
      this.listaParientes = info.info;
    });
  }

  editarPariente(id) {
    if (this.idCliente !== 0) {
      this.idPariente = id;
      this.parientesVista = 'editar';
    }
  }

  async eliminarParienteModal(id) {
    this.idPariente = id;
    this.abrirModal(this.eliminarParienteMdl);
  }

  async eliminarPariente() {
    this.clientesService.eliminarPariente(this.idPariente).subscribe((info) => {
      this.obtenerParientes();
      this.cerrarModal();
    });
  }

  abrirModal(modal) {
    this.modalService.open(modal);
  }

  cerrarModal() {
    this.modalService.dismissAll();
  }
}
