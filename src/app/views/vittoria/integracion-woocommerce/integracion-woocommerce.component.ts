import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamService} from '../../../services/admin/param.service';

@Component({
  selector: 'app-integracion-woocommerce',
  templateUrl: './integracion-woocommerce.component.html',
  styleUrls: ['./integracion-woocommerce.component.css']
})
export class IntegracionWoocommerceComponent implements OnInit, AfterViewInit {
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
  tiposOpciones = '';
  tipos;
  nombreBuscar;
  nombre;
  nombreTipo = '';
  descripcion;
  funcion = '';
  idParametro;
  tipoPadre = '';
  idPadre = 0;
  tipoVariable;
  valor;
  padres;

  // @ViewChild('padres') padres;
  constructor(
    private paramService: ParamService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
  ) {
  }

  get f() {
    return this.paramForm.controls;
  }

  ngOnInit(): void {
    this.paramForm = this._formBuilder.group({
      nombre: ['', []],
      nombreTipo: ['', []],
      descripcion: ['', []],
      tipoVariable: ['', []],
      valor: ['', [Validators.required]]
    });
    this.menu = {
      modulo: 'adm',
      seccion: 'param'
    };
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
    this.obtenerListaParametros();
  }

  async iniciarPaginador(): Promise<void> {
    await this.paramService.obtenerListaTipos().subscribe((result) => {
      this.tipos = result;
    });
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaParametros();
    });

  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramService.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar).subscribe((result) => {
      this.parametros = result.info;
      this.collectionSize = result.cont;
    });
  }

  async editarParametro(id): Promise<void> {

    this.idParametro = id;
    this.funcion = 'editar';

    await this.paramService.obtenerParametro(id).subscribe(async (result) => {
      if (result.idPadre) {
        await this.paramService.obtenerParametro(result.idPadre).subscribe(async (data) => {
          this.tipoPadre = data.tipo;
          await this.paramService.obtenerListaPadres(data.tipo).subscribe((result2) => {
            this.padres = result2;
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

  insertarParametro(): void {
    this.nombre = '';
    this.nombreTipo = 'INTEGRACION_WOOCOMMERCE';
    this.descripcion = 'Paginas de integracion de woocommerce';
    this.tipoPadre = '';
    this.tipoVariable = 'texto';
    this.valor = '';
    this.idPadre = 0;
    this.submitted = false;

    this.funcion = 'insertar';
  }

  async gestionarParametro(): Promise<void> {

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

  abrirModal(modal, id): void {
    this.idParametro = id;
    this.modalService.open(modal);
  }

  async cerrarModal(): Promise<void> {
    this.modalService.dismissAll();
    if (this.funcion !== 'editar' && this.funcion !== 'insertar') {
      await this.paramService.eliminarParametro(this.idParametro).subscribe((result) => {
        this.obtenerListaParametros();
      });
    }
    this.funcion = '';
  }

  async buscarPadre(): Promise<void> {
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

}
