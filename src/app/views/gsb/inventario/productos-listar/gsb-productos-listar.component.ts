import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../environments/environment';
import {ParamService as AdmParamService} from "../../../../services/admin/param.service";
import {SuperBaratoService} from "../../../../services/gsb/superbarato/super-barato.service";

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
    private superBaratoService: SuperBaratoService,
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
    this.superBaratoService.obtenerListaInventario(
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

  editarProducto(id): void {
    this.idProducto = id;
    this.vista = 'editar';
  }


  receiveMessage($event): void {
    this.obtenerListaProductos();
    this.vista = $event;
  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar)
      .subscribe((result) => {
        this.canalOpciones = result.data
      });
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
