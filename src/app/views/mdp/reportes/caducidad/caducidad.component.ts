import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from 'src/app/services/mdp/productos/productos.service';

@Component({
  selector: 'app-productos-caducidad',
  templateUrl: './caducidad.component.html'
})
export class CaducidadComponent implements OnInit {
  menu;
  constructor(
    private productosService:ProductosService,
    private modalService: NgbModal

  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "caduRep"
    };
  }

}
