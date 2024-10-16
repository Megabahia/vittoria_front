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
import {GdParamService} from "../../../../services/gsb/param/param.service";

@Component({
  selector: 'app-gd-registros-asesores',
  templateUrl: './gd_registros_asesores.component.html',
  providers: [DatePipe]
})
export class GdRegistrosAsesoresComponent implements OnInit, AfterViewInit {
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
  idAsesor = '';
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
  listaBancos;
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
      id: [''],
      estado: ['Activo'],
      observaciones: ['', [Validators.required]],
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
      estado: ['Registrado'],
      state: 1
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaAsesores = info.info;
    });
  }

  async confirmarAsesor(): Promise<void> {
    if (confirm('Esta seguro de guardar los datos') === true) {

      this.asesorForm.get('id').setValue(this.idAsesor);
      this.asesorService.confirmarAsesor(this.asesorForm.value).subscribe(value => {
        this.toaster.open('Asesor confirmado.', {type: 'success'});
        this.obtenerAsesoresRegistrados();
      }, error => {
        this.toaster.open(error, {type: 'danger'});
      });
    }
  }
  abrirModalConfirmar(modal, transaccion){
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
    this.idAsesor = transaccion.id;
    this.iniciarAsesor();
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
