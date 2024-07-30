import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceMDP} from '../../../../services/mdp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {ContactosService} from "../../../../services/gdc/contactos/contactos.service";
import {Toaster} from "ngx-toast-notifications";

@Component({
  selector: 'app-ventas-vendedor',
  templateUrl: './ventas-vendedor.component.html',
  styleUrls: ['./ventas-vendedor.component.css'],
  providers: [DatePipe]
})
export class VentasVendedorComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
  public formaPagoForm: FormGroup;
  public autorizarForm: FormGroup;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaTransacciones;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  archivo: FormData = new FormData();
  horaPedido;
  parametroIva;
  comision;
  totalIva;
  totalFormaPago;

  //FACTURACION
  mostrarInputComprobante;
  mostrarInputTransaccion;
  mostrarCargarArchivo;
  mostrarInputCobro;
  mostrarCargarArchivoCredito;
  mostrarInputTransaccionCredito;
  formasPago = [];
  selectFormaPago;
  totalPagar;
  idPedido;
  fechaFactura;
  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  public iva;
  public usuario;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceMDP: ParamServiceMDP,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private toaster: Toaster,
  ) {
    this.fechaFactura = this.obtenerFechaActual();
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
    this.autorizarForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      metodoConfirmacion: ['', [Validators.required]],
      codigoConfirmacion: ['', [Validators.required]],
      fechaHoraConfirmacion: ['', [Validators.required]],
      tipoFacturacion: ['', [Validators.required]],
    });
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'IVA', 'Impuesto de Valor Agregado').subscribe((result) => {
      this.parametroIva = parseFloat(result.info[0].valor);
    });
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'COMISION', 'Comision').subscribe((result) => {
      this.comision = parseFloat(result.info[0].valor);
    });
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerTransacciones();
  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      id: ['', []],
      facturacion: this.formBuilder.group({
        nombres: ['', []],
        apellidos: ['', []],
        correo: ['', []],
        identificacion: ['', []],
        tipoIdentificacion: ['', []],
        telefono: ['', []],
        pais: ['', []],
        provincia: ['', []],
        ciudad: ['', []],
        callePrincipal: ['', []],
        numero: ['', []],
        calleSecundaria: ['', []],
        referencia: ['', []],
        gps: ['', []],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      envio: this.formBuilder.group({
        nombres: ['', []],
        apellidos: ['', []],
        correo: ['', []],
        identificacion: ['', []],
        tipoIdentificacion: ['', []],
        telefono: ['', []],
        pais: ['', []],
        provincia: ['', []],
        ciudad: ['', []],
        callePrincipal: ['', []],
        numero: ['', []],
        calleSecundaria: ['', []],
        referencia: ['', []],
        gps: ['', []],
        canalEnvio: ['', []],
      }),
      articulos: this.formBuilder.array([]),
      total: ['', []],
      subtotal: ['', []],
      iva: ['', []],
      numeroPedido: ['', []],
      created_at: ['', []],
      metodoPago: ['', [Validators.required]],
    });
  }

  iniciarFormaPagoForm(): void {
    this.formaPagoForm = this.formBuilder.group({
      id: ['', []],
      tipoPago: ['', [Validators.required]],
      fechaCargaFormaPago: [''],
      formaPago: ['', [Validators.required]],
      archivoFormaPago: [''],
      archivoFormaPagoCredito: [''],
      numTransaccionTransferencia: [''],
      numTransaccionCredito: [''],
      totalCobroEfectivo: [''],
      montoTransferencia: [''],
      montoCredito: [''],
      numeroComprobante: ['']
    });
  }

  get formasPagoForm() {
    return this.formaPagoForm['controls'];
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerTransacciones();
    });
  }

  get autorizarFForm() {
    return this.autorizarForm['controls'];
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
      caracteristicas:['',[]],
      descuento: [0,[]],
      imagen: ['', []],
      imagen_principal: [''],
      prefijo: ['']
    });
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  obtenerTransacciones(): void {
    this.pedidosService.obtenerListaPedidos({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.transformarFecha(this.fin),
      codigoVendedor: this.usuario.usuario.username,
      rol: this.usuario.usuario.idRol
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerFechaActual(){
    const hoy = new Date();
    return this.datePipe.transform(hoy, 'dd-MM-yyyy') || '';
  }

  obtenerTransaccion(id): void {
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.iniciarNotaPedido();
      this.horaPedido = this.extraerHora(info.created_at);

      info.articulos.map((item): void => {
        this.agregarItem();
      });
      //const iva = +(info.total * this.iva.valor).toFixed(2);
      const total = info.total;
      this.notaPedido.patchValue({...info, subtotal: info.subtotal, total});
      this.calcular();
    });
  }


  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
    this.paramServiceMDP.obtenerParametroNombreTipo('ACTIVO', 'TIPO_IVA').subscribe((info) => {
        this.iva = info;
      },
      (error) => {
        alert('Iva no configurado');
      }
    );
  }

  obtenerProducto(i): void {
    this.productosService.obtenerProductoPorCodigo({
      codigoBarras: this.detallesArray.value[i].codigo
    }).subscribe((info) => {
      if (info.codigoBarras) {
        // this.detallesArray.value[i].codigo = info.codigo;
        console.log('dato', this.detallesArray.controls[i].get('articulo'));
        this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
        this.detallesArray.controls[i].get('cantidad').setValue(1);
        this.detallesArray.controls[i].get('valorUnitario').setValue(info.precioVentaA);
        this.detallesArray.controls[i].get('precio').setValue(info.precioVentaA * 1);
        this.calcular();
      } else {
        // this.comprobarProductos[i] = false;
        // this.mensaje = 'No existe el producto a buscar';
        // this.abrirModal(this.mensajeModal);
      }
    }, (error) => {

    });
  }


  calcular(): void {
    const detalles = this.detallesArray.controls;
    let total = 0;
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
      total += parseFloat(detalles[index].get('precio').value);
    });
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
  }

  cargarArchivo(event, nombreCampo): void {
    this.archivo.append(nombreCampo, event.target.files[0]);
  }

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

  calculoComision(estado, total) {
    let variable2;
    if (estado === 'Entregado') {
      variable2 = total/this.parametroIva;
      return (variable2 * this.comision).toFixed(2);
    }else{
      return '--';
    }
  }

  cargarFactura(modal, id): void {
    this.totalFormaPago = 0;
    //this.obtenerProvincias();
    //this.obtenerListaProductos();
    this.modalService.open(modal, {size: 'xl', backdrop: 'static'});
    this.idPedido = id;
    this.iniciarFormaPagoForm();
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      console.log('DATOS', info)
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

      //this.provincia = info.facturacion.provincia;
      //this.obtenerCiudad();

      this.totalPagar = info.total;
      /*this.iniciarNotaPedido();
      this.horaPedido = this.extraerHora(info.created_at);*/

      //this.canalPrincipal = info.articulos[0].canal;
      //this.canalSeleccionado = this.canalPrincipal;

      /*info.articulos.map((item): void => {
        this.agregarItem();
      });*/
      //this.formaPagoForm.patchValue({...info, verificarPedido: true});
      if (modal._declarationTContainer.localNames[0] === 'facturacionModal') {
        this.formaPagoForm.get('formaPago').setValidators([Validators.required]);
        this.formaPagoForm.get('formaPago').updateValueAndValidity();
        this.formaPagoForm.get('tipoPago').setValidators([Validators.required]);
        this.formaPagoForm.get('tipoPago').updateValueAndValidity();
      }
      this.calcular();
    });
  }

  async actualizar(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    if (this.formaPagoForm.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      const facturaFisicaValores: string[] = Object.values(this.formaPagoForm.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.formaPagoForm.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'archivoMetodoPago' && llaves !== 'facturacion' && llaves !== 'articulos') {
          this.archivo.delete(llaves);
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.archivo.append('id', this.idPedido);
      this.archivo.append('formaPago', JSON.stringify(this.formasPago));
      this.archivo.append('fechaCargaFormaPago', this.fechaFactura);
      if (this.mostrarInputCobro || this.mostrarInputTransaccion || this.mostrarInputTransaccionCredito) {
        if (Number(this.totalPagar) !== Number(this.totalFormaPago)) {
          this.toaster.open('El precio total ingresado no coincide', {type: 'danger'})
        } else {
          this.pedidosService.actualizarPedidoFormaPagoFormData(this.archivo).subscribe((info) => {
            this.modalService.dismissAll();
            this.obtenerTransacciones();
          }, error => this.toaster.open(error, {type: 'danger'}));
        }
      }
    }
  }

  onSelectChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'rimpePopular' || selectedValue === 'facturaElectronicaMegaBahia') {
      this.mostrarInputComprobante = true;
      this.formaPagoForm.get('numeroComprobante').setValidators([Validators.required]);
      this.formaPagoForm.get('numeroComprobante').updateValueAndValidity();
    } else {
      this.mostrarInputComprobante = false;
      this.formaPagoForm.get('numeroComprobante').setValidators([]);
      this.formaPagoForm.get('numeroComprobante').updateValueAndValidity();
    }
  }

  onSelectChangeFormaPago(event: any) {
    this.selectFormaPago = event.target.value;
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
        this.formaPagoForm.get('numTransaccionTransferencia').setValidators([Validators.required]);
        this.formaPagoForm.get('numTransaccionTransferencia').updateValueAndValidity();
        this.formaPagoForm.get('montoTransferencia').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]);
        this.formaPagoForm.get('montoTransferencia').updateValueAndValidity();
        //this.mostrarInputCobro = false;
        break;
      case 'efectivo':
        //this.mostrarInputTransaccion = false;
        //this.mostrarCargarArchivo = false;
        this.mostrarInputCobro = true;
        this.formaPagoForm.get('totalCobroEfectivo').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]);
        this.formaPagoForm.get('totalCobroEfectivo').updateValueAndValidity();

        break;
      case 'tarjeta_credito':
        this.mostrarInputTransaccionCredito = true;
        this.mostrarCargarArchivoCredito = true;
        //this.notaPedido.get('archivoFormaPagoCredito').setValidators([Validators.required]);
        //this.notaPedido.get('archivoFormaPagoCredito').updateValueAndValidity();
        this.formaPagoForm.get('numTransaccionCredito').setValidators([Validators.required]);
        this.formaPagoForm.get('numTransaccionCredito').updateValueAndValidity();
        this.formaPagoForm.get('montoCredito').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]);
        this.formaPagoForm.get('montoCredito').updateValueAndValidity();
        //this.mostrarInputCobro = false;
        break;
      default:
        console.log("Seleccione una forma de pago válida");
    }
  }

  quitarPagoTransferencia() {
    this.eliminarDatoArregloFormaPago('transferencia');
    this.archivo.delete('archivoFormaPago');
    this.formaPagoForm.get('montoTransferencia').setValue(0);
    this.calcularTotalFormaPago();
    this.formaPagoForm.get('numTransaccionTransferencia').setValidators([]);
    this.formaPagoForm.get('numTransaccionTransferencia').updateValueAndValidity();
    this.formaPagoForm.get('montoTransferencia').setValidators([]);
    this.formaPagoForm.get('montoTransferencia').updateValueAndValidity();
    this.mostrarCargarArchivo = false;
    this.mostrarInputTransaccion = false;
  }

  quitarPagoCredito() {
    this.eliminarDatoArregloFormaPago('tarjeta_credito');
    this.mostrarCargarArchivoCredito = false;
    this.archivo.delete('archivoFormaPagoCredito');
    this.formaPagoForm.get('montoCredito').setValue(0);
    this.calcularTotalFormaPago();
    this.formaPagoForm.get('numTransaccionCredito').setValidators([]);
    this.formaPagoForm.get('numTransaccionCredito').updateValueAndValidity();
    this.formaPagoForm.get('montoCredito').setValidators([]);
    this.formaPagoForm.get('montoCredito').updateValueAndValidity();
    this.mostrarInputTransaccionCredito = false;
  }

  quitarPagoEfectivo() {
    this.eliminarDatoArregloFormaPago('efectivo');
    this.formaPagoForm.get('totalCobroEfectivo').setValue(0);
    this.calcularTotalFormaPago();
    this.formaPagoForm.get('totalCobroEfectivo').setValidators([]);
    this.formaPagoForm.get('totalCobroEfectivo').updateValueAndValidity();
    this.mostrarInputCobro = false;
  }

  calcularTotalFormaPago() {
    this.totalFormaPago = (parseFloat(this.formaPagoForm.value.totalCobroEfectivo || 0) + parseFloat(this.formaPagoForm.value.montoCredito || 0) + parseFloat(this.formaPagoForm.value.montoTransferencia || 0)).toFixed(2);
  }

  eliminarDatoArregloFormaPago(valor) {
    let indice = this.formasPago.indexOf(valor);
    if (indice !== -1) {
      this.formasPago.splice(indice, 1);
    }
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
}
