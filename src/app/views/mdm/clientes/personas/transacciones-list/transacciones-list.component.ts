import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transacciones-list',
  templateUrl: './transacciones-list.component.html',
})
export class TransaccionesListComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "clientesTransac"
    };
  }

}
