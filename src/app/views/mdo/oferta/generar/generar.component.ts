import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { ParamService } from 'src/app/services/admin/param.service';
import { ParamService as ParamServiceMDO } from 'src/app/services/mdo/param/param.service';
import { ExportService } from '../../../../services/admin/export.service';
import { GenerarService, Oferta, Detalles } from '../../../../services/mdo/ofertas/generar/generar.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  @ViewChild('ofertaGuardar') ofertaGuardar;
  @ViewChild('mensajeModal') mensajeModal;

  numRegex = /^-?\d*[.,]?\d{0,2}$/;

  //forms
  ofertaForm: FormGroup;

  //----------------------
  submittedTransaccionForm = false;

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

  ofertaId;
  constructor(
    private _formBuilder: FormBuilder,
    private generarService: GenerarService,
    private datePipe: DatePipe,
    private globalParam: ParamService,
    private exportFile: ExportService,
    private clientesService: ClientesService,
    private negociosService: NegociosService,
    private paramService: ParamServiceMDO,
    private productosService: ProductosService,
    private modalService: NgbModal
  ) {
    this.oferta = this.generarService.inicializarOferta();
  }

  ngOnInit(): void {
    this.ofertaForm = this._formBuilder.group({
      detalles: this._formBuilder.array([
        this.crearDetalleGrupo()
      ]),
      codigoOferta: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      vigenciaOferta: ['', [Validators.required]],
      canal: ['', [Validators.required]],
      calificacionCliente: ['', [Validators.required]],
      indicadorCliente: ['', [Validators.required]],
      personaGenera: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      numeroProductosComprados: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
    });
    this.menu = {
      modulo: "mdo",
      seccion: "genOferta"
    };
    this.obtenerTipoIdentificacionOpciones();
    this.obtenerIVA();
  }
  get oForm() {
    return this.ofertaForm.controls;
  }
  inicializarDetallesOferta() {
    this.detalles = [];
    this.detalles.push(this.generarService.inicializarDetalle());
    this.listaPrecios.push(
      this.generarService.inicializarPrecios()
    );
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
  crearDetalleGrupo() {
    return this._formBuilder.group({
      codigo: ['', [Validators.required]],
      articulo: ['', [Validators.required]],
      valorUnitario: [0, [Validators.required]],
      cantidad: [0, [Validators.required, Validators.pattern("^[0-9]*$"), Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(1)]],
      informacionAdicional: ['', [Validators.required]],
      descuento: [0, [Validators.required, Validators.pattern(this.numRegex)]],
      valorDescuento: [0, [Validators.required]]
    });
  }
  get detallesArray(): FormArray {
    return this.ofertaForm.get('detalles') as FormArray;
  }
  crearDetalle() {
    return this._formBuilder.group(this.generarService.inicializarDetalle());
  }
  agregarItem(): void {
    this.detalles.push(this.generarService.inicializarDetalle());
    this.listaPrecios.push(
      this.generarService.inicializarPrecios()
    );
    let detGrupo = this.crearDetalleGrupo();
    this.detallesArray.push(detGrupo);
  }
  removerItem(i): void {

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

    this.oferta.numeroProductosComprados = cantidad;
    this.detallesTransac = detalles;
    this.oferta.subTotal = this.redondear(subtotal);
    this.oferta.iva = this.redondear((subtotal - descuento) * this.iva.valor);
    this.oferta.descuento = this.redondear(descuento);
    this.oferta.total = this.redondear((subtotal - descuento) + this.oferta.iva);
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
  redondeoValor(valor) {
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
    if (this.identificacionOfertaBusq) {
      if (this.tipoClienteOferta == "cliente") {
        this.clientesService.obtenerClientePorCedula({ cedula: this.identificacionOfertaBusq }).subscribe((info) => {
          if (info) {
            this.oferta.nombres = info.nombres;
            this.oferta.apellidos = info.apellidos;
            this.oferta.identificacion = info.cedula;
            this.oferta.telefono = info.telefono;
            this.oferta.correo = info.correo;
            this.oferta.cliente = info.id;
            this.oferta.negocio = null;
            this.oferta.indicadorCliente = "C-" + info.id;
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
            this.oferta.negocio = info.id;
            this.oferta.cliente = null;
            this.oferta.indicadorCliente = "N-" + info.id;
          }
        })
      }
    } else if (this.telefonoOfertaBusq) {
      if (this.tipoClienteOferta == "cliente") {
        this.clientesService.obtenerClientePorTelefono({ telefono: this.telefonoOfertaBusq }).subscribe((info) => {
          if (info) {
            this.oferta.nombres = info.nombres;
            this.oferta.apellidos = info.apellidos;
            this.oferta.identificacion = info.cedula;
            this.oferta.telefono = info.telefono;
            this.oferta.correo = info.correo;
            this.oferta.cliente = info.id;
            this.oferta.negocio = null;
            this.oferta.indicadorCliente = "C-" + info.id;
          }
        },
          (error) => {

          });
      } else if (this.tipoClienteOferta == "negocio") {
        this.negociosService.obtenerNegocioPorTelefono({ telefonoOficina: this.telefonoOfertaBusq }).subscribe((info) => {
          if (info) {
            this.oferta.nombres = info.razonSocial;
            this.oferta.apellidos = info.nombreComercial;
            this.oferta.identificacion = info.ruc;
            this.oferta.telefono = info.telefonoOficina;
            this.oferta.correo = info.correoOficina;
            this.oferta.negocio = info.id;
            this.oferta.cliente = null;
            this.oferta.indicadorCliente = "N-" + info.id;
          }
        })
      }
    }
  }

  crearOferta() {
    this.oferta = this.generarService.inicializarOferta();
    this.oferta.created_at = this.transformarFecha(this.fechaActual);
    this.oferta.fecha = this.transformarFecha(this.fechaActual);
    this.inicializarDetallesOferta();
    this.listaPrecios = [];
  }
  async obtenerIVA() {
    await this.paramService.obtenerParametroNombreTipo("ACTIVO", "TIPO_IVA").subscribe((info) => {
      this.iva = info;
    });
  }
  async guardarOferta() {
    this.submittedTransaccionForm = true;
    if (this.ofertaForm.invalid) {
      return;
    }
    this.calcularSubtotal();
    this.oferta.fecha = this.transformarFecha(this.fechaActual);
    this.oferta.detalles = this.detallesTransac;
    if (this.oferta.id == 0) {
      await this.generarService.crearOferta(this.oferta).subscribe((info) => {
        this.obtenerListaOfertas();
      });
    } else {
      await this.generarService.actualizarOferta(this.oferta).subscribe((info) => {
        this.obtenerListaOfertas();
      });
    }
  }
  obtenerProducto(i) {
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
  obtenerUltimosProductos(id) {
    this.generarService.obtenerProductosAdquiridos(id).subscribe((info) => {
      info.map((prod) => {
        prod.imagen = this.obtenerURLImagen(prod.imagen);
      });
      this.ultimosProductos = info;
    });
  }
  obtenerOferta(id) {
    this.generarService.obtenerOferta(id).subscribe((info) => {
      this.oferta = info;
      this.detalles = info.detalles;
      this.listaPrecios = [];
      for (let i = 0; i < info.detalles.length; i++) {
        this.listaPrecios.push(
          this.generarService.inicializarPrecios()
        );
        this.obtenerProducto(i);
      }
    });
  }

  abrirModal(modal, id) {
    this.ofertaId = id;
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
    this.generarService.eliminarOferta(this.ofertaId).subscribe(() => {
      this.obtenerListaOfertas();
    });
  }

}
