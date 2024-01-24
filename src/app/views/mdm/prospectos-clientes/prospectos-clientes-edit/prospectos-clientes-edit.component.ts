import {Component, OnInit, Input, ViewChild, Output, EventEmitter} from '@angular/core';
import {ParamService} from 'src/app/services/admin/param.service';
import {ParamService as MDMParamService} from 'src/app/services/mdm/param/param.service';
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

  constructor(
    private prospectosService: ProspectosService,
    private globalParam: ParamService,
    private productosServicer: ProductosService,
    private mdmParamService: MDMParamService,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private toaster: Toaster,
  ) {
  }

  ngOnInit(): void {
    this.prospectosService.obtenerProspecto(this.idUsuario).subscribe((info) => {
      this.prospecto = info;
      this.urlImagen = info.imagen;
      this.prospectoForm.patchValue({...info});
      this.fDetalles.controls[0].get('codigo').setValue(this.prospecto.codigoProducto);
      this.obtenerProducto(0);
      // this.productosServicer.obtenerProductoCodigo(this.prospecto.codigoProducto).subscribe((producto) => {
      //   this.producto = producto;
      // });
      this.obtenerPaisOpciones();
      this.obtenerTipoIdentificacion();
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
      detalles: this._formBuilder.array([
        this._formBuilder.group({
          id: [],
          imagen: ['', []],
          articulo: [0, [Validators.required]],
          valorUnitario: [0, []],
          cantidad: [1, [Validators.required]],
          precio: [0, [Validators.required]],
          codigo: [0, [Validators.required]],
          informacionAdicional: ['compra desde la url', []],
          descuento: [0, []],
          impuesto: [0, []],
          valorDescuento: [0, [Validators.required]],
          total: [0, [Validators.required]],
        }
      )])
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
        imagen: ['', []],
        articulo: [0, [Validators.required]],
        valorUnitario: [0, []],
        cantidad: [1, [Validators.required]],
        precio: [0, [Validators.required]],
        codigo: [0, [Validators.required]],
        informacionAdicional: ['compra desde la url', []],
        descuento: [0, []],
        impuesto: [0, []],
        valorDescuento: [0, [Validators.required]],
        total: [0, [Validators.required]],
      })
    );
  }

  removerItem(i): void {
    // this.calcularSubtotal();
    this.fDetalles.removeAt(i);
  }
  obtenerProducto(i): void {
    console.log('buscar', this.fDetalles.controls[i].get('codigo').value);
    this.productosServicer.obtenerProductoPorCodigo({
      codigoBarras: this.fDetalles.controls[i].get('codigo').value
    }).subscribe((info) => {
      if (info.codigoBarras) {
        this.fDetalles.controls[i].get('articulo').setValue(info.nombre);
        this.fDetalles.controls[i].get('imagen').setValue(info.imagen.toString());
        console.log('llega..', info.precioVentaA);
        this.fDetalles.controls[i].get('precio').setValue(info.precioVentaA);
        this.fDetalles.controls[i].get('valorUnitario').setValue(info.precioVentaA);
        console.log('this.fDetalles.controls[i].get(\'precio\')', this.fDetalles.controls[i].get('imagen').value);
        console.log(this.fDetalles.controls[i]);
      } else {
        // this.comprobarProductos[i] = false;
        alert('No existe el producto a buscar');
        // this.abrirModal(this.mensajeModal);
      }
    }, (error) => {

    });
  }
  calcularSubtotal() {
    // let detalles = this.detalles;
    // let subtotal = 0;
    // let descuento = 0;
    // let cantidad = 0;
    // if (detalles) {
    //   detalles.map((valor) => {
    //     let valorUnitario = Number(valor.valorUnitario) ? Number(valor.valorUnitario) : 0;
    //     let porcentDescuento = valor.descuento ? valor.descuento : 0;
    //     let cantidadProducto = valor.cantidad ? valor.cantidad : 0;
    //     let precio = cantidadProducto * valorUnitario;
    //
    //     valor.valorDescuento = this.redondeoValor(precio * (porcentDescuento / 100));
    //     descuento += precio * (porcentDescuento / 100);
    //     subtotal += precio;
    //     cantidad += valor.cantidad ? valor.cantidad : 0;
    //     valor.precio = this.redondear(precio);
    //     valor.total = valor.precio;
    //
    //   });
    // }
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
      this.prospecto.pais  = this.paisOpciones[0].valor;
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
}
