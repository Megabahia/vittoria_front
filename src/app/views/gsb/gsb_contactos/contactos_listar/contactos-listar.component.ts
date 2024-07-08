import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {ContactosService} from '../../../../services/mdm/personas/contactos/contactos.service';
import {SuperBaratoService} from '../../../../services/gsb/superbarato/super-barato.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {ValidacionesPropias} from "../../../../utils/customer.validators";

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
  datosContacto;
  canalSeleccionado = '';
  listaCanalesProducto;
  idSuperBarato;
  parametroIva;
  tipoIdentificacion;
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

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private contactoService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private superBaratoService: SuperBaratoService,
    private toaster: Toaster,
    private productosService: ProductosService,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'IVA', 'Impuesto de Valor Agregado').subscribe((result) => {
      this.parametroIva = parseFloat(result.info[0].valor);
    });
    /*this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'COMISION', 'Comision').subscribe((result) => {
      this.comision = parseFloat(result.info[0].valor);
    });*/
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
        tipoIdentificacion: [this.tipoIdentificacion, []],
        identificacion: ['', []],
        telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
        pais: [this.pais, [Validators.required]],
        provincia: ['', [Validators.required]],
        ciudad: ['', [Validators.required]],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      productoExtra: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      subtotal: [0],
      envioTotal: [0, []],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      verificarPedido: [true, []],
      canal: ['Super Barato'],
      estado: ['Entregado'],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
      numeroComprobante: [''],
      tipoPago: ['',],
      formaPago: ['',],
      numTransaccionTransferencia: [''],
      numTransaccionCredito: [''],
      totalCobroEfectivo: ['']
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

  get envioForm() {
    return this.notaPedido.get('envio')['controls'];
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

  crearDetalleGrupoProductoExtra(): any {
    return this.formBuilder.group({
      urlProducto: ['', [Validators.required]],
      valorUnitario: [0],
      cantidad: [0],
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
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
      canal: 'superbarato.megadescuento.com'
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
      canal: 'Super Barato'
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.idSuperBarato = info.info[0].id;
    });
  }


  obtenerDatosContacto(modal, id): void {
    this.modalService.open(modal, {size: 'xl', backdrop: 'static'});
    this.notaPedido.reset();

    this.contactoService.obtenerContacto(id).subscribe((info) => {
      this.horaPedido = this.extraerHora(info.created_at);
      this.canalPrincipal = info.canal;
      this.canalSeleccionado = this.canalPrincipal;

      info.articulos.map((item): void => {
        this.agregarItemExtra();
      });

      this.notaPedido.get('created_at').setValue(info.created_at);
      this.notaPedido.get('numeroPedido').setValue(this.generarID());
      this.notaPedido.get('metodoPago').setValue(info.metodoPago);
      this.notaPedido.get('facturacion').get('pais').setValue(this.pais);
      this.notaPedido.get('facturacion').get('nombres').setValue(info.nombres);
      this.notaPedido.get('facturacion').get('apellidos').setValue(info.apellidos);
      this.notaPedido.get('facturacion').get('telefono').setValue(info.whatsapp);
      this.notaPedido.get('productoExtra').setValue(info.articulos);

    });
  }

  async generarPedidoContacto(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    if (this.notaPedido.value.valorUnitario === 0) {
      this.toaster.open('Seleccione un precio que sea mayor a 0.', {type: 'danger'});
      return;
    }
    console.log(this.notaPedido)
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.superBaratoService.crearNuevoSuperBarato(this.notaPedido.value).subscribe((info) => {
          this.modalService.dismissAll();
          this.notaPedido.reset();

          this.notaPedido.patchValue({...info, id: this.idSuperBarato});
          this.obtenerDatosSuperBarato();

        }, error => this.toaster.open(error, {type: 'danger'})
      );
    }
  }

  async obtenerProducto(i): Promise<void> {
    if (this.canalSeleccionado === '') {
      this.toaster.open('Seleccione un canal y vuelva a buscar', {type: 'danger'});
      return;
    }
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
          this.detallesArray.controls[i].get('cantidad').setValidators([
            Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(info?.stock)
          ]);
          this.detallesArray.controls[i].get('cantidad').updateValueAndValidity();
          this.detallesArray.controls[i].get('canal').setValue(info.canal)
          this.detallesArray.controls[i].get('woocommerceId').setValue(info.woocommerceId)
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
        precios.push({clave: clave, valor: info[clave]});
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
    const detallesProductoExtra = this.detallesArrayProductoExtra.controls;
    let totalProdExtra = 0;
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
    detallesProductoExtra.forEach((item, index) => {
      const valorUnitario = parseFloat(detallesProductoExtra[index].get('valorUnitario').value || 0);
      const cantidad = parseFloat(detallesProductoExtra[index].get('cantidad').value || 0);
      detallesProductoExtra[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      totalProdExtra += parseFloat(detallesProductoExtra[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue((total + totalProdExtra).toFixed(2));
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

  openWhatsApp(event: Event, numero): void {
    event.preventDefault();
    const modifiedNumber = (numero.startsWith('0') ? numero.substring(1) : numero);
    const internationalNumber = '593' + modifiedNumber;
    //const imageUrl = encodeURIComponent(imagen);  // URL de la imagen que deseas enviar
    const whatsappUrl = `https://web.whatsapp.com/send/?phone=${internationalNumber}`;
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

}
