import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../../environments/environment';
import {ParamService as AdmParamService} from '../../../../../services/admin/param.service';
import {Toaster} from "ngx-toast-notifications";
import {Form, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-stock-virtual-listar',
  templateUrl: './stock-virtual-listar.component.html'
})
export class StockVirtualListarComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  canalStockVirtual: FormGroup;
  menu;
  vista = 'lista';
  page = 1;
  pageSize: any = 3;
  maxSize;
  collectionSize;
  listaProductos;
  idProducto = 0;
  codigoBarrasProducto = '';
  canalProducto = ''
  nombreBuscar: string;
  codigoBarras: string;
  enviando = false;
  canalOpciones;
  canalOpcionesModal;
  canalSeleccionado = '';
  seleccionados = [];
  listaStockVirtual;

  constructor(
    private productosService: ProductosService,
    private modalService: NgbModal,
    private paramServiceAdm: AdmParamService,
    private toaster: Toaster,
    private formBuilder: FormBuilder,
  ) {
    this.canalStockVirtual = this.formBuilder.group({
      canales: this.formBuilder.array([])
    });

    this.obtenerListaParametros();
    this.obtenerListaParametrosModal();
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

  get detallesArray(): FormArray {
    return this.canalStockVirtual.get('canales') as FormArray;
  }

  agregarItem(): void {
    this.detallesArray.push(this.crearDetalleGrupo());
  }

  crearDetalleGrupo(): any {
    return this.formBuilder.group({
      canal: [''],
      estado: [false]
    });
  }

  get getstockVirtual(): FormArray {
    return this.canalStockVirtual.get('canales') as FormArray;
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
        canalProducto: this.canalSeleccionado
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

  abrirModalStockVirtual(modal, id, codigoBarras, canal, stockVirtual): void {
    this.idProducto = id;
    this.codigoBarrasProducto = codigoBarras;
    this.canalProducto = canal;

    const canalUnicos = new Map();

    for (const canalModal of this.canalOpcionesModal) {
      canalUnicos.set(canalModal.canal, canalModal);
    }

    // Solo actualiza con stockVirtual si hay canales disponibles
    if (stockVirtual && stockVirtual.canales && stockVirtual.canales.length > 0) {
      for (const stockModal of stockVirtual.canales) {
        canalUnicos.set(stockModal.canal, {...canalUnicos.get(stockModal.canal), ...stockModal});
      }
    }
    // Convertimos el mapa de vuelta a un arreglo y lo establecemos en this.canalOpcionesModal
    this.canalOpcionesModal = Array.from(canalUnicos.values());

    this.getstockVirtual.clear()
    this.canalOpcionesModal.map((item): void => {
      this.agregarItem();
    });

    this.canalStockVirtual.patchValue({
      canales: this.canalOpcionesModal
    });
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

  async obtenerListaParametrosModal(): Promise<void> {
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar)
      .subscribe((result) => {
        this.canalOpcionesModal = result.data.map(opcion => {
          //const isMatching = opcion.valor === this.canalProducto;
          // Seleccionado si coincide con canalProducto o está en listaStockVirtual
          //const seleccionado = isMatching;
          // Deshabilitar si coincide exactamente con canalProducto
          //const deshabilitado = isMatching;
          // Añadir al arreglo seleccionados si está seleccionado y aún no está en el arreglo
          //if (seleccionado) {
          this.seleccionados.push(opcion.valor);
          //}
          return {
            //...opcion,
            canal: opcion.valor,
            estado: false
            //seleccionado,
            ///deshabilitado
          };
        });

      });
  }

  onSelectChange(e: any): void {
    const selectValue = e.target.value;
    this.canalSeleccionado = selectValue;
  }

  actualizarProducto() {
    const datos = {
      stockVirtual: this.canalStockVirtual.value,
      codigoBarras: this.codigoBarrasProducto,
      canal: this.canalProducto
    }

    this.productosService.actualizarProducto(datos, this.idProducto).subscribe(
      info => {
        this.toaster.open('Producto actualizado', {type: 'info'});
        this.obtenerListaProductos();
        this.modalService.dismissAll();
      },
      error => {
        this.toaster.open(error, {type: 'danger'});
      }
    );
  }

  actualizarSeleccionados(event: any, opcion: any): void {
    if (event.target.checked) {
      if (!this.seleccionados.includes(opcion.valor)) {
        this.seleccionados.push({canal: opcion.valor});
      }
    } else {
      const index = this.seleccionados.indexOf(opcion.valor);
      if (index !== -1) {
        this.seleccionados.splice(index, 1);
      }
    }
  }

  protected readonly JSON = JSON;
}
