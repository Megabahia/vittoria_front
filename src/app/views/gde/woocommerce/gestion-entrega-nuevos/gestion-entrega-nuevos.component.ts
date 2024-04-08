import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {DatePipe} from '@angular/common';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ChartDataSets} from 'chart.js';
import {Color} from 'ng2-charts';
import {ParamService} from '../../../../services/mp/param/param.service';
import {ParamService as ParamServiceMDP} from '../../../../services/mdp/param/param.service';
import {ParamService as ParamServiceGE} from '../../../../services/gde/param/param.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';
import { v4 as uuidv4 } from 'uuid';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-gestion-entrega',
  templateUrl: './gestion-entrega-nuevos.component.html',
  providers: [DatePipe]
})
export class GestionEntregaNuevosComponent implements OnInit, AfterViewInit {
  @ViewChild('printButton') printButtonRef!: ElementRef;
  @ViewChild(NgbPagination) paginator: NgbPagination;
  public notaPedido: FormGroup;
  public autorizarForm: FormGroup;
  public generarGuiaForm: FormGroup;
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
  guias = [];

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private pedidosService: PedidosService,
    private paramService: ParamService,
    private paramServiceMDP: ParamServiceMDP,
    private paramServiceGE: ParamServiceGE,
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
    this.generarGuiaForm = this.formBuilder.group({
      generarGuia: ['', [Validators.required]],
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
      subtotal: ['', []],
      iva: ['', []],
      numeroPedido: ['', []],
      created_at: ['', []],
      metodoPago: ['', [Validators.required]],
      numeroGuia: [uuidv4(), []],
    });
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerTransacciones();
    });
  }

  get generarGuiaFForm() {
    return this.generarGuiaForm['controls'];
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

  obtenerGuias(): void {
    this.paramServiceGE.obtenerListaPadres('COMBO_GENERAR_GUIA').subscribe((info) => {
      if (this.notaPedido.value.metodoPago.includes('Contra-Entrega')) {
        this.guias = info.filter((item) => item.valor === 'Motorizado');
      } else {
        this.guias = info;
      }
    });
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

  generarGuia(modal, id): void {
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.iniciarNotaPedido();
      info.articulos.map((item): void => {
        this.agregarItem();
      });
      this.notaPedido.patchValue({...info, numeroGuia: uuidv4()});
      this.obtenerGuias();

      this.modalService.open(modal, {size: 'lg'});
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
      fechaEmpacado: [ this.transformarFecha(new Date()), []],
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

  seleccionarGuia(): void {
    if (this.generarGuiaForm.invalid){
      return alert('Seleccione un metodo');
    }
    if ('Servi Entrega' === this.generarGuiaForm.value.generarGuia) {
      window.open('https://www.servientrega.com.ec/', '_blank');
      return;
    }
    this.pedidosService.actualizarPedido({
      id: this.notaPedido.value.id, verificarGeneracionGuia: true,
      numeroGuia: this.notaPedido.value.numeroGuia,
    }).subscribe((info) => {
      //this.printButtonRef.nativeElement.click();
      this.createPDF();
    });
  }

  createPDF(){

    const tableRaws=this.notaPedido.value.articulos.map(articulo=>[
      { text: articulo.codigo, fontSize: 5 },
      { text: articulo.cantidad, fontSize: 5 },
      { text: articulo.articulo, fontSize: 5 },
      { text: articulo.valorUnitario, fontSize: 5 },
      { text: articulo.precio, fontSize: 5 },
    ]);

    const tableData = [
      [{ text: 'Código', style: 'bold', fontSize: 8 },
        { text: 'Cantidad', style: 'bold', fontSize: 8 },
        { text: 'Nombre', style: 'bold', fontSize: 8 },
        { text: 'Valor unitario', style: 'bold', fontSize: 8 },
        { text: 'Total', style: 'bold', fontSize: 8 }],
      ...tableRaws
    ];

    const pdfDefinition: any = {
      pageSize: 'A7',
      content: [
        {
          columns: [
            { text: 'Fecha pedido: ', style: 'bold', fontSize: 5 },
            { text: this.notaPedido.value.created_at, fontSize: 5 },
          ]
        },
        {
          columns: [
            { text: 'Número pedido: ', style: 'bold', fontSize: 5 },
            { text: this.notaPedido.value.numeroPedido, fontSize: 5 },

          ],
        },
        {
          columns: [
            { text: 'Número guía:', style: 'bold', fontSize: 5 },
            { text: this.notaPedido.value.numeroGuia, fontSize: 5 }
          ]
        },
        {
          columns: [
            { text: 'Método de pago:', style: 'bold', fontSize: 5 },
            { text: this.notaPedido.value.metodoPago, fontSize: 5 }
          ]
        },
        '\n',

        { text: 'Productos', style: 'bold', fontSize: 8 },
        {
          table: {
            headerRows: 1,
            body: tableData,
            fontSize: 5,
          },
        },
        {
          text: 'Total envío: $'+ this.notaPedido.value.envioTotal, style: 'bold', fontSize: 5, margin: [0, 5, 0, 0]
        },
        {
          text: 'Total a pagar por el cliente: $'+this.notaPedido.value.total, style: 'bold', fontSize: 5,
        },
        '\n',
        {
          text:'Datos entrega',style:'bold',fontSize:8
        },
        {
          columns: [
            { text: 'Nombres: '+this.notaPedido.value.facturacion.nombres, fontSize: 5 },
            { text: 'Apellidos: '+this.notaPedido.value.facturacion.apellidos, fontSize: 5 },
          ],
        },
        {
          columns: [
            { text: 'Correo: '+this.notaPedido.value.facturacion.correo, fontSize: 5 },

            { text: 'Número de identificación: '+this.notaPedido.value.facturacion.identificacion, fontSize: 5 },

          ],
        },
        {
          columns: [
            { text: 'Teléfono: '+this.notaPedido.value.facturacion.telefono, fontSize: 5 },
            { text: 'País: '+this.notaPedido.value.facturacion.pais, fontSize: 5 },

          ],
        },
        {
          columns: [
            { text: 'Provincia: '+this.notaPedido.value.facturacion.provincia, fontSize: 5 },
            { text: 'Ciudad: '+this.notaPedido.value.facturacion.ciudad, fontSize: 5 },

          ],
        },
        {
          columns: [
            { text: 'Calle principal: '+this.notaPedido.value.facturacion.callePrincipal, fontSize: 5 },
            { text: 'Número: '+this.notaPedido.value.facturacion.numero, fontSize: 5 },

          ],
        },
        {
          columns: [
            { text: 'Calle secundaria : '+this.notaPedido.value.facturacion.calleSecundaria, fontSize: 5 },
            { text: 'Referencia: '+this.notaPedido.value.facturacion.referencia, fontSize: 5 },


          ],
        },
        {
          columns: [
            { text: 'GPS: '+this.notaPedido.value.facturacion.gps, fontSize: 5 },
            /*{ text: 'Canal envío : '+this.notaPedido.value.envio.canal, fontSize: 5 },*/

          ],
        },

      ],
      pageMargins: [5, 5, 5, 5]
    };

    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.open();

  }
}
