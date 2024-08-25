import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {Toaster} from 'ngx-toast-notifications';
import {IntegracionesEnviosService} from '../../../services/admin/integraciones_envios.service';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {IntegracionesService} from '../../../services/admin/integraciones.service';
import Decimal from 'decimal.js';
import {AuthService} from "../../../services/admin/auth.service";
import {ClientesService} from "../../../services/mdm/personas/clientes/clientes.service";

interface ProductoProcesado {
  canal?: string;

  [key: string]: any; // Esto permite cualquier nombre de clave adicional
}

@Component({
  selector: 'app-crear-pedido-woocomerce',
  templateUrl: './crear-pedido-woocomerce.component.html',
})


export class CrearPedidoWoocomerceComponent implements OnInit {

  @Input() paises;
  public notaPedido: FormGroup;
  archivo: FormData = new FormData();

  tipoIdentificacion;
  datos: any[] = [];
  pais = 'Ecuador';
  ciudadOpciones;
  provinciaOpciones;
  seleccionPrimerCombo: any;
  seleccionSegundoCombo: any;
  noEsCliente = false;
  enviarCorreo = false;
  correoCliente;
  codigoCorreo;

  numeroPedido: any [] = [];
  productoBuscar: any [] = [];
  numeroPedidos: any = {};

  mostrarContenido = false;
  mostrarContenidoFacturacion = false;
  mostrarCargaComprobante = false;
  mostrarContenidoPantalla = true;
  mostrarDatosEnvio = false;

  datosCliente;
  disabledCombo = false;
  selectClient;
  costoEnvio;
  numeroCuenta;
  nombreCuenta;
  sectorOpciones
  page = 1;
  page_size: any = 3;
  parametros;
  parametrosIntegracionesCanal;
  integracionProducto;
  formasPagoCourier: any[] = [];
  parametroIva;
  totalIva;
  currentUser;
  mostrarInputArchivoComprobante = false;
  listaCostoEnvio;
  listaMetodoPago;
  mostrarDatosGmb = false;
  cedulaABuscar = '';
  whatsappABuscar = '';
  correoABuscar = '';
  paginaWoocommerce
  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private paramServiceAdm: ParamServiceAdm,
    private pedidosService: PedidosService,
    private toaster: Toaster,
    private integracionesEnviosService: IntegracionesEnviosService,
    private productosService: ProductosService,
    private integracionesService: IntegracionesService,
    private authService: AuthService
  ) {
    console.log('ENTRA A D¿CONSTRUCTOR DE PEDIDO WOOCOMMERCE');

    const ref = document.referrer;
    const host = document.location.host;
    this.paginaWoocommerce = ref;

    this.currentUser = this.authService.currentUserValue;

    this.iniciarNotaPedido();
    this.obtenerListaParametrosCanal();

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.page_size, 'IVA', 'Impuesto de Valor Agregado').subscribe((result) => {
      this.parametroIva = parseFloat(result.info[0].valor);
    });

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.page_size, 'METODO PAGO', '').subscribe((result) => {
      this.listaMetodoPago = result.data;
    });
  }

  ngOnInit(): void {
    console.log('ENTRA A NGONINIT DE PEDIDO WOOCOMMERCE')
    console.log(localStorage.getItem('productosWoocommerce'));
    // this.route.queryParams.subscribe(params => {
    //     if (params) {
    //       // Decodificamos y parseamos el JSON de la cadena que recibimos
    const params = JSON.parse(localStorage.getItem('productosWoocommerce'));
          const productos = JSON.parse(params.cadena);

          // Procesar cada producto para normalizar claves y valores
          const productosProcesados: ProductoProcesado[] = productos.map(producto => {
            const productoProcesado: ProductoProcesado = {};

            Object.entries(producto).forEach(([clave, valor]) => {
              // Normalizar la clave a minúsculas sin tildes ni caracteres especiales
              const claveNormalizada = this.normalizarClave(clave);

              // Asignar el valor a la nueva clave en el objeto procesado
              productoProcesado[claveNormalizada] = valor;
            });

            // Agregar el canal al producto procesado
            productoProcesado.canal = params.canal;

            return productoProcesado;
          });

          // Si quieres agregar todos los productos al arreglo `this.datos`
          this.datos.push(...productosProcesados);
    //     } else {
    //       return;
    //     }
    //   }
    // );


    this.obtenerProvincias();
    this.obtenerCiudad();
    this.datos.map((data, index) => {
      this.obtenerProducto(this.datos[index]);
    });

    this.notaPedido.updateValueAndValidity();
  }

  tiendaArray(posicion: number): FormArray | null {
    if (this.detallesPedidos && this.detallesPedidos.controls[posicion]) {
      return this.detallesPedidos.controls[posicion].get('articulos') as FormArray;
    }
    return null;
  }

  normalizarClave(clave: string): string {
    return clave.toLowerCase() // Convertir a minúsculas
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar tildes
      .replace(/[^a-z0-9_]/gi, '_'); // Reemplazar espacios y caracteres no alfanuméricos con guión bajo
  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      facturacion: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        identificacion: ['', []],
        tipoIdentificacion: [this.tipoIdentificacion, [Validators.required]],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: [this.pais, [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        sector: ['', [Validators.required]],
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        gps: [''],
        codigoVendedor: [this.currentUser.usuario.username, [Validators.required]],
        nombreVendedor: [this.currentUser.full_name, [Validators.required]]
      }),
      articulos: this.formBuilder.array([]),
      pedidos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      envioTotal: [0],
      subtotal: [0],
      numeroPedido: [''],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['superbarato.megadescuento.com', []],
      estado: ['Pendiente', []],
      tipoEnvio: [''],
      tipoPago: [''],
      archivoMetodoPago: [''],
      comprobanteVendedorGmb: [''],
      envio: this.formBuilder.group({
        nombres: [''],
        apellidos: [''],
        correo: [''],
        identificacion: [''],
        tipoIdentificacion: [''],
        telefono: [''],
        pais: [''],
        provincia: [''],
        ciudad: [''],
        callePrincipal: [''],
        numero: [''],
        calleSecundaria: [''],
        referencia: [''],
        codigoVendedor: [''],
        nombreVendedor: ['']
      }),
      envios: ['', []],
      json: ['', []],
      formasEnvio: ['', []],
      montoPrevioPago: [''],
      nombreEnvio: ['']
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

  get detallesPedidos(): FormArray {
    return this.notaPedido.get('pedidos') as FormArray;
  }

  crearDetalleGrupo(datos: any, datosBaseDatos, preciosVentas): any {
    return this.formBuilder.group({
      id: [''],
      codigo: [datos.sku_del_producto],
      articulo: [datos.nombre_del_producto],
      valorUnitario: [datos.precio_del_producto || 0],
      cantidad: [datos.cantidad_en_el_carrito || 0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [datos.total_del_articulo || 0],
      imagen: [''],
      caracteristicas: [''],
      precios: [preciosVentas],
      canal: [datosBaseDatos.canal],
      imagen_principal: [datos.imagen_del_producto],
      prefijo: [datosBaseDatos.prefijo, []]
    });
  }

  crearDetalleGrupoGardar(data): any {
    return this.formBuilder.group({
      id: [data.id],
      codigo: [data.codigo],
      articulo: [data.articulo],
      valorUnitario: [data.valorUnitario],
      cantidad: [data.cantidad],
      precio: [data.precio],
      imagen: [data.imagen],
      caracteristicas: [data.caracteristicas],
      precios: [data.precios],
      canal: [data.canal],
      imagen_principal: [data.imagen_principal],
      prefijo: [data.prefijo]
    });
  }

  crearDetalleGrupoPedidos(datos: any, ciudad): any {
    return this.formBuilder.group({
      prefijo: [datos.prefijo, []],
      ciudad: [ciudad, []],
      couries: ['', []],
      formasPagos: ['', [Validators.required]],
      formaPago: ['', ],
      listaFormasPagos: ['', []],
      numeroCuenta: ['', []],
      nombreCuenta: ['', []],
      canal: ['', []],
      precioEnvio: [0],
      articulos: this.formBuilder.array([]),
    });
  }

  agregarItem(data): void {
    const detalle = this.crearDetalleGrupoGardar(data);
    this.detallesArray.push(detalle);
  }

  agregarItemPedidos(datos, ciudad): void {
    const detalle = this.crearDetalleGrupoPedidos(datos, ciudad);
    this.detallesPedidos.push(detalle);
  }

  removerItem(tienda, articuloIndex, tiendaIndex): void {
    // Remueve el artículo en el índice especificado.
    const tiendaFormArray = tienda.get('articulos') as FormArray;
    tiendaFormArray.removeAt(articuloIndex);

    if (tienda.value.articulos.length === 0) {
      this.detallesPedidos.removeAt(tiendaIndex);
    }

    this.calcular();
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
      );
      this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    } else {
      this.notaPedido.get('facturacion')['controls']['identificacion'].setValidators(
        [Validators.required, Validators.minLength(5)]
      );
      this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    }
    this.tipoIdentificacion = selectedValue;

  }

  calcular(): void {
    const pedidos = this.notaPedido.get('pedidos')['controls'];
    let total = 0;
    let subtotalPedido = 0;
    pedidos.map((pedido) => {
      total += parseFloat(pedido.value.precioEnvio ?? 0);
      pedido.value.articulos.forEach((item, index) => {
        const valorUnitario = parseFloat(item.valorUnitario);
        const cantidad = parseFloat(item.cantidad || 0);
        total += cantidad * valorUnitario;
      });
    });
    total += parseFloat(this.notaPedido.get('envioTotal').value);
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));

  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.notaPedido.value.facturacion.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerSector(): void {
    this.paramServiceAdm.obtenerListaHijos(this.notaPedido.value.facturacion.ciudad, 'CIUDAD').subscribe((info) => {
      this.sectorOpciones = info;
    });
  }

  generarID(): string {
    const numeroAleatorio = Math.floor(Math.random() * 1000000);

    return numeroAleatorio.toString().padStart(8, '0');
  }

  obtenerFechaActual(): Date {
    return new Date();
  }

  guardarVenta(): void {
    this.notaPedido.get('articulos').value.map((producto) => {
      delete producto.imagen_principal;
    });

    if (!this.selectClient) {
      this.toaster.open('Seleccione si es cliente o no', {type: 'danger'});
      return;
    }

    if (this.notaPedido.get('pedidos').value.length === 0) {
      this.toaster.open('Debe haber al menos 1 artículo', {type: 'danger'});
      return;
    }

    console.log(this.notaPedido);
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {

      this.notaPedido.value.pedidos.map((data) => {
        this.notaPedido.patchValue({
          ...this.notaPedido.value,
          envio: {...this.notaPedido.value.facturacion},
        });
        data.articulos.forEach((articulo, i) => {
          this.detallesArray.removeAt(i);
          this.agregarItem(articulo);
        });

        const facturaFisicaValores: string[] = Object.values(this.notaPedido.value);
        const facturaFisicaLlaves: string[] = Object.keys(this.notaPedido.value);

        facturaFisicaLlaves.map((llaves, index) => {
          if (llaves !== 'comprobanteVendedorGmb') {
            if (llaves === 'articulos' || llaves === 'facturacion' || llaves === 'envio') {
              this.archivo.delete(llaves);
              this.archivo.append(llaves, JSON.stringify(facturaFisicaValores[index]));
            } else {
              this.archivo.delete(llaves);
              this.archivo.append(llaves, facturaFisicaValores[index]);
            }
          }
        });

        this.archivo.append('numeroPedido', this.generarID());
        this.archivo.append('envioTotal', this.notaPedido.value.envioTotal);
        this.archivo.append('tipoPago', data.formasPagos);

        this.archivo.delete('envios');
        this.archivo.delete('pedidos');
        this.archivo.delete('json');

        this.pedidosService.crearPedidoSuperBarato(this.archivo).subscribe(result => {
          this.numeroPedido.push(result.numeroPedido);
          this.toaster.open('Pedido guardado', {type: 'success'});
          this.mostrarContenidoPantalla = false;
        }, error => this.toaster.open('Error al guardar pedido', {type: 'danger'}));
      });
    }
  }

  onChangeCombo(event: any, numeroPedido): void {
    const formasPago = this.notaPedido.get('pedidos')['controls'][numeroPedido]['controls'].couries.value.find((item) => item.nombre === event.target.value);
    this.notaPedido.get('pedidos')['controls'][numeroPedido].get('precioEnvio').setValue(formasPago.costo);
    const metodosPagos = this.notaPedido.get('pedidos')['controls'][numeroPedido]['controls']?.formasPagos.value[event.target.selectedIndex - 1];
    this.notaPedido.get('pedidos')['controls'][numeroPedido].get('listaFormasPagos').setValue([...metodosPagos]);
    this.notaPedido.updateValueAndValidity();
    /*if (seleccionado && seleccionado.formaPago) {
      this.nombreCuenta = seleccionado.nombreCuenta;
      this.numeroCuenta = seleccionado.numeroCuenta;
      this.costoEnvio = seleccionado.costo;
    } else {
      this.formasPagoCourier = [];
    }*/
    this.calcular();
  }

  compararEnvios(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  onFileSelected(event: any): void {
    if (this.seleccionPrimerCombo !== '') {
      this.archivo.append('comprobanteVendedorGmb', event.target.files.item(0), event.target.files.item(0).name);
      this.notaPedido.get('comprobanteVendedorGmb').setValue(event.target.files.item(0).name)
    } else {
      this.archivo.delete('comprobanteVendedorGmb');
      this.notaPedido.get('comprobanteVendedorGmb').setValue('');
    }
  }

  onSelectChangeCliente(event: any): void {
    const selectValue = event.target.value;
    this.selectClient = selectValue;
    if (selectValue === 'noEsCliente') {
      this.mostrarContenido = false;
      this.mostrarContenidoFacturacion = false;
      this.mostrarDatosEnvio = false;
      this.noEsCliente = true;
      this.cedulaABuscar = '';
      this.whatsappABuscar = '';
      this.correoABuscar = '';
    } else {
      this.noEsCliente = false;
      this.enviarCorreo = false;
      this.mostrarContenido = true;
      this.mostrarContenidoFacturacion = true;
    }
  }

  enviarCorreoCliente(): void {
    if (this.validarCorreo(this.correoCliente)) {
      const datos = {
        email: this.correoCliente
      };

      this.pedidosService.enviarCodioCorreo(datos).subscribe((item) => {
        this.enviarCorreo = true;

        this.toaster.open(item.message, {type: 'info'});
      }, error => this.toaster.open(error.error, {type: 'danger'}));
    } else {
      this.toaster.open('Ingrese un correo válido', {type: 'danger'});
    }
  }

  validarCodigoCorreo(): void {
    const datos = {
      correo: this.correoCliente,
      codigo: this.codigoCorreo
    };
    this.pedidosService.verificarCodigoCorreo(datos).subscribe(data => {
      this.datosCliente = data;
      this.completarCamposCliente();
      this.mostrarContenido = true;
      this.mostrarContenidoFacturacion = true;
      this.disabledCombo = true;
    }, error => this.toaster.open(error, {type: 'danger'}));
  }

  completarCamposCliente(): void {
    let tipoIdentificacion;
    if (this.datosCliente) {
      this.notaPedido.get('facturacion').get('nombres').setValue(this.datosCliente.nombres);
      this.notaPedido.get('facturacion').get('apellidos').setValue(this.datosCliente.apellidos);
      this.notaPedido.get('facturacion').get('correo').setValue(this.datosCliente.correo);
      this.notaPedido.get('facturacion').get('identificacion').setValue(this.datosCliente.cedula);

      if (this.datosCliente.tipoIdentificacion === 'Cédula') {
        tipoIdentificacion = 'cedula';
      } else if (this.datosCliente.tipoIdentificacion === 'RUC') {
        tipoIdentificacion = 'ruc';
      } else {
        tipoIdentificacion = 'pasaporte';
      }

      this.notaPedido.get('facturacion').get('tipoIdentificacion').setValue(tipoIdentificacion);
      this.notaPedido.get('facturacion').get('telefono').setValue(this.datosCliente.telefono ? this.datosCliente.telefono : '');
      this.notaPedido.get('facturacion').get('pais').setValue(this.datosCliente.paisNacimiento);
      this.notaPedido.get('facturacion').get('provincia').setValue(this.datosCliente.provinciaNacimiento);
      this.notaPedido.get('facturacion').get('ciudad').setValue(this.datosCliente.ciudadNacimiento);

      this.obtenerCiudad();
    }
  }

  validarCorreo(correo: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(correo);
  }

  async obtenerDatosProducto(): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = {
        canal: this.detallesArray.value[0].canal
      };

      this.productosService.obtenerProductoPorCodigoCanal(data).subscribe((info) => {
        this.integracionProducto = info.integraciones_canal;
      }, error => this.toaster.open(error, {type: 'danger'}));
    });
  }

  obtenerCostosEnvio(): void {
    if (this.notaPedido.get('facturacion').get('ciudad').value) {
      this.notaPedido.get('pedidos').value.map((tienda, index) => {
        this.integracionesEnviosService.obtenerListaIntegracionesEnviosSinAuth({
          ciudad: tienda.ciudad,
          ciudadDestino: this.notaPedido.get('facturacion').get('ciudad').value
        }).subscribe((result) => {
          const couries = result.info.map(item => {
            return {
              nombre: `${item.courier} - Desde ${item.ciudad} hasta ${item.ciudadDestino} - Costo $${item.costo}`,
              costo: item.costo,
              formaPago: item.formaPago,
            };
          });
          this.notaPedido.get('pedidos')['controls'][index].get('couries').setValue(couries);
          const formasPagos = result.info.map(item => item.formaPago.filter(item2 => item2.estado === true));
          const numeroCuenta = result.info.find(item => item.numeroCuenta !== undefined)?.numeroCuenta;
          const nombreCuenta = result.info.find(item => item.nombreCuenta !== undefined)?.nombreCuenta;
          this.notaPedido.get('pedidos')['controls'][index].get('formasPagos').setValue(formasPagos);
          if (numeroCuenta != null && nombreCuenta != null) {
            this.notaPedido.get('pedidos')['controls'][index].get('numeroCuenta').setValue(numeroCuenta);
            this.notaPedido.get('pedidos')['controls'][index].get('nombreCuenta').setValue(nombreCuenta);
          }
          this.notaPedido.updateValueAndValidity();
          if (result.cont === 0) {
            this.toaster.open(`No existe precio de envio desde ${tienda.ciudad} hasta
          ${this.notaPedido.get('facturacion').get('ciudad').value}`, {type: 'info'});
          } else {
            this.toaster.open('Costos de envío cargados', {type: 'info'});
          }
        });
      });
    }
  }

  onSelectFormaPago(e: any) {
    const selectValue = e.target.value;
    console.log('notepedido', this.notaPedido.value.pedidos[0].formaPago);
    // if (selectValue !== '' && selectValue === 'Transferencia') {
    //   this.mostrarCargaComprobante = true;
    // } else {
    //   this.mostrarCargaComprobante = false;
    // }
  }

  async obtenerListaParametrosCanal(): Promise<void> {
    const datos = {
      page: this.page,
      page_size: this.page_size,
      valor: 'superbarato.megadescuento.com'
    };
    await this.integracionesService.obtenerListaIntegraciones(datos).subscribe((result) => {
      this.parametrosIntegracionesCanal = result.data[0];
    });
  }

  escogerCantidad(operacion, i, articulo): void {
    const cantidadControl = articulo;
    let cantidad = +articulo.get('cantidad').value;
    cantidad = operacion === 'sumar' ? Math.min(cantidad + 1) : Math.max(cantidad - 1, 0);
    cantidadControl.get('cantidad').setValue(cantidad);
    const total = +new Decimal(cantidadControl.get('valorUnitario').value).mul(cantidad).toFixed(2).toString();
    cantidadControl.get('precio').setValue(total);
    this.notaPedido.updateValueAndValidity();
    this.calcular();
  }

  //OBTENER PRODUCTO
  async obtenerProducto(productoWoocomerce): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = {
        prefijo: productoWoocomerce.tienda_producto,
        codigoBarras: productoWoocomerce.sku_del_producto,
      };
      this.productosService.obtenerProductoPorCodigoCanal(data).subscribe((info) => {

        this.productoBuscar.push({...info.producto});
        const prefijo = info.producto.prefijo; // Asumiendo que cada producto tiene un atributo 'prefijo'

        if (!this.numeroPedidos[prefijo]) {
          this.numeroPedidos[prefijo] = []; // Inicializa el arreglo si el prefijo es nuevo
          this.agregarItemPedidos(info.producto, info.integraciones_canal.ciudad);
        }
        this.numeroPedidos[prefijo].push({...info.producto}); // Agrega el producto al arreglo correspondiente

        // Encuentra la posición del artículo con el prefijo 'MAXI'
        const posicion = this.notaPedido.get('pedidos').value.findIndex(articulo => articulo.prefijo === prefijo);

        // Usa el método tiendaArray para obtener el FormArray y agregar el valor
        const preciosVenta= [...this.extraerPrecios(info.producto)];
        this.tiendaArray(posicion).push(
          this.crearDetalleGrupo(productoWoocomerce, info.producto, preciosVenta)
        );
        console.log(preciosVenta)
        resolve(); // Resolver la promesa
        this.calcular();
      }, error => this.toaster.open(error, {type: 'danger'}));
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

  mostrarDatosEnvioConScroll() {
    this.mostrarDatosEnvio = true;
    this.smoothScrollToTop(1500);
  }

  smoothScrollToTop(duration: number) {
    const start = window.pageYOffset;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const fraction = elapsedTime / duration;

      const easeOutQuad = (t: number) => t * (2 - t);
      const scrollFraction = easeOutQuad(fraction);

      const newScrollPosition = start * (1 - scrollFraction);
      window.scrollTo(0, newScrollPosition);

      if (fraction < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  protected readonly Number = Number;
  protected readonly JSON = JSON;

  getTotalFormatted(): string {
    const totalValue = this.notaPedido.controls.total.value;
    return !isNaN(totalValue) && totalValue !== null ? (+totalValue).toFixed(2) : '0.00';
  }

  onSelectChangePago(e: any) {
    const selectedValue = e.target.value;
    if (selectedValue === 'Previo Pago Servientrega Nacional' || selectedValue === 'Previo Pago Motorizado en Quito') {
      this.mostrarInputArchivoComprobante = true;
      this.notaPedido.get('comprobanteVendedorGmb').setValidators([Validators.required]);
      this.notaPedido.get('comprobanteVendedorGmb').updateValueAndValidity();
      this.notaPedido.get('montoPrevioPago').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]);
      this.notaPedido.get('montoPrevioPago').updateValueAndValidity();
    } else {
      this.notaPedido.get('comprobanteVendedorGmb').setValidators([]);
      this.notaPedido.get('comprobanteVendedorGmb').updateValueAndValidity();
      this.notaPedido.get('montoPrevioPago').setValidators([]);
      this.notaPedido.get('montoPrevioPago').updateValueAndValidity();
      this.archivo.delete('comprobanteVendedorGmb');
      this.mostrarInputArchivoComprobante = false;
    }
    this.mostrarDatosGmb = true;
    this.paramServiceAdm.obtenerListaHijosEnvio(this.notaPedido.value.metodoPago).subscribe((result) => {
      this.listaCostoEnvio = result;
    });
  }

  onFileSelectedComprobantePago(event: any): void {
    this.archivo.append('archivoMetodoPago', event.target.files.item(0), event.target.files.item(0).name);
    this.notaPedido.get('archivoMetodoPago').setValue(event.target.files.item(0));
  }

  nombreEnvioSeleccionado(envio: any) {
    const selectedValue = envio.target.value;
    let [nombre, valor] = selectedValue.split('-').map(part => part.trim());
    valor = parseFloat(valor);
    this.notaPedido.get('envioTotal').setValue(valor ? valor : 0);
    this.notaPedido.get('nombreEnvio').setValue(nombre);
    this.calcular();

  }

  obtenerClienteCedula(): void {

    if (this.cedulaABuscar !== '' || this.whatsappABuscar !== '' || this.correoABuscar !== '') {

      const datos = {
        cedula: this.cedulaABuscar,
        whatsApp: this.whatsappABuscar,
        correo: this.correoABuscar,
      };

      this.clientesService.obtenerClientePorCedula(datos).subscribe((info) => {
        this.mostrarContenido = true;
        this.notaPedido.get('facturacion').get('nombres').setValue(info.nombres);
        this.notaPedido.get('facturacion').get('apellidos').setValue(info.apellidos);
        this.notaPedido.get('facturacion').get('correo').setValue(info.correo);
        this.notaPedido.get('facturacion').get('identificacion').setValue(info.cedula);
        this.notaPedido.get('facturacion').get('telefono').setValue(info.telefono);
        this.notaPedido.get('facturacion').get('provincia').setValue(info.provinciaNacimiento);
        this.notaPedido.get('facturacion').get('ciudad').setValue(info.ciudadNacimiento);

        this.obtenerCiudad();
        //this.notaPedido.get('facturacion').get('identificacion').disable();
      }, error => {
        this.toaster.open(error, {type: 'danger'});
        this.notaPedido.get('facturacion').get('nombres').setValue('');
        this.notaPedido.get('facturacion').get('apellidos').setValue('');
        this.notaPedido.get('facturacion').get('correo').setValue('');
        this.notaPedido.get('facturacion').get('identificacion').setValue('');
        this.notaPedido.get('facturacion').get('telefono').setValue('');
        this.notaPedido.get('facturacion').get('provincia').setValue('');
        this.notaPedido.get('facturacion').get('ciudad').setValue('');
        this.obtenerCiudad();

        //this.notaPedido.get('facturacion').get('identificacion').enable();
      });
    } else {
      this.toaster.open('Ingrese un campo para buscar', {type: 'danger'});
      return;
    }
  }
}



