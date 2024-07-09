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
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {GmbMegabahiaService} from '../../../services/gmb/megbahia/gmb-megabahia.service';
import {UsersService} from '../../../services/admin/users.service';

@Component({
  selector: 'app-megabahia',
  templateUrl: './Megabahia.component.html',
  styleUrls: ['Megabahia.component.css'],
  providers: [DatePipe]
})
export class MegabahiaComponent implements OnInit, AfterViewInit {
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
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  whatsapp = '';
  nombre = '';
  apellido = '';
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  totalIva;
  parametroIva;
  canalSeleccionado = '';
  listaCanalesProducto;
  listaUsuarios = [];
  usuarioSeleccionado = '';
  obtenerUsuarioLogeado;
  listaMetodoPago;
  listaCostoEnvio;
  mostrarInputArchivoComprobante = false;
  costoEnvioSeleccionado;
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
    private megabahiaService: GmbMegabahiaService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private servicioUsuarios: UsersService,
    private toaster: Toaster,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.obtenerUsuarioActual();
    this.obtenerListaUsuarios();
    //this.iniciarNotaPedido();
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

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'METODO PAGO', '').subscribe((result) => {
      this.listaMetodoPago = result.info;
    });

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'COSTO ENVIO', '').subscribe((result) => {
      this.listaCostoEnvio = result.info;
    });
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
    //this.iniciarPaginador();
  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
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
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        //gps: ['', []],
        codigoUsuario: [this.obtenerUsuarioLogeado.usuario.username, []],
        nombreUsuario: [this.obtenerUsuarioLogeado.usuario.nombres + ' ' + this.obtenerUsuarioLogeado.usuario.apellidos, []],
        comprobantePago: ['', []],
      }),
      vendedor: ['', [Validators.required]],
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      subtotal: [0],
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['', [Validators.required]],
      archivoMetodoPago: ['', [Validators.required]],
      archivoComprobanteVenta: ['', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['megabahia.megadescuento.com'],
      estado: ['Pendiente de entrega'],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
      numeroComprobante: [''],
      tipoPago: ['',],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
    });
  }

  get notaPedidoForm() {
    return this.notaPedido['controls'];
  }

  get facturacionForm() {
    return this.notaPedido.get('facturacion')['controls'];
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

  crearNuevaVentaMegabahia(modal): void {
    this.mostrarInputArchivoComprobante = false;
    this.canalSeleccionado = 'megabahia.megadescuento.com';
    this.archivo.delete('archivoComprobanteVenta');
    this.archivo.delete('archivoMetodoPago');
    this.iniciarNotaPedido();
    this.obtenerProvincias();
    this.obtenerCiudad();
    this.formatearFecha();
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }

  async guardarDespachoMegabahia(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    if (this.notaPedido.value.valorUnitario === 0) {
      this.toaster.open('Seleccione un precio que sea mayor a 0.', {type: 'danger'});
      return;
    }
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      const facturaFisicaValores: string[] = Object.values(this.notaPedido.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.notaPedido.value);
      facturaFisicaLlaves.map((llaves, index) => {
        this.archivo.delete(llaves);
        this.archivo.append(llaves, facturaFisicaValores[index]);

      });
      this.megabahiaService.crearNuevoMegabahiaDespacho(this.archivo).subscribe((info) => {
          this.modalService.dismissAll();
          this.notaPedido.patchValue({...info});
        }, error => this.toaster.open(error, {type: 'danger'})
      );
    }
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
        canalProducto: this.canalSeleccionado,
        canal: this.notaPedido.value.canal,
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        //if(info.mensaje==''){
        if (info.codigoBarras) {
          //this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
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
    let subtotalPedido = 0;
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value || 0);
      // tslint:disable-next-line:radix
      const descuento = parseInt(detalles[index].get('descuento').value);
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += parseFloat(this.notaPedido.get('envioTotal').value);

    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
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
    this.horaPedido = fechaActual.toTimeString().split(' ')[0];
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
    this.megabahiaService.validarCamposMegabahiaDespacho(this.notaPedido.value).subscribe((info) => {
    }, error => this.toaster.open(error, {type: 'danger'}));
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

  extraerPrecios(info: any) {
    const precios = [];
    Object.keys(info).forEach(clave => {
      if (clave.startsWith('precioVenta')) {
        precios.push({clave: clave, valor: info[clave]});
      }
    });
    return precios;
  }


  obtenerUsuarioActual(): void {
    const usuarioJSON = localStorage.getItem('currentUser');
    if (usuarioJSON) {
      this.obtenerUsuarioLogeado = JSON.parse(usuarioJSON);
    } else {
      console.log('No hay datos de usuario en localStorage');
    }
  }

  async obtenerListaUsuarios() {
    await this.servicioUsuarios.obtenerListaUsuarios({
      page: this.page - 1, page_size: this.pageSize
    })
      .subscribe((result) => {
        this.listaUsuarios = result.usuarios;
      });
  }

  onSelectChangePago(e: any) {
    const selectedValue = e.target.value;
    if (selectedValue === 'previo_pago_servientrega' || selectedValue === 'previo_pago_motorizado') {
      this.mostrarInputArchivoComprobante = true;
      this.notaPedido.get('archivoMetodoPago').setValidators([Validators.required]);
      this.notaPedido.get('archivoMetodoPago').updateValueAndValidity();
    } else {
      this.mostrarInputArchivoComprobante = false;
      this.notaPedido.get('archivoMetodoPago').setValidators([]);
      this.notaPedido.get('archivoMetodoPago').updateValueAndValidity();
    }
  }

  onFileSelectedComprobanteVenta(event: any): void {
    this.archivo.append('archivoComprobanteVenta', event.target.files.item(0), event.target.files.item(0).name);
    this.notaPedido.get('archivoComprobanteVenta').setValue(event.target.files.item(0));
  }

  onFileSelectedComprobantePago(event: any): void {
    this.archivo.append('archivoMetodoPago', event.target.files.item(0), event.target.files.item(0).name);
  }

}
