import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from 'src/app/services/mdp/productos/productos.service';

@Component({
  selector: 'app-productos-abastecimiento',
  templateUrl: './abastecimiento.component.html'
})
export class AbastecimientoComponent implements OnInit {
  menu;
  constructor(
    private productosService:ProductosService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "abastRep"
    };
  }

}
