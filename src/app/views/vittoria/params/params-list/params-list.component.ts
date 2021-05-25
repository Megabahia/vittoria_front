import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ParamService } from 'src/app/services/admin/param.service';

@Component({
  selector: 'app-params-list',
  templateUrl: './params-list.component.html'
})
export class ParamsListComponent implements OnInit {
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
  valor;
  @ViewChild('padres') padres;
  constructor(
    private paramService: ParamService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.menu={
      modulo:"adm",
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
      console.log(result);
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
      }else{
        this.tipoPadre = ""; 
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
    this.nombre = "";
    this.nombreTipo = "";
    this.descripcion = "";
    this.tipoPadre = "";
    this.tipoVariable = "";
    this.valor = "";
    this.idPadre = 0;
    this.funcion = 'insertar';
  }
  async gestionarParametro() {
    if (this.funcion == "insertar") {
      await this.paramService.insertarParametro(
        this.nombre,
        this.nombreTipo,
        this.descripcion,
        this.tipoVariable,
        this.valor,
        this.idPadre
      ).subscribe((result) => {
        this.obtenerListaParametros();
      });
    } else if (this.funcion = 'editar') {
      await this.paramService.editarParametro(
        this.idParametro,
        this.nombre,
        this.nombreTipo,
        this.descripcion,
        this.tipoVariable,
        this.valor,
        this.idPadre).subscribe((result) => {
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
