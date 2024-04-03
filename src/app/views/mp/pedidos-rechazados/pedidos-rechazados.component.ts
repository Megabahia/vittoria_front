import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../services/mp/param/param.service';
import {ParamService as ParamServiceMDP} from '../../../services/mdp/param/param.service';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {CONTRA_ENTREGA, PREVIO_PAGO} from '../../../constats/mp/pedidos';

@Component({
  selector: 'app-pedidos-rechazados',
  templateUrl: './pedidos-rechazados.component.html',
  styleUrls: ['./pedidos-rechazados.component.css'],
  providers: [DatePipe],
})
export class PedidosRechazadosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
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


  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  public iva;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceMDP: ParamServiceMDP,
    private productosService: ProductosService,
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
      id: ['', [Validators.required]],
      facturacion: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        identificacion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        pais: ['', [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        gps: ['', [Validators.required]],
        codigoVendedor: ['', [Validators.required]],
        nombreVendedor: ['', [Validators.required]],
        comprobantePago: ['', [Validators.required]],
      }),
      envio: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        identificacion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
        pais: ['', [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        gps: ['', []],
        canalEnvio: ['', [Validators.required]],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      envioTotal: ['', [Validators.required]],
      subtotal: ['', [Validators.required]],
      iva: ['', [Validators.required]],
      numeroPedido: ['', [Validators.required]],
      created_at: ['', [Validators.required]],
      metodoPago: ['', [Validators.required]],
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
      estado: ['Rechazado']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerTransaccion(id): void {
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.iniciarNotaPedido();
      info.articulos.map((item): void => {
        this.agregarItem();
      });
      const iva = +(info.total * this.iva.valor).toFixed(2);
      const total = iva + info.total;
      this.notaPedido.patchValue({...info, subtotal: info.subtotal, iva, total});
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
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value);
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    this.notaPedido.get('total').setValue(total);
  }

  actualizar(): void {
    this.calcular();
    if (confirm('Esta seguro de actualizar los datos') === true) {
      this.pedidosService.actualizarPedido(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  procesarEnvio(modal, transaccion): void {
    this.modalService.open(modal);
    const tipoFacturacion = transaccion.metodoPago === CONTRA_ENTREGA ? 'rimpePopular' : 'facturacionElectronica';
    this.autorizarForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      metodoConfirmacion: ['', [Validators.required]],
      codigoConfirmacion: ['', transaccion.metodoPago === PREVIO_PAGO ? [Validators.required] : []],
      fechaHoraConfirmacion: [this.datePipe.transform(new Date(), 'yyyy-MM-ddThh:mm:ss.SSSZ'), [Validators.required]],
      tipoFacturacion: [tipoFacturacion, [Validators.required]],
      urlMetodoPago: ['', transaccion.metodoPago === PREVIO_PAGO ? [Validators.required] : []],
      estado: ['Autorizado', [Validators.required]],
    });
  }

  procesarAutorizacion(): void {
    if (confirm('Esta seguro de cambiar de estado') === true) {
      this.pedidosService.actualizarPedido(this.autorizarForm.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }
}
