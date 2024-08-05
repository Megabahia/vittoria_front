import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceAdm} from '../../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';
import {ClientesService} from '../../../../services/mdm/personas/clientes/clientes.service';
import {ContactosService} from '../../../../services/mdm/personas/contactos/contactos.service';
import {SuperBaratoService} from '../../../../services/gsb/superbarato/super-barato.service';
import {AuthService} from '../../../../services/admin/auth.service';
import Decimal from "decimal.js";

@Component({
  selector: 'app-gsb-generar-contacto',
  templateUrl: './gsb-generar-contacto.component.html',
  styleUrls: ['gsb-generar-contacto.components.css'],
  providers: [DatePipe]
})
export class GsbGenerarContactoComponent implements OnInit, AfterViewInit {
  @Input() paises;

  public notaContacto: FormGroup;
  public autorizarForm: FormGroup;
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
  correo = '';
  usuarioActual;
  canalSeleccionado = '';
  cedulaABuscar = '';
  clientes;
  cliente;
  cedula;
  parametroDireccion;
  descuentoCupon;
  fotoCupon;
  diasValidosCupon;
  listaCanalesProducto;
  tipoIdentificacion;
  titulo = 'Nuevo contacto';
  tituloBoton = 'Guardar contacto';
  mostrarInformacionRepetida = false;

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
  horaPedido;
  currentUser;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private contactoService: ContactosService,
    private paramService: ParamService,
    private paramServiceAdm: ParamServiceAdm,
    private productosService: ProductosService,
    private superBaratoService: SuperBaratoService,
    private authService: AuthService,
    private toaster: Toaster,
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.obtenerListaProductos();

    const fecha = new Date();
    this.horaPedido = this.extraerHora(fecha.toString());
    //this.inicio.setMonth(this.inicio.getMonth() - 3);
    this.iniciarNotaContacto();

    /*this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'DIRECCIÓN', 'Dirección').subscribe((result) => {
      this.parametroDireccion = result.info[0].valor;
    });
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'CUPON', 'Descuento cupón').subscribe((result) => {
      this.descuentoCupon = result.info[0].valor;
    });
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'CUPON VALIDO', 'Cupón válido').subscribe((result) => {
      // tslint:disable-next-line:radix
      this.diasValidosCupon = parseInt(result.info[0].valor);
    });*/

  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerOpciones();
  }

  ngAfterViewInit(): void {
  }

  iniciarNotaContacto(): void {
    this.usuarioActual = JSON.parse(localStorage.getItem('currentUser'));
    this.notaContacto = this.formBuilder.group({
      id: [''],
      nombres: ['', [Validators.required]],
      apellidos: [''],
      articulos: this.formBuilder.array([]),
      whatsapp: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      created_at: [this.obtenerFechaActual(), [Validators.required]],
      metodoPago: ['Contra-Entrega', [Validators.required]],
      canal: [this.currentUser.usuario.canal, []],
      estado: ['NUEVO'],
      usuario: [`${this.currentUser.usuario.nombres} ${this.currentUser.usuario.apellidos}`],
      tipoContacto: ['']
    });
  }


  get notaContactoForm() {
    return this.notaContacto['controls'];
  }

  get detallesArray(): FormArray {
    return this.notaContacto.get('articulos') as FormArray;
  }

  crearDetalleGrupoProductoExtra(): any {
    return this.formBuilder.group({
      urlProducto: ['', [Validators.required]],
      valorUnitario: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d+)?$')]],
      cantidad: [1],
      precio: [0],
    });
  }

  agregarItemExtra(): void {
    this.detallesArray.push(this.crearDetalleGrupoProductoExtra());
  }

  removerItemExtra(i): void {
    this.detallesArray.removeAt(i);
    this.calcular();
  }


  crearNuevoContacto(modal): void {
    this.canalSeleccionado = this.currentUser.usuario.canal;
    this.iniciarNotaContacto();
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }

  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('Contacto_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  async guardarContacto(): Promise<void> {
    if (this.notaContacto.invalid) {
      this.toaster.open('Revise que los campos estén correctos', {type: 'danger'});
      return;
    }

    if (confirm('Esta seguro de guardar los datos') === true) {
      this.contactoService.crearContactos(this.notaContacto.value).subscribe((info) => {
          this.modalService.dismissAll();
          this.titulo = 'Nuevo contacto';
          this.tituloBoton = 'Guardar contacto';
          this.mostrarInformacionRepetida = false;
          this.toaster.open('Contacto registrado', {type: 'warning'});
          this.iniciarNotaContacto();
        }, error => this.toaster.open(error, {type: 'danger'})
      );
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
        canalProducto: this.canalSeleccionado,
        canal: this.notaContacto.value.canal,
        valorUnitario: this.detallesArray.controls[i].value.valorUnitario
      };
      this.productosService.obtenerProductoPorCodigo(data).subscribe((info) => {
        if (info.codigoBarras) {
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
          this.detallesArray.controls[i].get('canal').setValue(info.canal);
          this.detallesArray.controls[i].get('woocommerceId').setValue(info.woocommerceId);
          this.calcular();
          resolve();
        } else {
          this.detallesArray.controls[i].get('articulo').setValue('');
          this.toaster.open('Producto no existente, agregue un producto que se encuentre en la lista de productos.', {type: 'danger'});
          reject(new Error('No existe el producto a buscar')); // Rechaza la promesa si no se encuentra el producto
        }
      });
    });
  }

  extraerPrecios(info: any): any[] {
    const precios = [];
    Object.keys(info).forEach(clave => {
      if (clave.startsWith('precioVenta')) {
        precios.push({clave: clave, valor: info[clave]});
      }
    });
    return precios;
  }

  extraerHora(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().split(' ')[0];
  }

  calcular(): void {
    const detallesProductoExtra = this.detallesArray.controls;
    let totalProdExtra = 0;
    detallesProductoExtra.forEach((item, index) => {
      const valorUnitario = parseFloat(detallesProductoExtra[index].get('valorUnitario').value || 0);
      const cantidad = parseFloat(detallesProductoExtra[index].get('cantidad').value || 0);
      detallesProductoExtra[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      totalProdExtra += parseFloat(detallesProductoExtra[index].get('precio').value);
    });
  }


  obtenerFechaActual(): Date {
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

  validarDatos(): void {
    if (!this.validarNumeroCelular(this.notaContacto.value.whatsapp)){
      this.toaster.open('Número de celular inválido.', {type: 'danger'});
      return;
    }
    const filters = {
      whatsapp: this.notaContacto.value.whatsapp
    };
    this.superBaratoService.validarContacto(filters).subscribe((info) => {
      this.titulo = 'Nuevo contacto';
      this.tituloBoton = 'Guardar contacto';
      this.mostrarInformacionRepetida = false;
      this.notaContacto.get('tipoContacto').setValue('original');
    }, error => {
      this.canalSeleccionado = this.currentUser.usuario.canal;
      //this.iniciarNotaContacto();
      this.notaContacto.get('tipoContacto').setValue('duplicado');
      this.titulo = 'Contacto existente';
      this.tituloBoton = 'Guardar contacto existente';
      this.mostrarInformacionRepetida = true;
      this.toaster.open(error, {type: 'danger'});
    });
  }

  validarNumeroCelular(numero) {
    const regex = /^0\d{9}$/;
    return regex.test(numero);
  }

  escogerCantidad(operacion, i, articulo): void {
    const cantidadControl = articulo;
    let cantidad = +articulo.get('cantidad').value;
    cantidad = operacion === 'sumar' ? Math.min(cantidad + 1) : Math.max(cantidad - 1, 1);
    cantidadControl.get('cantidad').setValue(cantidad);
    const total = +new Decimal(cantidadControl.get('valorUnitario').value).mul(cantidad).toFixed(2).toString();
    cantidadControl.get('precio').setValue(total);
    this.notaContacto.updateValueAndValidity();
    this.calcular();
  }

}
