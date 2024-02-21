import {Component, OnInit} from '@angular/core';
import {GestionInventarioService} from '../../../../services/mdp/gestion-inventario/gestion-inventario.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-cargar-proveedores-productos',
  templateUrl: './cargar-proveedores-productos.component.html',
  styleUrls: ['./cargar-proveedores-productos.component.css']
})
export class CargarProveedoresProductosComponent implements OnInit {
  menu;
  archivo: FormData = new FormData();

  constructor(
    private toaster: Toaster,
    private gestionInventarioService: GestionInventarioService,
  ) {
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdp',
      seccion: 'stockAct'
    };
  }

  cargarArchivo(event): void {
    this.archivo = new FormData();
    this.archivo.append('archivo', event.target.files[0]);
  }

  cargarStock(): void {
    this.gestionInventarioService.cargarProductosProveedores(this.archivo).subscribe((info) => {
      this.toaster.open('Se cargo correctamente', {type: 'success'});
    });
  }
}
