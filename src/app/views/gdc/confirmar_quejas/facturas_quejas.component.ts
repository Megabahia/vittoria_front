import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';

import {ContactosService} from '../../../services/gdc/contactos/contactos.service';

@Component({
  selector: 'app-facturas-quejas-gdc',
  templateUrl: './facturas_quejas.component.html',
  providers: [DatePipe]
})
export class FacturasQuejasComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public notaPedido: FormGroup;
  public facturarForm: FormGroup;
  public formaPagoForm: FormGroup;
  public negarPedidoForm: FormGroup;
  public rechazoForm: FormGroup;
  datosProducto: FormData = new FormData();

  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaContactos;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  parametroIva;
  whatsapp = '';
  correo = '';
  mostrarInputComprobante = false;
  mostrarCargarArchivo = false;
  mostrarInputTransaccion = false;
  mostrarInputCobro = false;
  fileToUpload: File | null = null;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  listaFormasPago;
  listaPedido;
  totalIva;
  infoTipoPago = '';
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
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private contactosService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private toaster: Toaster,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
    this.facturarForm = this.formBuilder.group({
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

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'IVA', 'Impuesto de Valor Agregado').subscribe((result) => {
      this.parametroIva = parseFloat(result.info[0].valor);
    });
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    this.obtenerProvincias();
    this.obtenerCiudad();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerContactos();

  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      id: ['', [Validators.required]],
      facturacion: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        identificacion: ['', []],
        tipoIdentificacion: ['', []],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: [this.pais, [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      subtotal: ['', []],
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['Contacto Local'],
      estado: ['Entregado'],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
      numeroComprobante: [''],
      tipoPago: [''],
      formaPago: [''],
      numTransaccionTransferencia: [''],
      totalCobroEfectivo: ['']
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerContactos();
    });
  }

  iniciarFormaPagoForm(): void {
    this.formaPagoForm = this.formBuilder.group({
      id: [''],
      montoSubtotalAprobadoQueja: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
    });
  }

  iniciarpedidoNegadooForm(): void {
    this.negarPedidoForm = this.formBuilder.group({
      id: ['', []],
      motivoNegacionPedido: ['', [Validators.required]],
    });
  }

  get formasPagoForm() {
    return this.formaPagoForm['controls'];
  }

  get negarForm() {
    return this.negarPedidoForm['controls'];
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
      id: [''],
      codigo: ['', [Validators.required]],
      articulo: ['', [Validators.required]],
      valorUnitario: [0, [Validators.required]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0, [Validators.required]],
      imagen: ['', []],
      caracteristicas: ['', []],
      descuento: [0, []]
    });
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  removerItem(i): void {
    this.detallesArray.removeAt(i);
    this.calcular();
  }

  obtenerContactos(): void {
    this.contactosService.obtenerListaContactos({
      telefono: this.whatsapp,
      correo: this.correo,
      page: this.page - 1,
      page_size: this.pageSize,
      estado: ['Queja'],
      canal: 'Contacto Local'
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaContactos = info.info;
      this.listaFormasPago = info.info.formaPago;
    });
  }

  obtenerContacto(modal, id): void {
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
    this.contactosService.obtenerContacto(id).subscribe((info) => {
      if (info.tipoPago === 'rimpePopular') {
        this.mostrarInputComprobante = true;
      } else if (info.tipoPago === 'facturaElectronica') {
        this.mostrarInputComprobante = false;
      } else {
        this.mostrarInputComprobante = false;
      }
      if (info.formaPago === 'transferencia') {
        this.mostrarInputTransaccion = true;
        this.mostrarCargarArchivo = true;
        this.mostrarInputCobro = false;

      } else if (info.formaPago === 'efectivo') {
        this.mostrarInputTransaccion = false;
        this.mostrarCargarArchivo = false;
        this.mostrarInputCobro = true;
      } else {
        this.mostrarInputTransaccion = false;
        this.mostrarCargarArchivo = false;
        this.mostrarInputCobro = false;
      }
      this.totalPagar = info.total;
      this.iniciarNotaPedido();
      this.horaPedido = this.extraerHora(info.created_at);

      info.articulos.map((item: any): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, verificarPedido: true});
      this.calcular();
    });
  }

  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  async obtenerProducto(i): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = {
        codigoBarras: this.detallesArray.value[i].codigo,
        canal: this.notaPedido.value.canal,
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        if (info.codigoBarras) {
          this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
          this.detallesArray.controls[i].get('id').setValue(info.id);
          this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
          this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
          const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value) || info.precioVentaA;
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
    let subtotalPedido: number;
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value || 0);
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
  }

  obtenerPedido(id): void {
    this.contactosService.obtenerContacto(id).subscribe((info) => {
      if (info.tipoPagoQueja === 'rimpePopular') {
        this.infoTipoPago = 'Rimpe popular';
      } else if (info.tipoPagoQueja === 'facturaElectronica') {
        this.infoTipoPago = 'Factura electrónica';
      }
      this.listaPedido = info;
      this.formaPagoForm.get('id').setValue(info.id);
      //this.formaPagoForm.get('montoSubtotalAprobado').setValue(info.montoSubtotalCliente);
    });
  }


  async actualizarContactoAprobado(): Promise<void> {
    if (this.formaPagoForm.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.contactosService.actualizarAprobarcionContactoQueja(this.formaPagoForm.value.id, 'Entregado', Number(this.formaPagoForm.value.montoSubtotalAprobadoQueja))
        .subscribe((info) => {
          this.toaster.open('Despacho aprobado', {type: 'success'});
          this.obtenerContactos();
          this.modalService.dismissAll();
        }, error => this.toaster.open(error, {type: 'danger'}));
      /*if (Number(this.formaPagoForm.value.montoSubtotalAprobadoQueja) > Number(this.listaPedido.subtotal)) {
        this.toaster.open('El valor no debe exceder el monto subtotal del pedido', {type: 'danger'});
        return;
      } else {

      }*/
    }
  }

  async aprobarContacto(modal, id): Promise<void> {
    this.iniciarFormaPagoForm();
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
    this.obtenerPedido(id);
  }

  async actualizarNegarContacto(): Promise<void> {
    if (this.negarPedidoForm.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.contactosService
        .actualizarNegacionContacto(this.negarPedidoForm.value.id, 'Pedido Negado', this.negarPedidoForm.value.motivoNegacionPedido)
        .subscribe((info) => {
          this.toaster.open('Despacho negado', {type: 'info'});
          this.obtenerContactos();
          this.modalService.dismissAll();

        }, error => this.toaster.open(error, {type: 'info'}));
    }
  }

  async negarContacto(modal, id): Promise<void> {
    this.iniciarpedidoNegadooForm();
    this.negarPedidoForm.get('id').setValue(id);
    this.modalService.open(modal, {size: 'sm', backdrop: 'static'});

  }

  obtenerFechaActual(): Date {
    return new Date();
  }

  formatearFecha(): string {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mes}-${anio}`;
  }

  generarID(): string {
    const numeroAleatorio = Math.floor(Math.random() * 1000000);

    return numeroAleatorio.toString().padStart(8, '0');
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

  onSelectChange(event: any): void {
    const selectedValue = event.target.value;
    this.mostrarInputComprobante = selectedValue === 'rimpePopular';
  }

  onFileSelected(event: any): void {
    this.archivo.delete('archivoFormaPago');
    this.archivo.append('archivoFormaPago', event.target.files.item(0), event.target.files.item(0).name);
    // this.fileToUpload = event.target.files.item(0);
  }


  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

  formatearFechaYAgregarDia(fechaStr: string): string {
    if (!fechaStr) {
      return '';
    }

    const fecha = new Date(fechaStr);
    fecha.setDate(fecha.getDate() + 1); // Añade un día

    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // getMonth() es 0-index
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

}
