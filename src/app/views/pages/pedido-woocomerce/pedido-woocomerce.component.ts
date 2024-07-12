import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-pedido-woocomerce',
  templateUrl: './pedido-woocomerce.component.html',
  styleUrls: ['./pedido-woocomerce.component.css']
})
export class PedidoWoocomerceComponent implements OnInit {

  datos;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.datos = JSON.stringify(params);
      console.log(params); // Aquí tienes acceso a los parámetros de consulta
    });
  }

}
