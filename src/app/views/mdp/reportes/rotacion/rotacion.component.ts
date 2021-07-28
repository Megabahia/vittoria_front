import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from 'src/app/services/mdp/productos/productos.service';

@Component({
  selector: 'app-rotacion',
  templateUrl: './rotacion.component.html'
})
export class RotacionComponent implements OnInit {
  menu;
  constructor(
    private productosService:ProductosService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "rotaRep"
    };
  }

}
