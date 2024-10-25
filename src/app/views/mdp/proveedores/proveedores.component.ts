import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {ParamService as ParamServiceAdm} from '../../../services/admin/param.service';

import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Toaster} from 'ngx-toast-notifications';
import {MdpProveedoresService} from "../../../services/mdp/reportes/mdp_proveedores.service";

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.component.html',
  providers: [DatePipe]
})
export class ProveedoresComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @Input() paises;
  proveedoresForm: FormGroup;

  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
  opciones;
  pais = 'Ecuador';
  ciudad = '';
  provincia = '';
  ciudadOpciones;
  provinciaOpciones;
  verificarContacto = false;

  fileToUpload: File | null = null;
  totalPagar;
  horaPedido;
  clientes;
  cliente;
  cedula;
  factura;
  listaProveedores;
  codigoBarrasBuscar;
  fechaActual = new Date();
  mostrarSpinner = false;
  accion;

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private proveedoresService: MdpProveedoresService,
    private modalService: NgbModal,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
  }

  iniciarAprobacionProducto(): void {
    this.proveedoresForm = this.formBuilder.group({
      id: [''],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      pais: [this.pais],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
    });
  }

  get notaProveedoresForm() {
    return this.proveedoresForm['controls'];
  }

  ngOnInit(): void {
    this.obtenerListaProveedores();
  }

  ngAfterViewInit(): void {
    this.iniciarPaginador();
  }

  iniciarPaginador(): void {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaProveedores();
    });
  }

  crearProveedor() {

    if (this.proveedoresForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'danger'});
      return;
    }

    /*const llaves: string[] = Object.keys(this.notaRecepcionProducto.value);
    const valores: string[] = Object.values(this.notaRecepcionProducto.value);
    llaves.map((llave, index) => {
      if (valores[index]) {
        this.archivo.delete(llave);
        this.archivo.append(llave, valores[index]);
      }
    });

    if (this.imagenPrinciplSeleccionada != null) {
      this.archivo.delete('imagen');
      this.archivo.append('imagen', this.imagenPrinciplSeleccionada);
    }*/
    if (confirm('Esta seguro de guardar los datos') === true) {
      this.proveedoresService.crearProveedor(this.proveedoresForm.value).subscribe((info) => {
        this.toaster.open('Proveedor guardado', {type: 'success'});
        this.modalService.dismissAll();
        this.obtenerListaProveedores();
      });
    }
  }

  obtenerListaProveedores(): void {
    this.proveedoresService.obtenerListaProveedores({
      page: this.page - 1,
      page_size: this.pageSize,
      //inicio: this.inicio,
      //fin: this.transformarFecha(this.fin),
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaProveedores = info.info;
    });
  }

  actualizar(): void {
    if (this.proveedoresForm.invalid) {
      this.toaster.open('Llenar campos', {type: 'danger'});
      return;
    }

    if (confirm('¿Esta seguro de confirmar los datos?') === true) {
      this.proveedoresService.actualizarProveedor(this.proveedoresForm.value, this.proveedoresForm.value.id).subscribe((info) => {
        this.modalService.dismissAll();
        this.toaster.open('Proveedor actualizado', {type: 'success'});
        this.obtenerListaProveedores();
      });
    }
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  formatearFecha(): string {
    const fechaActual = new Date();
    const dia = fechaActual.getDate().toString().padStart(2, '0');
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaActual.getFullYear().toString();
    return `${dia}-${mes}-${anio}`;
  }

  obtenerProveedor(id): void {
    this.proveedoresService.obtenerProveedor(id).subscribe((info) => {
      this.proveedoresForm.patchValue({...info});
      this.obtenerCiudad();
    });
  }

  eliminarProveedor(id): void {
    if (confirm('¿Esta seguro eliminar el proveedor?') === true) {
      this.modalService.dismissAll();
      this.proveedoresService.eliminarProveedor(id).subscribe(() => {
        this.toaster.open('Proveedor eliminado', {type: 'warning'});
        this.obtenerListaProveedores();
      }, error => window.alert(error));
    }

  }

  abrirModalProveedor(modal, id, accion): void {
    this.iniciarAprobacionProducto();
    this.modalService.open(modal, {size: 'md', backdrop: 'static'});
    this.accion = accion;
    this.obtenerProvincias();
    this.obtenerCiudad();
    if (this.accion === 'editar') {
      this.obtenerProveedor(id);
    }
  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.proveedoresForm.value.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }


}
