import { Component, OnInit } from '@angular/core';
import { Transaccion, ClientesService } from '../../../../../services/mdm/personas/clientes/clientes.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { ParamService } from '../../../../../services/mdm/param/param.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transacciones-add',
  templateUrl: './transacciones-add.component.html',
  providers: [DatePipe]
})
export class TransaccionesAddComponent implements OnInit {
  menu;
  transaccion: Transaccion;
  detallesForm;
  detalles: FormArray;
  detallesTransac;
  public isCollapsed = [];
  tipoIdentificacionOpciones;
  iva;
  ultimaFactura = 0;
  fechaActual = new Date();
  canalOpciones;
  constructor(
    private formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private paramService: ParamService,
    private datePipe: DatePipe
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
    this.menu = {
      modulo: "mdm",
      seccion: "clientesTransacAdd"
    };
    this.detallesForm = this.formBuilder.group({
      detalles: new FormArray([this.crearDetalle()])
    });
    this.obtenerTipoIdentificacionOpciones();
    this.obtenerIVA();
    this.obternerUltimaTransaccion();
    this.obtenerCanales();
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  crearDetalle() {
    return this.formBuilder.group(this.clientesService.inicializarDetalle());
  }
  addItem(): void {
    this.detalles = this.detallesForm.get('detalles') as FormArray;
    this.detalles.push(this.crearDetalle());
    this.isCollapsed.push(false);
  }
  removeItem(i): void {
    this.isCollapsed.splice(i, 1);
    this.detalles.removeAt(i);
  }
  calcularSubtotal() {
    let detalles = this.detallesForm.value.detalles;
    let subtotal = 0;
    let descuento = 0;
    let cantidad = 0;
    if (detalles) {
      detalles.map((valor) => {
        let valorUnitario = valor.valorUnitario ? valor.valorUnitario : 0;
        let porcentDescuento = valor.descuento ? valor.descuento : 0;
        let cantidadProducto = valor.cantidad ? valor.cantidad : 0;
        let precio = cantidadProducto * valorUnitario;
        valor.precio = precio;
        valor.valorDescuento = precio * (porcentDescuento / 100);
        descuento += precio * (porcentDescuento / 100);
        subtotal += precio;
        cantidad += valor.cantidad ? valor.cantidad : 0;
      });
    }

    this.transaccion.numeroProductosComprados = cantidad;
    this.detallesTransac = detalles;
    this.transaccion.subTotal = this.redondear(subtotal);
    this.transaccion.iva = this.redondear(subtotal * this.iva.valor);
    this.transaccion.descuento = this.redondear(descuento);
    this.transaccion.total = this.redondear(subtotal + this.transaccion.iva - descuento);
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

  async obtenerTipoIdentificacionOpciones() {
    await this.paramService.obtenerListaPadres("TIPO_IDENTIFICACION").subscribe((info) => {
      this.tipoIdentificacionOpciones = info;
    });
  }
  async obtenerIVA() {
    await this.paramService.obtenerParametroNombreTipo("ACTIVO", "TIPO_IVA").subscribe((info) => {
      this.iva = info;
    });
  }
  async guardarTransaccion() {
    this.calcularSubtotal();
    this.transaccion.detalles = this.detallesTransac;
    await this.clientesService.crearTransaccion(this.transaccion).subscribe(() => {
      window.location.href = '/mdm/clientes/clientes/transacciones/list';

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
