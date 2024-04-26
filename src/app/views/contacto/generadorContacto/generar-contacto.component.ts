import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {Toaster} from 'ngx-toast-notifications';
import { v4 as uuidv4 } from 'uuid';
import {ClientesService} from "../../../services/mdm/personas/clientes/clientes.service";
import {ProspectosService} from "../../../services/mdm/prospectosCli/prospectos.service";

@Component({
  selector: 'app-generar-contacto',
  templateUrl: './generar-contacto.component.html',
  providers: [DatePipe]
})
export class GenerarContactoComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public notaPedido: FormGroup;
  public autorizarForm: FormGroup;
  public rechazoForm: FormGroup;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaTransacciones;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais= 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;

  listaProspectos;
  clientes;
  cliente;
  cedula

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

  constructor(
    private prospectosService: ProspectosService,

    private clientesService: ClientesService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private toaster: Toaster,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
    this.autorizarForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      metodoConfirmacion: ['', [Validators.required]],
      codigoConfirmacion: ['', [Validators.required]],
      fechaHoraConfirmacion: ['', [Validators.required]],
      tipoFacturacion: ['', [Validators.required]],
    });
    this.rechazoForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      motivo: ['', [Validators.required]],
      estado: ['Rechazado', [Validators.required]],
      fechaPedido: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    this.obtenerProspectos()
    this.obtenerListaClientes()
    this.obtenerProvincias();
    this.obtenerCiudad();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerTransacciones();

  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      id: ['', [Validators.required]],
      facturacion: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        identificacion: [''],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: [this.pais, [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        //callePrincipal: ['', [Validators.required]],
        //numero: ['', [Validators.required]],
        //calleSecundaria: ['', [Validators.required]],
        //referencia: ['', [Validators.required]],
        //gps: ['', []],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['Contacto Local', []],
      estado: ['Pendiente', []],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerTransacciones();
    });
  }

  get autorizarFForm() {
    return this.autorizarForm['controls'];
  }

  get rechazarFForm() {
    return this.rechazoForm['controls'];
  }

  get notaPedidoForm() {
    return this.notaPedido['controls'];
  }

  get facturacionForm() {
    return this.notaPedido.get('facturacion')['controls'];
  }

  get envioForm() {
    return this.notaPedido.get('envio')['controls'];
  }

  get detallesArray(): FormArray {
    return this.notaPedido.get('articulos') as FormArray;
  }

  crearDetalleGrupo(): any {
    return this.formBuilder.group({
      codigo: ['', [Validators.required]],
      articulo: ['', [Validators.required]],
      valorUnitario: [0, [Validators.required]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0, [Validators.required]],
      imagen: ['', []],
      caracteristicas: ['', []],
    });
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  removerItem(i): void {
    this.detallesArray.removeAt(i);
    this.calcular();
  }

  obtenerTransacciones(): void {
    this.pedidosService.obtenerListaPedidos({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.transformarFecha(this.fin),
      estado: ['Pendiente'],
      canal: 'Contacto Local'
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerTransaccion(modal, id): void {
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.iniciarNotaPedido();
      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, verificarPedido: true});

    });
  }

  crearNuevoPedidoContacto(modal): void {
    this.iniciarNotaPedido();
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});

  }


  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  async guardarPedidoPorContacto(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.pedidosService.crearNuevoPedidoContacto(this.notaPedido.value).subscribe((info) => {

        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  async obtenerProducto(i): Promise<void> {
    return new Promise((resolve, reject) => {
      let data= {
        codigoBarras: this.detallesArray.value[i].codigo,
        canal:this.notaPedido.value.canal,
        valorUnitario:this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        //if(info.mensaje==''){
          if (info.codigoBarras) {
            this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
            this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
            this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
            const precioProducto = this.notaPedido.get('canal').value
              .includes('Contra-Entrega') ? info.precioLandingOferta : info.precioVentaA;
            this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
            this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
            this.detallesArray.controls[i].get('imagen').setValue(info?.imagen);
            this.detallesArray.controls[i].get('cantidad').setValidators([
              Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info?.stock)
            ]);
            this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
            this.calcular();
            resolve();
          } else {
            this.detallesArray.controls[i].get('articulo').setValue('');
            this.toaster.open('Producto no existente, agregue un producto que se encuentre en la lista de productos.', {type: 'danger'});
            reject(new Error('No existe el producto a buscar')); // Rechaza la promesa si no se encuentra el producto
          }// Resuelve la promesa una vez completadas todas las asignaciones
        /*}else{
          this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
          window.alert('Existen inconsistencias con los precios de los productos.');
        }*/
      });
    });
  }

  calcular(): void {
    const detalles = this.detallesArray.controls;
    let total = 0;
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value || 0);
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    this.notaPedido.get('total').setValue(total);
  }

  async actualizar(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.pedidosService.actualizarPedido(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }


  procesarAutorizacion(): void {
    if (this.autorizarForm.invalid || this.invalidoTamanoVideo) {
      this.toaster.open('Campos vacios', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de cambiar de estado') === true) {
      const facturaFisicaValores: string[] = Object.values(this.autorizarForm.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.autorizarForm.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'archivoMetodoPago') {
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.mostrarSpinner = true;
      this.pedidosService.actualizarPedidoFormData(this.archivo).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
        this.mostrarSpinner = false;
      }, (data) => {
        this.toaster.open(data, {type: 'danger'});
        this.mostrarSpinner = false;
      });
    }
  }

  cargarArchivo(event, nombreCampo): void {
    const doc = event.target.files[0];
    this.invalidoTamanoVideo = false;
    if (10485760 < doc.size) {
      this.invalidoTamanoVideo = true;
      this.toaster.open('Archivo pesado', {type: 'warning'});
      return;
    }
    const x = document.getElementById(nombreCampo + 'lbl');
    x.innerHTML = '' + Date.now() + '_' + doc.name;
    this.archivo.delete(nombreCampo);
    this.archivo.append(nombreCampo, doc);
  }

  obtenerFechaActual(): Date {
    //const fecha= new Date();
    //const dia= fecha.getDate().toString().padStart(2, '0');
    //const mes= (fecha.getMonth() + 1).toString().padStart(2, '0');
    //const anio= fecha.getFullYear().toString();
    const fechaActual = new Date();

    return fechaActual;

  }

  formatearFecha(): string {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mes}-${anio}`;
  }

  generarID(): string {
    return uuidv4();
  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.notaPedido.value.facturacion.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  async obtenerListaClientes() {
    this.clientesService.obtenerListaClientes(
      {
        nombreCompleto: this.cliente,
        cedula: this.cedula,
        inicio: this.inicio,
        fin: this.fin,
        page: this.page - 1,
        page_size: this.pageSize
      }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.clientes = info.info;
      console.log('CLIENTES', this.clientes)
    });
  }

  async obtenerProspectos() {
    await this.prospectosService.obtenerFiltro('CONFIRMACION_PROSPECTO').subscribe((info) => {
      this.listaProspectos = info;
      console.log('CLIENTESProspecto', this.listaProspectos)

    });
  }
}
