import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
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
import {ProspectosService} from "../../../services/mdm/prospectosCli/prospectos.service";
import {ContactosService} from "../../../services/gdc/contactos/contactos.service";
import {logger} from "codelyzer/util/logger";
import {ValidacionesPropias} from "../../../utils/customer.validators";

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['contacto.component.css'],
  providers: [DatePipe]
})
export class ContactoComponent implements OnInit, AfterViewInit {
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
  nombre = '';
  apellido=''
  numPedido = ''
  mostrarInputComprobante = false;
  mostrarCargarArchivo = false;
  mostrarInputTransaccion = false;
  mostrarInputCobro = false;
  fileToUpload: File | null = null;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  totalIva;
  parametroIva
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
    private pedidosService: PedidosService,
    private contactosService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private toaster: Toaster,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaPedido();
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
      id: ['', [Validators.required]],
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
        //callePrincipal: ['', [Validators.required]],
        //numero: ['', [Validators.required]],
        //calleSecundaria: ['', [Validators.required]],
        //referencia: ['', [Validators.required]],
        //gps: ['', []],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      articulos: this.formBuilder.array([], Validators.required),
      total: ['', [Validators.required]],
      subtotal: [0],
      envioTotal: [0, [Validators.required]],
      numeroPedido: [this.generarID(), [Validators.required]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      verificarPedido: [true, [Validators.required]],
      canal: ['Contacto Local'],
      estado: ['Entregado'],
      envio: ['', []],
      envios: ['', []],
      json: ['', []],
      numeroComprobante: [''],
      tipoPago: [''],
      formaPago: [''],
      numTransaccionTransferencia: [''],
      totalCobroEfectivo: ['']
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerContactos();
    });
  }

  get autorizarFForm() {
    return this.facturarForm['controls'];
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
      descuento: [0, [Validators.required, Validators.min(0), Validators.max(100), Validators.pattern('^[0-9]*$')]],
      imagen: ['', []],
      caracteristicas: ['', []],
      precios: [[], []],
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
      nombre: this.nombre,
      apellido: this.apellido,
      numeroPedido: this.numPedido,
      page: this.page - 1,
      page_size: this.pageSize,
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
      estado: ['Pendiente de entrega'],
      canal: 'Contacto Local'
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaContactos = info.info;
      this.whatsapp=''
      this.nombre=''
      this.apellido=''
      this.numPedido=''
      //this.toaster.open('Lista actualizada', {type: 'success'});
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerContacto(modal, id): void {
    this.modalService.open(modal, {size: 'xl', backdrop: 'static'});
    this.contactosService.obtenerContacto(id).subscribe((info) => {
      if (info.tipoPago === 'rimpePopular') {
        this.mostrarInputComprobante = true;
      } else if (info.tipoPago === 'facturaElectronica') {
        this.mostrarInputComprobante = false;
      } else {
        this.mostrarInputComprobante = false;
      }
      if (info.formaPago === 'transferencia') {
        this.mostrarInputTransaccion = true;
        this.mostrarCargarArchivo = true;
        this.mostrarInputCobro = false;

      } else if (info.formaPago === 'efectivo') {
        this.mostrarInputTransaccion = false;
        this.mostrarCargarArchivo = false;
        this.mostrarInputCobro = true;
      } else {
        this.mostrarInputTransaccion = false;
        this.mostrarCargarArchivo = false;
        this.mostrarInputCobro = false;
      }
      this.totalPagar = info.total;
      this.iniciarNotaPedido();
      this.horaPedido = this.extraerHora(info.created_at);

      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, verificarPedido: true});
      this.calcular()
    });
  }

  crearNuevoContacto(modal): void {
    this.iniciarNotaPedido();
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }


  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  async guardarPorContacto(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.contactosService.crearNuevoContacto(this.notaPedido.value).subscribe((info) => {
          this.modalService.dismissAll();
          this.obtenerContactos();
          this.mostrarInputTransaccion = false;
          this.mostrarCargarArchivo = false;
          this.mostrarInputCobro = false;
          this.mostrarInputComprobante = false;
        }, error => this.toaster.open(error, {type: 'danger'})
      );
    }
  }

  async obtenerProducto(i): Promise<void> {
    return new Promise((resolve, reject) => {
      let data = {
        codigoBarras: this.detallesArray.value[i].codigo,
        canal: this.notaPedido.value.canal,
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        //if(info.mensaje==''){
        if (info.codigoBarras) {
          this.productosService.enviarGmailInconsistencias(this.notaPedido.value.id).subscribe();
          this.detallesArray.controls[i].get('id').setValue(info.id);
          this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
          this.detallesArray.controls[i].get('cantidad').setValue(this.detallesArray.controls[i].get('cantidad').value ?? 1);
          this.detallesArray.controls[i].get('precios').setValue([...this.extraerPrecios(info)]);
          const precioProducto = parseFloat(this.detallesArray.controls[i].get('valorUnitario').value);
          this.detallesArray.controls[i].get('valorUnitario').setValue(precioProducto.toFixed(2));
          this.detallesArray.controls[i].get('precio').setValue(precioProducto * 1);
          this.detallesArray.controls[i].get('imagen').setValue(info?.imagen);
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
      });
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
      if (descuento > 0 && descuento <= 100) {
        const totalDescuento = (valorUnitario * descuento) / 100;
        detalles[index].get('precio').setValue((((valorUnitario - totalDescuento) * cantidad)).toFixed(2));
      } else {
        detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      }
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    subtotalPedido = total / this.parametroIva;
    this.totalIva = (total - subtotalPedido).toFixed(2);
    this.notaPedido.get('subtotal').setValue((subtotalPedido).toFixed(2));
    this.notaPedido.get('total').setValue(total.toFixed(2));
  }

  /*validarComprobante(numComrpobante){
    this.obtenerContactos();

    this.listaContactos.map((num)=> {
      console.log('1', num.numeroComprobante)
      console.log('2', numComrpobante)

      if (num.numeroComprobante === numComrpobante){
        this.toaster.open('El número de comprobante ya existe', {type: 'danger'});
      }
    });
  }*/

  async actualizar(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    if (this.notaPedido.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }
    if (confirm('Esta seguro de guardar los datos') === true) {
      const facturaFisicaValores: string[] = Object.values(this.notaPedido.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.notaPedido.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'archivoMetodoPago' && llaves !== 'facturacion' && llaves !== 'articulos') {
          this.archivo.delete(llaves);
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.archivo.append('estado', 'Entregado');

      if (this.mostrarInputCobro) {
        if (Number(this.totalPagar) !== Number(this.notaPedido.value.totalCobroEfectivo)) {
          this.toaster.open('El precio total ingresado no coincide', {type: 'danger'})
        } else {
          this.contactosService.actualizarVentaFormData(this.archivo).subscribe((info) => {
            this.modalService.dismissAll();
            this.obtenerContactos();
            this.verificarContacto = true;
          }, error => this.toaster.open(error, {type: 'danger'}))
        }
      } else {
        this.contactosService.actualizarVentaFormData(this.archivo).subscribe((info) => {
          this.modalService.dismissAll();
          this.obtenerContactos();
          this.verificarContacto = true;
        }, error => this.toaster.open(error, {type: 'danger'}))
      }

      this.pedidosService.actualizarPedido(this.notaPedido.value).subscribe((info) => {
      });
    }
  }


  async actualizarContacto(): Promise<void> {
    await Promise.all(this.detallesArray.controls.map((producto, index) => {
      return this.obtenerProducto(index);
    }));
    if (confirm('Esta seguro de guardar los datos') === true) {
      if (this.notaPedido.invalid) {
        this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
        return;
      }

      this.contactosService.actualizarContacto(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerContactos();
        this.verificarContacto = true;
      }, error => this.toaster.open(error, {type: 'danger'}))
    }
  }

  cargarArchivo(event, nombreCampo): void {
    const doc = event.target.files[0];
    this.invalidoTamanoVideo = false;
    if (10485760 < doc.size) {
      this.invalidoTamanoVideo = true;
      this.toaster.open('Archivo pesado', {type: 'warning'});
      return;
    }
    const x = document.getElementById(nombreCampo + 'lbl');
    x.innerHTML = '' + Date.now() + '_' + doc.name;
    this.archivo.delete(nombreCampo);
    this.archivo.append(nombreCampo, doc);
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
    this.contactosService.validarCamposContacto(this.notaPedido.value).subscribe((info) => {
    }, error => this.toaster.open(error, {type: 'danger'}));
  }

  onSelectChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'rimpePopular' || selectedValue === 'facturaElectronicaMegaBahia') {
      this.mostrarInputComprobante = true;
    } else {
      this.mostrarInputComprobante = false;
    }
  }

  onSelectChangeIdentificacion(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'identificacion') {
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
        [Validators.required, Validators.pattern('^[0-9]*$'), ValidacionesPropias.cedulaValido]
      )
      this.notaPedido.get('facturacion')['controls']['identificacion'].updateValueAndValidity();
    }
  }

  onSelectChangeFormaPago(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'transferencia') {
      this.mostrarInputTransaccion = true;
      this.mostrarCargarArchivo = true;
      this.mostrarInputCobro = false;

    } else if (selectedValue === 'efectivo') {
      this.mostrarInputTransaccion = false;
      this.mostrarCargarArchivo = false;
      this.mostrarInputCobro = true;
    } else {
      this.mostrarInputTransaccion = false;
      this.mostrarCargarArchivo = false;
      this.mostrarInputCobro = false;
    }
  }

  onFileSelected(event: any): void {
    this.archivo.delete('archivoFormaPago');
    this.archivo.append('archivoFormaPago', event.target.files.item(0), event.target.files.item(0).name);
    // this.fileToUpload = event.target.files.item(0);
  }

  guardarComprobanteTransferencia(): void {
    if (this.archivo) {
      const formData = new FormData();
      formData.append('archivoFormaPago', this.fileToUpload, this.fileToUpload.name);
    }
  }

  guardarArchivoTransaccion() {
    if (this.archivo) {
      const formData = new FormData();
      formData.append('archivoFormaPago', 'asjfasijfnaskfjasfiasn');
      formData.append('id', '555555');
      //this.contactosService.actualizarVentaFormData(formData)
      //  .subscribe(() => {
      //    this.modalService.dismissAll();
      //  });

    } else {
      console.error('No se ha seleccionado ningún archivo.');
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
        this.detallesArray.controls[i].get('imagen').setValue(nuevaImagen);
        this.datosProducto.append('imagenes[' + 0 + ']id', '0');
        this.datosProducto.append('imagenes[' + 0 + ']imagen', archivo);
        this.datosProducto.append('codigoBarras', this.detallesArray.controls[i].get('codigo').value);

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

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
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
}
