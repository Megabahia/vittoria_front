import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../../environments/environment';
import {ParamService as AdmParamService} from "../../../../../services/admin/param.service";
import {Toaster} from "ngx-toast-notifications";
import {IntegracionesService} from "../../../../../services/admin/integraciones.service";
import {AuthService} from "../../../../../services/admin/auth.service";
import {NavigationExtras, Router} from "@angular/router";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-productos-listar',
  templateUrl: './productos-listar.component.html',
  providers: [DatePipe]
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
  filtroCanal;
  estadoProducto = '';
  currentUser;
  inicio;
  fin;
  inicioActualizacion;
  finActualizacion;
  filtros = false;
  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramServiceAdm: AdmParamService,
    private toaster: Toaster,
    private integracionesService: IntegracionesService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe,
  ) {
    //this.inicio.setMonth(this.inicio.getMonth() - 3);
    //this.inicioActualizacion.setMonth(this.inicioActualizacion.getMonth() - 3);
    this.currentUser = this.authService.currentUserValue;
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

    const filtros: any = {
      page: this.page - 1,
      page_size: this.pageSize,
      nombre: this.nombreBuscar,
      codigoBarras: this.codigoBarras,
      canalProducto: this.canalSeleccionado,
      imagen_principal: this.filtroImagen,
      sinCanal: this.filtroCanal,
      estado: this.estadoProducto,
    };

    // Solo añadir fechas si han sido seleccionadas
    if (this.inicio) {
      filtros['inicio'] = this.transformarFecha(this.inicio);
    }
    if (this.fin) {
      filtros['fin'] = this.transformarFecha(this.fin);
    }
    if (this.inicioActualizacion) {
      filtros['inicio_actualizacion'] = this.transformarFecha(this.inicioActualizacion);
    }
    if (this.finActualizacion) {
      filtros['fin_actualizacion'] = this.transformarFecha(this.finActualizacion);
    }
    this.productosService.obtenerListaProductos(filtros).subscribe((info) => {
      this.listaProductos = info.info;
      this.collectionSize = info.cont;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
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

    const filtros: any = {
      page: this.page - 1,
      page_size: this.pageSize,
      nombre: this.nombreBuscar,
      codigoBarras: this.codigoBarras,
      canalProducto: this.canalSeleccionado,
      imagen_principal: this.filtroImagen,
      sinCanal: this.filtroCanal,
      estado: this.estadoProducto,
    };

    // Solo añadir fechas si han sido seleccionadas
    if (this.inicio) {
      filtros['inicio'] = this.transformarFecha(this.inicio);
    }
    if (this.fin) {
      filtros['fin'] = this.transformarFecha(this.fin);
    }
    if (this.inicioActualizacion) {
      filtros['inicio_actualizacion'] = this.transformarFecha(this.inicioActualizacion);
    }
    if (this.finActualizacion) {
      filtros['fin_actualizacion'] = this.transformarFecha(this.finActualizacion);
    }

    this.productosService.exportar(filtros).subscribe((data) => {
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
    if (this.currentUser.usuario.idRol !== 1) {
      this.canalSeleccionado = this.currentUser.usuario.canal;
      this.disabledSelectCanal = true;
    }
    /*const usuarioJSON = localStorage.getItem('currentUser');
    if (usuarioJSON) {
      const usuarioObjeto = JSON.parse(usuarioJSON);
      if (usuarioObjeto.usuario.idRol === 60) {
        this.canalSeleccionado = usuarioObjeto.usuario.canal;
        this.disabledSelectCanal = true;
      }
    } else {
      console.log('No hay datos de usuario en localStorage');
    }*/
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

    this.productosService.copiarProducto({'canal': this.canal}, this.idProductoCopia).subscribe(() => {
      this.toaster.open('Producto copiado con éxito.', {type: 'success'});
      this.modalService.dismissAll();
      this.obtenerListaProductos();
    }, error => window.alert(error));
  }

  reporteProductosHtml() {

    const queryParams: any = {
      nombre: this.nombreBuscar,
      codigoBarras: this.codigoBarras,
      canalProducto: this.canalSeleccionado !== '' ? this.canalSeleccionado : null,
      imagen_principal: this.filtroImagen,
      sinCanal: this.filtroCanal,
      estado: 'Activo',
    };

    // Agregar solo las fechas definidas
    if (this.inicio) {
      queryParams['inicio'] = this.transformarFecha(this.inicio);
    }
    if (this.fin) {
      queryParams['fin'] = this.transformarFecha(this.fin);
    }
    if (this.inicioActualizacion) {
      queryParams['inicio_actualizacion'] = this.transformarFecha(this.inicioActualizacion);
    }
    if (this.finActualizacion) {
      queryParams['fin_actualizacion'] = this.transformarFecha(this.finActualizacion);
    }

    const navigationExtras: NavigationExtras = {queryParams};

    // Navegar al componente de destino con datos
    //this.router.navigate(['/pages/reporte/productos'], navigationExtras);

    this.productosService.generarTokenReporteProductos(
      {
        enlace: this.router.serializeUrl(this.router.createUrlTree(['/pages/reporte/productos'], navigationExtras)),
        usuario: this.currentUser.full_name,
        codigo_usuario: this.currentUser.usuario.username,
      }
    ).subscribe((info) => {
      navigationExtras.queryParams['token'] = info.token;

      const urlTree = this.router.createUrlTree(['/pages/reporte/productos'], navigationExtras);
      const fullUrl = this.router.serializeUrl(urlTree);
      const completeUrl = `${window.location.origin}/#${fullUrl}`;
      window.open(completeUrl, '_blank');
      //this.router.navigateByUrl(urlTree, '_blank');
    }, error => this.toaster.open('error', {type: 'danger'}));

  }


  activarFiltros(){
    this.filtros = !this.filtros;
  }
}
