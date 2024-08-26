import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';
import {PedidosService} from '../../../services/mp/pedidos/pedidos.service';
import {logger} from 'codelyzer/util/logger';
import {Toaster} from 'ngx-toast-notifications';
import {IntegracionesEnviosService} from '../../../services/admin/integraciones_envios.service';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {AuthService} from '../../../services/admin/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-gd-consulta-productos',
  templateUrl: './gd-consulta-productos.component.html',
  styleUrls: ['./gd-consulta-productos.component.css']
})


export class GdConsultaProductosComponent implements OnInit {

  @Input() paises;
  public notaPedido: FormGroup;
  archivo: FormData = new FormData();


  habilitarFinalizarPedido = true;
  tipoIdentificacion;
  datos: any[] = [];
  pais = 'Ecuador';
  provincia = '';
  ciudad = '';
  sector = '';

  callePrincipal = '';
  calleSecundaria = '';

  ciudadOpciones;
  provinciaOpciones;
  page = 1;
  // tslint:disable-next-line:variable-name
  page_size: any = 3;
  parametros;
  integracionEnvio: any[] = [];
  nombreProducto;
  codigoBarras;
  producto;
  integracionProducto;
  totalProductosEnOrigen;

  mostrarDatosEnvio = false;

  couriers: any[] = [];

  carrito: any[] = [];

  mostrarDatosProducto = false;

  sectorOpciones;

  cantidadProductoCarrito = 1;

  constructor(
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private _router: Router,
    private integracionesEnviosService: IntegracionesEnviosService,
    private productosService: ProductosService,
    private authService: AuthService,
    private modalService: NgbModal,
  ) {
  }

  ngOnInit(): void {
    this.obtenerProvincias();
  }

  async obtenerProducto(): Promise<void> {
    this.mostrarDatosEnvio = false;
    if (!this.codigoBarras && !this.nombreProducto) {
      this.toaster.open('Ingrese un dato para buscar producto', {type: 'danger'});
      return;
    }

    return new Promise((resolve, reject) => {
      const data = {
        codigoBarras: this.codigoBarras,
        nombre: this.nombreProducto,
        state: 1,
        estado: 'Activo',
      };

      this.productosService.obtenerProductoPorCodigoCanal(data).subscribe((info) => {
        this.producto = info.producto;
        this.integracionProducto = info.integraciones_canal;
        this.totalProductosEnOrigen = info.productos;
        //this.totalProductosEnOrigen.map((courier) => this.couriers.push(courier.courier));
        //console.log('COURIERS', this.couriers);
        //this.obtenerDatosOrigenProducto();
        this.mostrarDatosProducto = true;
      }, error => this.toaster.open(error, {type: 'danger'}));
    });
  }

  consultarDatosEnvio(): void {
    this.integracionEnvio = [];
    if (this.provincia === '' || this.ciudad === '' || this.sector === '') {
      this.toaster.open('Complete los campos requeridos', {type: 'danger'});
      return;
    }
    this.obtenerFacturasEnvio();
    //this.mostrarSelectCourier = true;
  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerSector(): void {
    this.paramServiceAdm.obtenerListaHijos(this.ciudad, 'CIUDAD').subscribe((info) => {
      this.sectorOpciones = info;
    });
  }

  /*obtenerDatosOrigenProducto(): void {
    const todosProductos: any[] = [];
    this.totalProductosEnOrigen.map(item => {
      this.integracionesEnviosService.obtenerListaIntegracionesEnviosSinAuth({
        ciudad: item.ciudad,
        sector: item.sector
      }).subscribe((result) => {
        todosProductos.push(result.info);
        if (result.cont === 0) {
          this.toaster.open(`No existe datos de envío`);
        }
      });
    })
    this.dataOrigenProductoEnvio = todosProductos;
    console.log('DATOS DESTINO PROD', this.dataOrigenProductoEnvio);
  }*/

  obtenerFacturasEnvio(): void {
    if (this.ciudad && this.sector) {

      this.totalProductosEnOrigen.map(producto => {
        this.integracionesEnviosService.obtenerListaIntegracionesEnviosSinAuth({
          ciudad: producto.ciudad,
          ciudadDestino: this.ciudad,
          sector: producto.sector,
          sectorDestino: this.sector
        }).subscribe((result) => {
          if (result.cont === 0) {
            this.mostrarDatosEnvio = false;
            this.toaster.open(`No existe datos de envío`);
          } else {

            this.mostrarDatosEnvio = true;
            this.integracionEnvio.push({envio: {...result.info}, datos_producto: producto});
            this.integracionEnvio.sort((a, b) => {
              return a.envio['0'].distancia - b.envio['0'].distancia; // De menor a mayor
            });
          }
        });
      });
    }
  }

  agregarCarrito(modal, datos) {
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
    const productoExistente = this.carrito.find(p => p.sku_del_producto === datos.codigoBarras && p.tienda_producto === datos.prefijo);

    if (!productoExistente) {
      const nuevoProducto = {
        sku_del_producto: datos.codigoBarras,
        nombre_del_producto: datos.nombre,
        precio_del_producto: datos.precioVentaA,
        cantidad_en_el_carrito: 1,
        total_del_articulo: datos.precioVentaA,
        imagen_del_producto: datos.imagen_principal,
        tienda_producto: datos.prefijo,
        canal: datos.canal
      };
      this.carrito.push(nuevoProducto);
    }

  }

  verCarrito(modal): void {
    if (this.carrito.length < 1) {
      this.toaster.open('No existe productos en el carrito', {type: 'danger'});
      return;
    }
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }

  eliminarProductoCarrito(i) {
    if (i >= 0 && i < this.carrito.length) {
      this.carrito.splice(i, 1);
    }
  }

  finalizarPedido() {
    if (this.carrito.length < 1) {
      this.toaster.open('No existe productos en el carrito', {type: 'danger'});
      return;
    }

    /*const datosInvalidos = this.carrito.map((datos) => datos.cantidad_en_el_carrito < 1);

    if (datosInvalidos) {
      this.toaster.open('Valores inválidos', {type: 'danger'});
      return;
    }*/

    const datosCarrito = encodeURIComponent(JSON.stringify(this.carrito));
    const baseUrl = environment.apiUrlFront;
    const urlCompleta = `${baseUrl}/#/gsb/pedido_woocommerce/crear?cadena=${datosCarrito}`;

    // Abrir la URL en una nueva pestaña
    window.open(urlCompleta, '_blank');

  }

  cerrarSesion(): void {
    this.authService.signOut();
  }

  escogerCantidad(operacion, i, datos): void {
    if (operacion === 'sumar') {
      datos.cantidad_en_el_carrito++;
      datos.total_del_articulo = datos.cantidad_en_el_carrito * datos.precio_del_producto;
    } else if (operacion === 'restar' && datos.cantidad_en_el_carrito > 0) {
      datos.cantidad_en_el_carrito--;
      datos.total_del_articulo = datos.cantidad_en_el_carrito * datos.precio_del_producto;
    }
  }

  generarPedido(data: any): void {
    localStorage.setItem('productoData', JSON.stringify(data));
    window.open('#/gdp/pedidos', '_blank');
  }

}



