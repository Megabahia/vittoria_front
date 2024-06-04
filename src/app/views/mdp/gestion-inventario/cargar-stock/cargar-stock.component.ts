import {Component, OnInit} from '@angular/core';
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
  resetearStock2 = false;
  resumen = '';

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

  cargarArchivoMegabahia(event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        // Aquí se podría validar el contenido si es necesario
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension !== 'xls') {
          this.toaster.open('Por favor, seleccione un archivo con la extensión .xls', {type: 'danger'});
          return null;
        }

        this.archivo = new FormData();
        this.archivo.append('archivo', file);
        // Proceder con cualquier otra lógica de carga o manipulación del archivo
      };
      // Leer el archivo como texto o como binario, según sea necesario
      reader.readAsArrayBuffer(file);
    } else {
      this.toaster.open('No se ha seleccionado ningún archivo', {type: 'danger'});
    }
  }

  cargarArchivo(event): void {
    this.archivo = new FormData();

    this.archivo.append('archivo', event.target.files[0]);
  }

  cargarStock(): void {
    this.resumen = '';
    let mensajeError = '';
    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }
    this.mostrarSpinner = true;
    this.archivo.delete('resetearStock');
    this.archivo.append('resetearStock', this.resetearStock === true ? 'true' : 'false');
    this.gestionInventarioService.cargarStock(this.archivo).subscribe((info) => {
      info.errores.map((mensaje) => {
        mensajeError += mensaje.error + '<br>';
      });
      this.resumen = 'Correctos: ' + info.correctos + '<br> Incorrectos ' + info.incorrectos + '<br></br>' + 'Errores: <br>' + mensajeError;
      this.toaster.open('Se cargo correctamente', {type: 'success'});
      this.mostrarSpinner = false;
      this.archivo.delete('archivo');

    }, (error) => {
      this.toaster.open('No es valido el archivo', {type: 'danger'});
      this.mostrarSpinner = false;
    });
  }

  cargarStockMegabahia(): void {
    let mensajeError = '';
    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }
    this.mostrarSpinner2 = true;
    this.archivo.delete('resetearStock');
    this.archivo.append('resetearStock', this.resetearStock2 === true ? 'true' : 'false');
    this.gestionInventarioService.cargarStockMegabahia(this.archivo).subscribe((info) => {
      info.errores.map((mensaje) => {
        mensajeError += mensaje.error + '<br>';
      });
      this.resumen = 'Correctos: ' + info.correctos + '<br> Incorrectos ' + info.incorrectos + '<br></br>' + 'Errores: <br>' + mensajeError;
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
