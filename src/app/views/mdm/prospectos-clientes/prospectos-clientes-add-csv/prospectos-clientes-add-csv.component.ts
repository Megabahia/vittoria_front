import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-prospectos-clientes-add-csv',
  templateUrl: './prospectos-clientes-add-csv.component.html',
})
export class ProspectosClientesAddCsvComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "addCSV"
    };
  }

}
