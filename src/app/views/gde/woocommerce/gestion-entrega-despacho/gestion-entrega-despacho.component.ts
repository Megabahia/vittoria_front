import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {ParamService} from '../../../../services/mp/param/param.service';
import {UsersService} from '../../../../services/admin/users.service';
import {ParamService as ParamServiceMDP} from '../../../../services/mdp/param/param.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-gestion-entrega-despacho',
  templateUrl: './gestion-entrega-despacho.component.html',
  styleUrls: ['./gestion-entrega-despacho.component.css'],
  providers: [DatePipe, UsersService]
})
export class GestionEntregaDespachoComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
  public autorizarForm: FormGroup;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaTransacciones;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  archivo: FormData = new FormData();


  public barChartData: ChartDataSets[] = [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  public couriers = [];
  mostrarSpinner = false;
  archivoGuiaInvalid = false;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private usersService: UsersService,
    private paramServiceMDP: ParamServiceMDP,
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
    this.iniciarPaginador();
    this.obtenerTransacciones();
  }

  iniciarNotaPedido(): void {
    this.notaPedido = this.formBuilder.group({
      id: ['', []],
      facturacion: this.formBuilder.group({
        nombres: ['', []],
        apellidos: ['', []],
        correo: ['', []],
        identificacion: ['', []],
        telefono: ['', []],
        pais: ['', []],
        provincia: ['', []],
        ciudad: ['', []],
        callePrincipal: ['', []],
        numero: ['', []],
        calleSecundaria: ['', []],
        referencia: ['', []],
        gps: ['', []],
        codigoVendedor: ['', []],
        nombreVendedor: ['', []],
        comprobantePago: ['', []],
      }),
      envio: this.formBuilder.group({
        nombres: ['', []],
        apellidos: ['', []],
        correo: ['', []],
        identificacion: ['', []],
        telefono: ['', []],
        pais: ['', []],
        provincia: ['', []],
        ciudad: ['', []],
        callePrincipal: ['', []],
        numero: ['', []],
        calleSecundaria: ['', []],
        referencia: ['', []],
        gps: ['', []],
        canalEnvio: ['', []],
      }),
      articulos: this.formBuilder.array([]),
      total: ['', []],
      envioTotal: ['', []],
      numeroPedido: ['', []],
      created_at: ['', []],
      metodoPago: ['', [Validators.required]],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerTransacciones();
    });
  }

  get autorizarFForm() {
    return this.autorizarForm['controls'];
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
      codigo: ['', [Validators.required]],
      articulo: ['', [Validators.required]],
      valorUnitario: [0, [Validators.required]],
      cantidad: [0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1)]],
      precio: [0, [Validators.required]],
      imagen: ['', []],
      caracteristicas: ['', []],
    });
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  removerItem(i): void {
    this.detallesArray.removeAt(i);
    this.calcular();
  }

  obtenerTransacciones(): void {
    this.pedidosService.obtenerListaPedidos({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.transformarFecha(this.fin),
      estado: ['Empacado']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  obtenerCouriers(pais, provincia, ciudad): void {
    this.usersService.obtenerListaUsuarios({
      page: 0 , page_size: 10, idRol: 50, estado: 'Activo', pais, provincia, ciudad
    }).subscribe((info) => {
      this.couriers = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerTransaccion(id): void {
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.iniciarNotaPedido();
      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info});
    });
  }


  obtenerOpciones(): void {
    this.paramService.obtenerListaPadres('PEDIDO_ESTADO').subscribe((info) => {
      this.opciones = info;
    });
  }

  obtenerProducto(i): void {
    this.productosService.obtenerProductoPorCodigo({
      codigoBarras: this.detallesArray.value[i].codigo
    }).subscribe((info) => {
      if (info.codigoBarras) {
        // this.detallesArray.value[i].codigo = info.codigo;
        console.log('dato', this.detallesArray.controls[i].get('articulo'));
        this.detallesArray.controls[i].get('articulo').setValue(info.nombre);
        this.detallesArray.controls[i].get('cantidad').setValue(1);
        this.detallesArray.controls[i].get('valorUnitario').setValue(info.precioVentaA);
        this.detallesArray.controls[i].get('precio').setValue(info.precioVentaA * 1);
        this.calcular();
      } else {
        // this.comprobarProductos[i] = false;
        // this.mensaje = 'No existe el producto a buscar';
        // this.abrirModal(this.mensajeModal);
      }
    }, (error) => {

    });
  }

  calcular(): void {
    const detalles = this.detallesArray.controls;
    let total = 0;
    detalles.forEach((item, index) => {
      const valorUnitario = parseFloat(detalles[index].get('valorUnitario').value);
      const cantidad = parseFloat(detalles[index].get('cantidad').value);
      detalles[index].get('precio').setValue((cantidad * valorUnitario).toFixed(2));
      total += parseFloat(detalles[index].get('precio').value);
    });
    total += this.notaPedido.get('envioTotal').value;
    this.notaPedido.get('total').setValue(total.toFixed(2));
  }

  actualizar(): void {
    this.calcular();
    if (confirm('Esta seguro de actualizar los datos') === true) {
      this.pedidosService.actualizarPedido(this.notaPedido.value).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      });
    }
  }

  procesarEnvio(modal, transaccion): void {
    this.archivo = new FormData();
    this.modalService.open(modal, {size: 'lg'});
    this.autorizarForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      numeroPedido: [transaccion.numeroPedido, [Validators.required]],
      numeroGuia: [transaccion?.numeroGuia, [Validators.required]],
      canalEnvio: ['', [Validators.required]],
      codigoCourier: ['', [Validators.required]],
      nombreCourier: ['', [Validators.required]],
      correoCourier: ['', [Validators.required]],
      archivoGuia: ['', [Validators.required]],
      estado: ['Despachado', [Validators.required]],
      envio: this.formBuilder.group({
        nombres: [transaccion.envio.nombres, []],
        apellidos: [transaccion.envio.apellidos, []],
        correo: [transaccion.envio.correo, []],
        identificacion: [transaccion.envio.identificacion, []],
        telefono: [transaccion.envio.telefono, []],
        pais: [transaccion.envio.pais, []],
        provincia: [transaccion.envio.provincia, []],
        ciudad: [transaccion.envio.ciudad, []],
        callePrincipal: [transaccion.envio.callePrincipal, []],
        numero: [transaccion.envio.numero, []],
        calleSecundaria: [transaccion.envio.calleSecundaria, []],
        referencia: [transaccion.envio.referencia, []],
        gps: [transaccion.envio.gps, []],
      }),
    });
    this.obtenerCouriers(transaccion.envio.pais, transaccion.envio.provincia, transaccion.envio.ciudad);
  }

  procesarAutorizacionEnvio(): void {
    if (this.autorizarForm.invalid || this.archivoGuiaInvalid) {
      this.toaster.open('Campos vacios', {type: 'danger'});
      console.log('form', this.autorizarForm);
      return;
    }
    if (confirm('Esta seguro de despachar') === true) {
      this.mostrarSpinner = true;
      const facturaFisicaValores: string[] = Object.values(this.autorizarForm.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.autorizarForm.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'archivoGuia' && llaves !== 'envio') {
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.pedidosService.actualizarPedidoFormData(this.archivo).subscribe((info) => {
        this.modalService.dismissAll();
        this.obtenerTransacciones();
        this.mostrarSpinner = false;
      }, error => this.mostrarSpinner = false);
    }
  }

  seleccionarCourier(event): void {
    this.couriers.forEach(item => {
      if (event.target.value === item.username) {
        this.autorizarForm.get('nombreCourier').setValue(`${item.nombres} ${item.apellidos}`);
        this.autorizarForm.get('correoCourier').setValue(item.email);
        this.autorizarForm.get('canalEnvio').setValue(item.username);
        this.autorizarForm.get('codigoCourier').setValue(item.username);
      }
    });
  }

  cargarArchivo(event, nombreCampo): void {
    const doc = event.target.files[0];
    const maxFileSize = 10485760; // 10 MB
    let invalidFlag = false;

    if (maxFileSize < doc.size) {
      invalidFlag = true;
      this.toaster.open('Archivo pesado', { type: 'warning' });
    }

    switch (nombreCampo) {
      case 'archivoGuia':
        this.archivoGuiaInvalid = invalidFlag;
        break;
    }

    if (!invalidFlag) {
      const x = document.getElementById(nombreCampo + 'lbl');
      x.innerHTML = '' + Date.now() + '_' + doc.name;
      this.archivo.delete(nombreCampo);
      this.archivo.append(nombreCampo, doc);
    }
  }

  verGuia(id:void){
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      if(info.archivoGuia===null){
       window.alert('No existe guías en este pedido');
      }else{
        window.open(info.archivoGuia, '_blank');
      }
    });
}
}

