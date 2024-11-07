import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../../environments/environment';
import {ParamService as AdmParamService} from "../../../../../services/admin/param.service";
import {Toaster} from "ngx-toast-notifications";
import {IntegracionesService} from "../../../../../services/admin/integraciones.service";

@Component({
  selector: 'app-productos-listar',
  templateUrl: './productos-listar.component.html'
})
export class ProductosListarComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  vista = 'lista';
  page = 1;
  pageSize: any = 3;
  maxSize;
  collectionSize;
  listaProductos;
  idProducto = 0;
  nombreBuscar: string;
  codigoBarras: string;
  enviando = false;
  canalOpciones;
  canalSeleccionado = '';
  disabledSelectCanal = false;
  canal = '';
  idProductoCopia;
  filtroImagen;
  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramServiceAdm: AdmParamService,
    private toaster: Toaster,
    private integracionesService: IntegracionesService
  ) {
    this.obtenerListaParametrosCanal();
    this.obtenerUsuarioActual();
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdp',
      seccion: 'prodList'
    };

  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerListaProductos();
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProductos();
    });
  }

  obtenerListaProductos(): void {
    this.productosService.obtenerListaProductos(
      {
        page: this.page - 1,
        page_size: this.pageSize,
        nombre: this.nombreBuscar,
        codigoBarras: this.codigoBarras,
        canalProducto: this.canalSeleccionado,
        imagen_principal: this.filtroImagen
      }
    ).subscribe((info) => {
      this.listaProductos = info.info;
      this.collectionSize = info.cont;
    });
  }

  crearProducto(): void {
    this.vista = 'editar';
    this.idProducto = 0;
  }

  editarProducto(id): void {
    this.idProducto = id;
    this.vista = 'editar';
  }

  abrirModal(modal, id): void {
    this.idProducto = id;
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
    this.productosService.eliminarProducto(this.idProducto).subscribe(() => {
      this.obtenerListaProductos();
    }, error => window.alert(error));
  }

  copiarURL(inputTextValue): void {
    const selectBox = document.createElement('textarea');
    selectBox.style.position = 'fixed';
    selectBox.value = `${environment.apiUrlFront}/#/pages/productos/${inputTextValue}`;
    document.body.appendChild(selectBox);
    selectBox.focus();
    selectBox.select();
    document.execCommand('copy');
    document.body.removeChild(selectBox);
  }

  receiveMessage($event): void {
    this.obtenerListaProductos();
    this.vista = $event;
  }

  reporteProductosStock(): void {
    this.enviando = true;
    this.productosService.exportar({}).subscribe((data) => {
      this.enviando = false;
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'productosStock.xlsx';
      link.click();
    }, (error) => {
      this.enviando = false;
    });
  }

  obtenerListaParametros() {
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', '')
      .subscribe((result) => {
        this.canalOpciones = result.data;
      });
  }

  obtenerListaParametrosCanal() {
    const datos = {
      page: this.page,
      page_size: this.pageSize
    };
    this.integracionesService.obtenerListaIntegraciones(datos).subscribe((result) => {
      this.canalOpciones = result.data;
    });
  }

  onSelectChange(e: any): void {
    const selectValue = e.target.value;
    this.canalSeleccionado = selectValue;
  }

  obtenerUsuarioActual(): void {
    const usuarioJSON = localStorage.getItem('currentUser');
    if (usuarioJSON) {
      const usuarioObjeto = JSON.parse(usuarioJSON);
      if (usuarioObjeto.usuario.idRol === 60) {
        this.canalSeleccionado = usuarioObjeto.usuario.canal;
        this.disabledSelectCanal = true;
      }
    } else {
      console.log('No hay datos de usuario en localStorage');
    }
  }

  abrirCopiaProductoModal(modal, id) {
    this.modalService.open(modal, {size: 'sm', backdrop: 'static'});
    this.idProductoCopia = id;
  }

  guardarCopiaProducto() {

    if (this.canal === '') {
      this.toaster.open('Seleccione un canal', {type: 'danger'});
      return;
    }

    this.productosService.copiarProducto({'canal': this.canal }, this.idProductoCopia).subscribe(() => {
      this.toaster.open('Producto copiado con éxito.', {type: 'success'});
      this.modalService.dismissAll();
      this.obtenerListaProductos();
    }, error => window.alert(error));
  }
}
