import { Component, OnInit } from '@angular/core';
import { NegociosService } from '../../../../../services/mdm/personas/negocios/negocios.service';

@Component({
  selector: 'app-negocios-list',
  templateUrl: './negocios-list.component.html',
})
export class NegociosListComponent implements OnInit {
  menu;
  vista="lista";
  idNegocio;
  page=1;
  pageSize=10;
  collectionSize;
  negocios;
  inicio;
  fin;
  
  constructor(private negociosService:NegociosService) { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "negociosList"
    };
    this.obtenerListaNegocios();
  }
  async obtenerListaNegocios(){
    this.negociosService.obtenerListaNegocios(
      {
        inicio:this.inicio,
        fin:this.fin,
        page:this.page-1,
        page_size:this.pageSize}).subscribe((info)=>{
          this.collectionSize=info.cont;
          this.negocios=info.info;
    });
  }
  crearNegocio(){
    this.idNegocio= 0;
    this.vista= 'editar';
  }
  editarNegocio(id){
    this.idNegocio= id;
    this.vista= 'editar';
  }

}
