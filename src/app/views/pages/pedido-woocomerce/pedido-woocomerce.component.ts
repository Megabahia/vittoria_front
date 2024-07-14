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
    { id: 1, valor: 'Opción 1' },
    { id: 2, valor: 'Opción 2' },
    { id: 3, valor: 'Opción 3' }
  ];

  opcionesSegundoCombo = [
    { id: 1, valor: 'A' },
    { id: 2, valor: 'B' },
    { id: 3, valor: 'C' }
  ];

  @Input() paises;
  public notaPedido: FormGroup;

  tipoIdentificacion;
  datos;
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

      const datosReorganizados = [];

      // Usar un mapa temporal para organizar los datos por ID
      const tempData = {};

      // Iterar sobre todas las claves del objeto 'params'
      Object.keys(params).forEach(key => {
        // Extraer el identificador del ítem
        const match = key.match(/^([a-f0-9]+)\[/);
        if (match) {
          const id = match[1];
          // Asegurarse de que hay un objeto inicializado para este ID
          if (!tempData[id]) {
            tempData[id] = {id: id}; // Almacena también el ID si es necesario
          }
          // Extraer el nombre de la propiedad (todo lo que está después del [ y antes del ])
          const propName = key.match(/\[([^)]+)\]/)[1];
          // Asignar el valor a la propiedad adecuada del objeto correspondiente al ID
          tempData[id][propName] = params[key];
        }
      });

      // Convertir el objeto de datos temporales en un arreglo
      for (const key in tempData) {
        datosReorganizados.push(tempData[key]);
        this.agregarItem(tempData[key]);
      }
      this.datos = datosReorganizados;
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

  guardarVenta(): void{
    console.log(this.notaPedido.value);
  }

  onChangeCombo(event: any): void {
    const newValue = event.target.value;
    // Actualizar el ngModel del primer combo
    this.seleccionPrimerCombo = newValue;
    console.log("Seleccionado en Primer Combo:", this.seleccionPrimerCombo);

    // Encontrar el objeto correspondiente en el segundo combo
    const seleccionEnSegundo = this.opcionesSegundoCombo.find(x => x.id === Number(newValue));

    // Asegurarse de que el segundo combo use solo el ID o el valor necesario para el ngModel
    if (seleccionEnSegundo) {
      this.seleccionSegundoCombo = seleccionEnSegundo.id;  // Asumiendo que quieres asignar el ID
      console.log("Valor automático para Segundo Combo:", seleccionEnSegundo.valor);
    }
  }
}
