import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {Toaster} from 'ngx-toast-notifications';
import {IntegracionesEnviosService} from '../../../services/admin/integraciones_envios.service';
import {ProductosService} from "../../../services/mdp/productos/productos.service";

interface ProductoProcesado {
  canal?: string;

  [key: string]: any; // Esto permite cualquier nombre de clave adicional
}

@Component({
  selector: 'app-pedido-woocomerce',
  templateUrl: './pedido-woocomerce.component.html',
  styleUrls: ['./pedido-woocomerce.component.css']
})


export class PedidoWoocomerceComponent implements OnInit {

  opcionesPrimerCombo = [
    {id: 'envioServiEntrega', valor: 'Envío por Servientrega'},
    {id: 'envioMotorizadoContraEntrega', valor: 'Envío motorizado de Contraentrega'},
    {id: 'envioPuntoEntrega', valor: 'Envío a punto de entrega'}
  ];

  opcionesSegundoCombo = [
    {id: 'tranferenciaDeposito', valor: 'Tranferencia/Depósito'},
    {id: 'eleccionCliente', valor: 'Cliente elegirá al momento de entrega'},
  ];

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
  esCliente;
  enviarCorreo = false;
  correoCliente;
  codigoCorreo;

  numeroPedido;

  mostrarContenido = false;
  mostrarCargaComprobante = false;
  mostrarContenidoPantalla = true;

  datosCliente;
  disabledCombo = false;
  selectClient;

  page = 1;
  page_size: any = 3;
  parametros;
  integracionProducto;
  formasPagoCourier: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private formBuilder: FormBuilder,
    private paramServiceAdm: ParamServiceAdm,
    private pedidosService: PedidosService,
    private toaster: Toaster,
    private integracionesEnviosService: IntegracionesEnviosService,
    private productosService: ProductosService
  ) {
    /*const ref = document.referrer;
    const host = document.location.host;
    if (ref !== 'https://superbarato.megadescuento.com/') {
      if (host !== '209.145.61.41:4201') {
        this._router.navigate([
          '/auth/signin'
        ]);
        localStorage.clear();
        return;
      }
    }*/
    this.iniciarNotaPedido();
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }


  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // Decodificamos y parseamos el JSON de la cadena que recibimos
      const productos = JSON.parse(decodeURIComponent(params.cadena));

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
    });

    this.obtenerProvincias();
    this.obtenerCiudad();
    this.datos.map(data => this.agregarItem(data));
    this.calcular();
    this.obtenerDatosProducto();
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
        callePrincipal: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        calleSecundaria: ['', [Validators.required]],
        referencia: ['', [Validators.required]],
        codigoVendedor: [''],
        nombreVendedor: ['']
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      envioTotal: ['', [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['superbarato.megadescuento.com', []],
      estado: ['Pendiente', []],
      tipoEnvio: ['', [Validators.required]],
      tipoPago: ['', [Validators.required]],
      archivoMetodoPago: [''],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
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

  crearDetalleGrupo(datos: any): any {
    return this.formBuilder.group({
      id: [''],
      codigo: [datos.sku_del_producto],
      articulo: [datos.nombre_del_producto],
      valorUnitario: [datos.precio_del_producto || 0],
      cantidad: [datos.cantidad_en_el_carrito || 0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [datos.total_del_articulo || 0],
      imagen: [''],
      caracteristicas: [''],
      precios: [[]],
      canal: [datos.canal],
      imagen_principal: [datos.imagen_del_producto]
    });
  }

  agregarItem(datos: any): void {
    const detalle = this.crearDetalleGrupo(datos);
    this.detallesArray.push(detalle);
  }

  removerItem(i): void {
    this.detallesArray.removeAt(i);
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
    const detalles = this.detallesArray.controls;
    let total = 0;
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value || 0);
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value ? parseFloat(this.notaPedido.get('envioTotal').value) : 0;
    this.notaPedido.get('total').setValue(total);
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

    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      const facturaFisicaValores: string[] = Object.values(this.notaPedido.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.notaPedido.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (llaves !== 'archivoMetodoPago') {
          if (llaves === 'articulos' || llaves === 'facturacion') {
            this.archivo.delete(llaves);
            this.archivo.append(llaves, JSON.stringify(facturaFisicaValores[index]));
          } else {
            this.archivo.delete(llaves);
            this.archivo.append(llaves, facturaFisicaValores[index]);
          }
        }
      });
      this.archivo.delete('envio');
      this.archivo.delete('envios');
      this.archivo.delete('json');
      this.archivo.delete('tipoPago');

      this.pedidosService.crearPedidoSuperBarato(this.archivo).subscribe(result => {
        this.toaster.open('Pedido guardado', {type: 'success'});
        this.numeroPedido = result.numeroPedido;
        this.mostrarContenidoPantalla = false;
      }, error => this.toaster.open('Error al guardar pedido', {type: 'danger'}));
    }
  }

  onChangeCombo(event: any): void {

    const newValue = event.target.value;
    const seleccionado = this.parametros.find(p => p.courier === newValue);
    if (seleccionado && seleccionado.formaPago) {
      this.formasPagoCourier = seleccionado.formaPago.filter(fp => fp.estado === true);
      this.mostrarCargaComprobante = false;
    } else {
      this.formasPagoCourier = [];
    }
  }

  onFileSelected(event: any): void {
    if (this.seleccionPrimerCombo !== '') {
      this.archivo.append('archivoMetodoPago', event.target.files.item(0), event.target.files.item(0).name);
    } else {
      this.archivo.delete('archivoMetodoPago');
    }
  }

  onSelectChangeCliente(event: any): void {
    const selectValue = event.target.value;
    this.selectClient = selectValue;
    if (selectValue === 'esCliente') {
      this.mostrarContenido = false;
      this.esCliente = true;
    } else {
      this.esCliente = false;
      this.enviarCorreo = false;
      this.mostrarContenido = true;
    }
  }

  enviarCorreoCliente(): void {
    if (this.validarCorreo(this.correoCliente)) {
      this.enviarCorreo = true;
      const datos = {
        email: this.correoCliente
      };

      this.pedidosService.enviarCodioCorreo(datos).subscribe((item) => {
        this.toaster.open(item.message, {type: 'info'});
      });
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
      this.integracionesEnviosService.obtenerListaIntegracionesEnviosSinAuth({
        ciudad: this.integracionProducto.ciudad,
        ciudadDestino: this.notaPedido.get('facturacion').get('ciudad').value
      }).subscribe((result) => {
        this.parametros = result.info;
        if (result.cont === 0) {
          this.toaster.open(`No existe precio de envio desde ${this.integracionProducto.ciudad} hasta
          ${this.notaPedido.get('facturacion').get('ciudad').value}`, {type: 'info'});
        } else {
          this.toaster.open('Costos de envío cargados', {type: 'info'});
        }
      });
    }
  }

  onSelectFormaPago(e: any) {
    const selectValue = e.target.value;
    if (selectValue === 'Transferencia') {
      this.mostrarCargaComprobante = true;
    } else {
      this.mostrarCargaComprobante = false;
    }
  }

  protected readonly Number = Number;
}



