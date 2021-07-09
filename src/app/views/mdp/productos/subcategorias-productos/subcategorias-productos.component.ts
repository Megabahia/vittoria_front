import { Component, OnInit } from '@angular/core';
import { Subcategoria, SubcategoriasService } from '../../../../services/mdp/productos/subcategorias/subcategorias.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-subcategorias-productos',
  templateUrl: './subcategorias-productos.component.html'
})
export class SubcategoriasProductosComponent implements OnInit {
  menu;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  listaSubcategorias;
  subcategoria:Subcategoria;
  idSubcategoria;
  constructor(
    private modalService: NgbModal,
    private subcategoriasService:SubcategoriasService
  ) {
    this.subcategoria = subcategoriasService.inicializarSubcategoria();
   }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdp",
      seccion: "subCat"
    };
    this.obtenerListaSubcategorias();
  }
  async obtenerListaSubcategorias(){
    await this.subcategoriasService.obtenerListaSubcategoria({
     page:this.page - 1, 
     page_size:this.pageSize
    }).subscribe((info)=>{
      this.listaSubcategorias = info.info;
      this.collectionSize = info.cont;
    });
  }
  async crearSubcategoria(){
    this.subcategoria = this.subcategoriasService.inicializarSubcategoria();
  }

  async editarSubcategoria(id){
    await this.subcategoriasService.obtenerSubcategoria(id).subscribe((info)=>{
      this.subcategoria = info;
    });
  }
  
  async guardarSubcategoria(){
    if(this.subcategoria.id==0){
      await this.subcategoriasService.crearSubcategoria(this.subcategoria).subscribe(()=>{
        this.obtenerListaSubcategorias();
      });
    }else{
      await this.subcategoriasService.actualizarSubcategoria(this.subcategoria).subscribe(()=>{
        this.obtenerListaSubcategorias();
      });
    }
  }
  abrirModal(modal, id) {
    this.idSubcategoria = id;
    this.modalService.open(modal)
  }
  async cerrarModal() {
    this.modalService.dismissAll();
    await this.subcategoriasService.eliminarSubcategoria(this.idSubcategoria).subscribe(() => {
      this.obtenerListaSubcategorias();
    });
  }

}
