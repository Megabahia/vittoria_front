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
  tiposOpciones: number = 0;
  tipos;
  nombreBuscar;
  nombre;
  idTipo = 0;
  descripcion;
  funcion;
  idParametro;
  constructor(
    private paramService: ParamService,
    private modalService: NgbModal
    ) { }

  ngOnInit(): void {
    this.menu = 'param';
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
    await this.paramService.obtenerParametro(id).subscribe((result) => {
      this.nombre = result.nombre;
      this.idTipo = result.idTipo;
      this.descripcion = result.descripcion;
    });
  }
  insertarParametro() {
    this.nombre = "";
    this.idTipo = 0;
    this.descripcion = "";
    this.funcion = 'insertar';
  }
  async gestionarParametro() {
    if (this.funcion == "insertar") {
      await this.paramService.insertarParametro(this.nombre, this.idTipo, this.descripcion).subscribe((result) => {
        this.obtenerListaParametros();
      });
    } else if (this.funcion = 'editar') {
      await this.paramService.editarParametro(this.idParametro, this.nombre, this.idTipo, this.descripcion).subscribe((result) => {
        this.obtenerListaParametros();
      });
    }
  }

  abrirModal(modal,id){
    this.idParametro=id;
    this.modalService.open(modal)
  }
  async cerrarModal(){
    this.modalService.dismissAll();
   await this.paramService.eliminarParametro(this.idParametro).subscribe((result)=>{
      this.obtenerListaParametros();
    });
  }

}
