import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-refil',
  templateUrl: './refil.component.html'
})
export class RefilComponent implements OnInit {
  menu;
  constructor() { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdo",
      seccion: "predRefil"
    };
  }

}
