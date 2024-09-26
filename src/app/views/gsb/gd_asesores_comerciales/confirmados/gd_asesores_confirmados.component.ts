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

    iniciarAsesorBaco(): void {
        this.asesorBancoForm = this.formBuilder.group({
            nombre_banco: ['', [Validators.required]],
            numero_cuenta: ['', [Validators.required, Validators.maxLength(13)]],
            tipo_cuenta: ['', [Validators.required]],
            identificacion: ['', [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.cedulaValido]],
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
        }).subscribe((info) => {
            this.collectionSize = info.cont;
            this.listaAsesores = info.info.filter(asesor => asesor.estado !== 'Registrado');
            //this.listaAsesores = info.info;
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
            const asesoraFisicaValores: string[] = Object.values(this.asesorBancoForm.value);
            const asesoraFisicaLlaves: string[] = Object.keys(this.asesorBancoForm.value);
            asesoraFisicaLlaves.map((llaves, index) => {
                if (asesoraFisicaValores[index] && llaves !== 'archivoCedula') {
                    this.archivo.delete(llaves);
                    this.archivo.append(llaves, asesoraFisicaValores[index]);
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
        if (saldo < 0 && saldo) {
            this.toaster.open('Ingrese un valor mayor a 0', {type: 'warning'});
            return;
        }
        if (confirm('Esta seguro de guardar los datos') === true) {
            await this.asesorService.actualizarAsesor(id, {saldo_asesor: saldo}).subscribe((info) => {
                this.toaster.open('Saldo guardado correctamente', {type: 'success'});
                this.modalService.dismissAll();
                this.obtenerAsesoresRegistrados();
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
        this.obtenerAsesor(transaccion.id);
        this.iniciarAsesorBaco();
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
