import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos-caducidad',
  templateUrl: './caducidad.component.html'
})
export class CaducidadComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "caduRep"
    };
  }

}
