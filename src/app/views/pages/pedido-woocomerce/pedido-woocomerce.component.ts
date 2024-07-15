import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidacionesPropias} from "../../../utils/customer.validators";
import {ParamService as ParamServiceAdm} from "../../../services/admin/param.service";
import {PedidosService} from "../../../services/mp/pedidos/pedidos.service";
import {logger} from "codelyzer/util/logger";
import {Toaster} from "ngx-toast-notifications";

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

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private paramServiceAdm: ParamServiceAdm,
    private pedidosService: PedidosService,
    private toaster: Toaster,
  ) {
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
      cantidad: [datos.cantidad_en_el_carrito || 0],
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

    if (this.notaPedido.invalid){
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
}
