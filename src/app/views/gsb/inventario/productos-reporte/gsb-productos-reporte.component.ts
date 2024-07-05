import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../environments/environment';
import {ParamService as AdmParamService} from "../../../../services/admin/param.service";
import {SuperBaratoService} from "../../../../services/gsb/superbarato/super-barato.service";

@Component({
  selector: 'app-gsb-productos-listar',
  templateUrl: './gsb-productos-reporte.component.html'
})
export class GsbProductosReporteComponent implements OnInit, AfterViewInit {
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
  canalSeleccionado = 'superbarato.megadescuento.com';
  canalSeleccionadoAsignado = '';
  disabledSelectCanal = false;

  constructor(
    private superBaratoService: SuperBaratoService,
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
        canalProducto: 'superbarato.megadescuento.com',
        canalStockVirtual: this.canalSeleccionadoAsignado
      }
    ).subscribe((info) => {
      this.listaProductos = info.info;
      this.collectionSize = info.cont;
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

  onSelectChangeAsignados(e: any): void {
    const selectValue = e.target.value;
    this.canalSeleccionadoAsignado = selectValue;
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

  reporteProductosStock(): void {
    this.enviando = true;
    this.superBaratoService.exportar({
      nombre: this.nombreBuscar,
      codigoBarras: this.codigoBarras,
      canalProducto: 'superbarato.megadescuento.com',
      canalStockVirtual: this.canalSeleccionadoAsignado
    }).subscribe((data) => {
      this.enviando = false;
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'inventarioSuperBarato.xlsx';
      link.click();
    }, (error) => {
      this.enviando = false;
    });
  }
}
