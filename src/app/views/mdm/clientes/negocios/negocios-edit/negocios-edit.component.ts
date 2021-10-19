import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NegociosService, DatosBasicos, Personal, Direcciones, Transaccion } from '../../../../../services/mdm/personas/negocios/negocios.service';
import { DatePipe } from '@angular/common';
import { ParamService } from '../../../../../services/mdm/param/param.service';
import { ParamService as ParamServiceADM } from '../../../../../services/admin/param.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-negocios-edit',
  templateUrl: './negocios-edit.component.html',
  providers: [DatePipe]
})
export class NegociosEditComponent implements OnInit {
  @Input() idNegocio;
  @ViewChild(NgbPagination) paginatorPE: NgbPagination;
  @ViewChild(NgbPagination) paginatorDE: NgbPagination;
  @ViewChild('tab1') tab1;
  @ViewChild('tab2') tab2;
  @ViewChild('tab3') tab3;

  //forms
  datosBasicosForm: FormGroup;
  datosPersonalForm: FormGroup;
  datosFisicosForm: FormGroup;
  //------------------------
  //subbmiteds
  submittedDatosBasicosForm = false;
  submittedDatosVirtualesForm = false;
  submittedDatosFisicosForm = false;
  //------------------------
  //Mensaje
  mensaje = "";
  //-------------

  public barChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1
  };
  public barChartLabels: Label[] = [

  ];
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
  }

  pageDE = 1;
  pageSizeDE = 10;
  collectionSizeDE;
  pagePE = 1;
  pageSizePE = 10;
  collectionSizePE;
  pageTA = 1;
  pageSizeTA = 10;
  collectionSizeTA;

  fechaInicioTransac = new Date();
  fechaFinTransac = new Date();

  datosBasicos: DatosBasicos;
  datosPersonal: Personal;
  datosDirecciones: Direcciones;

  listaPersonal;
  listaDirecciones;
  listaTransacciones;

  tipoNegocioOpciones;
  nacionalidadOpciones;
  paisesOpciones;
  provinciasResidenciaOpciones;
  ciudadesResidenciaOpciones;
  segmentoActividadEconomicaOpciones;
  actividadEconomicaOpciones;
  profesionOpciones;
  llevarContabilidadOpciones;

  tipoContactoOpciones;

  tipoDireccionOpciones;
  provinciasDireccionOpciones;
  ciudadesDireccionOpciones;

  fechaActual = new Date();

  transaccion: Transaccion;

  estadoOpcion;
  urlImagen;
  constructor(
    private datePipe: DatePipe,
    private negociosService: NegociosService,
    private paramService: ParamService,
    private globalParam: ParamServiceADM,
    private _formBuilder: FormBuilder,

  ) {
    this.datosBasicos = negociosService.inicializarDatosBasicos();
    this.datosPersonal = negociosService.inicializarPersonal();
    this.datosDirecciones = negociosService.inicializarDireccion();
    this.datosPersonal.negocio = this.idNegocio;
    this.datosDirecciones.negocio = this.idNegocio;
    this.fechaInicioTransac.setMonth(this.fechaInicioTransac.getMonth() - 3);
    this.transaccion = this.negociosService.inicializarTransaccion();
  }

  //gets
  get dbForm() {
    return this.datosBasicosForm.controls;
  }
  get dpForm() {
    return this.datosPersonalForm.controls;
  }
  get dfForm() {
    return this.datosFisicosForm.controls;
  }
  //------------------

  ngOnInit(): void {

    this.datosBasicosForm = this._formBuilder.group({
      tipoNegocio: ['', [Validators.required]],
      ruc: ['', [Validators.required]],
      razonSocial: ['', [Validators.required]],
      nombreComercial: ['', [Validators.required]],
      nacionalidad: ['', [Validators.required]],
      fechaCreacionNegocio: ['', [Validators.required]],
      edadNegocio: ['', [Validators.required]],
      paisOrigen: ['', [Validators.required]],
      paisResidencia: ['', [Validators.required]],
      provinciaResidencia: ['', [Validators.required]],
      ciudadResidencia: ['', [Validators.required]],
      numeroEmpleados: [0, [Validators.required]],
      segmentoActividadEconomica: ['', [Validators.required]],
      profesion: ['', [Validators.required]],
      actividadEconomica: ['', [Validators.required]],
      llevarContabilidad: ['', [Validators.required]],
      ingresosPromedioMensual: ['', [Validators.required]],
      gastosPromedioMensual: ['', [Validators.required]],
      numeroEstablecimientos: [0, [Validators.required]],
      telefonoOficina: ['', [Validators.required]],
      celularOficina: ['', [Validators.required]],
      celularPersonal: ['', [Validators.required]],
      whatsappPersonal: ['', [Validators.required]],
      whatsappSecundario: ['', [Validators.required]],
      correoPersonal: ['', [Validators.required]],
      correoOficina: ['', [Validators.required]],
      googlePlus: ['', [Validators.required]],
      twitter: ['', [Validators.required]],
      facebook: ['', [Validators.required]],
      instagram: ['', [Validators.required]]
    });


    this.barChartData = [this.datosTransferencias];
    this.barChartLabels = [
    ]
    this.obtenerActividadEconomicaOpciones();
    this.obtenerNacionalidadOpciones();
    this.obtenerPaisOpciones();
    this.obtenerProfesionOpciones();
    this.obtenerSegmentoActividadEconomicaOpciones();
    this.obtenerTipoContactoNegocioOpciones();
    this.obtenerTipoNegocioOpciones();
    this.obtenerTipoDireccionOpciones();
    if (this.idNegocio == 0) {
      this.datosBasicos.created_at = this.transformarFecha(this.fechaActual);
    } else {
      this.obtenerDatosBasicos();
      this.obtenerPersonalEmpresa();
      this.obtenerDireccionesEmpresa();
      this.obtenerTransacciones();
    }
  }
  async ngAfterViewInit() {
    this.iniciarPaginador();
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  async iniciarPaginador() {
    this.paginatorDE.pageChange.subscribe(() => {
      this.obtenerDireccionesEmpresa();
    });
    this.paginatorPE.pageChange.subscribe(() => {
      this.obtenerPersonalEmpresa();
    });
  }
  async obtenerDatosBasicos() {
    this.negociosService.obtenerNegocio(this.idNegocio).subscribe((info) => {
      this.datosBasicos = info;
      this.estadoOpcion = info.estado == 'Activo' ? 1 : 0;
      this.urlImagen = info.imagen;
      this.datosBasicos.estado = info.estado;
      this.datosBasicos.created_at = this.transformarFecha(info.created_at);
      this.datosBasicos.fechaCreacionNegocio = this.transformarFecha(info.fechaCreacionNegocio);
      this.obtenerProvinciasResidencia();
      this.obtenerCiudadResidencia();
    });
  }
  async guardarImagen(event) {
    let nuevaImagen = event.target.files[0];
    let imagen = new FormData();
    imagen.append('imagen', nuevaImagen, nuevaImagen.name);
    if (this.idNegocio != 0) {
      this.negociosService.editarImagen(this.idNegocio, imagen).subscribe((info) => {
        this.urlImagen = info.imagen;
      });
    }
  }

  obtenerPersonalEmpresa() {
    this.negociosService.obtenerPersonal(this.idNegocio, {
      page: this.pagePE - 1,
      page_size: this.pageSizePE
    }).subscribe((info) => {
      this.listaPersonal = info.info;
      this.collectionSizePE = info.cont;
    });
  }
  obtenerDireccionesEmpresa() {
    this.negociosService.obtenerDireccion(this.idNegocio, {
      page: this.pageDE - 1,
      page_size: this.pageSizeDE
    }).subscribe((info) => {
      this.listaDirecciones = info.info;
      this.collectionSizeDE = info.cont;
    });
  }
  async guardarDatosBasicos() {
    this.submittedDatosBasicosForm = true;

    if (this.datosBasicosForm.invalid) {
      return;
    }
    if (this.idNegocio != 0) {
      this.negociosService.editarDatosBasicos(this.idNegocio, this.datosBasicos).subscribe((info) => {
      });
    } else {
      this.negociosService.crearDatosBasicos(this.datosBasicos).subscribe((info) => {
        this.idNegocio = info.id;
        this.datosPersonal.negocio = this.idNegocio;
        this.datosDirecciones.negocio = this.idNegocio;
      });
    }
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  async obtenerTipoNegocioOpciones() {
    await this.paramService.obtenerListaPadres("TIPO_NEGOCIO").subscribe((info) => {
      this.tipoNegocioOpciones = info;
    });
  }
  async obtenerNacionalidadOpciones() {
    await this.paramService.obtenerListaPadres("NACIONALIDAD").subscribe((info) => {
      this.nacionalidadOpciones = info;
    });
  }
  async obtenerPaisOpciones() {
    await this.paramService.obtenerListaPadres("PAIS").subscribe((info) => {
      this.paisesOpciones = info;
    });
  }
  async obtenerProvinciasResidencia() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.paisResidencia, "PAIS").subscribe((info) => {
      this.provinciasResidenciaOpciones = info;
    });
  }
  async obtenerCiudadResidencia() {
    await this.paramService.obtenerListaHijos(this.datosBasicos.provinciaResidencia, "PROVINCIA").subscribe((info) => {
      this.ciudadesResidenciaOpciones = info;
    });
  }
  async obtenerSegmentoActividadEconomicaOpciones() {
    await this.paramService.obtenerListaPadres("SEGMENTO_ACTIVIDAD_ECONOMICA").subscribe((info) => {
      this.segmentoActividadEconomicaOpciones = info;
    });
  }
  async obtenerProfesionOpciones() {
    await this.paramService.obtenerListaPadres("PROFESION").subscribe((info) => {
      this.profesionOpciones = info;
    });
  }
  async obtenerActividadEconomicaOpciones() {
    await this.paramService.obtenerListaPadres("ACTIVIDAD_ECONOMICA").subscribe((info) => {
      this.actividadEconomicaOpciones = info;
    });
  }
  async obtenerTipoContactoNegocioOpciones() {
    await this.paramService.obtenerListaPadres("TIPO_CONTACTO_NEGOCIO").subscribe((info) => {
      this.tipoContactoOpciones = info;
    });
  }
  async obtenerTipoDireccionOpciones() {
    await this.paramService.obtenerListaPadres("TIPO_DIRECCION").subscribe((info) => {
      this.tipoDireccionOpciones = info;
    });
  }
  async obtenerProvinciasDirecciones() {
    await this.paramService.obtenerListaHijos(this.datosDirecciones.pais, "PAIS").subscribe((info) => {
      this.provinciasDireccionOpciones = info;
    });
  }
  async obtenerCiudadDirecciones() {
    await this.paramService.obtenerListaHijos(this.datosDirecciones.provincia, "PROVINCIA").subscribe((info) => {
      this.ciudadesDireccionOpciones = info;
    });
  }
  async calcularEdadNegocio() {
    this.datosBasicos.edadNegocio = moment().diff(this.datosBasicos.fechaCreacionNegocio, 'years');
  }
  async cambiarEstado() {
    this.datosBasicos.estado = this.estadoOpcion == 1 ? 'Activo' : 'Inactivo'
  }
  crearPersonal() {
    this.datosPersonal = this.negociosService.inicializarPersonal();
    this.datosPersonal.created_at = this.transformarFecha(this.fechaActual);
    this.datosPersonal.negocio = this.idNegocio;
  }
  async editarPersonal(id) {
    await this.negociosService.obtenerUnPersonal(id).subscribe((info) => {
      this.datosPersonal = info;
    });
  }
  async eliminarPersonal(id) {
    await this.negociosService.eliminarPersonal(id).subscribe(() => {
      this.obtenerPersonalEmpresa();
    });
  }

  async guardarPersonal() {
    console.log(this.datosPersonal);
    if (this.datosPersonal.id == 0) {
      await this.negociosService.crearPersonal(this.datosPersonal).subscribe((info) => {
        this.obtenerPersonalEmpresa();
      });
    } else {
      await this.negociosService.editarPersonal(this.datosPersonal).subscribe((info) => {
        this.obtenerPersonalEmpresa();
      });
    }
  }
  crearDireccion() {
    this.datosDirecciones = this.negociosService.inicializarDireccion();
    this.datosDirecciones.created_at = this.transformarFecha(this.fechaActual);
    this.datosDirecciones.negocio = this.idNegocio;
  }
  async editarDireccion(id) {
    await this.negociosService.obtenerUnaDireccion(id).subscribe((info) => {
      this.datosDirecciones = info;
      this.datosDirecciones.created_at = this.transformarFecha(info.created_at);
      this.obtenerProvinciasDirecciones();
      this.obtenerCiudadDirecciones();
    });
  }
  async eliminarDireccion(id) {
    await this.negociosService.eliminarDireccion(id).subscribe(() => {
      this.obtenerDireccionesEmpresa();
    });
  }

  async guardarDireccion() {
    if (this.datosDirecciones.id == 0) {
      await this.negociosService.crearDireccion(this.datosDirecciones).subscribe((info) => {
        this.obtenerDireccionesEmpresa();
      });
    } else {
      await this.negociosService.editarDireccion(this.datosDirecciones).subscribe((info) => {
        this.obtenerDireccionesEmpresa();
      });
    }
  }

  obtenerTransacciones() {
    this.negociosService.obtenerTransaccionesNegocios(this.idNegocio,
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
    this.negociosService.obtenerGraficaTransaccionesNegocios(this.idNegocio, {
      page: this.pageTA - 1,
      page_size: this.pageSizeTA,
      inicio: this.fechaInicioTransac,
      fin: this.fechaFinTransac
    }
    ).subscribe((info) => {
      let etiquetas = [];
      let valores = [];

      info.map((datos) => {
        etiquetas.push(datos.anio + "-" + datos.mes);
        valores.push(datos.cantidad);
      });
      this.datosTransferencias = {
        data: valores, label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
      }
      this.barChartData = [this.datosTransferencias];
      this.barChartLabels = etiquetas;
    });
  }
  async obtenerTransaccion(id) {
    this.negociosService.obtenerTransaccion(id).subscribe((info) => {
      this.transaccion = info;
      this.transaccion.created_at = this.transformarFecha(info.created_at);
    });
  }
}
