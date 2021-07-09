import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-productos-editar',
  templateUrl: './productos-editar.component.html'
})
export class ProductosEditarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  // in app.component.ts
  files: File[] = [];

  onSelect(event) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

}
