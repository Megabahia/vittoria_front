import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidacionesPropias} from "../../../utils/customer.validators";
import {ParamService as ParamServiceAdm} from "../../../services/admin/param.service";
import {PedidosService} from "../../../services/mp/pedidos/pedidos.service";
import {logger} from "codelyzer/util/logger";
import {Toaster} from "ngx-toast-notifications";
import {IntegracionesEnviosService} from "../../../services/admin/integraciones_envios.service";

interface ProductoProcesado {
  canal?: string;

  [key: string]: any; // Esto permite cualquier nombre de clave adicional
}

@Component({
  selector: 'app-consulta-productos',
  templateUrl: './consulta-productos.component.html',
  styleUrls: ['./consulta-productos.component.css']
})


export class ConsultaProductosComponent implements OnInit {

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

  datosCliente;

  page = 1;
  page_size: any = 3;
  parametros;

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private formBuilder: FormBuilder,
    private paramServiceAdm: ParamServiceAdm,
    private pedidosService: PedidosService,
    private toaster: Toaster,
    private integracionesEnviosService: IntegracionesEnviosService,
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

    this.obtenerListaParametros();
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
    console.log('NOTA PEDIDO INICIAL', this.notaPedido);
  }

  normalizarClave(clave: string): string {
    return clave.toLowerCase() // Convertir a minúsculas
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
      .replace(/[^a-z0-9_]/gi, '_'); // Reemplazar espacios y caracteres no alfanuméricos con guión bajo
  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      id: [''],
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
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['superbarato.megadescuento.com', []],
      estado: ['Pendiente', []],
      tipoEnvio: [this.seleccionPrimerCombo, [Validators.required]],
      tipoPago: [this.seleccionSegundoCombo],
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
    console.log(this.notaPedido);
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
    this.tipoIdentificacion = selectedValue

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
    const fechaActual = new Date();
    return fechaActual;
  }

  guardarVenta(): void {
    console.log(this.notaPedido.value);

    this.notaPedido.get('articulos').value.map((producto) => {
      delete producto.imagen_principal;
    });

    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    this.pedidosService.crearPedido(this.notaPedido.value).subscribe(result => {
      console.log('PEDIDO GUARDADO', result);
      this.toaster.open('Pedido guardado', {type: 'success'});
    }, error => this.toaster.open('Error al guardar pedido', {type: 'danger'}));
  }

  onChangeCombo(event: any): void {
    const newValue = event.target.value;
    this.seleccionPrimerCombo = newValue;
    if (newValue === 'envioServiEntrega' && newValue !== '') {
      this.seleccionSegundoCombo = 'tranferenciaDeposito'; // Asumiendo que deseas seleccionar esta opción si se elige 'envioServiEntrega'
    } else {
      this.seleccionSegundoCombo = 'eleccionCliente'; // Opción predeterminada para los otros casos
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
    if (selectValue === 'esCliente') {
      this.esCliente = true;
    } else {
      this.esCliente = false;
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
    console.log(this.codigoCorreo);
    const datos = {
      correo: this.correoCliente,
      codigo: this.codigoCorreo
    };
    this.pedidosService.verificarCodigoCorreo(datos).subscribe(data => {
      this.datosCliente = data;
      this.completarCamposCliente();
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

  async obtenerListaParametros(): Promise<void> {
    await this.integracionesEnviosService.obtenerListaIntegracionesEnvios(this.page - 1, this.page_size).subscribe((result) => {
      this.parametros = result.data;
    });
  }
}



