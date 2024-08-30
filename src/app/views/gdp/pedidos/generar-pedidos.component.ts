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
import {v4 as uuidv4} from 'uuid';
import {ClientesService} from "../../../services/mdm/personas/clientes/clientes.service";
import {ContactosService} from "../../../services/gdc/contactos/contactos.service";
import {ValidacionesPropias} from "../../../utils/customer.validators";
import {environment} from "../../../../environments/environment";
import html2canvas from 'html2canvas';
import {element} from "protractor";
import {Download} from "angular-feather/icons";

@Component({
  selector: 'app-generar-ventas',
  templateUrl: './generar-pedidos.component.html',
  styleUrls: ['generar-pedido.components.css'],
  providers: [DatePipe]
})
export class GenerarPedidosComponent implements OnInit, AfterViewInit {
  @Input() paises;

  public notaPedido: FormGroup;
  public autorizarForm: FormGroup;
  public rechazoForm: FormGroup;
  datosProducto: FormData = new FormData();

  productoDesdeConsulta: any;
  productoNuevoCodigo = '';

  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaContactos;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  verificarContacto = false;
  whatsapp = '';
  correo = '';
  usuarioActual;
  canalSeleccionado = 'megabahia.megadescuento.com';
  cedulaABuscar = '';
  clientes;
  cliente;
  cedula;
  parametroDireccion;
  descuentoCupon;
  myAngularxCode;
  fotoCupon;
  idContacto
  imagenCargada = false;
  diasValidosCupon;
  verDireccion = true;
  listaCanalesProducto;
  tipoIdentificacion;
  totalIva;
  hablilitarBotonGuardar = true;
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
  parametroIva;
  dataPedidoWoocommerce;
  mostrarFiltroCliente = true;
  mostrarInputNumPedido = false;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private clientesService: ClientesService,
    private contactosService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
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
      fechaPedido: ['', [Validators.required]],
    });

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'DIRECCIÓN', 'Dirección').subscribe((result) => {
      this.parametroDireccion = result.info[0].valor;
    });
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'CUPON', 'Descuento cupón').subscribe((result) => {
      this.descuentoCupon = result.info[0].valor;
    });
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'CUPON VALIDO', 'Cupón válido').subscribe((result) => {
      this.diasValidosCupon = parseInt(result.info[0].valor);
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
    this.canalSeleccionado = 'megabahia.megadescuento.com';
    this.iniciarNotaPedido();
    this.obtenerListaProductos();
    this.cedulaABuscar = '';
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
    this.obtenerProvincias();
    this.obtenerCiudad();

    if (localStorage.getItem('productoData')) {
      this.obtenerProductoDesdeConsulta();
    } else if (localStorage.getItem('productoDataPedidoWoocommerce')) {
      this.mostrarFiltroCliente = false;
      this.mostrarInputNumPedido = true;
      this.obtenerDatosPedidoWoocommerce();
    }

  }

  ngAfterViewInit(): void {
    this.obtenerContactos();
  }

  iniciarNotaPedido(): void {
    this.usuarioActual = JSON.parse(localStorage.getItem('currentUser'));
    this.notaPedido = this.formBuilder.group({
      id: [''],
      facturacion: this.formBuilder.group({
        nombres: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        apellidos: ['', [Validators.required, Validators.minLength(1), Validators.pattern('[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]+')]],
        correo: ['', [Validators.email]],
        identificacion: ['', []],
        tipoIdentificacion: [this.tipoIdentificacion, []],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: [this.pais, [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        codigoVendedor: [this.usuarioActual.usuario.username, []],
        nombreVendedor: [this.usuarioActual.full_name, []],
        comprobantePago: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      subtotal: [0],
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Pago Contra Entrega en Quito', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['Contacto Local', []],
      estado: ['Pendiente de entrega', []],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
      fotoCupon: ['', []]
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
      valorUnitario: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0, [Validators.required]],
      imagen: [''],
      caracteristicas: ['', []],
      precios: [[], []],
      canal: ['megabahia.megadescuento.com'],
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

  obtenerContactos(): void {
    this.contactosService.obtenerListaContactos({
      telefono: this.whatsapp,
      correo: this.correo,
      page: this.page - 1,
      page_size: this.pageSize,
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
      //estado: ['Pendiente'],
      canal: 'Contacto Local'
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaContactos = info.info;
      this.idContacto = info.info[0].id;
    });
  }

  crearNuevaVenta(modal): void {
    this.hablilitarBotonGuardar = true;
    this.canalSeleccionado = 'megabahia.megadescuento.com';
    this.iniciarNotaPedido();
    this.obtenerListaProductos();
    this.cedulaABuscar = '';
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }

  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  async guardarVenta(notaPedidoModal): Promise<void> {
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

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.hablilitarBotonGuardar = false;
      this.contactosService.crearNuevaVenta(this.notaPedido.value).subscribe((info) => {
          this.modalService.dismissAll();
          this.notaPedido.patchValue({...info, id: this.idContacto});
          this.obtenerContactos();
          this.abrirModalCupon(notaPedidoModal);
          this.myAngularxCode = `Numero de pedido: ${info.numeroPedido}`;
          this.toaster.open('Pedido creado. Creando cupón...', {type: 'info'});
          this.captureScreen();
          this.mostrarFiltroCliente = true;
          this.mostrarInputNumPedido = false;
        }, error => this.toaster.open(error, {type: 'danger'})
      );
      this.hablilitarBotonGuardar = true;
    } else {
      this.hablilitarBotonGuardar = true;
    }

  }

  obtenerListaProductos(): void {
    this.productosService.obtenerListaProductos(
      {
        page: this.page - 1,
        page_size: this.pageSize,
        nombre: '',
        codigoBarras: '',
      }
    ).subscribe((info) => {
      this.listaCanalesProducto = info.canal;
    });
  }

  async obtenerProducto(i): Promise<void> {
    if (this.canalSeleccionado === '') {
      this.toaster.open('Seleccione un canal y vuelva a buscar', {type: 'danger'});
      return;
    }
    return new Promise((resolve, reject) => {
      const data = {
        codigoBarras: this.detallesArray.value[i].codigo,
        //canalProducto: this.detallesArray.value[i].canal ? this.detallesArray.value[i].canal : this.canalSeleccionado,
        canal: this.canalSeleccionado,
        //valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigoCanal(data).subscribe((info) => {
        //if(info.mensaje==''){
        if (info.producto.codigoBarras) {
          this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
          this.detallesArray.controls[i].get('id').setValue(info.producto.id);
          this.detallesArray.controls[i].get('articulo').setValue(info.producto.nombre);
          this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
          this.detallesArray.controls[i].get('precios').setValue([...this.extraerPrecios(info.producto)]);
          const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value);
          this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
          this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
          this.detallesArray.controls[i].get('imagen').setValue(info.producto?.imagen);
          this.detallesArray.controls[i].get('imagen_principal').setValue(info.producto?.imagen_principal);
          this.detallesArray.controls[i].get('cantidad').setValidators([
            Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info.producto?.stock)
          ]);
          this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
          this.detallesArray.controls[i].get('canal').setValue(info.producto.canal);
          this.detallesArray.controls[i].get('woocommerceId').setValue(info.producto.woocommerceId);
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
        precios.push({clave: clave, valor: info[clave] ? info[clave] : 0});
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
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
  }

  async actualizar(): Promise<void> {
    this.archivo.delete('id');
    this.archivo.delete('fotoCupon');
    this.archivo.append('id', this.idContacto)
    this.archivo.append('fotoCupon', this.fotoCupon);

    this.contactosService.actualizarVentaFormData(this.archivo).subscribe((info) => {
      delete info.articulos;
      this.notaPedido.patchValue({...info});
      this.toaster.open('Cupón creado. Captura realizada', {type: 'info'});
      this.imagenCargada = true;

    }, error => this.toaster.open(error, {type: 'danger'}));

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

  validarDatos(): void {
    if (this.notaPedido.value.facturacion.tipoIdentificacion === null && this.notaPedido.value.facturacion.identificacion !== '') {
      this.notaPedido.get('facturacion').get('tipoIdentificacion').setValidators([Validators.required]);
      this.notaPedido.get('facturacion').get('tipoIdentificacion').updateValueAndValidity();
    } else {
      this.notaPedido.get('facturacion').get('tipoIdentificacion').setValidators([]);
      this.notaPedido.get('facturacion').get('tipoIdentificacion').updateValueAndValidity();
    }
    this.contactosService.validarCamposContacto(this.notaPedido.value).subscribe((info) => {
    }, error => this.toaster.open(error, {type: 'danger'}));
  }

  obtenerClienteCedula(): void {

    if (this.cedulaABuscar !== '') {
      this.clientesService.obtenerClientePorCedula({cedula: this.cedulaABuscar}).subscribe((info) => {
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
      this.toaster.open('Ingrese una cédula', {type: 'danger'});
      return;
    }
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
          }, error => this.toaster.open('No se pudo actualizar la imagen.', {type: "danger"}));
        } catch (error) {
          this.toaster.open('Error al actualizar la imagen.', {type: "danger"});
        }
      };
      reader.readAsDataURL(archivo);

    }
  }

  validarCedulaInicial(e) {
    if (e.target.value === '') {
      this.notaPedido.get('facturacion').get('identificacion').setValidators([]);
    } else {
      this.notaPedido.get('facturacion').get('identificacion').setValidators([Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$'),
        ValidacionesPropias.cedulaValido
      ]);
    }
    this.notaPedido.get('facturacion').get('identificacion').updateValueAndValidity();
  }

  fechaValidez(): string {
    const fecha = new Date(this.notaPedido.value.created_at);
    const dia = fecha.getDate() + this.diasValidosCupon;
    const mes = fecha.getMonth() + 1;
    const anio = fecha.getFullYear();

    return dia.toString().padStart(2, '0') + '-' + mes.toString().padStart(2, '0') + '-' + anio;
  }


  abrirModalCupon(modal): void {
    this.imagenCargada = false

    this.modalService.open(modal, {size: 'lg', backdrop: 'static'})
  }

  captureScreen() {
    const data = document.getElementById('notaPedidoContent');
    if (data) {
      setTimeout(() => {
        html2canvas(data, {
          scale: 2,
          backgroundColor: null,
        }).then(canvas => {
          canvas.style.filter = 'brightness(150%)';
          const imgData = canvas.toDataURL('image/png');
          this.fotoCupon = this.base64ToFile(imgData, `pedido_${this.notaPedido.value.numeroPedido}.png`, 'image/png');
          this.notaPedido.value.fotoCupon = imgData;
          this.actualizar();
        });
      }, 3000);
    }
  }

  base64ToFile(base64, filename, contentType) {
    const arr = base64.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: contentType});
  }

  openWhatsApp(event: Event): void {
    event.preventDefault();
    const numero = this.notaPedido.value.facturacion.telefono;
    const modifiedNumber = (numero.startsWith('0') ? numero.substring(1) : numero);
    const internationalNumber = '593' + modifiedNumber;
    const message = encodeURIComponent(`Sr.(a)(ita). ${this.notaPedido.value.facturacion.nombres} ${this.notaPedido.value.facturacion.apellidos}\n\nMuchas gracias por confiar en nosotros, su pedido estará listo para que usted pase retirando en nuestro punto de entrega.\n\nEncuéntranos en QUITO: Av. 10 de Agosto N39-201 y José Arizaga, Sector La Y, frente al Hipermercado CORAL y junto a la Clínica AXXIS.\n\n${this.parametroDireccion}\n\n*Cuando usted retire su pedido, presentando la siguiente imagen usted  OBTIENE un 10% de ¡DESCUENTO ADICIONAL!*\n\n${this.notaPedido.value.fotoCupon}`);
    //const imageUrl = encodeURIComponent(imagen);  // URL de la imagen que deseas enviar
    const whatsappUrl = `https://web.whatsapp.com/send/?phone=${internationalNumber}&text=${message}`;
    window.open(whatsappUrl, '_blank');  // Abrir WhatsApp en una nueva pestaña
  }

  descargarImagen(): void {
    window.open(this.notaPedido.value.fotoCupon, 'Download');
  }

  onSelectChange(e: any) {
    const value = e.target.value;
    this.canalSeleccionado = value;
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

  obtenerProductoDesdeConsulta() {
    const data = localStorage.getItem('productoData');
    if (data) {
      this.productoDesdeConsulta = JSON.parse(data);
      this.agregarItem();
      this.detallesArray.controls[0].get('codigo').setValue(this.productoDesdeConsulta.codigoBarras);
      this.obtenerProducto(0);
      localStorage.removeItem('productoData');
    }
  }

  async obtenerDatosPedidoWoocommerce() {
    const data = localStorage.getItem('productoDataPedidoWoocommerce');
    if (data) {
      this.dataPedidoWoocommerce = JSON.parse(data);
      this.notaPedido.patchValue({...this.dataPedidoWoocommerce});
      this.dataPedidoWoocommerce.articulos.map((datos, index) => {
        this.agregarItem();
        this.detallesArray.controls[index].get('codigo').setValue(datos.codigo);
        this.obtenerProducto(index);
      });
      this.obtenerCiudad();
      //this.obtenerSector();

      //this.notaPedido.get('numeroPedido').setValue(this.generarID());
      this.notaPedido.get('canal').setValue('Contacto Local');
      this.notaPedido.get('estado').setValue('Pendiente de entrega');
      localStorage.removeItem('productoDataPedidoWoocommerce');
    }

  }


  /*obtenerSector(): void {
    this.paramServiceAdm.obtenerListaHijos(this.notaPedido.value.ciudad, 'CIUDAD').subscribe((info) => {
      this.sectorOpciones = info;
    });
  }*/
}

