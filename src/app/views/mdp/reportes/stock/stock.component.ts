import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductosService } from 'src/app/services/mdp/productos/productos.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html'
})
export class StockComponent implements OnInit {
  menu;
  constructor(
    private productosService:ProductosService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo: "mdp",
      seccion: "stockRep"
    };
  }

}
