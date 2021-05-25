import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prospectos-clientes-list',
  templateUrl: './prospectos-clientes-list.component.html'
})
export class ProspectosClientesListComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "prospectosCli"
    };
  }

}
