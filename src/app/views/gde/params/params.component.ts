import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {ParamService} from 'src/app/services/gde/param/param.service';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '../../../services/admin/auth.service';

@Component({
  selector: 'app-params',
  templateUrl: './params.component.html'
})

export class ParamsComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  paramForm: FormGroup;
  submitted;
  menu;
  vista;
  page = 1;
  pageSize: any = 10;
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
  minimo;
  maximo;
  valor;
  padres;
  currentUserValue;

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
      modulo: 'gde',
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
    await this.paramService.obtenerListaParametros({
      page: this.page - 1,
      page_size: this.pageSize,
      tipo: this.tiposOpciones,
      nombre: this.nombreBuscar
    }).subscribe((result) => {
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
      this.maximo = result.maximo;
      this.minimo = result.minimo;
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
    this.minimo = '';
    this.maximo = '';
  }

  async gestionarParametro() {

    this.submitted = true;
    if (this.paramForm.invalid) {
      return;
    }
    if (this.funcion == 'insertar') {
      await this.paramService.insertarParametro({
        nombre: this.nombre,
        tipo: this.nombreTipo,
        descripcion: this.descripcion,
        tipoVariable: this.tipoVariable,
        valor: this.valor,
        idPadre: this.idPadre,
        minimo: this.minimo,
        maximo: this.maximo
      }).subscribe((result) => {
        this.obtenerListaParametros();
        this.dismissModal.nativeElement.click();
        this.submitted = false;

      });
    } else if (this.funcion = 'editar') {
      await this.paramService.editarParametro(
        {
          id: this.idParametro,
          nombre: this.nombre,
          tipo: this.nombreTipo,
          descripcion: this.descripcion,
          tipoVariable: this.tipoVariable,
          valor: this.valor,
          idPadre: this.idPadre,
          minimo: this.minimo,
          maximo: this.maximo
        }).subscribe((result) => {
        this.obtenerListaParametros();
        this.dismissModal.nativeElement.click();
        this.submitted = false;
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

  exportar(): void {
    this.paramService.exportar().subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'parametrizaciones.xls';
      link.click();
    });
  }
}
