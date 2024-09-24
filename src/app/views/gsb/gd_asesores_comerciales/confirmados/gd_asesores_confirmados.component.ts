import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';
import {ValidacionesPropias} from "../../../../utils/customer.validators";
import {SuperBaratoService} from "../../../../services/gsb/superbarato/super-barato.service";
import {AsesoresService} from "../../../../services/admin/asesores.service";

@Component({
  selector: 'app-gd-asesores-confirmados',
  templateUrl: './gd_asesores_confirmados.component.html',
  providers: [DatePipe]
})
export class GdAsesoresConfirmadosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public asesorForm: FormGroup;

  listaAsesores;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaSuperBarato;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  whatsapp = '';
  nombre = '';
  apellido = ''
  mostrarInputComprobante = false;
  mostrarCargarArchivo = false;
  mostrarInputTransaccion = false;

  mostrarInputCobro = false;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  totalIva;
  parametroIva;
  canalSeleccionado = '';
  listaCanalesProducto;
  formasPago = [];
  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  archivo: FormData = new FormData();
  invalidoTamanoVideo = false;
  mostrarSpinner = false;
  canalPrincipal = '';

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toaster: Toaster,
    private asesorService: AsesoresService,
    private paramServiceAdm: ParamServiceAdm,
  ) {

  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerAsesoresRegistrados();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
  }

  iniciarAsesor(): void {
    this.asesorForm = this.formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      estado: ['Activo'],
      fecha_nacimiento: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      pais: [this.pais, [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      whatsapp: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      gender: ['', [Validators.required]]
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerAsesoresRegistrados();
    });
  }


  get notaAsesorForm() {
    return this.asesorForm['controls'];
  }

  obtenerAsesoresRegistrados(): void {
    this.asesorService.obtenerAsesoresRegistrados({
      page: this.page - 1,
      page_size: this.pageSize,
      estado: 'Activo',
      state: 1
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaAsesores = info.info;
    });
  }

  async confirmarAsesor(asesor, estado): Promise<void> {
    this.asesorService.confirmarAsesor(asesor.id, estado).subscribe(value => {
      this.toaster.open('Asesor confirmado.', {type: 'success'});
    }, error => {
      this.toaster.open(error, {type: 'danger'});
    });
  }

  obtenerFechaActual(): Date {
    const fechaActual = new Date();
    return fechaActual;
  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }
}
