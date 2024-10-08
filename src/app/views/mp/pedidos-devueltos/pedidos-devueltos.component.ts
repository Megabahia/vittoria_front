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
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {Toaster} from "ngx-toast-notifications";
import {logger} from "codelyzer/util/logger";
import {ParamService as ParamServiceAdm} from "../../../services/admin/param.service";
import {ContactosService} from "../../../services/gdc/contactos/contactos.service";

@Component({
  selector: 'app-pedidos-devueltos',
  templateUrl: './pedidos-devueltos.component.html',
  styleUrls: ['./pedidos-devueltos.component.css'],
  providers: [DatePipe],
})
export class PedidosDevueltosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
  public autorizarForm: FormGroup;
  public rechazoForm: FormGroup;
  datosProducto: FormData = new FormData();

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
  horaPedido;
  parametroIva;
  totalIva;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadEnvio = '';
  provinciaEnvio = '';
  ciudadOpciones;
  provinciaOpciones;
  ciudadOpcionesEnvio;
  provinciaOpcionesEnvio;
  detallePedido;
  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };

  constructor(
    private toaster: Toaster,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private contactosService: ContactosService,
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
        identificacion: ['', []],
        tipoIdentificacion: ['', [Validators.required]],
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
        identificacion: ['', []],
        tipoIdentificacion: ['', [Validators.required]],
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
      subtotal: ['', [Validators.required]],
      envioTotal: ['', [Validators.required]],
      numeroPedido: ['', [Validators.required]],
      created_at: ['', [Validators.required]],
      metodoPago: ['', [Validators.required]],
      canal: ['', []],
      nombreEnvio: [''],
      comprobanteVendedorGmb: [''],
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
      id: [''],
      codigo: ['', [Validators.required]],
      articulo: ['', [Validators.required]],
      valorUnitario: [0, [Validators.required]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0, [Validators.required]],
      precios: [[], []],
      imagen: [''],
      descuento: [0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern('^[0-9]*$')]],
      caracteristicas: ['', []],
      bodega: ['', []],
      canal: [''],
      woocommerceId: [''],
      observaciones: ['', [Validators.maxLength(40)]],
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
      estado: ['Devolucion']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerTransaccion(id): void {
    this.obtenerProvincias();
    this.obtenerProvinciasEnvio();
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.provincia = info.facturacion.provincia;
      this.obtenerCiudad();
      this.provinciaEnvio = info.envio.provincia;
      this.obtenerCiudadEnvio();

      this.horaPedido = this.extraerHora(info.created_at);

      this.validarCiudadEnProvincia(info.facturacion.provincia, info.facturacion.ciudad, info.envio.provincia, info.envio.ciudad);
      this.iniciarNotaPedido();
      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, canal: this.cortarUrlHastaCom(info.canal)});

      this.calcular();

    });
  }

  cortarUrlHastaCom(url: string): string {
    const match = url.match(/https?:\/\/[^\/]+\.com/);
    if (match) {
      return match[0].replace(/https?:\/\//, '');
    }
    return url.replace(/https?:\/\//, '');
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
        canalProducto: this.detallesArray.value[i].canal || this.notaPedido.value.canal,
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
                this.detallesArray.controls[i].get('id').setValue(info.id);
                this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
                this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
                this.detallesArray.controls[i].get('observaciones').setValue(this.detallesArray.controls[i].get('observaciones').value);
                this.detallesArray.controls[i].get('descuento').setValue(this.detallesArray.controls[i].get('descuento').value ?? 0);
                this.detallesArray.controls[i].get('precios').setValue([...this.extraerPrecios(info)]);
                const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value);
                this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
                this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
                this.detallesArray.controls[i].get('imagen').setValue(info.imagen);
                this.detallesArray.controls[i].get('imagen_principal').setValue(info?.imagen_principal);
                this.detallesArray.controls[i].get('bodega').setValue(param[0].nombre);
                if (info.canal !== '') {
                  this.detallesArray.controls[i].get('canal').setValue(info.canal)
                } else {
                  this.detallesArray.controls[i].get('canal').setValue(this.notaPedido.value.canal)
                }
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

            } else {
              this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
              window.alert('Existen inconsistencias con los precios de los productos.');
            }
          });
        } else {
          this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
            this.detallesArray.controls[i].get('id').setValue(info.id);
            this.detallesArray.controls[i].get('articulo').setValue(info.nombre || info.articulo);
            this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
            this.detallesArray.controls[i].get('observaciones').setValue(this.detallesArray.controls[i].get('observaciones').value);
            this.detallesArray.controls[i].get('descuento').setValue(this.detallesArray.controls[i].get('descuento').value ?? 0);
            this.detallesArray.controls[i].get('precios').setValue([...this.extraerPrecios(info)]);
            const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value);
            this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
            this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
            this.detallesArray.controls[i].get('imagen').setValue(info.imagen);
            this.detallesArray.controls[i].get('imagen_principal').setValue(info.imagen_principal);
            this.detallesArray.controls[i].get('bodega').setValue('');
            this.detallesArray.controls[i].get('canal').setValue(info.canal);
            this.detallesArray.controls[i].get('woocommerceId').setValue(info.woocommerceId);
            this.detallesArray.controls[i].get('cantidad').setValidators([
              Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info?.stock)
            ]);
            this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
            this.calcular();
            resolve();
          });
        }
      });
    });
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
    this.validarCiudadEnProvincia(
      this.notaPedido.value.facturacion.provincia,
      this.notaPedido.value.facturacion.ciudad,
      this.notaPedido.value.envio.provincia,
      this.notaPedido.value.envio.ciudad
    );

    delete this.notaPedido.value.comprobanteVendedorGmb;

    if (confirm('Esta seguro de actualizar los datos') === true) {
      if (this.notaPedido.invalid || !this.ciudadPresenteFacturacion || !this.ciudadPresenteEnvio) {
        this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
        return;
      }
      this.pedidosService.actualizarPedido(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  procesarEnvio(modal, transaccion): void {
    this.detallePedido = transaccion;
    this.modalService.open(modal);
    const tipoFacturacion = transaccion.metodoPago === CONTRA_ENTREGA ? 'rimpePopular' : 'facturacionElectronica';
    this.autorizarForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      metodoConfirmacion: [transaccion.metodoConfirmacion, [Validators.required]],
      codigoConfirmacion: ['', transaccion.metodoPago === PREVIO_PAGO ? [Validators.required] : []],
      fechaHoraConfirmacion: [this.datePipe.transform(new Date(), 'yyyy-MM-ddThh:mm:ss.SSSZ'), [Validators.required]],
      tipoFacturacion: [tipoFacturacion, [Validators.required]],
      urlMetodoPago: ['', transaccion.metodoPago === PREVIO_PAGO ? [Validators.required] : []],
      estado: ['Autorizado', [Validators.required]],
    });
  }


  procesarRechazo(modal, transaccion): void {
    this.modalService.open(modal);
    this.rechazoForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      motivo: ['', [Validators.required]],
      estado: ['Rechazado', [Validators.required]],
    });
  }

  procesarAutorizacion(): void {
    if (confirm('Esta seguro de cambiar de estado') === true) {
      if (this.autorizarForm.value.metodoConfirmacion === '') {
        this.toaster.open('Seleccione el método de confirmación.', {type: 'warning'});
        return;
      }
      this.pedidosService.actualizarPedido(this.autorizarForm.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  procesarRechazar(): void {
    if (confirm('Esta seguro de cambiar de estado') === true) {
      this.pedidosService.actualizarPedido(this.rechazoForm.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  validarCiudadEnProvincia(provinciaFacturacion, ciudadFacturacion, provinciaEnvio, ciudadEnvio): void {
    this.paramServiceAdm.obtenerListaHijos(provinciaFacturacion, 'PROVINCIA')
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
    this.paramServiceAdm.obtenerListaHijos(provinciaEnvio, 'PROVINCIA')
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


  validarDatos(): void {
    this.contactosService.validarCamposContacto(this.notaPedido.value).subscribe((info) => {
    }, error => this.toaster.open(error, {type: 'danger'}));
  }

  cargarImagen(i, event: any): void {
    this.datosProducto = new FormData();

    const id = this.detallesArray.controls[i].get('id').value;
    const archivo = event.target.files[0];
    if (archivo) {
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
            this.toaster.open('Imagen actualizada con éxito', {type: "info"});
          }, error => this.toaster.open('Error al actualizar la imagen.', {type: "danger"}));
        } catch (error) {
          this.toaster.open('Error al actualizar la imagen.', {type: "danger"});
        }
      };
      reader.readAsDataURL(archivo);

    }
  }

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
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

  onSelectChangeIdentificacionEnvio(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'cedula') {
      this.notaPedido.get('envio')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.cedulaValido]
      );
      this.notaPedido.get('envio')['controls']['identificacion'].updateValueAndValidity();
    } else if (selectedValue === 'ruc') {
      this.notaPedido.get('envio')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.rucValido]
      )
      this.notaPedido.get('envio')['controls']['identificacion'].updateValueAndValidity();
    } else {
      this.notaPedido.get('envio')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.minLength(5)]
      );
      this.notaPedido.get('envio')['controls']['identificacion'].updateValueAndValidity();
    }
  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerProvinciasEnvio(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpcionesEnvio = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerCiudadEnvio(): void {
    this.paramServiceAdm.obtenerListaHijos(this.provinciaEnvio, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpcionesEnvio = info;
    });
  }
}
