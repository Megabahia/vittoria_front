import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-transacciones-add',
  templateUrl: './transacciones-add.component.html',
})
export class TransaccionesAddComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "clientesTransacAdd"
    };
  }

}
