import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-actualizar-stock',
  templateUrl: './actualizar-stock.component.html'
})
export class ActualizarStockComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdp",
      seccion: "stockAct"
    };
  }

}
