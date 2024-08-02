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
import {Toaster} from 'ngx-toast-notifications';

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

  // FACTURACION
  mostrarInputComprobante;
  mostrarInputTransaccion;
  mostrarCargarArchivo;
  mostrarInputCobro;
  formasPago = [];
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
      fechaCargaFormaPago: [this.fechaFactura],
      formaPago: [''],
      archivoFormaPago: [''],
      archivoFormaPagoCredito: [''],
      numTransaccionTransferencia: [''],
      numTransaccionCredito: [''],
      totalCobroEfectivo: [''],
      montoTransferencia: [''],
      montoCredito: [''],
      numeroComprobante: [''],
      archivoFactura: ['', [Validators.required]],
      montoSubtotalCliente: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      fechaEmisionFactura: ['', [Validators.required]],
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
      caracteristicas: ['', []],
      descuento: [0, []],
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
      this.listaTransacciones = info.info.map((item) => {
        const resultado = this.calculoComision(item.estado, item.montoSubtotalCliente, item.total, item.montoSubtotalAprobado);
        return {...item, comision: resultado};
      });
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerFechaActual(): string {
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

  calculoComision(estado, montoSubtotal, total, montoAprobado): string {
    let resultado;
    if (estado !== 'Entregado') {
      return '--';
    }

    if (montoAprobado != null) {
      resultado = montoAprobado * this.comision;
    } else if (montoSubtotal != null){
      resultado = montoSubtotal * this.comision;
    } else if (total != null) {
      resultado = (total / this.parametroIva) * this.comision;
    }

    return resultado.toFixed(2);
  }

  cargarFactura(modal, id): void {
    this.totalFormaPago = 0;
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
    this.idPedido = id;
    this.iniciarFormaPagoForm();
    this.formaPagoForm.get('archivoFactura').setValue('');
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.formasPago = [];
      this.totalPagar = info.subtotal;
      if (modal._declarationTContainer.localNames[0] === 'facturacionModal') {
        this.formaPagoForm.get('tipoPago').setValidators([Validators.required]);
        this.formaPagoForm.get('tipoPago').updateValueAndValidity();
      }
      this.calcular();
    });
  }

  async actualizar(): Promise<void> {
    /*await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));*/
    this.formaPagoForm.get('archivoFactura').setValue('');
    this.formaPagoForm.get('archivoFactura').setValidators([]);
    this.formaPagoForm.get('archivoFactura').updateValueAndValidity();

    if (this.formaPagoForm.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      if (Number(this.totalPagar) < Number(this.formaPagoForm.value.montoSubtotalCliente)) {
        this.toaster.open('El monto ingresado no debe ser mayor al monto a pagar del pedido.', {type: 'danger'});
        return;
      } else {
        const fechaTransformada = new Date(this.formaPagoForm.get('fechaEmisionFactura').value).toISOString();

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
        this.archivo.append('fechaEmisionFactura', fechaTransformada);

        this.pedidosService.actualizarPedidoFormaPagoFormData(this.archivo).subscribe((info) => {
          this.modalService.dismissAll();
          this.obtenerTransacciones();
        }, error => this.toaster.open(error, {type: 'danger'}));
      }

    }
  }

  onSelectChange(event: any): void {
    const selectedValue = event.target.value;
    if (selectedValue === 'rimpePopular' || selectedValue === 'facturaElectronica') {
      this.mostrarInputComprobante = true;
      this.formaPagoForm.get('numeroComprobante').setValidators([Validators.required]);
      this.formaPagoForm.get('numeroComprobante').updateValueAndValidity();
    } else {
      this.mostrarInputComprobante = false;
      this.formaPagoForm.get('numeroComprobante').setValidators([]);
      this.formaPagoForm.get('numeroComprobante').updateValueAndValidity();
    }
  }

  onFileSelected(event: any): void {
    this.archivo.append('archivoFactura', event.target.files.item(0), event.target.files.item(0).name);
    this.formaPagoForm.get('archivoFactura').setValue(event.target.files.item(0).name);
  }


}
