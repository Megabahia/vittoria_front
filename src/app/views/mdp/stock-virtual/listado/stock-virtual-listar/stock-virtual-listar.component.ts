import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../../../services/mdp/productos/productos.service';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../../../environments/environment';
import {ParamService as AdmParamService} from '../../../../../services/admin/param.service';
import {Toaster} from "ngx-toast-notifications";

@Component({
    selector: 'app-stock-virtual-listar',
    templateUrl: './stock-virtual-listar.component.html'
})
export class StockVirtualListarComponent implements OnInit, AfterViewInit {
    @ViewChild(NgbPagination) paginator: NgbPagination;
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
    canalSeleccionado = '';
    seleccionados = [];

    constructor(
        private productosService: ProductosService,
        private modalService: NgbModal,
        private paramServiceAdm: AdmParamService,
        private toaster: Toaster,
    ) {
        this.obtenerListaParametros();
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

    abrirModalStockVirtual(modal, id, codigoBarras, canal): void {
        this.idProducto = id;
        this.codigoBarrasProducto = codigoBarras;
        this.canalProducto = canal
        this.obtenerListaParametros();
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
        await this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar).subscribe((result) => {
            this.canalOpciones = result.data.filter(item => item.valor !== this.canalProducto);
        });
    }

    onSelectChange(e: any): void {
        const selectValue = e.target.value;
        this.canalSeleccionado = selectValue;
    }

    actualizarProducto() {
        this.productosService.actualizarProducto({
            stockVirtual: this.seleccionados,
            codigoBarras: this.codigoBarrasProducto,
            canal: this.canalProducto
        }, this.idProducto).subscribe((info) => {
                this.toaster.open('Producto actualizado', {type: 'info'});
                this.modalService.dismissAll();
            },
            (error) => {
                this.toaster.open(error, {type: 'danger'});
            });
    }

    actualizarSeleccionados(event, opcion): void {
        if (event.target.checked) {
            // Añadir un objeto al arreglo
            this.seleccionados.push({canal: opcion.valor});
        } else {
            // Buscar el índice del objeto por su propiedad 'canal'
            const index = this.seleccionados.findIndex(item => item.canal === opcion.valor);
            if (index !== -1) {
                this.seleccionados.splice(index, 1);
            }
        }
    }
}
