import {Component, OnInit} from '@angular/core';
import {Toaster} from 'ngx-toast-notifications';
import {GestionInventarioService} from '../../../../services/mdp/gestion-inventario/gestion-inventario.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {ParamService as ParamServiceAdm} from "../../../../services/admin/param.service";
import {IntegracionesService} from "../../../../services/admin/integraciones.service";

@Component({
  selector: 'app-cargar-stock-canales',
  templateUrl: './cargar-stock-canales.component.html',
})
export class CargarStockCanalesComponent implements OnInit {
  menu;
  archivo: FormData = new FormData();
  enviando = false;
  mostrarSpinner = false;
  mostrarSpinner2 = false;
  resetearStock = false;
  resetearStock2 = true;
  resumen = '';
  canal = '';
  canalOpciones;
  page = 1;
  pageSize = 3;
  listaProductosResumen;
  constructor(
    private toaster: Toaster,
    private gestionInventarioService: GestionInventarioService,
    private productosService: ProductosService,
    private paramServiceAdm: ParamServiceAdm,
    private integracionesService: IntegracionesService

  ) {
    this.obtenerListaParametrosCanal();
    /*this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', '').subscribe((result) => {
      this.canalOpciones = result.data;
    });*/
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdp',
      seccion: 'stockAct'
    };
  }

  obtenerListaParametrosCanal() {
    const datos = {
      page: this.page,
      page_size: this.pageSize
    };
    this.integracionesService.obtenerListaIntegraciones(datos).subscribe((result) => {
      this.canalOpciones = result.data;
    });
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
          fileInput.value = '';
          return null;
        }

        this.archivo = new FormData();
        this.archivo.append('archivo', file);
        // Proceder con cualquier otra lógica de carga o manipulación del archivo
      };
      // Leer el archivo como texto o como binario, según sea necesario
      reader.readAsArrayBuffer(file);
    } else {
      this.archivo.delete('archivo');
      this.toaster.open('No se ha seleccionado ningún archivo', {type: 'danger'});
    }
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

  cargarStockPorCanal(): void {
    this.resumen = '';
    let mensajeError = '';

    if (this.canal === '') {
      this.toaster.open('Seleccione un canal', {type: 'warning'});
      return;
    }

    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }
    this.mostrarSpinner2 = true;
    this.archivo.delete('resetearStock');
    this.archivo.append('resetearStock', this.resetearStock2 === true ? 'true' : 'false');
    this.archivo.append('canal', this.canal);
    this.gestionInventarioService.cargarStockCanal(this.archivo).subscribe((info) => {
      info.errores.map((mensaje) => {
        mensajeError += mensaje.error + '<br>';
      });
      this.resumen = 'Correctos: ' + info.correctos + '<br> Incorrectos ' + info.incorrectos + '<br></br>' + 'Errores: <br>' + mensajeError;
      this.listaProductosResumen = info.data;
      this.toaster.open('Se cargo correctamente', {type: 'success'});

      this.mostrarSpinner2 = false;
      this.archivo.delete('archivo');
    }, (error) => {
      this.toaster.open('No es valido el archivo', {type: 'danger'});
      this.listaProductosResumen = [];
      this.mostrarSpinner2 = false;
      this.archivo.delete('archivo');
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
