import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';

import {DatePipe} from '@angular/common';

import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {Toaster} from 'ngx-toast-notifications';

import {AuthService} from "../../../services/admin/auth.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-reporte-producto',
  templateUrl: './reporte_productos.component.html',
  providers: [DatePipe]
})
export class ReporteProductosComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;

  menu;
  page = 1;
  pageSize: any = 10;
  collectionSize;
  listaContactos;
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  verificarContacto = false;
  whatsapp = '';
  correo = ''
  mostrarInputComprobante = false;
  mostrarCargarArchivo = false;
  mostrarInputTransaccion = false;
  mostrarInputCobro = false;
  fileToUpload: File | null = null;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  parametroIva;
  totalIva;
  canalOpciones;
  verificarParametros = true;

  nombre;
  codigoBarras;
  canalProducto;
  imagenPrincipal;
  sinCanal;
  estado;
  listaProductos;
  token;
  inicio;
  fin;
  inicioActualizacion;
  finActualizacion;
  codigoBarrasBuscar;
  sortColumn: string = '';
  sortDirection: string = '';
  imagenSeleccionada: string = '';
  headers = [
    {name: 'Tienda', value: 'canal'},
    {name: 'Fecha de creación', value: 'created_at'},
    {name: 'Fecha de actualización', value: 'updated_at'},
    {name: 'Código de barras', value: 'codigoBarras'},
    {name: 'Nombre', value: 'nombre'},
    {name: 'Precio Venta A', value: 'precioVentaA'},
    {name: 'Precio Venta B', value: 'precioVentaB'},
    {name: 'Precio Venta C', value: 'precioVentaC'},
    {name: 'Precio Venta D', value: 'precioVentaD'},
    {name: 'Precio Venta E', value: 'precioVentaE'},
    {name: 'Categoría', value: 'categoria'},
    {name: 'Subcategoría', value: 'subCategoria'},
    {name: 'Stock', value: 'stock'},
    {name: 'Estado', value: 'estado'},
    {name: 'Foto principal', value: 'imagen_principal'},
    {name: 'Fotos secundarias', value: 'imagenes'},
  ];
  mostrarSpinner = false;

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private toaster: Toaster,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
  }

  cerrarSesion(): void {
    this.authService.signOut();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      //if (Object.keys(params).length === 0) {
      //  this.verificarParametros = false;
      //} else {
      this.verificarParametros = true;
      this.nombre = params['nombre'];
      this.codigoBarras = params['codigoBarras'];
      this.canalProducto = params['canalProducto'];
      this.imagenPrincipal = params['imagen_principal'];
      this.sinCanal = params['sinCanal'];
      this.estado = params['estado'];
      this.token = params['token'];
      this.inicio = params['inicio'];
      this.fin = params['fin'];
      this.inicioActualizacion = params['inicio_actualizacion'];
      this.finActualizacion = params['fin_actualizacion'];
      //}
    });
    //this.obtenerListaProductos();
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
      nombre: this.nombre,
      codigoBarras: this.codigoBarrasBuscar ? this.codigoBarrasBuscar : this.codigoBarras,
      canalProducto: this.canalProducto,
      imagen_principal: this.imagenPrincipal,
      sinCanal: this.sinCanal,
      estado: this.estado,
      token: this.token
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
    this.mostrarSpinner = true;

    this.productosService.obtenerReporteHtmlProductos(filtros).subscribe((info) => {
        this.listaProductos = info.info;
        this.collectionSize = info.cont;
        this.mostrarSpinner = false;
      }, error => {
        this.mostrarSpinner = false;

      }
    );
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  ordenar(columna: string) {
    if (this.sortColumn === columna) {
      // Alternar la dirección del orden actual
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Cambiar a una nueva columna
      this.sortColumn = columna;
      this.sortDirection = 'asc'; // Por defecto, se ordena ascendente
    }

    // Ordenar la lista según la columna seleccionada
    this.listaProductos = [...this.listaProductos].sort((a, b) => {
      const valA = a[columna];
      const valB = b[columna];

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  isSortable(column: string): boolean {
    // Define las columnas que se pueden ordenar
    const sortableColumns = [
      'created_at',
      'updated_at',
      'precioVentaA',
      'precioVentaB',
      'precioVentaC',
      'precioVentaD',
      'precioVentaE',
      'stock',
    ];
    return sortableColumns.includes(column);
  }

  abrirModalImagen(imagen: string): void {
    this.imagenSeleccionada = imagen;
    const modal = document.getElementById('modalZoom');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

}
