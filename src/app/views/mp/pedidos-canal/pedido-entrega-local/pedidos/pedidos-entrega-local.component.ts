import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';
import {ContactosService} from '../../../../../services/gdc/contactos/contactos.service';
import {ValidacionesPropias} from "../../../../../utils/customer.validators";
import {IntegracionesService} from "../../../../../services/admin/integraciones.service";

@Component({
  selector: 'app-contacto',
  templateUrl: './pedidos-entrega-local.component.html',
  styleUrls: ['pedidos-entrega-local.component.css'],
  providers: [DatePipe]
})
export class PedidosEntregaLocalComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public notaPedido: FormGroup;
  public facturarForm: FormGroup;
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
  verificarContacto = false;
  whatsapp = '';
  nombre = '';
  apellido = ''
  numPedido = ''
  mostrarInputComprobante = false;
  mostrarCargarArchivo = false;
  mostrarInputTransaccion = false;
  mostrarCargarArchivoCredito = false;
  mostrarInputTransaccionCredito = false;
  mostrarInputCobro = false;
  fileToUpload: File | null = null;
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
  selectFormaPago;
  formasPago = [];
  totalFormaPago = 0;
  canal = '';
  canalOpciones;
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
    private contactosService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private toaster: Toaster,
    private integracionesService: IntegracionesService,

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
    this.obtenerListaParametrosCanal();
    /*this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', '').subscribe((result) => {
      this.canalOpciones = result.data;
    });*/

  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    //this.obtenerProvincias();
    //this.obtenerCiudad();
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
        tipoIdentificacion: ['', [Validators.required]],
        identificacion: ['', []],
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
      subtotal: [0],
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: [''],
      estado: ['Entregado'],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
      numeroComprobante: [''],
      tipoPago: [''],
      formaPago: [''],
      numTransaccionTransferencia: [''],
      numTransaccionCredito: [''],
      totalCobroEfectivo: [0],
      montoTransferencia: [0],
      montoCredito: [0],
      comision: [0]
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerContactos();
    });
  }

  get autorizarFForm() {
    return this.facturarForm['controls'];
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
      id: [''],
      codigo: ['', [Validators.required]],
      articulo: ['', [Validators.required]],
      valorUnitario: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0, [Validators.required]],
      descuento: [0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern('^[0-9]*$')]],
      imagen: ['', []],
      caracteristicas: ['', []],
      precios: [[], []],
      canal: [''],
      woocommerceId: [''],
      imagen_principal: ['', [Validators.required]],
      porcentaje_comision: [0],
      valor_comision: [0],
      monto_comision: [0]
    });
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  removerItem(i): void {
    this.detallesArray.removeAt(i);
    this.calcular();
  }

  obtenerListaParametrosCanal() {
    const datos = {
      page: this.page,
      page_size: this.pageSize
    };
    this.integracionesService.obtenerListaIntegraciones(datos).subscribe((result) => {
      this.canalOpciones = result.data;
    });
  }

  obtenerContactos(): void {
    this.contactosService.obtenerListaContactos({
      page: this.page - 1,
      page_size: this.pageSize,
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
      estado: ['Pendiente de retiro'],
      canalProducto: this.canal,
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaContactos = info.info;
    });
  }

  obtenerContacto(modal, id): void {
    this.totalFormaPago = 0;
    this.obtenerProvincias();
    this.obtenerListaProductos();
    this.modalService.open(modal, {size: 'xl', backdrop: 'static'});
    this.contactosService.obtenerContacto(id).subscribe((info) => {
      /*if (info.tipoPago === 'rimpePopular') {
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
      } else {*/
      this.mostrarInputComprobante = false;
      this.mostrarInputTransaccion = false;
      this.mostrarCargarArchivo = false;
      this.mostrarInputCobro = false;
      this.mostrarCargarArchivoCredito = false;
      this.mostrarInputTransaccionCredito = false;
      this.formasPago = [];
      //}

      this.provincia = info.facturacion.provincia;
      this.obtenerCiudad();

      this.totalPagar = info.total;
      this.iniciarNotaPedido();
      this.horaPedido = this.extraerHora(info.created_at);

      this.canalPrincipal = info.articulos[0].canal;
      this.canalSeleccionado = this.canalPrincipal;

      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, verificarPedido: true});
      if (modal._declarationTContainer.localNames[0] === 'facturacionModal') {
        this.notaPedido.get('formaPago').setValidators([Validators.required]);
        this.notaPedido.get('formaPago').updateValueAndValidity();
        this.notaPedido.get('tipoPago').setValidators([Validators.required]);
        this.notaPedido.get('tipoPago').updateValueAndValidity();
      }
      this.calcular();
    });
  }

  crearNuevoContacto(modal): void {
    this.iniciarNotaPedido();
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }


  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  obtenerListaProductos(): void {
    this.productosService.obtenerListaProductos(
      {
        page: this.page - 1,
        page_size: this.pageSize,
        nombre: '',
        codigoBarras: '',
      }
    ).subscribe((info) => {
      this.listaCanalesProducto = info.canal
    });
  }

  async obtenerProducto(i): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = {
        codigoBarras: this.detallesArray.value[i].codigo,
        canalProducto: this.canalSeleccionado,
        canal: this.notaPedido.value.canal,
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        //if(info.mensaje==''){
        if (info.codigoBarras) {
          this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
          this.detallesArray.controls[i].get('id').setValue(info.id);
          this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
          this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
          this.detallesArray.controls[i].get('precios').setValue([...this.extraerPrecios(info)]);
          const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value);
          this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
          this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
          this.detallesArray.controls[i].get('imagen').setValue(info?.imagen);
          this.detallesArray.controls[i].get('imagen_principal').setValue(info?.imagen_principal);
          this.detallesArray.controls[i].get('canal').setValue(info.canal)
          this.detallesArray.controls[i].get('woocommerceId').setValue(info.woocommerceId)
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
      }, error => this.toaster.open(error, {type: 'danger'}));
    });
  }

  calcular(): void {
    const detalles = this.detallesArray.controls;
    let total = 0;
    let comisionTotal = 0;
    let comision = 0;
    let subtotalPedido = 0;
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value || 0);
      // tslint:disable-next-line:radix
      const descuento = parseInt(detalles[index].get('descuento').value);
      if (descuento > 0 && descuento <= 100) {
        const totalDescuento = (valorUnitario * descuento) / 100;
        detalles[index].get('precio').setValue((((valorUnitario - totalDescuento) * cantidad)).toFixed(2));
      } else {
        detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      }

      //COMISION
      if (!detalles[index].get('valor_comision').value) {
        comision = (detalles[index].get('porcentaje_comision').value * detalles[index].get('precio').value) / 100;
      } else {
        comision = detalles[index].get('valor_comision').value * cantidad;
      }
      detalles[index].get('monto_comision').setValue((comision).toFixed(2));
      comisionTotal += parseFloat(detalles[index].get('monto_comision').value);

      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
    this.notaPedido.get('comision').setValue(comisionTotal.toFixed(2));

  }


  async actualizar(): Promise<void> {
    /*await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));*/
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.mostrarSpinner = true;

      const facturaFisicaValores: string[] = Object.values(this.notaPedido.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.notaPedido.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'archivoMetodoPago' && llaves !== 'facturacion' && llaves !== 'articulos' && llaves !== 'envio') {
          this.archivo.delete(llaves);
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.archivo.append('estado', 'Entregado');
      this.archivo.append('formaPago', JSON.stringify(this.formasPago));
      if (this.mostrarInputCobro || this.mostrarInputTransaccion || this.mostrarInputTransaccionCredito) {
        if (Number(this.totalPagar) !== Number(this.totalFormaPago)) {

          this.toaster.open('El precio total ingresado no coincide', {type: 'danger'});
          this.mostrarSpinner = false;

        } else {
          this.contactosService.actualizarVentaFormData(this.archivo).subscribe((info) => {
            this.modalService.dismissAll();
            this.obtenerContactos();
            this.verificarContacto = true;
            this.mostrarSpinner = false;

          }, error => {
            this.mostrarSpinner = false;
            this.toaster.open(error, {type: 'danger'})
          });
        }
      } else {
        this.contactosService.actualizarVentaFormData(this.archivo).subscribe((info) => {
          this.modalService.dismissAll();
          this.obtenerContactos();
          this.verificarContacto = true;
          this.mostrarSpinner = false;

        }, error => {
          this.mostrarSpinner = false;

          this.toaster.open(error, {type: 'danger'})
        })
      }

    }
  }

  calcularTotalFormaPago() {
    this.totalFormaPago = parseFloat(this.notaPedido.value.totalCobroEfectivo || 0) + parseFloat(this.notaPedido.value.montoCredito || 0) + parseFloat(this.notaPedido.value.montoTransferencia || 0);
  }


  async actualizarContacto(): Promise<void> {
    //await Promise.all(this.detallesArray.controls.map((producto, index) => {
    //   return this.obtenerProducto(index);
    //}));
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.mostrarSpinner = true;

      this.contactosService.actualizarContacto(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerContactos();
        this.verificarContacto = true;
        this.mostrarSpinner = false;

      }, error => {
        this.mostrarSpinner = false;
        this.toaster.open(error, {type: 'danger'})
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
    const numeroAleatorio = Math.floor(Math.random() * 1000000);

    return numeroAleatorio.toString().padStart(8, '0');
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

  validarDatos(): void {
    this.contactosService.validarCamposContacto(this.notaPedido.value).subscribe((info) => {
    }, error => this.toaster.open(error, {type: 'danger'}));
  }

  onSelectChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'rimpePopular' || selectedValue === 'facturaElectronicaMegaBahia') {
      this.mostrarInputComprobante = true;
    } else {
      this.mostrarInputComprobante = false;
    }
  }

  onSelectChangeIdentificacion(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'cedula') {
      this.notaPedido.get('facturacion')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.cedulaValido]
      );
      this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    } else if (selectedValue === 'ruc') {
      this.notaPedido.get('facturacion')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.rucValido]
      )
      this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    } else {
      this.notaPedido.get('facturacion')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.minLength(5)]
      )
      this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    }
  }

  agregarFormaPago(): void {

    if (!this.formasPago.includes(this.selectFormaPago)) {
      this.formasPago.push(this.selectFormaPago);
    }

    switch (this.selectFormaPago) {
      case 'transferencia':
        this.mostrarInputTransaccion = true;
        this.mostrarCargarArchivo = true;
        //this.notaPedido.get('archivoFormaPago').setValidators([Validators.required]);
        //this.notaPedido.get('archivoFormaPago').updateValueAndValidity();
        this.notaPedido.get('numTransaccionTransferencia').setValidators([Validators.required]);
        this.notaPedido.get('numTransaccionTransferencia').updateValueAndValidity();
        this.notaPedido.get('montoTransferencia').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]);
        this.notaPedido.get('montoTransferencia').updateValueAndValidity();
        //this.mostrarInputCobro = false;
        break;
      case 'efectivo':
        //this.mostrarInputTransaccion = false;
        //this.mostrarCargarArchivo = false;
        this.mostrarInputCobro = true;
        this.notaPedido.get('totalCobroEfectivo').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]);
        this.notaPedido.get('totalCobroEfectivo').updateValueAndValidity();

        break;
      case 'tarjeta_credito':
        this.mostrarInputTransaccionCredito = true;
        this.mostrarCargarArchivoCredito = true;
        //this.notaPedido.get('archivoFormaPagoCredito').setValidators([Validators.required]);
        //this.notaPedido.get('archivoFormaPagoCredito').updateValueAndValidity();
        this.notaPedido.get('numTransaccionCredito').setValidators([Validators.required]);
        this.notaPedido.get('numTransaccionCredito').updateValueAndValidity();
        this.notaPedido.get('montoCredito').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]);
        this.notaPedido.get('montoCredito').updateValueAndValidity();
        //this.mostrarInputCobro = false;
        break;
      default:
        console.log('Seleccione una forma de pago válida');
    }
  }

  onSelectChangeFormaPago(event: any) {
    this.selectFormaPago = event.target.value;
  }

  onFileSelected(event: any): void {
    if (this.mostrarCargarArchivo) {
      this.archivo.append('archivoFormaPago', event.target.files.item(0), event.target.files.item(0).name);
    } else {
      this.archivo.delete('archivoFormaPago');
    }
  }

  onFileSelectedTarjeta(event: any): void {
    if (this.mostrarCargarArchivoCredito) {
      this.archivo.append('archivoFormaPagoCredito', event.target.files.item(0), event.target.files.item(0).name);
    } else {
      this.archivo.delete('archivoFormaPagoCredito');
    }
  }

  guardarComprobanteTransferencia(): void {
    if (this.archivo) {
      const formData = new FormData();
      formData.append('archivoFormaPago', this.fileToUpload, this.fileToUpload.name);
    }
  }

  cargarImagen(i, event: any): void {
    this.datosProducto = new FormData();

    const id = this.detallesArray.controls[i].get('id').value;
    const archivo = event.target.files[0];
    if (archivo) {
      // Verificar el tamaño del archivo (5MB = 5 * 1024 * 1024 bytes)
      const MAX_SIZE = 5 * 1024 * 1024;

      if (archivo.size > MAX_SIZE) {
        this.toaster.open('La imagen no puede ser mayor a 5MB.', {type: "danger"});
        return;  // Detener el proceso si el archivo es demasiado grande
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const nuevaImagen = e.target.result;
          this.detallesArray.controls[i].get('imagen_principal').setValue(nuevaImagen);
          this.datosProducto.append('imagen_principal', archivo)
          //this.datosProducto.append('imagenes[' + 0 + ']id', '0');
          //this.datosProducto.append('imagenes[' + 0 + ']imagen', archivo);
          this.datosProducto.append('codigoBarras', this.detallesArray.controls[i].get('codigo').value);
          this.datosProducto.append('canal', this.detallesArray.controls[i].get('canal').value);
          try {
            this.productosService.actualizarProducto(this.datosProducto, id).subscribe((producto) => {
              this.toaster.open('Imagen actualizada con éxito', {type: 'info'});
            }, error => this.toaster.open('Error al actualizar la imagen.', {type: 'danger'}));
          } catch (error) {
            this.toaster.open('Error al actualizar la imagen.', {type: 'danger'});
          }
        };
        reader.readAsDataURL(archivo);
      }
    }
  }

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

  extraerPrecios(info: any) {
    const precios = [];
    Object.keys(info).forEach(clave => {
      if (clave.startsWith('precioVenta')) {
        precios.push({clave: clave, valor: info[clave]});
      }
    });
    return precios;
  }

  quitarPagoTransferencia() {
    this.eliminarDatoArregloFormaPago('transferencia');
    this.archivo.delete('archivoFormaPago');
    this.notaPedido.get('numTransaccionTransferencia').setValue('');
    this.notaPedido.get('montoTransferencia').setValue(0);
    this.notaPedido.get('numTransaccionTransferencia').setValidators([]);
    this.notaPedido.get('numTransaccionTransferencia').updateValueAndValidity();
    this.notaPedido.get('montoTransferencia').setValidators([]);
    this.notaPedido.get('montoTransferencia').setValue(0);
    this.notaPedido.get('montoTransferencia').updateValueAndValidity();
    this.calcularTotalFormaPago();
    this.mostrarCargarArchivo = false;
    this.mostrarInputTransaccion = false;
  }

  quitarPagoCredito() {
    this.eliminarDatoArregloFormaPago('tarjeta_credito');
    this.mostrarCargarArchivoCredito = false;
    this.archivo.delete('archivoFormaPagoCredito');
    this.notaPedido.get('montoCredito').setValue(0);
    this.notaPedido.get('numTransaccionCredito').setValue('');
    this.calcularTotalFormaPago();
    this.notaPedido.get('numTransaccionCredito').setValidators([]);
    this.notaPedido.get('numTransaccionCredito').updateValueAndValidity();
    this.notaPedido.get('montoCredito').setValidators([]);
    this.notaPedido.get('montoCredito').updateValueAndValidity();
    this.mostrarInputTransaccionCredito = false;
  }

  quitarPagoEfectivo() {
    this.eliminarDatoArregloFormaPago('efectivo');
    this.notaPedido.get('totalCobroEfectivo').setValue(0);
    this.calcularTotalFormaPago();
    this.notaPedido.get('totalCobroEfectivo').setValidators([]);
    this.notaPedido.get('totalCobroEfectivo').updateValueAndValidity();
    this.mostrarInputCobro = false;
  }

  eliminarDatoArregloFormaPago(valor) {
    let indice = this.formasPago.indexOf(valor);
    if (indice !== -1) {
      this.formasPago.splice(indice, 1);
    }
  }

  valorComision(porcentaje, valor, precio) {
    if (valor) {
      return valor.toFixed(2);
    } else {
      return porcentaje + '% => ' + ((precio * porcentaje) / 100).toFixed(2);
    }
  }

  obtenerTiendaComercial(canal) {
    const tienda = this.canalOpciones.filter(item => item.valor === canal);
    return tienda[0].nombre;
  }

}
