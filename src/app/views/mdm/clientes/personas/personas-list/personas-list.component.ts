import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ClientesService} from '../../../../../services/mdm/personas/clientes/clientes.service';
import {NgbPagination, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../../../services/admin/auth.service';

@Component({
  selector: 'app-personas-list',
  templateUrl: './personas-list.component.html',
})
export class PersonasListComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('prospectosMdl') prospectosMdl;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  nombres;
  apellidos;
  cedula = '';
  inicio;
  fin;
  clientes;
  cliente = '';
  vista = 'lista';
  idCliente;
  busquedaProspecto = {
    nombreCompleto: '',
    identificacion: '',
    telefono: ''
  };
  idProspecto = 0;
  listaProspectos;
  currentUserValue;

  constructor(
    private clientesService: ClientesService,
    private modalService: NgbModal,
    private authService: AuthService,
  ) {
    this.currentUserValue = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesList'
    };
    this.obtenerListaClientes();
  }

  async ngAfterViewInit() {
    this.iniciarPaginador();
  }

  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaClientes();
    });
  }

  async obtenerListaClientes() {
    this.clientesService.obtenerListaClientes(
      {
        nombreCompleto: this.cliente,
        cedula: this.cedula,
        inicio: this.inicio,
        fin: this.fin,
        page: this.page - 1,
        page_size: this.pageSize
      }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.clientes = info.info;
    });
  }

  crearCliente() {
    this.vista = 'editar';
    this.idCliente = 0;
  }

  editarCliente(id) {
    this.vista = 'editar';
    this.idCliente = id;
  }

  primeraLetra(nombre, apellido) {
    let iniciales = nombre.charAt(0) + apellido.charAt(0);
    return iniciales;
  }

  // eliminarCliente(id){
  //   this.clientesService.eliminarCliente(id).subscribe(()=>{
  //     this.obtenerListaClientes();
  //   });
  // }
  agregarProspecto(id) {
    this.idCliente = 0;
    this.idProspecto = id;
    this.vista = 'editar';
    this.cerrarModalProspectos();
  }

  abrirModal(modal, id) {
    this.idCliente = id;
    this.modalService.open(modal);
  }

  abrirModalProspectos() {
    this.clientesService.obtenerProspectoCliente(this.busquedaProspecto).subscribe((info) => {
      this.listaProspectos = info.info;
    });
    this.modalService.open(this.prospectosMdl, {size: 'lg'});
  }

  cerrarModalProspectos() {
    this.modalService.dismissAll();
  }

  cerrarModal() {
    this.modalService.dismissAll();
    this.clientesService.eliminarCliente(this.idCliente).subscribe(() => {
      this.obtenerListaClientes();
    });
  }

  export(): void {
    this.clientesService.exportar().subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'personasClientes.xls';
      link.click();
    });
  }
}
