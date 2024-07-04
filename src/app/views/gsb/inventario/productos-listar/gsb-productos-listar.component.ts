import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../environments/environment';
import {ParamService as AdmParamService} from "../../../../services/admin/param.service";

@Component({
  selector: 'app-gsb-productos-listar',
  templateUrl: './gsb-productos-listar.component.html'
})
export class GsbProductosListarComponent implements OnInit, AfterViewInit {
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
  disabledSelectCanal= false;
  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramServiceAdm: AdmParamService,
  ) {
    this.obtenerListaParametros();
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
        canalProducto: 'superbarato.megadescuento.com'
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

  async obtenerListaParametros(): Promise<void> {
    await this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar)
      .subscribe((result) => {
        this.canalOpciones = result.data
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
      console.log('Usuario obtenido como objeto:', usuarioObjeto.usuario);
    } else {
      console.log('No hay datos de usuario en localStorage');
    }
  }
}
