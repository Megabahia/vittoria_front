import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ParamService} from 'src/app/services/mdm/param/param.service';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '../../../services/admin/auth.service';

@Component({
  selector: 'app-params',
  templateUrl: './params.component.html'
})
export class ParamsComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;

  cargando = false;
  mensaje = '';
  paramForm: FormGroup;
  submitted;
  menu;
  vista;
  page = 1;
  pageSize: any = 3;
  maxSize;
  collectionSize;
  parametros;
  tiposOpciones: string = '';
  tipos;
  nombreBuscar;
  nombre;
  nombreTipo = '';
  descripcion;
  funcion;
  idParametro;
  tipoPadre = '';
  idPadre = 0;
  tipoVariable;
  valor;
  padres;
  currentUserValue;
  archivo: FormData = new FormData();

  // @ViewChild('padres') padres;
  constructor(
    private paramService: ParamService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.currentUserValue = this.authService.currentUserValue;
  }

  get f() {
    return this.paramForm.controls;
  }

  ngOnInit(): void {
    this.paramForm = this._formBuilder.group({
      nombre: ['', [Validators.required]],
      nombreTipo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      tipoVariable: ['', [Validators.required]],
      valor: ['', [Validators.required]]
    });
    this.menu = {
      modulo: 'mdm',
      seccion: 'param'
    };
  }

  async ngAfterViewInit() {
    this.iniciarPaginador();
    this.obtenerListaParametros();
  }

  async iniciarPaginador() {
    await this.paramService.obtenerListaTipos().subscribe((result) => {
      this.tipos = result;
    });
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaParametros();
    });

  }

  async obtenerListaParametros() {
    await this.paramService.obtenerListaParametros(this.page - 1, this.pageSize, this.tiposOpciones, this.nombreBuscar).subscribe((result) => {
      this.parametros = result.info;
      this.collectionSize = result.cont;
    });

  }

  async editarParametro(id) {

    this.idParametro = id;
    this.funcion = 'editar';

    await this.paramService.obtenerParametro(id).subscribe(async (result) => {
      if (result.idPadre) {
        await this.paramService.obtenerParametro(result.idPadre).subscribe(async (data) => {
          this.tipoPadre = data.tipo;
          await this.paramService.obtenerListaPadres(data.tipo).subscribe((result) => {
            this.padres = result;
          });
        });
        this.idPadre = result.idPadre;
      } else {
        this.tipoPadre = '';
        this.idPadre = 0;

      }
      this.nombre = result.nombre;
      this.nombreTipo = result.tipo;
      this.descripcion = result.descripcion;
      this.tipoVariable = result.tipoVariable;
      this.valor = result.valor;
    });
  }

  insertarParametro() {
    this.nombre = '';
    this.nombreTipo = '';
    this.descripcion = '';
    this.tipoPadre = '';
    this.tipoVariable = '';
    this.valor = '';
    this.idPadre = 0;
    this.submitted = false;

    this.funcion = 'insertar';
  }

  async gestionarParametro() {

    this.submitted = true;
    if (this.paramForm.invalid) {
      return;
    }
    this.cargando = true;
    if (this.funcion === 'insertar') {
      await this.paramService.insertarParametro(
        this.nombre,
        this.nombreTipo,
        this.descripcion,
        this.tipoVariable,
        this.valor,
        this.idPadre
      ).subscribe((result) => {
          this.obtenerListaParametros();
          this.dismissModal.nativeElement.click();
          this.submitted = false;
          this.cargando = false;
          this.mensaje = 'Parámetro guardado';
          this.abrirModalMensaje(this.mensajeModal);
          this.idParametro = result.id;
          this.actualizarArchivoParametro();
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModalMensaje(this.mensajeModal);
        });
    } else if (this.funcion === 'editar') {
      await this.paramService.editarParametro(
        this.idParametro,
        this.nombre,
        this.nombreTipo,
        this.descripcion,
        this.tipoVariable,
        this.valor,
        this.idPadre).subscribe((result) => {
          this.obtenerListaParametros();
          this.dismissModal.nativeElement.click();
          this.submitted = false;
          this.cargando = false;
          this.mensaje = 'Parámetro guardado';
          this.abrirModalMensaje(this.mensajeModal);
          this.idParametro = result.id;
          this.actualizarArchivoParametro();
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModalMensaje(this.mensajeModal);
        });
    }
  }

  abrirModal(modal, id) {
    this.idParametro = id;
    this.modalService.open(modal);
  }

  async cerrarModal() {
    this.modalService.dismissAll();
    await this.paramService.eliminarParametro(this.idParametro).subscribe((result) => {
      this.obtenerListaParametros();
    });
  }

  async buscarPadre() {
    await this.paramService.obtenerListaPadres(this.tipoPadre).subscribe((result) => {
      this.padres = result;
    });
  }

  abrirModalMensaje(modal): void {
    this.modalService.open(modal);
  }

  cerrarModalMensaje(): void {
    this.modalService.dismissAll();
  }

  export(): void {
    this.paramService.exportarUsuarios().subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'parametrizaciones.xls';
      link.click();
    });
  }

  actualizarArchivoParametro(): void {
    this.archivo.append('id', this.idParametro);
    this.paramService.actualizarArchivo(this.idParametro, this.archivo).subscribe((info) => {
    });
  }

  subirArchivo(event): void {
    this.archivo = new FormData();
    this.archivo.append('archivo', event.target.files[0]);
  }
}
