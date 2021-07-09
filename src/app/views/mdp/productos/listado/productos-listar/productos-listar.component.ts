import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos-listar',
  templateUrl: './productos-listar.component.html'
})
export class ProductosListarComponent implements OnInit {
  menu;
  vista= "lista";

  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdp",
      seccion: "prodList"
    };
  }

  crearProducto(){
    this.vista = "editar";
  }

  editarProducto(){

  }

}
