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
import {Toaster} from 'ngx-toast-notifications';
import {ParamService as ParamServiceAdm} from "../../../../services/admin/param.service";

@Component({
  selector: 'app-gestion-entrega-devolucion',
  templateUrl: './gestion-entrega-devolucion.component.html',
  styleUrls: ['./gestion-entrega-devolucion.component.css'],
  providers: [DatePipe],
})
export class GestionEntregaDevolucionComponent implements OnInit, AfterViewInit {
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
  horaPedido;

  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  public couriers = [];
  usuario;

  totalIva
  parametroIva
  transaccionDevolucion;
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceGDE: ParamServiceGDE,
    private paramServiceMDP: ParamServiceMDP,
    private productosService: ProductosService,
    private toaster: Toaster,
    private paramServiceAdm: ParamServiceAdm
  ) {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
    this.evidenciasForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      evidenciaFotoEmpaque: ['', [Validators.required]],
      evidenciaVideoEmpaque: ['', []],
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
      envioTotal: ['', []],
      subtotal: ['', []],
      iva: ['', []],
      numeroPedido: ['', []],
      numeroGuia: ['', []],
      created_at: ['', []],
      metodoPago: ['', [Validators.required]],
      estado: ['', []],
      canal: ['', []],
      nombreEnvio: ['']
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
      caracteristicas: ['', []],
      bodega: ['', []],
      canal: [''],
      woocommerceId: [''],
      descuento: ['', []],
      observaciones: [''],
      imagen_principal: ['', [Validators.required]]
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
      estado: ['Pedido devuelto'],
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
      this.horaPedido = this.extraerHora(info.created_at);

      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, canal: this.cortarUrlHastaCom(info.canal)});

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
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario.toFixed(2)
      };

      const codigoBodega = this.detallesArray.value[i].codigo.slice(-2);

      this.paramService.obtenerListaValor({valor: codigoBodega}).subscribe((param) => {
        if (this.detallesArray.value[i].codigo.endsWith('MD')) {
          this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
            if (info.mensaje === '') {
              if (info.codigoBarras) {
                this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
                this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
                this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
                this.detallesArray.controls[i].get('observaciones').setValue(this.detallesArray.controls[i].get('observaciones').value);
                const precioProducto = info.precio;
                this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
                this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
                this.detallesArray.controls[i].get('imagen').setValue(info?.imagen);
                this.detallesArray.controls[i].get('bodega').setValue(param[0].nombre);

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
            } else {
              this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
              window.alert('Existen inconsistencias con los precios de los productos.');
            }
          });
        } else {
          this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
            if (info.codigoBarras) {
              this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
              this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
              this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
              this.detallesArray.controls[i].get('observaciones').setValue(this.detallesArray.controls[i].get('observaciones').value);
              const precioProducto = info.precio;
              this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
              this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
              this.detallesArray.controls[i].get('imagen').setValue(info?.imagen);
              this.detallesArray.controls[i].get('bodega').setValue('DESCONOCIDO');
              this.detallesArray.controls[i].get('cantidad').setValidators([
                Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info?.stock)
              ]);
              this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
              this.calcular();
              resolve();
            }
          });
        }
      })


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
    total += parseFloat(this.notaPedido.get('envioTotal').value);
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
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

  procesarDevolucion(modal,transaccion) {
    this.modalService.open(modal);
    this.transaccionDevolucion = transaccion;
  }

  procesarEnvio(): void {
    if (confirm('Esta seguro de actualizar los datos') === true) {
      this.transaccionDevolucion.articulos.map(articulo => this.agregarItem());
      this.notaPedido.patchValue({...this.transaccionDevolucion, estado: 'Paquete Ingresado Stock'});
      this.pedidosService.devolucion(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  cargarArchivo(event, nombreCampo): void {
    this.archivo.append(nombreCampo, event.target.files[0]);
  }

  cortarUrlHastaCom(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const match = url.match(/https?:\/\/[^\/]+\.com/);
      return match ? match[0] : url;  // Devuelve la URL cortada o la original si no se encuentra .com
    }
    return url;
  }

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

}
