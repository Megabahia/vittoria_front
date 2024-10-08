import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../services/mdp/productos/productos.service';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamService} from '../../../services/mdm/param/param.service';
import {ParamService as MDPParamService} from '../../../services/mdp/param/param.service';
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {ProspectosService} from '../../../services/mdm/prospectosCli/prospectos.service';
import {Toaster} from 'ngx-toast-notifications';
import Decimal from 'decimal.js';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  productoInactivo = false;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;
  public mensaje = '';
  producto;
  pospectoForm: FormGroup;
  submitted = false;
  numRegex = /^-?\d*[.,]?\d{0,2}$/;
  cargando = false;
  paisOpciones;
  provinciaOpciones;
  ciudadOpciones;
  public tipoIdentificacion = [];
  confirmProspectoOpciones;
  tipoPrecioOpciones;
  tipoClienteOpciones;
  public tituloPaginaProductos;
  public subTituloPaginaProductos;
  public mensajeModalPedido;
  public imagenServientrega;

  constructor(
    private toaster: Toaster,
    private rutaActiva: ActivatedRoute,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private paramService: ParamService,
    private MDPparamService: MDPParamService,
    private prospectosService: ProspectosService,
    private productoService: ProductosService,
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
  }

  get f() {
    return this.pospectoForm.controls;
  }

  get fDetalles() {
    return this.pospectoForm.controls['detalles'] as FormArray;
  }

  // Helper method to get the 'subItems' FormArray inside an 'item'
  getSubItems(itemIndex: number) {
    console.log('item', (this.fDetalles.at(itemIndex) as FormGroup));
    return (this.fDetalles.at(itemIndex) as FormGroup) as FormGroup;
  }

  ngOnInit(): void {
    this.productoService.obtenerProductoFree(this.rutaActiva.snapshot.params.id, {estadoLanding: true}).subscribe((info) => {
      this.productoInactivo = false;
      this.producto = info;

      const cuentaForm = this._formBuilder.group({
        articulo: [this.producto.nombre, []],
        valorUnitario: [this.producto.precioLandingOferta, []],
        cantidad: [1, []],
        precio: [this.producto.precioLandingOferta, []],
        codigo: [this.producto.codigoBarras, []],
        informacionAdicional: ['compra desde la url', []],
        descuento: [0, []],
        impuesto: [0, []],
        valorDescuento: [0, []],
        imagen_principal: [this.producto.imagen_principal, []],
        total: [this.producto.precioLandingOferta * 1, []],
      });
      if (!this.producto.envioNivelNacional) {
        this.pospectoForm.get('provincia').setValue(this.producto.lugarVentaProvincia);
        this.obtenerCiudad();
        this.pospectoForm.get('ciudad').setValue(this.producto.lugarVentaCiudad);
      }
      this.fDetalles.push(cuentaForm);
      this.pospectoForm.get('precio').setValue(this.producto.precioLandingOferta * 1);
      this.pospectoForm.get('total').setValue(this.producto.precioLandingOferta * 1);
      this.obtenerParametrosPagina();
      this.pospectoForm.get('courier').setValue(this.producto.courier);
    }, error => {
      this.productoInactivo = true;
    });
    this.pospectoForm = this._formBuilder.group({
      cantidad: [1, [Validators.required, Validators.min(1)]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      tipoIdentificacion: ['', [Validators.required]],
      identificacion: ['', [
        Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10),
        Validators.maxLength(10), ValidacionesPropias.cedulaValido
      ]],
      whatsapp: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(10), Validators.maxLength(10)]],
      correo1: ['', [Validators.required, Validators.email]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      callePrincipal: ['', [Validators.required, Validators.maxLength(150)]],
      numeroCasa: ['', [Validators.required, Validators.maxLength(20)]],
      calleSecundaria: ['', [Validators.required, Validators.maxLength(150)]],
      referencia: ['', [Validators.required, Validators.maxLength(255)]],
      comentarios: ['', [Validators.maxLength(255)]],
      nombreVendedor: [''],
      nombreProducto: ['', [Validators.required]],
      codigoProducto: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      detalles: this._formBuilder.array([]),
      courier: ['', []],
      total: ['', []],
      canalOrigen: [this.cortarUrlLanding(window.location.href), []]
    });
  }

  ngAfterViewInit(): void {
    this.obtenerProspectos();
    this.obtenerTiposPrecio();
    this.obtenerTiposCliente();
    this.obtenerPaisOpciones();
    this.paramService.obtenerListaPadres('TIPO_IDENTIFICACION').subscribe((info) => {
      this.tipoIdentificacion = info;
    });
  }

  obtenerParametrosPagina(): void {
    this.MDPparamService.obtenerListaPadres('PAGINA_PRODUCTOS_URL_' + this.producto.courier).subscribe((info: []) => {
      this.tituloPaginaProductos = info.find((item: any) => {
        return item.nombre === 'TITULO_PAGINA_PRODUCTOS';
      });
      this.subTituloPaginaProductos = info.find((item: any) => {
        return item.nombre === 'SUBTITULO_PAGINA_PRODUCTOS';
      });
      this.mensajeModalPedido = info.find((item: any) => {
        return item.nombre === 'MENSAJE_MODAL_COMPLETADO';
      });
      const nombreVendedor: any = info.find((item: any) => {
        return item.nombre === 'NOMBRE_VENDEDOR';
      });
      this.pospectoForm.get('nombreVendedor').setValue(nombreVendedor?.valor);
      this.imagenServientrega = info.find((item: any) => {
        return item.nombre === 'IMAGEN_COURIER';
      });
    });
  }

  obtenerPaisOpciones(): void {
    // this.provincia = '';
    // this.ciudad = '';
    this.paramService.obtenerListaPadres('PAIS').subscribe((info) => {
      this.paisOpciones = info;
      this.pospectoForm.get('pais').setValue(this.paisOpciones[0].valor);
      this.obtenerProvincias();
    });
  }

  obtenerProvincias(): void {
    // this.ciudad = '';
    this.paramService.obtenerListaHijos(this.pospectoForm.value.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramService.obtenerListaHijos(this.pospectoForm.value.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }

  obtenerProspectos(): void {
    this.paramService.obtenerListaPadres('CONFIRMACION_PROSPECTO').subscribe((info) => {
      this.confirmProspectoOpciones = info;
    });
  }

  obtenerTiposPrecio(): void {
    this.paramService.obtenerListaPadres('TIPO_PRECIO').subscribe((info) => {
      this.tipoPrecioOpciones = info;
    });
  }

  obtenerTiposCliente(): void {
    this.paramService.obtenerListaPadres('TIPO_CLIENTE').subscribe((info) => {
      this.tipoClienteOpciones = info;
    });
  }

  crearProspecto(): void {
    this.pospectoForm.get('nombreProducto').setValue(this.producto.nombre);
    this.pospectoForm.get('codigoProducto').setValue(this.producto.codigoBarras);
    this.pospectoForm.get('telefono').setValue(this.pospectoForm.value.whatsapp);
    this.submitted = true;
    if (this.pospectoForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'warning'});
      console.log('form', this.pospectoForm);
      return;
    }
    this.cargando = true;
    this.prospectosService.crearProspectos(this.pospectoForm.value).subscribe((pedido) => {
        this.submitted = false;
        this.cargando = false;
        this.cerrarModal();
        this.mensaje = `Su pedido ${pedido.id} ha sido recibido. Nuestro asesor se pondrá en contacto con usted a través del número de WhatsApp.`;
        this.modalService.open(this.mensajeModal, {backdrop: 'static', keyboard: false});
      },
      (error) => {
        const errores = Object.values(error);
        const llaves = Object.keys(error);
        errores.map((infoErrores, index) => {
          this.toaster.open(llaves[index] + ': ' + infoErrores, {type: 'danger'});
        });
        this.cargando = false;
      }
    );
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  obtenerTipoIdentificacion(): void {
    if (this.pospectoForm.value.tipoIdentificacion === 'Ruc') {
      this.pospectoForm.get('identificacion').setValidators(
        [Validators.required, ValidacionesPropias.rucValido]
      );
    } else {
      this.pospectoForm.get('identificacion').setValidators(
        [Validators.required, ValidacionesPropias.cedulaValido]
      );
    }
    this.pospectoForm.get('identificacion').updateValueAndValidity();
  }

  modalOpenSM(modalSM): void {
    this.modalService.open(modalSM, {
      centered: true,
      size: 'xl' // size: 'xs' | 'sm' | 'lg' | 'xl'
    });
  }

  escogerCantidad(operacion): void {
    const cantidadControl = this.pospectoForm.get('cantidad');
    let cantidad = +cantidadControl.value;
    cantidad = operacion === 'sumar' ? Math.min(cantidad + 1, this.producto.stock) : Math.max(cantidad - 1, 0);
    cantidadControl.setValue(cantidad);
    this.fDetalles.controls[0].get('cantidad').setValue(cantidad);
    this.fDetalles.controls[0].get('precio').setValue(this.producto.precioLandingOferta);
    const total = +new Decimal(this.producto.precioLandingOferta).mul(cantidad).toFixed(2).toString();
    this.fDetalles.controls[0].get('total').setValue(total);
    this.pospectoForm.get('precio').setValue(this.producto.precioLandingOferta * cantidad);
    this.pospectoForm.get('total').setValue(this.producto.precioLandingOferta * cantidad);
    this.pospectoForm.updateValueAndValidity();
  }

  cortarUrlLanding(url: string): string {
    const withoutProtocol = url.replace(/(^\w+:|^)\/\//, '');  // Elimina el protocolo
    const domainSlashIndex = withoutProtocol.indexOf('/');  // Encuentra el primer slash después del dominio
    if (domainSlashIndex !== -1) {
      return withoutProtocol.substring(0, domainSlashIndex);  // Corta hasta el primer slash después del dominio
    }
    return withoutProtocol;  // Devuelve la URL sin cambios si no hay slash
  }
}
