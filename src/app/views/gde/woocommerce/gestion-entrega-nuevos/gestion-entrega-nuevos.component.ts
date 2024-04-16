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
  fileToUpload: File | null = null;

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

  mostrarDiv = false;


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
      this.obtenerTransacciones();
      this.modalService.dismissAll();
    });
  }

  createPDF(){

    const image64='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAD/gUlEQVR4XuxdBYBdxdWea0/Wd7NxT0hCgkNwJ3iB0sIPVWhpqVEvbam3lLZUqbfQAi2U4lbcLbiFGHH3bNZ3n1z7v2/ue8kmbJL1rJwbHmtXZr6ZO2eOfUcpOQQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBAQBQUAQEAQEAUFAEBAEBAFBQBAQBHaPgLH7U+QMQUAQ2NMIhP7GuDKry5QKLKV8fDxHhW4c39v4nRn62UTURtNXoeUZTrxZKSejlOUrZbsqKG5UKuYpw3ENsyLY0/2R5wsCgkDXIyACvesxlTsKAu1GIPS22CrcXKmChnIV1g7xvY2jPW/ziMDbMtR3awcpr3qQCuqGBIGXCEM/FoReDF+tUHkU6IYZBIahQgr0UIWmbxhWYECYm4btG6bthk6ywTYLawynbEtollfZ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fflxeWnp2gP+fMvd3z358187vd4PSziemiUxwSBEPRNzp0bvg4kxQXKSpozk+xsiXztNNjbHLLrz+dfPf/i5mWd94JTj75xfVf+daahg1t7xb+38ex98/NKAmQxQ+uGcys3HKEEtekmABT7HHb7fo4dPG/lyVzyzPfeARh7/2wNPf/Fftz/8pRUbNo1V8QLMjwReb84PpPvi3eD6x+Iw5AchY2dkEMUmOMiqjU1u8W0PP/XJh5965gNf/9PN//7qpy78/piC2C437ctWr50CK8p+TnwobYpMJsWcCBGYH1N1qYaSV2cvOBEP0AJ9ZbNbcsV19195670PfKrJM4qMOAikKG+R9uxgU+FjvUaBL/wCmzXMMhfCq8rPDrrmljuueGTmix/4yw8v/+iU0cPntMQklQ2SDz4984MZu0TPURP9YZ55BlkvOudfHzsaabjewQaaYSYB60UgF4uKHTYBPjaPPtJQX3rj7SNXY1OLi2fxDg3ZMPHyO4uOzxpJI4gVqpSXxpYocPiMZetrRs1dvOwQuCzfbfRV7Kq/3PTrW+577JImI5nMGkjjThQA32j9jtZ/Q9U3NyframuH4ocVO47xGiii19750DdPvuRLX2zwVGkGazWYhXV/9DuF9QfWW51BZtJkiHeFFOx8L7WJEutEI8B7as7qE59+65/H7z+6bPYDby28/OyDpzDw8j1HZwR6W+Znu0xky2syQ75zzX9+fvPDj33SjxWYGXCAM30u4rMhmxwWPrLV6RcQOzMIJW0E1LtULgb4ikHkpIcaoVzLMde54aCf3XD31U+9Me+s1zbXXrxXRfHKCmub6WVXnXhh3orjLv/tP/+x0S+o8B28TBjIABPExkRzMShbD0ZKI7fZwOYjxKcBExBb1eI/3vb4t99atOrgCz76ob96BtnCNbdUztzeMbnxzJK10y/42k+vnb1i48FZME8h+QuBO7BccI4RbWickFxaZEWTIi++tmnqMCpj+oLkAgIOaTvxORtSB37q+79+4JvX3/3rz33k7KsnJmN6J9vdB5vLIFU+57wzTrxh9twbfucjCInvia+d//hwUmMeVDc1ldzz9Osfx6ntEuirGlLlp138tfd52Olz7DTFsZ4v1GYyKoH59IEzTr+lDDEY9UFnQ++2IQat3Ln1oRc+9aEv//jnDaFd3hAAb25KuehiIebmSruLad7F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PXJ1IK5dzFzFn1E6WOX0QKIYIxLGMHkMsxPHmozOwV1yVj0644ab+3dIlTC1366K5clCoEkCMqFL4xAC/2UEqpxu88K12879dP6ya5bkbR1fY3dF+ZAMxYv4dHq8U++aKWFCSUUoxQopd223Tj1splplWBpU4FLjomrOGjfs08kje38+pl/P+XHQK/8vwyWvIwT+awjIhP5fU5XyIkLgWAL5Dn/Muk07xq/Zvmvk9p35/YpKSjJr7A1xbq/fgi+bz+c3UwyOdnikAnQnxcRW5eZ03Nq9Q+am0YP7fNejS9aaTBvybsolBITAfzwBmdD/46tICigETj6BgtrGOLcvYHEjwQ1yZCC9pc6PpDBVyUg2dPKfJncUAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAJCQAgIASEgBISAEBACQkAICAEhIASEgBAQAkJACAgBISAEhIAQEAL/dwn8P4RVoOMntLQjAAAAAElFTkSuQmCC'

    const tableRaws=this.notaPedido.value.articulos.map(articulo=>[
      { text: articulo.codigo, fontSize: 5 },
      { text: articulo.cantidad, fontSize: 5 },
      { text: articulo.articulo, fontSize: 5 },
      { text: articulo.valorUnitario, fontSize: 5 },
      { text: articulo.precio, fontSize: 5 },
    ]);
    const tableRaws2=this.notaPedido.value.articulos.map(articulo2=>[
      { text: articulo2.codigo, fontSize: 5 },
      { text: articulo2.cantidad, fontSize: 5 },
      { text: articulo2.articulo, fontSize: 5 },
      { text: articulo2.valorUnitario, fontSize: 5 },
      { text: articulo2.precio, fontSize: 5 },
    ]);
    const tableRaws3=this.notaPedido.value.articulos.map(articulo3=>[
      { text: articulo3.codigo, fontSize: 5 },
      { text: articulo3.cantidad, fontSize: 5 },
      { text: articulo3.articulo, fontSize: 5 },
      { text: articulo3.valorUnitario, fontSize: 5 },
      { text: articulo3.precio, fontSize: 5 },
    ]);

    const tableData = [
      [{ text: 'Código', style: 'bold', fontSize: 8 },
        { text: 'Cantidad', style: 'bold', fontSize: 8 },
        { text: 'Nombre', style: 'bold', fontSize: 8 },
        { text: 'Valor unitario', style: 'bold', fontSize: 8 },
        { text: 'Total', style: 'bold', fontSize: 8 }],
      ...tableRaws
    ];
    const tableData2 = [
      [{ text: 'Código', style: 'bold', fontSize: 8 },
        { text: 'Cantidad', style: 'bold', fontSize: 8 },
        { text: 'Nombre', style: 'bold', fontSize: 8 },
        { text: 'Valor unitario', style: 'bold', fontSize: 8 },
        { text: 'Total', style: 'bold', fontSize: 8 }],
      ...tableRaws2
    ];
    const tableData3 = [
      [{ text: 'Código', style: 'bold', fontSize: 8 },
        { text: 'Cantidad', style: 'bold', fontSize: 8 },
        { text: 'Nombre', style: 'bold', fontSize: 8 },
        { text: 'Valor unitario', style: 'bold', fontSize: 8 },
        { text: 'Total', style: 'bold', fontSize: 8 }],
      ...tableRaws3
    ];
    /*const guiaContentA7 = [
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
        text: 'Total envío: $' + this.notaPedido.value.envioTotal, style: 'bold', fontSize: 5, margin: [0, 5, 0, 0]
      },
      {
        text: 'Total a pagar por el cliente: $' + this.notaPedido.value.total, style: 'bold', fontSize: 5,
      },
      '\n',
      {
        text: 'Datos entrega', style: 'bold', fontSize: 8
      },
      {
        columns: [
          { text: 'Nombres: ' + this.notaPedido.value.facturacion.nombres, fontSize: 5 },
          { text: 'Apellidos: ' + this.notaPedido.value.facturacion.apellidos, fontSize: 5 },
        ],
      },
      {
        columns: [
          { text: 'Correo: ' + this.notaPedido.value.facturacion.correo, fontSize: 5 },
          { text: 'Número de identificación: ' + this.notaPedido.value.facturacion.identificacion, fontSize: 5 },
        ],
      },
      {
        columns: [
          { text: 'Teléfono: ' + this.notaPedido.value.facturacion.telefono, fontSize: 5 },
          { text: 'País: ' + this.notaPedido.value.facturacion.pais, fontSize: 5 },
        ],
      },
      {
        columns: [
          { text: 'Provincia: ' + this.notaPedido.value.facturacion.provincia, fontSize: 5 },
          { text: 'Ciudad: ' + this.notaPedido.value.facturacion.ciudad, fontSize: 5 },
        ],
      },
      {
        columns: [
          { text: 'Calle principal: ' + this.notaPedido.value.facturacion.callePrincipal, fontSize: 5 },
          { text: 'Número: ' + this.notaPedido.value.facturacion.numero, fontSize: 5 },
        ],
      },
      {
        columns: [
          { text: 'Calle secundaria : ' + this.notaPedido.value.facturacion.calleSecundaria, fontSize: 5 },
          { text: 'Referencia: ' + this.notaPedido.value.facturacion.referencia, fontSize: 5 },
        ],
      },
      {
        columns: [
          { text: 'GPS: ' + this.notaPedido.value.facturacion.gps, fontSize: 5 },
          /*{ text: 'Canal envío : '+this.notaPedido.value.envio.canal, fontSize: 5 },
        ],
      },
    ];*/

    const guiaContentA7Column1 = [
      {
        image: image64,
        width: 50,
        height: 50,
        alignment: 'start',
      },
      { text: 'Fecha pedido: '+this.notaPedido.value.created_at, style: 'bold', fontSize: 8 },
      { text: 'Número pedido: '+this.notaPedido.value.numeroPedido, style: 'bold', fontSize: 8 },
      { text: 'Número guía: '+this.notaPedido.value.numeroGuia, style: 'bold', fontSize: 8 },
      { text: 'Método de pago: '+this.notaPedido.value.metodoPago, style: 'bold', fontSize: 8 },
      '\n',
      { text: 'Productos', style: 'bold', fontSize: 8 },
      {
        table: {
          widths: ['auto', 'auto', 50, 'auto', 'auto'],
          headerRows: 1,
          body:tableData,
        }
      },
      { text: 'Total envío: $' + this.notaPedido.value.envioTotal, style: 'bold', fontSize: 8, margin: [0, 10, 0, 0] },
      { text: 'Total a pagar por el cliente: $' + this.notaPedido.value.total, style: 'bold', fontSize: 8 },
      '\n',
      { text: 'Datos entrega', style: 'bold', fontSize: 8 },
      { text: 'Nombres: ' + this.notaPedido.value.facturacion.nombres, fontSize: 8 },
      { text: 'Apellidos: ' + this.notaPedido.value.facturacion.apellidos, fontSize: 8 },
      { text: 'Correo: ' + this.notaPedido.value.facturacion.correo, fontSize: 8 },
      { text: 'Número de identificación: ' + this.notaPedido.value.facturacion.identificacion, fontSize: 8 },
      { text: 'Teléfono: ' + this.notaPedido.value.facturacion.telefono, fontSize: 8 },
      { text: 'País: ' + this.notaPedido.value.facturacion.pais, fontSize: 8 },
      { text: 'Provincia: ' + this.notaPedido.value.facturacion.provincia, fontSize: 8 },
      { text: 'Ciudad: ' + this.notaPedido.value.facturacion.ciudad, fontSize: 8 },
      { text: 'Calle principal: ' + this.notaPedido.value.facturacion.callePrincipal, fontSize: 8 },
      { text: 'Número: ' + this.notaPedido.value.facturacion.numero, fontSize: 8 },
      { text: 'Calle secundaria : ' + this.notaPedido.value.facturacion.calleSecundaria, fontSize: 8 },
      { text: 'Referencia: ' + this.notaPedido.value.facturacion.referencia, fontSize: 8 },
      { text: 'GPS: ' + this.notaPedido.value.facturacion.gps, fontSize: 8 }
    ];

    const guiaContentA7Column2 = [
      {
        image: image64,
        width: 50,
        height: 50,
        alignment: 'start',
      },
      { text: 'Fecha pedido: '+this.notaPedido.value.created_at, style: 'bold', fontSize: 8 },
      { text: 'Número pedido: '+this.notaPedido.value.numeroPedido, style: 'bold', fontSize: 8 },
      { text: 'Número guía: '+this.notaPedido.value.numeroGuia, style: 'bold', fontSize: 8 },
      { text: 'Método de pago: '+this.notaPedido.value.metodoPago, style: 'bold', fontSize: 8 },
      '\n',
      { text: 'Productos', style: 'bold', fontSize: 8 },
      {
        table: {
          widths: ['auto', 'auto', 50, 'auto', 'auto'],
          headerRows: 1,
          body:tableData2,
        }
      },
      { text: 'Total envío: $' + this.notaPedido.value.envioTotal, style: 'bold', fontSize: 8, margin: [0, 10, 0, 0] },
      { text: 'Total a pagar por el cliente: $' + this.notaPedido.value.total, style: 'bold', fontSize: 8 },
      '\n',
      { text: 'Datos entrega', style: 'bold', fontSize: 8 },
      { text: 'Nombres: ' + this.notaPedido.value.facturacion.nombres, fontSize: 8 },
      { text: 'Apellidos: ' + this.notaPedido.value.facturacion.apellidos, fontSize: 8 },
      { text: 'Correo: ' + this.notaPedido.value.facturacion.correo, fontSize: 8 },
      { text: 'Número de identificación: ' + this.notaPedido.value.facturacion.identificacion, fontSize: 8 },
      { text: 'Teléfono: ' + this.notaPedido.value.facturacion.telefono, fontSize: 8 },
      { text: 'País: ' + this.notaPedido.value.facturacion.pais, fontSize: 8 },
      { text: 'Provincia: ' + this.notaPedido.value.facturacion.provincia, fontSize: 8 },
      { text: 'Ciudad: ' + this.notaPedido.value.facturacion.ciudad, fontSize: 8 },
      { text: 'Calle principal: ' + this.notaPedido.value.facturacion.callePrincipal, fontSize: 8 },
      { text: 'Número: ' + this.notaPedido.value.facturacion.numero, fontSize: 8 },
      { text: 'Calle secundaria : ' + this.notaPedido.value.facturacion.calleSecundaria, fontSize: 8 },
      { text: 'Referencia: ' + this.notaPedido.value.facturacion.referencia, fontSize: 8 },
      { text: 'GPS: ' + this.notaPedido.value.facturacion.gps, fontSize: 8 }

    ];

    const guiaContentA7Column3 = [
      {
        image: image64,
        width: 50,
        height: 50,
        alignment: 'start',
      },
      { text: 'Fecha pedido: '+this.notaPedido.value.created_at, style: 'bold', fontSize: 8 },
      { text: 'Número pedido: '+this.notaPedido.value.numeroPedido, style: 'bold', fontSize: 8 },
      { text: 'Número guía: '+this.notaPedido.value.numeroGuia, style: 'bold', fontSize: 8 },
      { text: 'Método de pago: '+this.notaPedido.value.metodoPago, style: 'bold', fontSize: 8 },
      '\n',
      { text: 'Productos', style: 'bold', fontSize: 8 },
      {
        table: {
          widths: ['auto', 'auto', 50, 'auto', 'auto'],
          headerRows: 1,
          body:tableData3,
        }
      },
      { text: 'Total envío: $' + this.notaPedido.value.envioTotal, style: 'bold', fontSize: 8, margin: [0, 10, 0, 0] },
      { text: 'Total a pagar por el cliente: $' + this.notaPedido.value.total, style: 'bold', fontSize: 8 },
      '\n',
      { text: 'Datos entrega', style: 'bold', fontSize: 8 },
      { text: 'Nombres: ' + this.notaPedido.value.facturacion.nombres, fontSize: 8 },
      { text: 'Apellidos: ' + this.notaPedido.value.facturacion.apellidos, fontSize: 8 },
      { text: 'Correo: ' + this.notaPedido.value.facturacion.correo, fontSize: 8 },
      { text: 'Número de identificación: ' + this.notaPedido.value.facturacion.identificacion, fontSize: 8 },
      { text: 'Teléfono: ' + this.notaPedido.value.facturacion.telefono, fontSize: 8 },
      { text: 'País: ' + this.notaPedido.value.facturacion.pais, fontSize: 8 },
      { text: 'Provincia: ' + this.notaPedido.value.facturacion.provincia, fontSize: 8 },
      { text: 'Ciudad: ' + this.notaPedido.value.facturacion.ciudad, fontSize: 8 },
      { text: 'Calle principal: ' + this.notaPedido.value.facturacion.callePrincipal, fontSize: 8 },
      { text: 'Número: ' + this.notaPedido.value.facturacion.numero, fontSize: 8 },
      { text: 'Calle secundaria : ' + this.notaPedido.value.facturacion.calleSecundaria, fontSize: 8 },
      { text: 'Referencia: ' + this.notaPedido.value.facturacion.referencia, fontSize: 8 },
      { text: 'GPS: ' + this.notaPedido.value.facturacion.gps, fontSize: 8 }

    ];


    const pdfDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
          columns: [
            guiaContentA7Column1,
            guiaContentA7Column2,
            guiaContentA7Column3
          ]
        },
      ],
      pageMargins: [20, 5, 20, 20]
    };

    const pdf = pdfMake.createPdf(pdfDefinition);
    pdf.getBlob((blob: Blob) => {
      const archivoPDF = new File([blob], `${this.notaPedido.value.facturacion.nombres}.pdf`, { type: 'application/pdf' });

      // Crea un nuevo FormData y adjunta el archivo PDF
      const formData = new FormData();
      formData.append('archivoGuia', archivoPDF);

      // Agrega cualquier otro dato necesario al FormData
      formData.append('id', this.notaPedido.value.id);

      // Llama al método de actualización del servicio con el FormData
      this.pedidosService.actualizarPedidoFormData(formData)
        .subscribe();
    });
    pdf.open();

  }

  onSelectChange(event: any) {
    const selectedValue = event.target.value;
    if (selectedValue === 'Servi Entrega') {
      this.mostrarDiv = true;
    } else {
      this.mostrarDiv = false;
    }
  }

  onFileSelected(event: any) {
    this.fileToUpload = event.target.files.item(0);
  }

  guardarGuiaServiEntrega(){
    if(this.archivo){
      const formData = new FormData();
      formData.append('guiServiEntrega', this.fileToUpload, this.fileToUpload.name);
      formData.append('id',this.notaPedido.value.id);
      formData.append('verificarGeneracionGuia','1');
      this.pedidosService.actualizarPedidoFormData(formData)
        .subscribe(()=> {
          window.alert('Archivo guardado.');
          this.obtenerTransacciones();
          this.modalService.dismissAll();
        });

    } else {
  console.error('No se ha seleccionado ningún archivo.');
}

  }

}
