import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-personas-list',
  templateUrl: './personas-list.component.html',
})
export class PersonasListComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "clientesList"
    };
  }

}
