import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generar',
  templateUrl: './generar.component.html'
})
export class GenerarComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdo",
      seccion: "genOferta"
    };
  }

}
