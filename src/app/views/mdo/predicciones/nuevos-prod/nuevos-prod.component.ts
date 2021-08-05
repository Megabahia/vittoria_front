import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nuevos-prod',
  templateUrl: './nuevos-prod.component.html'
})
export class NuevosProdComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdo",
      seccion: "predNueProd"
    };
  }

}
