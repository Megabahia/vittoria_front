import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-negocios-list',
  templateUrl: './negocios-list.component.html',
})
export class NegociosListComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "negociosList"
    };
  }

}
