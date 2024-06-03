import { Component, OnInit } from '@angular/core';
import {Toaster} from 'ngx-toast-notifications';
import {GestionInventarioService} from '../../../../services/mdp/gestion-inventario/gestion-inventario.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';

@Component({
  selector: 'app-cargar-stock',
  templateUrl: './cargar-stock.component.html',
  styleUrls: ['./cargar-stock.component.css']
})
export class CargarStockComponent implements OnInit {
  menu;
  archivo: FormData = new FormData();
  enviando = false;
  mostrarSpinner = false;
  mostrarSpinner2 = false;
  resetearStock = false;

  constructor(
    private toaster: Toaster,
    private gestionInventarioService: GestionInventarioService,
    private productosService: ProductosService,
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

  cargarArchivoMegabahia(event): void {
    this.archivo = new FormData();

    this.archivo.append('archivo', event.target.files[0]);
  }

  cargarStock(): void {
    console.log('enviado', this.archivo.get('archivo'));
    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }
    this.mostrarSpinner = true;
    this.archivo.delete('resetearStock');
    this.archivo.append('resetearStock', this.resetearStock === true ? 'true' : 'false');
    this.gestionInventarioService.cargarStock(this.archivo).subscribe((info) => {
      this.toaster.open('Se cargo correctamente', {type: 'success'});
      this.mostrarSpinner = false;
    }, (error) => {
      this.toaster.open('No es valido el archivo', {type: 'danger'});
      this.mostrarSpinner = false;
    });
  }

  cargarStockMegabahia(): void {
    console.log('enviado', this.archivo.get('archivo'));
    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }
    this.mostrarSpinner2 = true;
    this.archivo.delete('resetearStock');
    this.archivo.append('resetearStock', this.resetearStock === true ? 'true' : 'false');
    this.gestionInventarioService.cargarStockMegabahia(this.archivo).subscribe((info) => {
      this.toaster.open('Se cargo correctamente', {type: 'success'});

      this.mostrarSpinner2 = false;
    }, (error) => {
      this.toaster.open('No es valido el archivo', {type: 'danger'});
      this.mostrarSpinner2 = false;
    });
  }

  reporteProductosStock(): void {
    this.enviando = true;
    this.productosService.exportar({}).subscribe((data) => {
      this.enviando = false;
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'productosStock.xlsx';
      link.click();
    }, (error) => {
      this.enviando = false;
    });
  }
}
