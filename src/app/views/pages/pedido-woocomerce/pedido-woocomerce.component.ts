import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidacionesPropias} from "../../../utils/customer.validators";
import {ParamService as ParamServiceAdm} from "../../../services/admin/param.service";

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
      const decodedString = decodeURIComponent(params.cadena);
      const lines = decodedString.split('\n');

      const product = {};

      lines.forEach(line => {
        const [key, value] = line.split(': ');
        if (value) {
          let cleanValue = value.trim();

          // Extraer la URL de la imagen del producto
          if (key.includes('Imagen_del_producto')) {
            const urlMatch = /src="(.*?)"/.exec(cleanValue);
            cleanValue = urlMatch ? urlMatch[1] : '';
          }

          // Limpiar y convertir los valores de los campos de precio
          if (key.includes('Total_del_artículo') || key.includes('Subtotal_del_artículo')) {
            cleanValue = cleanValue.replace(/<[^>]*>?/gm, ''); // Elimina etiquetas HTML
            cleanValue = cleanValue.replace(/&#36;/g, ''); // Elimina referencias codificadas a símbolos monetarios
            const matches = cleanValue.match(/[0-9]+,[0-9]{2}/); // Encuentra números con formato `9,00`
            cleanValue = matches ? matches[0] : '0.00'; // Usa el número encontrado o '0.00' si no se encuentra nada
          }

          product[key.trim().replace('á', 'a').replace('é', 'e')] = cleanValue; // Ajustar claves para remover tildes
        }
      });

      this.datos.push(product);
    });

    this.obtenerProvincias();
    this.obtenerCiudad();
    console.log('NOTA PEDIDO INICIAL', this.notaPedido);
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
      codigo: [''],
      articulo: [''],
      valorUnitario: [datos.line_total || 0],
      cantidad: [datos.quantity || 0],
      precio: [datos.line_subtotal || 0],
      imagen: [''],
      caracteristicas: [''],
      precios: [[]],
      canal: ['superbarato.megadescuento.com'],
      woocommerceId: [''],
      imagen_principal: ['']
    });
  }

  agregarItem(datos: any): void {
    const detalle = this.crearDetalleGrupo(datos)
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
