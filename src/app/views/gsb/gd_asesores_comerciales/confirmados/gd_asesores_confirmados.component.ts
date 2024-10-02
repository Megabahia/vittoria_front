import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {ValidacionesPropias} from '../../../../utils/customer.validators';
import {AsesoresService} from '../../../../services/admin/asesores.service';
import {GdParamService} from "../../../../services/gsb/param/param.service";

@Component({
  selector: 'app-gd-asesores-confirmados',
  templateUrl: './gd_asesores_confirmados.component.html',
  providers: [DatePipe]
})
export class GdAsesoresConfirmadosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public asesorBancoForm: FormGroup;

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
  apellido = '';
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
  saldoInicial;

  listaCostoInicial;
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
  listaTipoCuenta;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private toaster: Toaster,
    private asesorService: AsesoresService,
    private paramServiceAdm: ParamServiceAdm,
    private paramService: GdParamService,
  ) {
    this.paramService.obtenerListaPadresGd('BANCO').subscribe((result) => {
      this.listaBancos = result;
    });
    this.paramService.obtenerListaPadresGd('TIPO CUENTA').subscribe((result) => {
      this.listaTipoCuenta = result;
    });
    this.paramService.obtenerListaPadresGd('SALDO INICIAL').subscribe((result) => {
      this.listaCostoInicial = result;
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

  iniciarAsesorBaco(): void {
    this.asesorBancoForm = this.formBuilder.group({
      nombre_banco: ['', [Validators.required]],
      numero_cuenta: ['', [Validators.required, Validators.maxLength(13)]],
      tipo_cuenta: ['', [Validators.required]],
      tipoIdentificacion: ['', [Validators.required]],
      identificacion: ['', []],
      archivoCedula: ['', [Validators.required]],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerAsesoresRegistrados();
    });
  }


  get notaAsesorBancoForm() {
    return this.asesorBancoForm['controls'];
  }

  obtenerAsesoresRegistrados(): void {
    this.asesorService.obtenerAsesoresRegistrados({
      page: this.page - 1,
      page_size: this.pageSize,
      estado: ['Activo', 'Inactivo']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      //this.listaAsesores = info.info.filter(asesor => asesor.estado !== 'Registrado');
      this.listaAsesores = info.info;
    });
  }

  obtenerAsesor(id): void {
    this.asesorService.obtenerAsesor(id).subscribe(info => {
      this.asesorBancoForm.patchValue({...info});
    }, error => this.toaster.open(error, {type: 'danger'}));
  }

  async activarDesactivarAsesor(accion, asesor, estado): Promise<void> {
    if (confirm('Esta seguro de guardar los datos') === true) {

      if (accion === 'activar') {
        await this.asesorService.activarDesactivarAsesor(asesor.id, estado, 1).subscribe(value => {
          this.toaster.open('Asesor Activo.', {type: 'success'});
          this.obtenerAsesoresRegistrados();
        }, error => {
          this.toaster.open(error, {type: 'danger'});
        });
      } else {
        await this.asesorService.activarDesactivarAsesor(asesor.id, estado, 0).subscribe(value => {
          this.toaster.open('Asesor Inactivo.', {type: 'success'});
          this.obtenerAsesoresRegistrados();
        }, error => {
          this.toaster.open(error, {type: 'danger'});
        });
      }
    }
  }

  async actualizar(): Promise<void> {
    if (this.asesorBancoForm.invalid) {
      this.toaster.open('Revise que los campos estén completos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      const asesorFisicaValores: string[] = Object.values(this.asesorBancoForm.value);
      const asesorFisicaLlaves: string[] = Object.keys(this.asesorBancoForm.value);
      asesorFisicaLlaves.map((llaves, index) => {
        if (asesorFisicaValores[index] && llaves !== 'archivoCedula') {
          this.archivo.delete(llaves);
          this.archivo.append(llaves, asesorFisicaValores[index]);
        }
      });

      this.archivo.append('id', this.idAsesor);

      await this.asesorService.actualizarAsesorFormData(this.archivo).subscribe((info) => {
        this.toaster.open('Datos guardados correctamente', {type: 'success'});
        this.modalService.dismissAll();
        this.obtenerAsesoresRegistrados();
      }, error => this.toaster.open(error, {type: 'danger'}));

    }
  }

  async actualizarSaldoAsesor(id, saldo) {
    if (saldo === '' || !saldo) {
      this.toaster.open('Seleccione un saldo inicial válido', {type: 'warning'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      await this.asesorService.actualizarAsesor(id, {saldo_asesor: parseFloat(saldo)}).subscribe((info) => {
        this.toaster.open('Saldo guardado correctamente', {type: 'success'});
        this.modalService.dismissAll();
        this.obtenerAsesoresRegistrados();
      }, error => this.toaster.open(error, {type: 'danger'}));
    }
  }

  guardarMovimientos(id, saldo): Promise<void> {

    this.saldoInicial = saldo;

    if (this.saldoInicial === '' || !this.saldoInicial) {
      this.toaster.open('Seleccione un saldo inicial válido', {type: 'warning'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.asesorService.crearMovimiento({
        tipo_movimiento: 'Saldo incial',
        saldo_ingreso: parseFloat(this.saldoInicial),
        created_at: this.obtenerFechaActual(),
        observaciones: '',
        asesor: id,
        saldo_egreso: 0,
        saldo_total: parseFloat(this.saldoInicial)
      }).subscribe((info) => {
        this.toaster.open('Datos guardados correctamente', {type: 'success'});
      }, error => this.toaster.open(error, {type: 'danger'}));
    }
  }

  onFileSelected(event: any): void {
    this.archivo.append('archivoCedula', event.target.files.item(0), event.target.files.item(0).name);
    this.asesorBancoForm.get('archivoCedula').setValue(event.target.files.item(0).name);
  }

  abrirModalCuentaBancaria(modal, transaccion) {
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
    this.idAsesor = transaccion.id;

    if (transaccion.nombre_banco) {
      this.obtenerAsesor(transaccion.id);
    }
    this.iniciarAsesorBaco();
  }

  onSelectChangeIdentificacion(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'Cedula') {
      this.asesorBancoForm.get('identificacion').setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.cedulaValido]
      );
      this.asesorBancoForm.get('identificacion').updateValueAndValidity();
    } else if (selectedValue === 'RUC') {
      this.asesorBancoForm.get('identificacion').setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.rucValido]
      );
      this.asesorBancoForm.get('identificacion').updateValueAndValidity();
    } else {
      this.asesorBancoForm.get('identificacion').setValidators(
        [Validators.required, Validators.minLength(5)]
      );
      this.asesorBancoForm.get('identificacion').updateValueAndValidity();
    }
  }

  obtenerFechaActual(): Date {
    const fechaActual = new Date();
    return fechaActual;
  }

}
