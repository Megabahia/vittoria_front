import { Component, OnInit } from '@angular/core';
import { Transaccion, ClientesService } from '../../../../../services/mdm/personas/clientes/clientes.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParamService } from '../../../../../services/mdm/param/param.service';
import { ParamService as ParamServiceADM } from '../../../../../services/admin/param.service';
import { DatePipe } from '@angular/common';
import { ProductosService } from '../../../../../services/mdp/productos/productos.service';

@Component({
  selector: 'app-transacciones-add',
  templateUrl: './transacciones-add.component.html',
  providers: [DatePipe]
})
export class TransaccionesAddComponent implements OnInit {
  menu;
  transaccion: Transaccion;
  detallesForm;
  // detalles: FormArray;
  detalles = [];
  detallesTransac;

  //forms
  datosBasicosForm: FormGroup;
  //----------------

  public isCollapsed = [];
  tipoIdentificacionOpciones;
  iva;
  ultimaFactura = 0;
  fechaActual = new Date();
  canalOpciones;
  constructor(
    private _formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private paramService: ParamService,
    private datePipe: DatePipe,
    private productosService: ProductosService,
    private globalParam: ParamServiceADM

  ) {
    this.transaccion = clientesService.inicializarTransaccion();
    this.iva = {
      created_at: "",
      descripcion: "",
      id: 0,
      idPadre: 0,
      nombre: "",
      state: 0,
      tipo: "",
      tipoVariable: "",
      updated_at: "",
      valor: ""
    };
    this.transaccion.fecha = this.transformarFecha(this.fechaActual);

  }

  ngOnInit(): void {

    this.datosBasicosForm = this._formBuilder.group({
      canalCompra: ['', [Validators.required]],
      cliente: [0, [Validators.required]],
      correo: ['', [Validators.required]],
      created_at: ['', [Validators.required]],
      descuento: [0, [Validators.required]],
      detalles: this._formBuilder.array([
        {
          codigo: [0, [Validators.required]],
        }
      ]),
      direccion: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      identificacion: ['', [Validators.required]],
      iva: [0, [Validators.required]],
      nombreVendedor: ['', [Validators.required]],
      numeroFactura: [0, [Validators.required]],
      numeroProductosComprados: [0, [Validators.required]],
      razonSocial: ['', [Validators.required]],
      subTotal: [0, [Validators.required]],
      telefono: ['', [Validators.required]],
      tipoIdentificacion: ['', [Validators.required]],
      total: [0, [Validators.required]],
    });
    this.menu = {
      modulo: "mdm",
      seccion: "clientesTransacAdd"
    };

    this.obtenerTipoIdentificacionOpciones();
    this.obtenerIVA();
    this.obternerUltimaTransaccion();
    this.obtenerCanales();
    this.inicializarDetalles();
  }
  inicializarDetalles() {
    this.detalles = [];
    this.detalles.push(this.clientesService.inicializarDetalle());
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }

  agregarItem(): void {
    this.detalles.push(this.clientesService.inicializarDetalle());
  }
  removerItem(i): void {
    this.detalles.splice(i, 1);
    this.calcularSubtotal();
    // this.isCollapsed.splice(i, 1);
    // this.detalles.removeAt(i);
  }
  obtenerProducto(i) {
    this.productosService.obtenerProductoPorCodigo({
      codigoBarras: this.detalles[i].codigo
    }).subscribe((info) => {
      if (info.codigoBarras) {
        this.detalles[i].articulo = info.nombre;
        this.detalles[i].imagen = this.obtenerURLImagen(info.imagen);
        this.detalles[i].valorUnitario = info.precioVentaA;
      }
    });
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
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

    this.transaccion.numeroProductosComprados = cantidad;
    this.detallesTransac = detalles;
    this.transaccion.subTotal = this.redondear(subtotal);
    this.transaccion.iva = this.redondear((subtotal - descuento) * this.iva.valor);
    this.transaccion.descuento = this.redondear(descuento);
    this.transaccion.total = this.redondear((subtotal - descuento) + this.transaccion.iva);
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
  async obtenerTipoIdentificacionOpciones() {
    await this.paramService.obtenerListaPadres("TIPO_IDENTIFICACION").subscribe((info) => {
      this.tipoIdentificacionOpciones = info;
    });
  }
  async obtenerIVA() {
    await this.paramService.obtenerParametroNombreTipo("ACTIVO", "TIPO_IVA").subscribe((info) => {
      this.iva = info;
    },
      (error) => {

      });
  }
  async guardarTransaccion() {
    this.calcularSubtotal();
    this.transaccion.detalles = this.detallesTransac;
    await this.clientesService.crearTransaccion(this.transaccion).subscribe(() => {
      window.location.href = '/mdm/clientes/personas/transacciones/list';

    });
  }
  async obternerUltimaTransaccion() {
    await this.clientesService.obtenerUltimaTransaccion().subscribe((info) => {
      this.ultimaFactura = info.numeroFactura;
    });
  }
  async obtenerCliente() {
    await this.clientesService.obtenerClientePorCedula({ cedula: this.transaccion.identificacion }).subscribe((info) => {
      if (info) {
        this.transaccion.correo = info.correo;
        this.transaccion.razonSocial = info.nombreCompleto;
        this.transaccion.cliente = info.id;
      }
    });
  }
  async obtenerCanales() {
    await this.paramService.obtenerListaPadres("CANAL").subscribe((info) => {
      this.canalOpciones = info;
    });
  }
}
