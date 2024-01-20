import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../services/gdp/productos/productos.service';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamService} from '../../../services/mdm/param/param.service';
import {ValidacionesPropias} from '../../../utils/customer.validators';
import {ProspectosService} from '../../../services/mdm/prospectosCli/prospectos.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, AfterViewInit {
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;
  public mensaje = '';
  producto;
  pospectoForm: FormGroup;
  submitted = false;
  numRegex = /^-?\d*[.,]?\d{0,2}$/;
  cargando = false;
  canalOpciones;
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

  ngOnInit(): void {
    this.productoService.obtenerProductoFree(this.rutaActiva.snapshot.params.id).subscribe((info) => {
      this.producto = info;
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
      precio: ['', [Validators.required, Validators.pattern(this.numRegex)]],
    });
  }

  ngAfterViewInit(): void {
    this.obtenerCanales();
    this.obtenerProspectos();
    this.obtenerVendedores();
    this.obtenerTiposPrecio();
    this.obtenerTiposCliente();
    this.obtenerPaisOpciones();
    this.paramService.obtenerListaPadres('PAGINA_PRODUCTOS_URL').subscribe((info: []) => {
      this.tituloPaginaProductos = info.find((item: any) => {
        return item.nombre === 'TITULO_PAGINA_PRODUCTOS';
      });
      this.subTituloPaginaProductos = info.find((item: any) => {
        return item.nombre === 'SUBTITULO_PAGINA_PRODUCTOS';
      });
      this.mensajeModalPedido = info.find((item: any) => {
        return item.nombre === 'MENSAJE_MODAL_COMPLETADO';
      });
    });
    this.paramService.obtenerListaPadres('SERVIENTREGA_PARAMETROS').subscribe((info) => {
      this.imagenServientrega = info[0];
    });
    this.paramService.obtenerListaPadres('TIPO_IDENTIFICACION').subscribe((info) => {
      this.tipoIdentificacion = info;
    });
  }

  obtenerCanales(): void {
    this.paramService.obtenerListaPadres('CANAL').subscribe((info) => {
      this.canalOpciones = info;
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

  obtenerVendedores(): void {
    // this.prospectosService.obtenerVendedor('Vendedor').subscribe((info) => {
    //   this.vendedorOpciones = info;
    // });
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
    this.pospectoForm.get('nombreProducto').setValue(this.producto.titulo);
    this.pospectoForm.get('precio').setValue(this.producto.precio);
    this.submitted = true;
    if (this.pospectoForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'warning'});
      console.log('form', this.pospectoForm);
      return;
    }
    this.cargando = true;
    this.prospectosService.crearProspectos(this.pospectoForm.value).subscribe(() => {
        this.submitted = false;
        this.cargando = false;
        this.cerrarModal();
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
    this.pospectoForm.updateValueAndValidity();
  }
}