import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {AsesoresService} from "../../../../../services/admin/asesores.service";
import {GdParamService} from "../../../../../services/gsb/param/param.service";

@Component({
  selector: 'app-gd_cargar_saldo_billetera_digital',
  templateUrl: './gd_cargar_saldo_billetera_digital.component.html',
  providers: [DatePipe]
})
export class GdCargarSaldoBilleteraDigitalComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public movimientoAsesorForm: FormGroup;

  listaAsesores;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
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
  idAsesor;
  listaSaldo;
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
    private paramService: GdParamService,
  ) {
    this.paramService.obtenerListaPadresGd('SALDO INICIAL').subscribe((result) => {
      this.listaSaldo = result;
    });
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

  iniciarMovimientoAsesor(): void {
    this.movimientoAsesorForm = this.formBuilder.group({
      tipo_movimiento: ['Carga de saldo', [Validators.required]],
      saldo_ingreso: ['', [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      observaciones: ['', [Validators.required]],
      archivo_comprobante: ['', [Validators.required]],
      numero_transaccion: ['', [Validators.required]],
      asesor: [this.idAsesor, [Validators.required]],
      saldo_egreso: [0],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerAsesoresRegistrados();
    });
  }


  get notaMovimientoAsesorForm() {
    return this.movimientoAsesorForm['controls'];
  }

  obtenerAsesoresRegistrados(): void {
    this.asesorService.obtenerAsesoresRegistrados({
      page: this.page - 1,
      page_size: this.pageSize,
      estado: ['Activo'],
      state: 1
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaAsesores = info.info;
    });
  }

  abrirModalCargaSaldo(modal, transaccion) {
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
    this.idAsesor = transaccion.id;
    this.iniciarMovimientoAsesor();
  }


  obtenerFechaActual(): Date {
    const fechaActual = new Date();
    return fechaActual;
  }

  onFileSelected(event: any): void {
    this.archivo.append('archivo_comprobante', event.target.files.item(0), event.target.files.item(0).name);
    this.movimientoAsesorForm.get('archivo_comprobante').setValue(event.target.files.item(0).name);
  }

  guardarMovimientos(): Promise<void> {

    if (this.movimientoAsesorForm.invalid) {
      this.toaster.open('Revise que los campos estén completos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      const asesorFisicaValores: string[] = Object.values(this.movimientoAsesorForm.value);
      const asesorFisicaLlaves: string[] = Object.keys(this.movimientoAsesorForm.value);
      asesorFisicaLlaves.map((llaves, index) => {
        if (asesorFisicaValores[index] && llaves !== 'archivo_comprobante') {
          this.archivo.delete(llaves);
          this.archivo.append(llaves, asesorFisicaValores[index]);
        }
      });

      this.asesorService.crearMovimiento(this.archivo).subscribe((info) => {
        this.toaster.open('Datos guardados correctamente', {type: 'success'});
        this.modalService.dismissAll();
        this.obtenerAsesoresRegistrados();
      }, error => this.toaster.open(error, {type: 'danger'}));
    }
  }
}
