import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {DatePipe} from '@angular/common';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceMDP} from '../../../../services/mdp/param/param.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';


@Component({
  selector: 'app-gestion-entrega',
  templateUrl: './gestion-entrega-nuevos.component.html',
  providers: [DatePipe]
})
export class GestionEntregaNuevosComponent implements OnInit, AfterViewInit {
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
  mostrarSpinner = false;
  fotoEmpaqueInvalid = false;
  videoEmpaqueInvalid = false;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
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
      subtotal: ['', []],
      iva: ['', []],
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
      estado: ['Autorizado']
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
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
    this.notaPedido.get('total').setValue(total);
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
    this.modalService.open(modal);
    this.autorizarForm = this.formBuilder.group({
      id: [transaccion.id, [Validators.required]],
      confirmacionEnvio: ['', [Validators.required]],
      numeroPedido: [transaccion.numeroPedido, [Validators.required]],
      fotoEmpaque: ['', [Validators.required]],
      videoEmpaque: ['', []],
      estado: ['Empacado', [Validators.required]],
    });
  }

  procesarAutorizacionEnvio(): void {
    if (this.autorizarForm.invalid || this.fotoEmpaqueInvalid || this.videoEmpaqueInvalid) {
      this.toaster.open('Campos vacios', {type: 'danger'});
      console.log('form', this.autorizarForm);
      return;
    }
    if (confirm('Esta seguro de enviar') === true) {
      this.mostrarSpinner = true;
      const facturaFisicaValores: string[] = Object.values(this.autorizarForm.value);
      const facturaFisicaLlaves: string[] = Object.keys(this.autorizarForm.value);
      facturaFisicaLlaves.map((llaves, index) => {
        if (facturaFisicaValores[index] && llaves !== 'fotoEmpaque' && llaves !== 'videoEmpaque') {
          this.archivo.append(llaves, facturaFisicaValores[index]);
        }
      });
      this.pedidosService.actualizarPedidoFormData(this.archivo).subscribe((info) => {
        this.mostrarSpinner = false;
        this.modalService.dismissAll();
        this.obtenerTransacciones();
      }, error => {
        this.mostrarSpinner = false;
        this.toaster.open(error, {type: 'danger'});
      });
    }
  }

  procesarDevolucion(id): void {
    if (confirm('Esta seguro de enviar') === true) {
      this.pedidosService.actualizarPedido({id, estado: 'Devolucion'}).subscribe((info) => {
        this.obtenerTransacciones();
      });
    }
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
      case 'fotoEmpaque':
        this.fotoEmpaqueInvalid = invalidFlag;
        break;
      case 'videoEmpaque':
        this.videoEmpaqueInvalid = invalidFlag;
        break;
    }

    if (!invalidFlag) {
      const x = document.getElementById(nombreCampo + 'lbl');
      x.innerHTML = '' + Date.now() + '_' + doc.name;
      this.archivo.delete(nombreCampo);
      this.archivo.append(nombreCampo, doc);
    }
  }
}
