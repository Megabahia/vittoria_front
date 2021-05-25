import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prospectos-clientes-add-xlsx',
  templateUrl: './prospectos-clientes-add-xlsx.component.html',
})
export class ProspectosClientesAddXlsxComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "addXLSX"
    };
  }

}
