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
import {Toaster} from "ngx-toast-notifications";
import {ParamService as ParamServiceAdm} from "../../../../services/admin/param.service";
import {UsersService} from "../../../../services/admin/users.service";

@Component({
  selector: 'app-gestion-entrega-enviados',
  templateUrl: './gestion-entrega-enviados.component.html',
  styleUrls: ['./gestion-entrega-enviados.component.css'],
  providers: [DatePipe, UsersService],
})
export class GestionEntregaEnviadosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
  public evidenciasForm: FormGroup;
  public evidenciasNoEntrega: FormGroup;
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
  pedido;
  horaPedido;
  totalIva;
  parametroIva;
  mostrarCargaComprobante = false;
  mostrarMontoEfectivo = false;
  mostrarMontoTransferencia = false;
  valorSeleccionadoAccion;
  mostrarBotonAccion: boolean[] = [];
  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  public couriers = [];
  courierPedido
  usuario;
  mostrarSpinner = false;

  constructor(
    private toaster: Toaster,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceGDE: ParamServiceGDE,
    private paramServiceMDP: ParamServiceMDP,
    private productosService: ProductosService,
    private paramServiceAdm: ParamServiceAdm,
    private usersService: UsersService,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
    this.evidenciasForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      evidenciaFotoEmpaque: ['', [Validators.required]],
      evidenciaVideoEmpaque: ['', []],
      tipoPago: ['', [Validators.required]],
      evidenciaPago: ['', [Validators.required]],

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

  get evidenciasNoEntregaForm() {
    return this.evidenciasNoEntrega['controls'];
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
      descuento: ['', []],
      bodega: ['', []],
      canal: [''],
      observaciones: [''],
      woocommerceId: [''],
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

  obtenerProducto(i): void {

    const codigoBodega = this.detallesArray.value[i].codigo.slice(-2);

    this.paramService.obtenerListaValor({valor: codigoBodega}).subscribe((param) => {
      if (this.detallesArray.value[i].codigo.endsWith('MD')) {
        this.productosService.obtenerProductoPorCodigo({
          codigoBarras: this.detallesArray.value[i].codigo
        }).subscribe((info) => {
          if (info.codigoBarras) {
            // this.detallesArray.value[i].codigo = info.codigo;
            console.log('dato', this.detallesArray.controls[i].get('articulo'));
            this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
            this.detallesArray.controls[i].get('cantidad').setValue(1);
            this.detallesArray.controls[i].get('observaciones').setValue(this.detallesArray.controls[i].get('observaciones').value);
            this.detallesArray.controls[i].get('valorUnitario').setValue(info.precioVentaA);
            this.detallesArray.controls[i].get('precio').setValue(info.precioVentaA * 1);
            this.detallesArray.controls[i].get('bodega').setValue(param[0].nombre);

            this.calcular();
          } else {
            // this.comprobarProductos[i] = false;
            // this.mensaje = 'No existe el producto a buscar';
            // this.abrirModal(this.mensajeModal);
          }
        }, (error) => {

        });
      } else {
        this.productosService.obtenerProductoPorCodigo({
          codigoBarras: this.detallesArray.value[i].codigo
        }).subscribe((info) => {
          if (info.codigoBarras) {
            // this.detallesArray.value[i].codigo = info.codigo;
            this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
            this.detallesArray.controls[i].get('cantidad').setValue(1);
            this.detallesArray.controls[i].get('observaciones').setValue(this.detallesArray.controls[i].get('observaciones').value);
            this.detallesArray.controls[i].get('valorUnitario').setValue(info.precioVentaA);
            this.detallesArray.controls[i].get('precio').setValue(info.precioVentaA * 1);
            this.detallesArray.controls[i].get('bodega').setValue('DESCONOCIDO');

            this.calcular();
          } else {
            // this.comprobarProductos[i] = false;
            // this.mensaje = 'No existe el producto a buscar';
            // this.abrirModal(this.mensajeModal);
          }
        }, (error) => {

        });
      }
    })

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

  procesarEnvio(modal, transaccion): void {
    this.archivo = new FormData();
    this.modalService.open(modal);
    this.mostrarMontoEfectivo = false;
    this.mostrarMontoTransferencia = false;
    this.mostrarCargaComprobante = false;
    this.evidenciasForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      evidenciaFotoEmpaque: ['', [Validators.required]],
      evidenciaVideoEmpaque: ['', []],
      tipoPago: ['', [Validators.required]],
      evidenciaPago: ['', [Validators.required]],
      estado: ['Envio', []],
      totalCobroEfectivo: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
      montoTransferencia: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]]
    });
    this.obtenerTransaccion(transaccion.id);
    this.pedido = transaccion;
  }

  procesarAutorizacionEnvio(): void {
    if (confirm('Esta seguro de despachar') === true) {

      if (!this.mostrarMontoEfectivo && !this.mostrarMontoTransferencia) {
        this.evidenciasForm.get('montoTransferencia').setValidators([]);
        this.evidenciasForm.get('montoTransferencia').updateValueAndValidity();
        this.evidenciasForm.get('totalCobroEfectivo').setValidators([]);
        this.evidenciasForm.get('totalCobroEfectivo').updateValueAndValidity();
      } else if (this.mostrarMontoEfectivo) {
        if (Number(this.evidenciasForm.value.totalCobroEfectivo) < this.pedido.total) {
          this.toaster.open('El monto efectivo ingresado no es el correcto', {type: "danger"});
          return;
        }
      } else if (this.mostrarMontoTransferencia) {
        if (Number(this.evidenciasForm.value.montoTransferencia) < this.pedido.total) {
          this.toaster.open('El monto de transferencia ingresado no es el correcto', {type: "danger"});
          return;
        }
      }


      const facturaFisicaValores: string[] = Object.values(this.evidenciasForm.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.evidenciasForm.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'evidenciaFotoEmpaque' && llaves !== 'evidenciaVideoEmpaque') {
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      if (this.evidenciasForm.value.evidenciaFotoEmpaque === '') {
        this.toaster.open('Complete los campos requeridos.', {type: 'warning'})
        return;
      }
      this.mostrarSpinner = true;

      this.pedidosService.actualizarPedidoFormData(this.archivo).subscribe((info) => {

        this.modalService.dismissAll();
        this.obtenerTransacciones();
        this.mostrarSpinner = false;

      }, error => {
        this.mostrarSpinner = false;

      });

    }
  }

  seleccionarCourier(event)
    :
    void {
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

  cargarArchivo(event, nombreCampo)
    :
    void {
    this.archivo.append(nombreCampo, event.target.files[0]);
  }

  cortarUrlHastaCom(url
                      :
                      string
  ):
    string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const match = url.match(/https?:\/\/[^\/]+\.com/);
      return match ? match[0] : url;  // Devuelve la URL cortada o la original si no se encuentra .com
    }
    return url;
  }

  extraerHora(dateTimeString
                :
                string
  ):
    string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

  onSelectTIpoPago(e: any) {
    if (e.target.value === 'transferencia') {
      this.mostrarCargaComprobante = true;
      this.mostrarMontoTransferencia = true;
      this.mostrarMontoEfectivo = false;
      this.evidenciasForm.get('totalCobroEfectivo').setValue('');
    } else {
      this.mostrarCargaComprobante = false;
      this.mostrarMontoTransferencia = false;
      this.mostrarMontoEfectivo = true;
      this.evidenciasForm.get('montoTransferencia').setValue('');
    }
  }

  pedidoEntregago(e: any, i: number) {
    this.valorSeleccionadoAccion = e.target.value;

    if (this.valorSeleccionadoAccion !== '') {
      this.mostrarBotonAccion[i] = true;
    } else {
      this.mostrarBotonAccion[i] = false;
    }
  }

  razonPedidoNoEntregado(modal, transaccion): void {
    this.modalService.open(modal);
    this.evidenciasNoEntrega = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      motivo: ['', [Validators.required]],
      estado: ['Pedido devuelto']
    });
    this.pedido = transaccion;
  }

  procesarMotivoNoEntrega() {
    if (confirm('Esta seguro de despachar') === true) {

      if (this.evidenciasNoEntrega.value.motivo === '') {
        this.toaster.open('Complete los campos requeridos.', {type: 'danger'});
        return;
      }
      this.mostrarSpinner = true;

      this.pedidosService.actualizarPedido(this.evidenciasNoEntrega.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
        this.mostrarSpinner = false;

      }, error => {
        this.mostrarSpinner = false;

      });

    }
  }

  obtenerCourier(codigoCourier, emailCourier): void {
    this.usersService.obtenerUsuarioCourier({
      email: emailCourier,
      username: codigoCourier
    }).subscribe((info) => {
      this.courierPedido = info.info;
    });
  }

  abrirWhatsApp(event: Event, pedidoWhatsApp): void {
    event.preventDefault();
    this.obtenerCourier(pedidoWhatsApp.codigoCourier, pedidoWhatsApp.correoCourier);

    setTimeout(()=> {
      const numero = this.courierPedido.map(dato => dato.whatsapp)[0];
      const modifiedNumber = (numero.startsWith('0') ? numero.substring(1) : numero);
      const internationalNumber = '593' + modifiedNumber;
      const fecha = pedidoWhatsApp.created_at.split('T')[0];
      const mensajeEncabezado = `*Hola, aquí tienes los datos del pedido despachado:*\n\nFecha de pedido: ${fecha}\nNúmero de pedido: ${pedidoWhatsApp.numeroPedido}\nNúmero guía: ${pedidoWhatsApp.numeroGuia}\n*Método de envío: ${pedidoWhatsApp.metodoPago}*`;
      const mensajeProductos = pedidoWhatsApp.articulos.map((articulo, index) => `*Producto ${index + 1}*\nCódigo: ${articulo.codigo}\nNombre: ${articulo.articulo}\nCantidad: ${articulo.cantidad}\nPrecio: $${articulo.valorUnitario}\nDescuento: ${articulo.descuento}%\nTotal: $${articulo.precio}\n\n`);
      const mensajeDetallePrecios = `Envío a: ${pedidoWhatsApp.nombreEnvio ?? ''}\nTotal de envío: $${pedidoWhatsApp.envioTotal}\n*Total a pagar por el cliente: $${pedidoWhatsApp.total}*`;
      const mensajeEnvio = `*Datos de entrega:*\nNombre: ${pedidoWhatsApp.facturacion.nombres} ${pedidoWhatsApp.facturacion.apellidos}\nCorreo: ${pedidoWhatsApp.facturacion.correo}\nNúmero de identificación: ${pedidoWhatsApp.facturacion.identificacion}\nTeléfono: ${pedidoWhatsApp.facturacion.telefono}\nLocalidad: ${pedidoWhatsApp.facturacion.ciudad}, ${pedidoWhatsApp.facturacion.provincia}, ${pedidoWhatsApp.facturacion.pais}\nCalle principal: ${pedidoWhatsApp.facturacion.callePrincipal}\nNúmero de casa: ${pedidoWhatsApp.facturacion.numero}\nCalle secundaria: ${pedidoWhatsApp.facturacion.calleSecundaria}\nReferencia: ${pedidoWhatsApp.facturacion.referencia}\nGPS:\n${pedidoWhatsApp.facturacion.gps}`;
      const message = encodeURIComponent(`${mensajeEncabezado}\n\n*Datos del producto*\n${mensajeProductos}*Datos de envío*\n${mensajeDetallePrecios}\n\n${mensajeEnvio}`);

      const whatsappUrl = `https://web.whatsapp.com/send/?phone=${internationalNumber}&text=${message}`;
      window.open(whatsappUrl, '_blank');  // Abrir WhatsApp en una nueva pestaña
    },2000)

  }

}
