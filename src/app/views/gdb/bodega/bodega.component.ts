import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../services/mp/param/param.service';
import {ParamService as ParamServiceMDP} from '../../../services/admin/param.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {CONTRA_ENTREGA, PREVIO_PAGO} from '../../../constats/mp/pedidos';
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {Toaster} from 'ngx-toast-notifications';
@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  providers: [DatePipe]
})
export class BodegaComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
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
  ciudadPresenteFacturacion = true;
  ciudadPresenteEnvio = true;
  datosParamFiltrados: any[] = [];

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
    private paramService: ParamService,
    private paramServiceMDP: ParamServiceMDP,
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
    });
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    this.obtenerListaParametros();
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
        identificacion: ['', [
          Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$'),
          ValidacionesPropias.cedulaValido
        ]],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: ['', [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        gps: ['', []],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      envio: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        identificacion: ['', [
          Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$'),
          ValidacionesPropias.cedulaValido
        ]],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: ['', [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        gps: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      envioTotal: ['', [Validators.required]],
      numeroPedido: ['', [Validators.required]],
      created_at: ['', [Validators.required]],
      metodoPago: ['', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['', []],
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
      bodega: ['', []]
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
      estado: ['Pendiente']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerTransaccion(modal, id): void {
    this.modalService.open(modal, {size: 'xl', backdrop: 'static'});
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.validarCiudadEnProvincia(info.facturacion.provincia, info.facturacion.ciudad, info.envio.provincia, info.envio.ciudad);

      this.iniciarNotaPedido();
      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, verificarPedido: true, canal: this.cortarUrlHastaCom(info.canal)});

      info.articulos.forEach((item, index) => {
        this.obtenerProducto(index);
      });
    });
  }

  cortarUrlHastaCom(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const match = url.match(/https?:\/\/[^\/]+\.com/);
      return match ? match[0] : url;  // Devuelve la URL cortada o la original si no se encuentra .com
    }
    return url;
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
        valorUnitario: Number(this.detallesArray.controls[i].value.valorUnitario).toFixed(2)
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
                const precioProducto = info.precio;
                this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
                this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
                this.detallesArray.controls[i].get('imagen').setValue(info.imagen);
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
              const precioProducto = info.precio;
              this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
              this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
              this.detallesArray.controls[i].get('imagen').setValue(info.imagen);
              this.detallesArray.controls[i].get('cantidad').setValidators([
                Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info?.stock)
              ]);
              this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
              this.detallesArray.controls[i].get('bodega').setValue('DESCONOCIDO');

              this.calcular();
              resolve();
            }
          });
        }
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
    this.notaPedido.get('total').setValue(total.toFixed(2));
  }

  async actualizar(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    this.validarCiudadEnProvincia(this.notaPedido.value.facturacion.provincia, this.notaPedido.value.facturacion.ciudad, this.notaPedido.value.envio.provincia, this.notaPedido.value.envio.ciudad);

    if (this.notaPedido.invalid) {
      this.toaster.open('Pedido Incompleto', {type: 'danger'});
      return;
    }
    if (!this.ciudadPresenteFacturacion || !this.ciudadPresenteEnvio) {
      return;
    }

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
    const tipoFacturacion = transaccion.metodoPago === CONTRA_ENTREGA ? 'rimpePopular' : 'facturacionElectronica';
    this.autorizarForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      metodoConfirmacion: ['', [Validators.required]],
      codigoConfirmacion: ['', transaccion.metodoPago === PREVIO_PAGO ? [Validators.required] : []],
      fechaHoraConfirmacion: [this.datePipe.transform(new Date(), 'yyyy-MM-ddThh:mm:ss.SSSZ'), [Validators.required]],
      tipoFacturacion: [tipoFacturacion, [Validators.required]],
      urlMetodoPago: ['', transaccion.metodoPago === PREVIO_PAGO ? [Validators.required] : []],
      archivoMetodoPago: ['', []],
      estado: ['Autorizado', [Validators.required]],
    });
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

  procesarRechazo(modal, transaccion): void {
    this.modalService.open(modal);
    this.rechazoForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      motivo: ['', [Validators.required]],
      estado: ['Rechazado', [Validators.required]],
    });
  }

  procesarRechazar(): void {
    if (confirm('Esta seguro de cambiar de estado') === true) {
      this.mostrarSpinner = true;
      this.pedidosService.actualizarPedido(this.rechazoForm.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
        this.mostrarSpinner = false;
      }, () => {
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

  validarCiudadEnProvincia(provinciaFacturacion, ciudadFacturacion, provinciaEnvio, ciudadEnvio): void {

    this.paramServiceMDP.obtenerListaHijos(provinciaFacturacion, 'PROVINCIA')
      .subscribe((infoFacturacion) => {
          const estaPresenteFacturacion = infoFacturacion.some((ciudad) =>
            ciudad.nombre === ciudadFacturacion
          );
          if (!estaPresenteFacturacion) {
            this.toaster.open("La ciudad no se encuentra en la provincia en los datos de factura.", {
              type: 'danger'
            });
            this.ciudadPresenteFacturacion = false;
          } else {
            this.ciudadPresenteFacturacion = true;

          }
        }
      );
    this.paramServiceMDP.obtenerListaHijos(provinciaEnvio, 'PROVINCIA')
      .subscribe((infoEnvio) => {
          const estaPresenteEnvio = infoEnvio.some((ciudad) =>
            ciudad.nombre === ciudadEnvio
          );
          if (!estaPresenteEnvio) {
            this.toaster.open("La ciudad no se encuentra en la provincia en los datos de envio.", {
              type: 'danger'
            });
            this.ciudadPresenteEnvio = false;
          } else {
            this.ciudadPresenteEnvio = true;

          }
        }
      );
  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramService.obtenerListaParametros({
      page: this.page - 1,
      page_size: 50
    }).subscribe((result) => {
      this.datosParamFiltrados = result.info.filter(dato => dato.tipo.trim().toLowerCase().endsWith('.com'));
    });
  }


}
