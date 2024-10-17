import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbPagination, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ParamService as AdmParamService, ParamService} from 'src/app/services/admin/param.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-params-list',
  templateUrl: './params-list.component.html'
})
export class ParamsListComponent implements OnInit {
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
  canal = '';
  tiempo_entrega = '';
  tipoVariable;
  valor;
  padres;
  mostrarCanales = false;
  canalOpciones;

  // @ViewChild('padres') padres;
  constructor(
    private paramService: ParamService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private paramServiceAdm: AdmParamService,
  ) {
    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar).subscribe((result) => {
      this.canalOpciones = result.data;
    });
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
      valor: ['', [Validators.required]],
      canal: [''],
      tiempo_entrega: [''],
    });
    this.menu = {
      modulo: 'adm',
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
      if (result.tipo === 'METODO PAGO') {
        this.mostrarCanales = true;
      } else {
        this.mostrarCanales = false;
      }
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
      this.canal = result.canal;
      this.tiempo_entrega = result.tiempo_entrega;
    });
  }

  insertarParametro(): void {
    this.nombre = '';
    this.nombreTipo = '';
    this.descripcion = '';
    this.tipoPadre = '';
    this.tipoVariable = '';
    this.valor = '';
    this.idPadre = 0;
    this.submitted = false;
    this.canal = '';
    this.tiempo_entrega = '';
    this.funcion = 'insertar';
    this.mostrarCanales = false;
  }

  onChangeTipoPago(e: any) {
    if (e.target.value === 'METODO PAGO') {
      this.mostrarCanales = true;
    } else {
      this.mostrarCanales = false;
    }
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
        this.idPadre,
        this.canal,
        this.tiempo_entrega
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
        this.idPadre,
        this.canal,
        this.tiempo_entrega).subscribe((result) => {
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

  async cerrarModal() {
    this.modalService.dismissAll();
    if (this.funcion !== 'editar' && this.funcion !== 'insertar') {
      await this.paramService.eliminarParametro(this.idParametro).subscribe((result) => {
        this.obtenerListaParametros();
      });
    }
    this.funcion = '';
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

}
