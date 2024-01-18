import {Component, OnInit, ViewChild} from '@angular/core';
import {ProductosService} from '../../../services/gdp/productos/productos.service';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  @ViewChild('errorAuth') errorAuth;
  producto;

  constructor(
    private rutaActiva: ActivatedRoute,
    private modalService: NgbModal,
    private productoService: ProductosService,
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
  }

  ngOnInit(): void {
    this.productoService.obtenerProductoFree(this.rutaActiva.snapshot.params.id).subscribe((info) => {
      this.producto = info;
    });
  }

  openModal(modal): void {
    this.modalService.open(modal);
  }
}
