import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { ParamService } from 'src/app/services/admin/param.service';
import { ParamService as ParamServiceMDO } from 'src/app/services/mdo/param/param.service';
import { ExportService } from '../../../../services/admin/export.service';
import { GenerarService, Oferta, Detalles } from '../../../../services/mdo/ofertas/generar/generar.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { ClientesService } from '../../../../services/mdm/personas/clientes/clientes.service';
import { NegociosService } from '../../../../services/mdm/personas/negocios/negocios.service';
import { ProductosService } from '../../../../services/mdp/productos/productos.service';

@Component({
  selector: 'app-generar',
  templateUrl: './generar.component.html',
  providers: [DatePipe]
})
export class GenerarComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  fecha = "";
  inicio = "";
  fin = "";
  ultimosProductos;
  prediccion;
  cliente;
  tipoCliente = "";
  tipoClienteModal = "";
  identificacion;
  infoExportar = [];
  listaOfertas;

  fechaActual = new Date();
  identificacionOfertaBusq;
  telefonoOfertaBusq;
  oferta: Oferta;
  tipoClienteOferta = "";
  iva;

  habilitarIdentificacion;
  habilitarTelefono;
  habalitarBusqueda;

  detallesForm;
  detalles: Detalles[] = [];
  detallesTransac;
  public isCollapsed = [];
  listaPrecios = [];
  precios = [];
  tipoCanalOpciones;

  constructor(
    private formBuilder: FormBuilder,
    private generarService: GenerarService,
    private datePipe: DatePipe,
    private globalParam: ParamService,
    private exportFile: ExportService,
    private clientesService: ClientesService,
    private negociosService: NegociosService,
    private paramService: ParamServiceMDO,
    private productosService: ProductosService
  ) {
    this.oferta = this.generarService.inicializarOferta();
  }

  ngOnInit(

  ): void {
    this.menu = {
      modulo: "mdo",
      seccion: "genOferta"
    };
    this.obtenerTipoIdentificacionOpciones();
    this.obtenerIVA(); 
  }
  inicializarDetallesOferta() {
    this.detalles = [];
    this.detalles.push(this.generarService.inicializarDetalle());
    console.log(this.detalles);
    // this.detallesForm = this.formBuilder.group({
    //   detalles: new FormArray([this.crearDetalle()])
    // });
    // this.detalles = this.detallesForm.get('detalles') as FormArray;
    this.listaPrecios.push(
      this.generarService.inicializarPrecios()
    );
    // this.precios = [];
    // this.precios.push(0);
  }
  async ngAfterViewInit() {
    this.iniciarPaginador();
    this.obtenerListaOfertas();

  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaOfertas();
    });
  }
  obtenerListaOfertas() {
    let fecha = this.fecha.split(' to ');
    this.inicio = fecha[0] ? fecha[0] : "";
    this.fin = fecha[1] ? fecha[1] : "";
    let busqueda: any = {
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin
    };
    if (this.tipoCliente == 'negocio') {
      busqueda = { ...busqueda, negocio: 1, identificacion: this.identificacion }
    } else if (this.tipoCliente == 'cliente') {
      busqueda = { ...busqueda, cliente: 1, identificacion: this.identificacion }
    }
    this.generarService.obtenerListaOfertas(
      busqueda
    ).subscribe((info) => {
      this.listaOfertas = info.info;
      this.collectionSize = info.cont;
    });
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  crearDetalle() {
    return this.formBuilder.group(this.generarService.inicializarDetalle());
  }
  addItem(): void {
    // this.detalles = this.detallesForm.get('detalles') as FormArray;
    // this.detalles.push(this.crearDetalle());
    // this.isCollapsed.push(false);
    this.detalles.push(this.generarService.inicializarDetalle());
    this.listaPrecios.push(
      this.generarService.inicializarPrecios()
    );
    // this.precios.push(0);
    // console.log(this.precios);
  }
  removeItem(i): void {
    // console.log(this.detalles)
    // this.isCollapsed.splice(i, 1);

    this.detalles.splice(i, 1);
    this.listaPrecios.splice(i, 1);
    this.precios.splice(i, 1);
    this.calcularSubtotal()
  }

  calcularSubtotal() {
    let detalles = this.detalles;
    let subtotal = 0;
    let descuento = 0;
    let cantidad = 0;
    if (detalles) {
      detalles.map((valor) => {
        let valorUnitario = Number(valor.valorUnitario) ? Number(valor.valorUnitario) : 0;
        let porcentDescuento = valor.descuento ? valor.descuento : 0;
        let cantidadProducto = valor.cantidad ? valor.cantidad : 0;
        let precio = cantidadProducto * valorUnitario;

        valor.valorDescuento = this.redondeoValor(precio * (porcentDescuento / 100));
        descuento += precio * (porcentDescuento / 100);
        subtotal += precio;
        cantidad += valor.cantidad ? valor.cantidad : 0;
        valor.precio = this.redondear(precio);
      });
    }
    // this.detallesTransac = detalles;
    let iva = this.redondear(subtotal * this.iva.valor);
    this.oferta.iva = iva;
    this.oferta.descuento =  this.redondear(descuento);
    this.oferta.total = this.redondear(subtotal + 0 - descuento);
  }
  redondear(num, decimales = 2) {
    var signo = (num >= 0 ? 1 : -1);
    num = num * signo;
    if (decimales === 0) //con 0 decimales
      return signo * Math.round(num);
    // round(x * 10 ^ decimales)
    num = num.toString().split('e');
    num = Math.round(+(num[0] + 'e' + (num[1] ? (+num[1] + decimales) : decimales)));
    // x * 10 ^ (-decimales)
    num = num.toString().split('e');
    let valor = signo * (Number)(num[0] + 'e' + (num[1] ? (+num[1] - decimales) : -decimales));
    return valor;
  }
  redondeoValor(valor){
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }
  verificarBusqueda() {
    if (!this.identificacionOfertaBusq && !this.telefonoOfertaBusq) {
      this.habilitarIdentificacion = false;
      this.habilitarTelefono = false;
    } else if (this.identificacionOfertaBusq) {
      this.habilitarIdentificacion = false;
      this.habilitarTelefono = true;
    } else if (this.telefonoOfertaBusq) {
      this.habilitarIdentificacion = true;
      this.habilitarTelefono = false;
    }
  }
  obtenerCliente() {
    if (this.tipoClienteOferta == "cliente") {
      this.clientesService.obtenerClientePorCedula({ cedula: this.identificacionOfertaBusq }).subscribe((info) => {
        if (info) {
          this.oferta.nombres = info.nombres;
          this.oferta.apellidos = info.apellidos;
          this.oferta.identificacion = info.cedula;
          this.oferta.telefono = info.telefono;
          this.oferta.correo = info.correo;
        }
      },
        (error) => {

        });
    } else if (this.tipoClienteOferta == "negocio") {
      this.negociosService.obtenerNegocioPorRuc({ ruc: this.identificacionOfertaBusq }).subscribe((info) => {
        if (info) {
          this.oferta.nombres = info.razonSocial;
          this.oferta.apellidos = info.nombreComercial;
          this.oferta.identificacion = info.ruc;
          this.oferta.telefono = info.telefonoOficina;
          this.oferta.correo = info.correoOficina;
        }
      })
    }
  }
  crearOferta() {
    this.oferta = this.generarService.inicializarOferta();
    this.oferta.created_at = this.transformarFecha(this.fechaActual);
    this.inicializarDetallesOferta();

  }
  async obtenerIVA() {
    await this.paramService.obtenerParametroNombreTipo("ACTIVO", "TIPO_IVA").subscribe((info) => {
      this.iva = info;
    });
  }
  guardarOferta() {
    if (this.oferta.id == 0) {

    }
  }
  obtenerProducto(i) {
    // let detalles = this.detallesForm.get('detalles')['controls'];
    this.productosService.obtenerProductoPorCodigo({
      codigoBarras: this.detalles[i].codigo
    }).subscribe((info) => {
      if (info.codigoBarras) {
        this.detalles[i].articulo = info.nombre;
        this.detalles[i].imagen = this.obtenerURLImagen(info.imagen);
        this.listaPrecios[i].precioVentaA = info.precioVentaA;
        this.listaPrecios[i].precioVentaB = info.precioVentaB;
        this.listaPrecios[i].precioVentaC = info.precioVentaC;
        this.listaPrecios[i].precioVentaD = info.precioVentaD;
        this.listaPrecios[i].precioVentaE = info.precioVentaE;
      }
    });
  }
  async obtenerTipoIdentificacionOpciones() {
    await this.paramService.obtenerListaPadres("CANAL_VENTA").subscribe((info) => {
      this.tipoCanalOpciones = info;
    });
  }
  // obtenerUltimosProductos(id) {
  //   return this.generarService.obtenerUltimasOfertas(id).subscribe((info) => {
  //     info.map((prod) => {
  //       prod.imagen = this.obtenerURLImagen(prod.imagen);
  //     });
  //     this.ultimosProductos = info;
  //   });
  // }

}
