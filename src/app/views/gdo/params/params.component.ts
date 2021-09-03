import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ParamService } from 'src/app/services/gdo/param/param.service';

@Component({
  selector: 'app-params',
  templateUrl: './params.component.html'
})

export class ParamsComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  vista;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  parametros;
  tiposOpciones: string = "";
  tipos;
  nombreBuscar;
  nombre;
  nombreTipo = "";
  descripcion;
  funcion;
  idParametro;
  tipoPadre = "";
  idPadre = 0;
  tipoVariable;
  minimo;
  maximo;
  valor;
  @ViewChild('padres') padres;

  constructor(
    private modalService: NgbModal,
    private paramService: ParamService
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "gdo",
      seccion: "param"
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
    await this.paramService.obtenerListaParametros({ page: this.page - 1, page_size: this.pageSize, tipo: this.tiposOpciones, nombre: this.nombreBuscar }).subscribe((result) => {
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
        this.tipoPadre = "";
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
    this.nombre = "";
    this.nombreTipo = "";
    this.descripcion = "";
    this.tipoPadre = "";
    this.tipoVariable = "";
    this.valor = "";
    this.idPadre = 0;
    this.funcion = 'insertar';
    this.minimo = "";
    this.maximo = "";
  }
  async gestionarParametro() {
    if (this.funcion == "insertar") {
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
        });
    }
  }

  abrirModal(modal, id) {
    this.idParametro = id;
    this.modalService.open(modal)
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

}