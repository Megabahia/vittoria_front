import { Component, OnInit } from '@angular/core';
import {Toaster} from 'ngx-toast-notifications';
import {GestionInventarioService} from '../../../../services/mdp/gestion-inventario/gestion-inventario.service';

@Component({
  selector: 'app-cargar-stock',
  templateUrl: './cargar-stock.component.html',
  styleUrls: ['./cargar-stock.component.css']
})
export class CargarStockComponent implements OnInit {
  menu;
  archivo: FormData = new FormData();
  enviando = false;

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
    console.log('enviado', this.archivo.get('archivo'));
    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }
    this.enviando = true;
    this.gestionInventarioService.cargarStock(this.archivo).subscribe((info) => {
      this.toaster.open('Se cargo correctamente', {type: 'success'});
      this.enviando = false;
    }, (error) => {
      this.toaster.open('No es valido el archivo', {type: 'danger'});
      this.enviando = false;
    });
  }
}
