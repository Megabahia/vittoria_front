import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rotacion',
  templateUrl: './rotacion.component.html'
})
export class RotacionComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "rotaRep"
    };
  }

}
