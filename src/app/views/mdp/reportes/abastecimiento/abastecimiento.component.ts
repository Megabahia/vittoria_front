import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos-abastecimiento',
  templateUrl: './abastecimiento.component.html'
})
export class AbastecimientoComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "abastRep"
    };
  }

}
