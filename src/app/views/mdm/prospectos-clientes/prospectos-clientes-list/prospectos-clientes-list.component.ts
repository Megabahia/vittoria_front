import { Component, OnInit, ViewChild } from '@angular/core';
import { ProspectosService } from '../../../../services/mdm/prospectosCli/prospectos.service';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-prospectos-clientes-list',
  templateUrl: './prospectos-clientes-list.component.html',
  providers: [DatePipe]
})
export class ProspectosClientesListComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;
  @ViewChild('eliminarProspectoMdl') eliminarProspectoMdl;
  public mensaje = "";

  numRegex = /^-?\d*[.,]?\d{0,2}$/;

  cargando = false;
  idProspecto = 0;
  submitted = false;
  menu;
  canalOpciones;
  canalLista = "";
  vendedor = "";
  vendedorOpciones;
  fecha = "";
  confirmProspectoLista = "";
  confirmProspectoOpciones;
  tipoPrecioOpciones;
  tipoClienteOpciones;
  pageSize: any = 10;
  page = 1;
  maxSize;
  collectionSize;
  lista;
  usuario: FormData = new FormData();
  pospectoForm: FormGroup;
  idUsuario;
  nombres;
  apellidos;
  telefono;
  tipoCliente = "";
  whatsapp;
  facebook;
  twitter;
  instagram;
  correo1;
  correo2;
  ciudad;
  canal = "";
  codigoProducto;
  nombreProducto;
  precio;
  tipoPrecio = "";
  nombreVendedor;
  confirmacionProspecto = "";
  imagen;
  vista;
  constructor(
    private prospectosService: ProspectosService,
    private datePipe: DatePipe,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.pospectoForm = this._formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      tipoCliente: ['', [Validators.required]],
      whatsapp: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      facebook: ['', [Validators.required]],
      twitter: ['', [Validators.required]],
      instagram: ['', [Validators.required]],
      correo1: ['', [Validators.required]],
      correo2: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      canal: ['', [Validators.required]],
      codigoProducto: ['', [Validators.required]],
      nombreProducto: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.pattern(this.numRegex)]],
      tipoPrecio: ['', [Validators.required]],
      nombreVendedor: ['', [Validators.required]],
      confirmacionProspecto: ['', [Validators.required]]
    });
    this.menu = {
      modulo: "mdm",
      seccion: "prospectosCli"
    };
    this.vista = 'lista';
  }
  async ngAfterViewInit() {
    this.obtenerCanales();
    this.obtenerProspectos();
    this.obtenerVendedores();
    this.obtenerListaProspectos();
    this.iniciarPaginador();
    this.obtenerTiposPrecio();
    this.obtenerTiposCliente();
  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProspectos();
    });
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  get f() {
    return this.pospectoForm.controls;
  }
  async obtenerListaProspectos() {
    await this.prospectosService.obtenerLista(
      {
        page: this.page - 1,
        page_size: this.pageSize,
        canal: this.canalLista,
        created_at: this.fecha,
        nombreVendedor: this.vendedor,
        confirmacionProspecto: this.confirmProspectoLista
      }
    )
      .subscribe((info) => {
        this.lista = info.info;
        this.collectionSize = info.cont;
      }
      );
  }
  async removerImagen() {

  }
  async obtenerCanales() {
    await this.prospectosService.obtenerFiltro("CANAL").subscribe((info) => {
      this.canalOpciones = info;
    });
  }
  async obtenerVendedores() {
    await this.prospectosService.obtenerVendedor("Vendedor").subscribe((info) => {
      this.vendedorOpciones = info;
    });
  }
  async obtenerProspectos() {
    await this.prospectosService.obtenerFiltro("CONFIRMACION_PROSPECTO").subscribe((info) => {
      this.confirmProspectoOpciones = info;
    });
  }
  async obtenerTiposPrecio() {
    await this.prospectosService.obtenerFiltro("TIPO_PRECIO").subscribe((info) => {
      this.tipoPrecioOpciones = info;
    });
  }
  async obtenerTiposCliente() {
    await this.prospectosService.obtenerFiltro("TIPO_CLIENTE").subscribe((info) => {
      this.tipoClienteOpciones = info;
    });
  }
  async guardarImagen(event) {
    this.imagen = event.target.files[0];
  }
  async crearProspecto() {
    this.submitted = true;
    // if (this.pospectoForm.invalid || !this.imagen) {
      if(this.pospectoForm.invalid){
        return;
      }
    // }
    this.cargando = true;
    this.usuario.append('nombres', this.nombres);
    this.usuario.append('apellidos', this.apellidos);
    this.usuario.append('telefono', this.telefono);
    this.usuario.append('tipoCliente', this.tipoCliente);
    this.usuario.append('whatsapp', this.whatsapp);
    this.usuario.append('facebook', this.facebook);
    this.usuario.append('twitter', this.twitter);
    this.usuario.append('instagram', this.instagram);
    this.usuario.append('correo1', this.correo1);
    this.usuario.append('correo2', this.correo2);
    this.usuario.append('ciudad', this.ciudad);
    this.usuario.append('canal', this.canal);
    this.usuario.append('codigoProducto', this.codigoProducto);
    this.usuario.append('nombreProducto', this.nombreProducto);
    this.usuario.append('tipoPrecio', this.tipoPrecio);
    this.usuario.append('precio', this.precio);
    this.usuario.append('nombreVendedor', this.nombreVendedor);
    this.usuario.append('confirmacionProspecto', this.confirmacionProspecto);
    if(this.imagen){
      this.usuario.append('imagen', this.imagen, this.imagen.name);
    }
    this.prospectosService.crearProspectos(this.usuario).subscribe(() => {
      this.obtenerListaProspectos();
      this.dismissModal.nativeElement.click();
      this.submitted = false;
      this.cargando = false;
      this.mensaje = "Prospecto creado exitosamente";
      this.abrirModal(this.mensajeModal);

    },
      (error) => {
        let errores = Object.values(error);
        let llaves = Object.keys(error);
        this.mensaje = "";
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ": " + infoErrores + "<br>";
        });
        this.abrirModal(this.mensajeModal);
        this.cargando = false;

      }
    );
  }
  abrirModal(modal) {
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  editarProspecto(id) {
    this.idUsuario = id;
    this.vista = 'editar';
  }
  eliminarProspecto(id) {
    this.idProspecto = id;
    this.abrirModal(this.eliminarProspectoMdl);
  }
  eliminarProspectoModal() {
    this.prospectosService.eliminarProspecto(this.idProspecto).subscribe((info) => {
      this.obtenerListaProspectos();
      this.cerrarModal();
    });

  }

}
