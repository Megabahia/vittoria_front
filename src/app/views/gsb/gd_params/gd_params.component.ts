import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {GdParamService} from 'src/app/services/gsb/param/param.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {AuthService} from '../../../services/admin/auth.service';

@Component({
  selector: 'app-gd-params',
  templateUrl: './gd_params.component.html'
})
export class GdParamsComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  paramForm: FormGroup;
  submitted;
  menu;
  vista;
  page = 1;
  pageSize: any = 3;
  maxSize;
  collectionSize;
  parametros;
  tiposOpciones: string;
  tipos;
  nombreBuscar;
  nombre;
  nombreTipo = '';
  descripcion;
  funcion;
  idParametro;
  tipoPadre = '';
  tipoVariable;
  valor;
  padres;
  currentUserValue;
  archivo: FormData = new FormData();
  tipo;

  parametroTiempo;

  // @ViewChild('padres') padres;
  constructor(
    private paramService: GdParamService,
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
      tipo: ['', [Validators.required]],
      tipoVariable: ['', [Validators.required]],
      valor: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });
    this.menu = {
      modulo: 'mdp',
      seccion: 'param'
    };
  }

  async ngAfterViewInit(): Promise<void> {
    this.iniciarPaginador();
    this.obtenerListaParametros();
  }

  async iniciarPaginador(): Promise<void> {
    await this.paramService.obtenerListaTiposGd().subscribe((result) => {
      this.tipos = result;
    });
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaParametros();
    });

  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramService.obtenerListaParametrosGd({
      page: this.page - 1,
      page_size: this.pageSize,
      tipo: this.tiposOpciones,
      nombre: this.nombreBuscar
    }).subscribe((result) => {
      this.parametros = result.info;
      this.collectionSize = result.cont;
    });

  }

  async editarParametro(id): Promise<void> {

    this.idParametro = id;
    this.funcion = 'editar';

    await this.paramService.obtenerParametroGd(id).subscribe(async (result) => {
      this.nombre = result.nombre;
      this.tipo = result.tipo;
      this.tipoVariable = result.tipoVariable;
      this.valor = result.valor;
      this.descripcion = result.descripcion;
    });
  }

  insertarParametro(): void {
    this.nombre = '';
    this.tipo = '';
    this.tipoVariable = '';
    this.valor = '';
    this.descripcion = '';
    this.submitted = false;

    this.funcion = 'insertar';
  }

  async gestionarParametro(): Promise<void> {

    this.submitted = true;
    if (this.paramForm.invalid) {
      return;
    }
    if (this.funcion === 'insertar') {
      await this.paramService.insertarParametroGd({
        nombre: this.nombre,
        tipo: this.tipo,
        tipoVariable: this.tipoVariable,
        valor: this.valor,
        descripcion: this.descripcion
      }).subscribe((result) => {
        this.obtenerListaParametros();
        this.dismissModal.nativeElement.click();
        this.submitted = false;
        this.idParametro = result.id;
        this.actualizarArchivoParametro();
      });
    } else if (this.funcion === 'editar') {
      await this.paramService.editarParametroGd(
        {
          id: this.idParametro,
          nombre: this.nombre,
          tipo: this.tipo,
          tipoVariable: this.tipoVariable,
          valor: this.valor,
          descripcion: this.descripcion
        }).subscribe((result) => {
        this.obtenerListaParametros();
        this.dismissModal.nativeElement.click();
        this.submitted = false;
        this.actualizarArchivoParametro();
      });
    }
  }

  abrirModal(modal, id): void {
    this.idParametro = id;
    this.modalService.open(modal);
  }

  async cerrarModal(): Promise<void> {
    this.modalService.dismissAll();
    await this.paramService.eliminarParametroGd(this.idParametro).subscribe((result) => {
      this.obtenerListaParametros();
    });
  }

  async buscarPadre(): Promise<void> {
    await this.paramService.obtenerListaPadresGd(this.tipoPadre).subscribe((result) => {
      this.padres = result;
    });
  }

  export(): void {
    this.paramService.exportarGd().subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'parametrizaciones.xls';
      link.click();
    });
  }

  actualizarArchivoParametro(): void {
    this.archivo.append('id', this.idParametro);
    this.paramService.actualizarArchivoGd(this.idParametro, this.archivo).subscribe((info) => {
    });
  }

  subirArchivo(event): void {
    this.archivo = new FormData();
    this.archivo.append('archivo', event.target.files[0]);
  }
}
