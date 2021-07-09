import { Component, OnInit } from '@angular/core';
import { CategoriasService, Categoria } from '../../../../services/mdp/productos/categorias/categorias.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-categorias-productos',
  templateUrl: './categorias-productos.component.html'
})
export class CategoriasProductosComponent implements OnInit {
  menu;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  listaCategorias;
  categoria:Categoria;
  idCategoria;
  constructor(
    private modalService: NgbModal,
    private categoriasService:CategoriasService
  ) {
    this.categoria = categoriasService.inicializarCategoria();
   }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdp",
      seccion: "cat"
    };
    this.obtenerListaCategorias();
  }
  async obtenerListaCategorias(){
    await this.categoriasService.obtenerListaCategoria({
     page:this.page - 1, 
     page_size:this.pageSize
    }).subscribe((info)=>{
      this.listaCategorias = info.info;
      this.collectionSize = info.cont;
    });
  }
  async crearCategoria(){
    this.categoria = this.categoriasService.inicializarCategoria();
  }

  async editarCategoria(id){
    await this.categoriasService.obtenerCategoria(id).subscribe((info)=>{
      this.categoria = info;
    });
  }
  
  async guardarCategoria(){
    if(this.categoria.id==0){
      await this.categoriasService.crearCategoria(this.categoria).subscribe(()=>{
        this.obtenerListaCategorias();
      });
    }else{
      await this.categoriasService.actualizarCategoria(this.categoria).subscribe(()=>{
        this.obtenerListaCategorias();
      });
    }
  }
  abrirModal(modal, id) {
    this.idCategoria = id;
    this.modalService.open(modal)
  }
  async cerrarModal() {
    this.modalService.dismissAll();
    await this.categoriasService.eliminarCategoria(this.idCategoria).subscribe(() => {
      this.obtenerListaCategorias();
    });
  }

}
