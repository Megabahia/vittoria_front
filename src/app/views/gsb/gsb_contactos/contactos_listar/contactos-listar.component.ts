import {AfterViewInit, Component, Input, OnInit, ViewChild, Inject, LOCALE_ID} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';
import {formatDate} from '@angular/common';
import {Router, NavigationExtras} from '@angular/router';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {ContactosService} from '../../../../services/mdm/personas/contactos/contactos.service';
import {SuperBaratoService} from '../../../../services/gsb/superbarato/super-barato.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {ValidacionesPropias} from '../../../../utils/customer.validators';
import {GdParamService} from '../../../../services/gsb/param/param.service';
import {AuthService} from '../../../../services/admin/auth.service';
import {PedidosService} from "../../../../services/mp/pedidos/pedidos.service";

@Component({
  selector: 'app-gsb-contactos-listar',
  templateUrl: './contactos-listar.component.html',
  styleUrls: ['contactos-listar.component.css'],
  providers: [DatePipe]
})
export class ContactosListarComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  public notaPedido: FormGroup;
  public rechazoForm: FormGroup;
  datosProducto: FormData = new FormData();

  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaContacto;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  sector = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  whatsapp = '';
  nombre = '';
  apellido = ''
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  totalIva;
  horaContactoVenta;
  listaCanalesProducto;
  idSuperBarato;
  parametroIva;
  tipoIdentificacion;
  estadoGestionSeleccionado = '';
  idContacto;
  currentUserValue;
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
  canalPrincipal = '';
  parametroTiempo;
  listaEstadoContacto;
  columnaAcciones = false;
  listaCostoEnvio;
  listaMetodoPago;
  mostrarInputArchivoComprobante = false;
  formaEntrega;
  cuentaBancaria;
  mostrarBotonEnviarGDP = false;
  mostrarBoton = true;
  sectorOpciones;
  desabilitarDescuento = false;
  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private contactoService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private superBaratoService: SuperBaratoService,
    private toaster: Toaster,
    private productosService: ProductosService,
    private paramServiceMdm: GdParamService,
    private router: Router,
    private authService: AuthService,
    private pedidosService: PedidosService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.currentUserValue = this.authService.currentUserValue;
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'IVA', 'Impuesto de Valor Agregado').subscribe((result) => {
      this.parametroIva = parseFloat(result.info[0].valor);
    });

    this.paramServiceMdm.obtenerListaParametrosGd({
      page: this.page - 1,
      page_size: this.pageSize,
      tipo: 'TIEMPO',
      nombre: 'Tiempo Venta'
    }).subscribe((result) => {
      // tslint:disable-next-line:radix
      this.parametroTiempo = parseInt(result.info[0].valor);
    });
    /*this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'COMISION', 'Comision').subscribe((result) => {
      this.comision = parseFloat(result.info[0].valor);
    });*/

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'ESTADO CONTACTO', '').subscribe((result) => {
      this.listaEstadoContacto = result.data;
    });


  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    this.obtenerProvincias();
    this.obtenerCiudad();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerContactos();

  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      id: ['', []],
      facturacion: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.required, Validators.email]],
        tipoIdentificacion: [this.tipoIdentificacion, [Validators.required]],
        identificacion: ['', []],
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
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      productoExtra: this.formBuilder.array([]),
      total: ['', [Validators.required]],
      subtotal: [0],
      envioTotal: [0, []],
      numeroPedido: ['', [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['', [Validators.required]],
      verificarPedido: [false, []],
      canal: [''],
      estado: ['Pendiente'],
      envio: this.formBuilder.group({
        nombres: [''],
        apellidos: [''],
        correo: [''],
        tipoIdentificacion: [''],
        identificacion: [''],
        telefono: [''],
        pais: [this.pais],
        provincia: [''],
        ciudad: [''],
        sector: [''],
        callePrincipal: [''],
        numero: [''],
        calleSecundaria: [''],
        referencia: [''],
        gps: [''],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
      }),
      archivoMetodoPago: [''],
      montoPrevioPago: [''],
      nombreEnvio: [''],
      comision: [0]
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerContactos();
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

  get detallesArrayProductoExtra(): FormArray {
    return this.notaPedido.get('productoExtra') as FormArray;
  }

  crearDetalleGrupo(): any {
    return this.formBuilder.group({
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
      imagen_principal: ['', [Validators.required]],
      prefijo: ['', []],
      porcentaje_comision: [0],
      valor_comision: [0],
      monto_comision: [0]
    });
  }

  crearDetalleGrupoProductoExtra(): any {
    return this.formBuilder.group({
      urlProducto: ['', [Validators.required]],
      valorUnitario: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0],
    });
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  agregarItemExtra(): void {
    this.detallesArrayProductoExtra.push(this.crearDetalleGrupoProductoExtra());
  }

  removerItem(i): void {
    this.detallesArray.removeAt(i);
    this.calcular();
  }

  removerItemExtra(i): void {
    this.detallesArrayProductoExtra.removeAt(i);
    this.calcular();
  }

  obtenerContactos(): void {
    this.contactoService.obtenerLista({
      page: this.page - 1,
      page_size: this.pageSize,
      estado: ['NUEVO', 'CONTACTO FALSO', 'EN PROCESO DE VENTA']
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaContacto = info.info;
    });
  }

  obtenerDatosSuperBarato(): void {
    this.superBaratoService.obtenerListaSuperBarato({
      telefono: '',
      correo: '',
      page: this.page - 1,
      page_size: this.pageSize,
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
      //estado: ['Pendiente'],
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.idSuperBarato = info.info[0].id;
    });
  }


  obtenerDatosContacto(modal, id, canal): void {
    this.iniciarNotaPedido();
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'METODO PAGO', '', canal).subscribe((result) => {
      this.listaMetodoPago = result.data; // Asegura que el resultado sea siempre un array
    });

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'CUENTA BANCARIA', '').subscribe((result) => {
      this.cuentaBancaria = result.info[0];
    });

    this.notaPedido.reset();
    //this.detallesArrayProductoExtra.clear();

    this.modalService.open(modal, {size: 'xl', backdrop: 'static'});

    this.contactoService.obtenerContacto(id).subscribe((info) => {
      this.idContacto = info.id;
      this.horaPedido = this.extraerHora(info.created_at);
      this.canalPrincipal = info.canal;

      info.articulos.map((item): void => {
        this.agregarItemExtra();
      });

      this.notaPedido.get('created_at').setValue(info.created_at);
      this.notaPedido.get('numeroPedido').setValue(this.generarID());
      this.notaPedido.get('metodoPago').setValue(info.metodoPago);
      this.notaPedido.get('facturacion').get('pais').setValue(this.pais);
      this.notaPedido.get('facturacion').get('codigoVendedor').setValue(this.currentUserValue.usuario.username);
      this.notaPedido.get('facturacion').get('nombreVendedor').setValue(this.currentUserValue.full_name);
      this.notaPedido.get('facturacion').get('nombres').setValue(info.nombres);
      this.notaPedido.get('facturacion').get('apellidos').setValue(info.apellidos);
      this.notaPedido.get('facturacion').get('telefono').setValue(info.whatsapp);
      this.notaPedido.get('productoExtra').setValue(info.articulos);

      this.notaPedido.get('metodoPago').setValue('');
      this.notaPedido.get('verificarPedido').setValue(false);
      this.notaPedido.get('canal').setValue(info.canal);
      this.notaPedido.get('estado').setValue('Pendiente');
      this.notaPedido.get('envioTotal').setValue(0);

      this.calcular();

    });
  }

  async generarPedidoContacto(): Promise<void> {
    /*await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));*/
    if (this.notaPedido.value.valorUnitario === 0) {
      this.toaster.open('Seleccione un precio que sea mayor a 0.', {type: 'danger'});
      return;
    }
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (this.notaPedido.value.total > 100) {
      this.toaster.open('El pedido no debe exceder el total de 100 dólares.', {type: 'warning'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.mostrarSpinner = true;
      this.notaPedido.get('envio').patchValue({...this.notaPedido.value.facturacion});

      const facturaFisicaValores: string[] = Object.values(this.notaPedido.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.notaPedido.value);

      facturaFisicaLlaves.map((llaves, index) => {
        if (llaves !== 'archivoMetodoPago') {
          if (llaves === 'articulos' || llaves === 'facturacion' || llaves === 'envio' || llaves === 'productoExtra') {
            this.archivo.delete(llaves);
            this.archivo.append(llaves, JSON.stringify(facturaFisicaValores[index]));
          } else {
            this.archivo.delete(llaves);
            this.archivo.append(llaves, facturaFisicaValores[index]);
          }
        }
      });

      this.archivo.delete('id');
      this.archivo.delete('productoExtra');

      if (!this.notaPedido.value.montoPrevioPago) {
        this.archivo.delete('montoPrevioPago');
      }

      /*this.superBaratoService.crearNuevoSuperBarato(this.archivo).subscribe((info) => {
          //ACTUALIZAR ESTADO DE CONTACTO
          this.contactoService.actualizarEstadoContacto(this.idContacto, 'CONCRETADO').subscribe((data) => {
            this.columnaAcciones = true;
            this.toaster.open('Estado del contacto actualizado.', {type: 'success'});
          }, error => {
            this.toaster.open(error, {type: 'danger'});
          });
          this.modalService.dismissAll();
          this.obtenerContactos();
          /*this.notaPedido.reset();

          this.notaPedido.patchValue({...info, id: this.idSuperBarato});

          this.contactoService.actualizarEstadoContacto(this.idContacto, 'CONCRETADO VENTA').subscribe((data) => {
            this.obtenerContactos();
          }, error => {
            this.toaster.open(error, {type: 'danger'});
          });

          // this.obtenerDatosSuperBarato();

        }, error => this.toaster.open(error, {type: 'danger'})
      );*/
      this.pedidosService.crearPedidoSuperBarato(this.archivo).subscribe(result => {
        //ACTUALIZAR ESTADO DE CONTACTO
        this.contactoService.actualizarEstadoContacto(this.idContacto, 'CONCRETADO').subscribe((data) => {
          this.columnaAcciones = true;
          this.toaster.open('Estado del contacto actualizado.', {type: 'success'});
        }, error => {
          this.toaster.open(error, {type: 'danger'});
        });
        this.modalService.dismissAll();
        this.obtenerContactos();
        this.toaster.open('Pedido enviado', {type: 'success'});
        this.mostrarSpinner = false;
      }, error => {
        this.mostrarSpinner = false;
        this.toaster.open('Error al guardar pedido', {type: 'danger'})
      });
    }
  }

  async obtenerProducto(i): Promise<void> {
    if (this.canalPrincipal === '') {
      this.toaster.open('Seleccione un canal y vuelva a buscar', {type: 'danger'});
      return;
    }
    return new Promise((resolve, reject) => {
      const data = {
        codigoBarras: this.detallesArray.value[i].codigo,
        canalProducto: this.canalPrincipal,
        canal: this.canalPrincipal,
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        //if(info.mensaje==''){
        if (info.codigoBarras) {
          //this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
          //this.detallesArray.controls[i].get('id').setValue(info.id);
          this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
          this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
          this.detallesArray.controls[i].get('precios').setValue([...this.extraerPrecios(info)]);
          const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value);
          this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto);
          this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
          this.detallesArray.controls[i].get('imagen').setValue(info?.imagen);
          this.detallesArray.controls[i].get('imagen_principal').setValue(info?.imagen_principal);
          this.detallesArray.controls[i].get('cantidad').setValidators([
            Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info?.stock)
          ]);
          this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
          this.detallesArray.controls[i].get('porcentaje_comision').setValue(info?.porcentaje_comision);
          this.detallesArray.controls[i].get('valor_comision').setValue(info?.valor_comision);
          this.detallesArray.controls[i].get('canal').setValue(info.canal);
          this.detallesArray.controls[i].get('monto_comision').setValue(0);
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
      });
    });
  }

  extraerPrecios(info: any) {
    const precios = [];
    Object.keys(info).forEach(clave => {
      if (clave.startsWith('precioVenta')) {
        precios.push({clave: clave, valor: parseFloat(info[clave])});
      }
    });
    return precios;
  }

  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }


  calcular(): void {
    const detalles = this.detallesArray.controls;
    //const detallesProductoExtra = this.detallesArrayProductoExtra.controls;
    //let totalProdExtra = 0;
    let total = 0;
    let comisionTotal = 0;
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
      const montoComision = this.calculoComision(detalles[index].get('porcentaje_comision').value, detalles[index].get('valor_comision').value, detalles[index].get('precio').value, cantidad);
      detalles[index].get('monto_comision').setValue(montoComision);
      comisionTotal += parseFloat(detalles[index].get('monto_comision').value);

    });
    /*detallesProductoExtra.forEach((item, index) => {
      const valorUnitario = parseFloat(detallesProductoExtra[index].get('valorUnitario').value || 0);
      const cantidad = parseFloat(detallesProductoExtra[index].get('cantidad').value || 0);
      detallesProductoExtra[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      totalProdExtra += parseFloat(detallesProductoExtra[index].get('precio').value);
    });*/

    total = total + this.notaPedido.get('envioTotal').value;
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue((total).toFixed(2));
    this.notaPedido.get('comision').setValue(comisionTotal.toFixed(2));

  }

  calculoComision(porcentaje, valor, precioProducto, cantidad) {
    if (valor) {
      return (parseFloat(valor) * parseFloat(cantidad)).toFixed(2);
    } else {
      return ((parseFloat(porcentaje) * parseFloat(precioProducto)) / 100).toFixed(2);
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
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mes}-${anio}`;
  }

  generarID(): string {
    const numeroAleatorio = Math.floor(Math.random() * 1000000);
    return numeroAleatorio.toString().padStart(8, '0');
  }

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

  openWhatsApp(event: Event, numero, nombre, apellido): void {
    event.preventDefault();
    const modifiedNumber = (numero.startsWith('0') ? numero.substring(1) : numero);
    const internationalNumber = '593' + modifiedNumber;
    const message = encodeURIComponent(`Hola Sr.(a)(ita). ${nombre} ${apellido}\n\nLe saludamos desde MEGA BAHIA, nos comunicamos con usted por su interés en el producto: *XXXXXXXX* que se encuentra con *precio OFERTA $XX.XX*.🚨🚨\n\n*Por su SEGURIDAD usted paga al momento de recibir su producto.*\n\n¿En qué dirección desea que le hagamos la entrega?🤗📍`);
    const whatsappUrl = `https://web.whatsapp.com/send/?phone=${internationalNumber}&text=${message}`;
    window.open(whatsappUrl, '_blank');  // Abrir WhatsApp en una nueva pestaña
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
    this.tipoIdentificacion = selectedValue;

  }

  enmarcarNumeroTelefono(numero: any): string {
    if (numero.length <= 4) {
      return numero;
    }
    const ultimosDigitos = numero.slice(-4);
    const numerosEnmascarados = numero.slice(0, -4).replace(/./g, '*');
    return numerosEnmascarados + ultimosDigitos;
  }

  calcularTiempoConcretar(contacto: any): string {
    const fechaContacto = new Date(contacto.created_at);
    fechaContacto.setMinutes(fechaContacto.getMinutes() + this.parametroTiempo);
    return formatDate(fechaContacto, 'HH:mm:ss', this.locale);
  }

  esTiempoSobrepasado(contacto: any): boolean {
    const fechaContacto = new Date(contacto.created_at);
    fechaContacto.setMinutes(fechaContacto.getMinutes() + this.parametroTiempo);
    const tiempoConcretar = fechaContacto;
    const ahora = new Date();
    return ahora > tiempoConcretar;
  }

  actualizarEstadoContacto(contacto, estado) {
    this.contactoService.actualizarEstadoContacto(contacto.id, estado).subscribe((data) => {
      this.columnaAcciones = true;
      this.toaster.open('Estado del contacto actualizado.', {type: 'success'});
      this.obtenerContactos();
    }, error => {
      this.toaster.open(error, {type: 'danger'});
    });
  }

  guardarEstadoGestion(contacto) {
    const fechaActual = new Date();
    this.contactoService.actualizarEstadoGestionContacto(contacto.id, contacto.estadoGestion, fechaActual).subscribe((data) => {
      this.columnaAcciones = true;
      this.toaster.open('Estado del contacto actualizado.', {type: 'success'});
      this.obtenerContactos();
    }, error => {
      this.toaster.open(error, {type: 'danger'});
    });
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

  consultarProductos(canal) {
    const navigationExtras: NavigationExtras = {
      queryParams: {canalContacto: canal}
    };

    // Navegar al componente de destino con datos
    this.router.navigate(['/gd/gd_consulta_productos'], navigationExtras);
  }

  obtenerMetodoPago(nombre) {
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'METODO PAGO', nombre).subscribe((result) => {
      this.formaEntrega = result.data[0];
    });
  }

  onSelectChangePago(e: any) {
    const selectedValue = e.target.value;
    this.resetValidationAndFlags(); // Resetear validaciones y flags antes de aplicar condiciones específicas

    if (selectedValue.includes('Previo Pago')) {
      this.handlePrevioPago();
      this.handleDefault();
    } else if (selectedValue.includes('Retiro')) {
      this.handleRetiroEnLocal();
      alert("Nota: La forma de entrega del pedido es Retiro en Local, al completar el pedido se enviará al local para que el cliente se acerque a retirar.");
    } else {
      this.handleDefault();
    }

    this.updateEnvioList(selectedValue);
    this.obtenerMetodoPago(selectedValue);
  }

  private handleDefault() {
    this.mostrarBoton = true;
    this.mostrarBotonEnviarGDP = false;
    this.desabilitarDescuento = false;

    this.notaPedido.get('facturacion')['controls']['pais'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['pais'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['provincia'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['provincia'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['ciudad'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['ciudad'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['sector'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['sector'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['tipoIdentificacion'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['tipoIdentificacion'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['callePrincipal'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['callePrincipal'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['numero'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['numero'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['calleSecundaria'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['calleSecundaria'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['referencia'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['referencia'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['correo'].setValidators([Validators.required]);
    this.notaPedido.get('facturacion')['controls']['correo'].updateValueAndValidity();

  }

  private handleRetiroEnLocal() {
    this.mostrarBotonEnviarGDP = true;
    this.mostrarBoton = false;
    this.desabilitarDescuento = true;
    this.notaPedido.get('facturacion')['controls']['pais'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['pais'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['provincia'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['provincia'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['ciudad'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['ciudad'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['sector'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['sector'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['correo'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['correo'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['tipoIdentificacion'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['tipoIdentificacion'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['identificacion'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['callePrincipal'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['callePrincipal'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['numero'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['numero'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['calleSecundaria'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['calleSecundaria'].updateValueAndValidity();
    this.notaPedido.get('facturacion')['controls']['referencia'].setValidators([]);
    this.notaPedido.get('facturacion')['controls']['referencia'].updateValueAndValidity();
  }

  private resetValidationAndFlags() {
    this.notaPedido.get('archivoMetodoPago').setValidators([]);
    this.notaPedido.get('montoPrevioPago').setValidators([]);
    this.notaPedido.get('archivoMetodoPago').updateValueAndValidity();
    this.notaPedido.get('montoPrevioPago').updateValueAndValidity();
    this.archivo.delete('archivoMetodoPago');
    this.mostrarInputArchivoComprobante = false;
  }

  private handlePrevioPago() {
    this.mostrarInputArchivoComprobante = true;
    this.notaPedido.get('archivoMetodoPago').setValidators([Validators.required]);
    this.notaPedido.get('montoPrevioPago').setValidators([Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]);
    this.notaPedido.get('archivoMetodoPago').updateValueAndValidity();
    this.notaPedido.get('montoPrevioPago').updateValueAndValidity();
  }

  private updateEnvioList(selectedValue: string) {
    const pattern = /Retiro|Pago Contra Entrega a Nivel Nacional por Servientrega/i;

    this.paramServiceAdm.obtenerListaHijosEnvio(this.notaPedido.value.metodoPago).subscribe((result) => {
      this.listaCostoEnvio = pattern.test(selectedValue)
        ? result
        : result.filter(envio => envio.nombre !== "Gratis");
    });
  }

  onFileSelected(event: any): void {
    this.archivo.append('archivoMetodoPago', event.target.files.item(0), event.target.files.item(0).name);
    this.notaPedido.get('archivoMetodoPago').setValue(event.target.files.item(0).name);
  }

  nombreEnvioSeleccionado(envio: any) {
    const selectedValue = envio.target.value;
    let [nombre, valor] = selectedValue.split('-').map(part => part.trim());
    valor = parseFloat(valor);
    this.notaPedido.get('envioTotal').setValue(valor ? valor : 0);
    this.notaPedido.get('nombreEnvio').setValue(nombre);
    this.calcular();

  }

  generarPedido(): void {
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    this.notaPedido.removeControl('productoExtra');

    // Acceder a los valores actuales del formulario
    const formData = this.notaPedido.value;

    // Extraer los artículos del primer objeto de 'pedidos' y asignarlos a 'articulos'

    //const articulos = this.notaPedido.value.articulos;
    //formData.articulos.push(...articulos); // Aquí expandimos el array de artículos directamente


    localStorage.setItem('pedidoConcretarVenta', JSON.stringify(formData));
    this.modalService.dismissAll();
    //window.open('#/gdp/pedidos/woocommerce');
    window.location.href = '#/gdp/pedidos';

  }

  obtenerSector(): void {
    //if (this.notaPedido.value.facturacion.ciudad !== 'Quito') {
    //  this.sectorOpciones = [{nombre: this.notaPedido.value.facturacion.ciudad}];
    //} else {
    this.paramServiceAdm.obtenerListaHijos(this.notaPedido.value.facturacion.ciudad, 'CIUDAD').subscribe((info) => {
      this.sectorOpciones = info;
    });
    //}
  }

}
