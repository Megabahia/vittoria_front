import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceGDE} from '../../../../services/gde/param/param.service';
import {ParamService as ParamServiceMDP} from '../../../../services/mdp/param/param.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';

@Component({
  selector: 'app-gestion-entrega-enviados',
  templateUrl: './gestion-entrega-enviados.component.html',
  styleUrls: ['./gestion-entrega-enviados.component.css'],
  providers: [DatePipe],
})
export class GestionEntregaEnviadosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
  public evidenciasForm: FormGroup;
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


  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  public couriers = [];
  usuario;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceGDE: ParamServiceGDE,
    private paramServiceMDP: ParamServiceMDP,
    private productosService: ProductosService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
    this.evidenciasForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      evidenciaFotoEmpaque: ['', [Validators.required]],
      evidenciaVideoEmpaque: ['', []],
    });
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    this.obtenerCouriers();
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
      envioTotal: ['', []],
      subtotal: ['', []],
      iva: ['', []],
      numeroPedido: ['', []],
      numeroGuia: ['', []],
      created_at: ['', []],
      metodoPago: ['', [Validators.required]],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerTransacciones();
    });
  }

  get autorizarFForm() {
    return this.evidenciasForm['controls'];
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
      estado: ['Despachado'],
      canalEnvio: 50 === this.usuario.usuario.idRol ? this.usuario.usuario.username : '',
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  obtenerCouriers(): void {
    this.paramServiceGDE.obtenerListaPadres('COURIER').subscribe((info) => {
      this.couriers = info;
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
      this.notaPedido.patchValue({...info});
    });
  }


  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
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
    this.archivo = new FormData();
    this.modalService.open(modal);
    this.evidenciasForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      evidenciaFotoEmpaque: ['', [Validators.required]],
      evidenciaVideoEmpaque: ['', []],
    });
  }

  procesarAutorizacionEnvio(): void {
    if (confirm('Esta seguro de despachar') === true) {
      const facturaFisicaValores: string[] = Object.values(this.evidenciasForm.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.evidenciasForm.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'evidenciaFotoEmpaque' && llaves !== 'evidenciaVideoEmpaque') {
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.pedidosService.actualizarPedidoFormData(this.archivo).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  seleccionarCourier(event): void {
    this.paramServiceGDE.obtenerListaPadres(event.target.value).subscribe((info) => {
      info.map((item) => {
        if ('NOMBRE_COURIER' === item.nombre) {
          this.evidenciasForm.get('nombreCourier').setValue(item.valor);
        }
        if ('CORREO_COURIER' === item.nombre) {
          this.evidenciasForm.get('correoCourier').setValue(item.valor);
        }
        if ('CANAL_ENVIO_COURIER' === item.nombre) {
          this.evidenciasForm.get('canalEnvio').setValue(item.valor);
        }
        if ('CODIGO_COURIER' === item.nombre) {
          this.evidenciasForm.get('codigoCourier').setValue(item.valor);
        }
      });
    });
  }

  cargarArchivo(event, nombreCampo): void {
    this.archivo.append(nombreCampo, event.target.files[0]);
  }
}
