import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-buscar-producto',
  templateUrl: './buscar-producto.component.html'
})
export class BuscarProductoComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdp",
      seccion: "prodBusq"
    };
  }

}
