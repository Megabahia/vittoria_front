import {Component, OnInit} from '@angular/core';
import {Toaster} from 'ngx-toast-notifications';
import {GestionInventarioService} from '../../../../services/mdp/gestion-inventario/gestion-inventario.service';
import {ProductosService} from '../../../../services/mdp/productos/productos.service';
import {ParamService as ParamServiceAdm} from "../../../../services/admin/param.service";
import {IntegracionesService} from "../../../../services/admin/integraciones.service";
import {AuthService} from "../../../../services/admin/auth.service";

@Component({
  selector: 'app-cargar-stock-canales',
  templateUrl: './actualizar-inventario.component.html',
})
export class ActualizarInventarioComponent implements OnInit {
  menu;
  archivo: FormData = new FormData();
  enviando = false;
  mostrarSpinner = false;
  mostrarSpinner2 = false;
  resetearStock = false;
  resetearStock2 = false;
  sumarStock = false;
  restarStock = false;
  resumen = '';
  canal = '';
  canalOpciones;
  page = 1;
  pageSize = 3;
  listaProductosResumen;
  currentUser;
  disabledSelectCanal = false;

  constructor(
    private toaster: Toaster,
    private gestionInventarioService: GestionInventarioService,
    private productosService: ProductosService,
    private paramServiceAdm: ParamServiceAdm,
    private integracionesService: IntegracionesService,
    private authService: AuthService,
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.obtenerUsuarioActual();
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

  obtenerUsuarioActual(): void {
    if (this.currentUser.usuario.idRol !== 1) {
      this.canal = this.currentUser.usuario.canal;
      this.disabledSelectCanal = true;
    }
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

    if ((this.resetearStock2 && this.sumarStock && this.restarStock) || (this.resetearStock2 && this.restarStock) || (this.resetearStock2 && this.sumarStock) || (this.sumarStock && this.restarStock)) {
      this.toaster.open('Solo una opción es válida para modificar el stock', {type: 'warning'});
      return;
    }

    if ((!this.resetearStock2 && !this.sumarStock && !this.restarStock) ) {
      this.toaster.open('Debe seleccionar al menos una opción para modificar el stock', {type: 'warning'});
      return;
    }

    if (this.archivo.get('archivo') === null) {
      this.toaster.open('Agrege un archivo', {type: 'warning'});
      return;
    }


    this.mostrarSpinner2 = true;
    this.archivo.delete('resetearStock');
    this.archivo.delete('sumarStock');
    this.archivo.delete('restarStock');
    this.archivo.append('resetearStock', this.resetearStock2 === true ? 'true' : 'false');
    this.archivo.append('sumarStock', this.sumarStock === true ? 'true' : 'false');
    this.archivo.append('restarStock', this.restarStock === true ? 'true' : 'false');
    this.archivo.append('canal', this.canal);
    this.gestionInventarioService.actualizarInvetarioPrecios(this.archivo).subscribe((info) => {
      info.errores.map((mensaje) => {
        mensajeError += mensaje.error + '<br>';
      });
      this.resumen = 'Correctos: ' + info.correctos + '<br> Incorrectos ' + info.incorrectos + '<br></br>' + 'Errores: <br>' + mensajeError;
      this.listaProductosResumen = info.data;
      this.toaster.open('Se cargo correctamente', {type: 'success'});

      this.mostrarSpinner2 = false;
      this.archivo.delete('archivo');
    }, (error) => {
      this.mostrarSpinner2 = false;
      //this.toaster.open('Error al cargar archivo', {type: 'danger'});
      this.listaProductosResumen = [];
      this.archivo.delete('archivo');
      alert('Error al cargar archivo. Revise Sque los productos existan y pertenezcan al mismo canal para poder actualizar.');
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
