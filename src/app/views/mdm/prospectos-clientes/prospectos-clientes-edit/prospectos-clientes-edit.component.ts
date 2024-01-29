import {Component, OnInit, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {ParamService} from 'src/app/services/admin/param.service';
import {ParamService as MDMParamService} from 'src/app/services/mdm/param/param.service';
import {ParamService as MDPParamService} from 'src/app/services/mdp/param/param.service';
import {ProspectosService, Prospecto} from '../../../../services/mdm/prospectosCli/prospectos.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {Toaster} from 'ngx-toast-notifications';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidacionesPropias} from '../../../../utils/customer.validators';

@Component({
  selector: 'app-prospectos-clientes-edit',
  templateUrl: './prospectos-clientes-edit.component.html',
})
export class ProspectosClientesEditComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<string>();
  @ViewChild('eliminarImagenMdl') eliminarImagenMdl;
  @ViewChild('eliminarProspectoMdl') eliminarProspectoMdl;
  @Input() idUsuario;
  @Input() confirmProspectoOpciones;
  prospecto: Prospecto = {
    nombres: '',
    apellidos: '',
    telefono: '',
    tipoCliente: '',
    whatsapp: '',
    facebook: '',
    twitter: '',
    instagram: '',
    correo1: '',
    correo2: '',
    pais: '',
    provincia: '',
    ciudad: '',
    canal: '',
    codigoProducto: '',
    nombreProducto: '',
    precio: 0,
    tipoPrecio: '',
    nombreVendedor: '',
    confirmacionProspecto: '',
    imagen: '',
    comentariosVendedor: '',
    cantidad: '',
    tipoIdentificacion: '',
    identificacion: '',
  };
  urlImagen;
  producto;
  prospectoForm: FormGroup;
  numRegex = /^-?\d*[.,]?\d{0,2}$/;
  paisOpciones;
  provinciaOpciones;
  ciudadOpciones;
  tipoIdentificacion = [];
  submitted = false;
  iva;

  constructor(
    private prospectosService: ProspectosService,
    private globalParam: ParamService,
    private productosServicer: ProductosService,
    private mdmParamService: MDMParamService,
    private mdpParamService: MDPParamService,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private toaster: Toaster,
  ) {
    this.obtenerIVA();
  }

  ngOnInit(): void {
    this.prospectosService.obtenerProspecto(this.idUsuario).subscribe((info) => {
      this.prospecto = info;
      this.urlImagen = info.imagen;
      info.detalles.forEach((detalle, index) => {
        this.agregarItem();
      });
      this.prospectoForm.patchValue({...info});
      info.detalles.forEach((detalle, index) => {
        this.fDetalles.controls[index].get('codigo').setValue(detalle.codigo);
        this.obtenerProducto(index);
      });
      // this.productosServicer.obtenerProductoCodigo(this.prospecto.codigoProducto).subscribe((producto) => {
      //   this.producto = producto;
      // });
      this.obtenerPaisOpciones();
      this.obtenerTipoIdentificacion();
      this.calcularSubtotal();
    });
    this.prospectoForm = this._formBuilder.group({
      id: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      tipoIdentificacion: ['', [Validators.required]],
      identificacion: ['', [
        Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10),
        Validators.maxLength(10), ValidacionesPropias.cedulaValido
      ]],
      whatsapp: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      correo1: ['', [Validators.required, Validators.email]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      callePrincipal: ['', [Validators.required]],
      numeroCasa: ['', [Validators.required]],
      calleSecundaria: ['', [Validators.required]],
      referencia: ['', [Validators.required]],
      comentarios: ['', []],
      nombreProducto: ['', [Validators.required]],
      codigoProducto: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      confirmacionProspecto: ['', [Validators.required]],
      comentariosVendedor: ['', []],
      telefono: ['', [Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      facebook: ['', []],
      twitter: ['', []],
      correo2: ['', []],
      canal: ['', []],
      tipoPrecio: ['', []],
      nombreVendedor: ['', [Validators.required]],
      detalles: this._formBuilder.array([], Validators.required),
      subTotal: ['', [Validators.required]],
      descuento: ['', []],
      iva: ['', [Validators.required]],
      total: ['', [Validators.required]],
    });
    this.mdmParamService.obtenerListaPadres('TIPO_IDENTIFICACION').subscribe((info) => {
      this.tipoIdentificacion = info;
    });
  }

  get f() {
    return this.prospectoForm.controls;
  }

  get fDetalles() {
    return this.prospectoForm.controls['detalles'] as FormArray;
  }

  agregarItem(): void {
    this.fDetalles.push(
      this._formBuilder.group({
        id: [0, []],
        imagen: ['', []],
        articulo: ['', [Validators.required]],
        valorUnitario: [0, [Validators.required, Validators.min(1)]],
        cantidad: [1, [Validators.required, Validators.min(1)]],
        precio: [0, [Validators.required]],
        codigo: [0, [Validators.required]],
        informacionAdicional: ['compra desde la url', []],
        descuento: [0, []],
        impuesto: [0, []],
        valorDescuento: [0, [Validators.required]],
        total: [0, [Validators.required, Validators.min(1)]],
        prospectoClienteEncabezado: [this.prospectoForm.get('id').value, []],
      })
    );
  }

  removerItem(i): void {
    this.fDetalles.removeAt(i);
    this.calcularSubtotal();
  }

  obtenerProducto(i): void {
    this.productosServicer.obtenerProductoPorCodigo({
      codigoBarras: this.fDetalles.controls[i].get('codigo').value,
      lugarVentaCiudad: this.prospectoForm.get('ciudad').value
    }).subscribe((info) => {
      if (info.codigoBarras) {
        this.fDetalles.controls[i].get('articulo').setValue(info.nombre);
        this.fDetalles.controls[i].get('imagen').setValue(info.imagen.toString());
        this.fDetalles.controls[i].get('valorUnitario').setValue(info.precioOferta);
        this.fDetalles.controls[i].get('total').setValue(info.precioOferta * +this.fDetalles.controls[i].get('cantidad').value);
        this.calcularSubtotal();
      } else {
        // this.comprobarProductos[i] = false;
        alert('No existe el producto a buscar');
        // this.abrirModal(this.mensajeModal);
      }
    }, (error) => {

    });
  }

  calcularSubtotal() {
    console.log('detallaes antes', this.prospectoForm.get('detalles').value);
    let detalles = this.prospectoForm.get('detalles').value;
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
        valor.total = valor.precio;

      });
      this.prospectoForm.get('detalles').patchValue(detalles);
      this.prospectoForm.get('subTotal').patchValue(subtotal);
      const iva = Number(subtotal * this.iva.valor).toFixed(2);
      this.prospectoForm.get('iva').patchValue(iva);
      const total = Number(iva + subtotal).toFixed(2);
      this.prospectoForm.get('total').patchValue(total);
    } else {
      this.prospectoForm.get('detalles').patchValue(detalles);
      this.prospectoForm.get('subTotal').patchValue(0);
      this.prospectoForm.get('iva').patchValue(0);
      this.prospectoForm.get('total').patchValue(0);
    }
    console.log('detallaes despues', detalles);
  }

  redondeoValor(valor) {
    return isNaN(valor) ? valor : parseFloat(valor).toFixed(2);
  }

  redondear(num, decimales = 2) {
    var signo = (num >= 0 ? 1 : -1);
    num = num * signo;
    if (decimales === 0) {
      return signo * Math.round(num);
    }
    // round(x * 10 ^ decimales)
    num = num.toString().split('e');
    num = Math.round(+(num[0] + 'e' + (num[1] ? (+num[1] + decimales) : decimales)));
    // x * 10 ^ (-decimales)
    num = num.toString().split('e');
    let valor = signo * (Number)(num[0] + 'e' + (num[1] ? (+num[1] - decimales) : -decimales));
    return valor;
  }

  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }

  async ngAfterViewInit() {

  }

  async subirImagen(event) {
    let imagen = event.target.files[0];
    let imagenForm = new FormData();
    imagenForm.append('imagen', imagen, imagen.name);
    this.prospectosService.insertarImagen(this.idUsuario, imagenForm).subscribe((data) => {
      this.urlImagen = data.imagen;
    });

  }

  abrirModalEliminarImagen(): void {
    this.abrirModal(this.eliminarImagenMdl);
  }

  abrirModalEliminarProspecto(): void {
    this.abrirModal(this.eliminarProspectoMdl);

  }

  eliminarImagen(): void {
    this.prospectosService.insertarImagen(this.idUsuario, {imagen: null}).subscribe((data) => {
      this.urlImagen = data.imagen;
      this.cerrarModal();
    });
  }

  actualizarProspecto(): void {
    this.calcularSubtotal();
    this.submitted = true;
    if (this.prospectoForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'warning'});
      console.log(this.prospectoForm);
      return;
    }
    this.prospectosService.actualizarProspecto(
      this.prospectoForm.value
    ).subscribe(() => {
      this.toaster.open('Actualizacion', {type: 'success'});
      this.messageEvent.emit('lista');
    });
  }

  eliminarProspecto(): void {
    this.prospectosService.eliminarProspecto(this.idUsuario).subscribe((info) => {
      this.messageEvent.emit('lista');
      this.cerrarModal();
    });
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  abrirModalProducto(modal): void {
    this.modalService.open(modal, {size: 'lg', backdrop: 'static'});
  }

  obtenerTipoIdentificacion(): void {
    console.log('entro a buscar', this.prospectoForm);
    if (this.prospectoForm.value.tipoIdentificacion === 'Ruc') {
      this.prospectoForm.get('identificacion').setValidators(
        [Validators.required, ValidacionesPropias.rucValido]
      );
    } else {
      this.prospectoForm.get('identificacion').setValidators(
        [Validators.required, ValidacionesPropias.cedulaValido]
      );
    }
    this.prospectoForm.get('identificacion').updateValueAndValidity();
  }

  obtenerPaisOpciones(): void {
    // this.provincia = '';
    // this.ciudad = '';
    this.mdmParamService.obtenerListaPadres('PAIS').subscribe((info) => {
      this.paisOpciones = info;
      this.prospecto.pais = this.paisOpciones[0].valor;
      this.obtenerProvincias();
    });
  }

  obtenerProvincias(): void {
    // this.ciudad = '';
    this.mdmParamService.obtenerListaHijos(this.prospecto.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
      this.obtenerCiudad();
    });
  }

  obtenerCiudad(): void {
    this.mdmParamService.obtenerListaHijos(this.prospecto.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  async obtenerIVA() {
    await this.mdpParamService.obtenerParametroNombreTipo('ACTIVO', 'TIPO_IVA').subscribe((info) => {
        this.iva = info;
      },
      (error) => {
        alert('Iva no configurado');
      }
    );
  }
}
