import { Component, OnInit, ViewChild } from '@angular/core';
import { ClientesService } from '../../../../../services/mdm/personas/clientes/clientes.service';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-personas-list',
  templateUrl: './personas-list.component.html',
})
export class PersonasListComponent implements OnInit {
  @ViewChild(NgbPagination)paginator:NgbPagination;
  menu;
  page = 1;
  pageSize=10;
  collectionSize;
  nombres;
  apellidos;
  cedula="";
  inicio;
  fin;
  clientes;
  cliente="";
  vista="lista";
  idCliente;
  constructor(
    private clientesService:ClientesService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.menu = {
      modulo:"mdm",
      seccion: "clientesList"
    };
    this.obtenerListaClientes();
  }
  async ngAfterViewInit(){

  }
  async obtenerListaClientes(){
    this.clientesService.obtenerListaClientes(
      {nombreCompleto: this.cliente,
        cedula:this.cedula,
        inicio:this.inicio,
        fin:this.fin,
        page:this.page-1,
        page_size:this.pageSize}).subscribe((info)=>{
          this.collectionSize=info.cont;
          this.clientes=info.info;
    });
  }
  crearCliente(){
    this.vista= 'editar';
    this.idCliente= 0;
  }
  editarCliente(id){
    this.vista= 'editar';
    this.idCliente= id;
  }
  // eliminarCliente(id){
  //   this.clientesService.eliminarCliente(id).subscribe(()=>{
  //     this.obtenerListaClientes();
  //   });
  // }
  abrirModal(modal,id){
    this.idCliente=id;
    this.modalService.open(modal)
  }
  cerrarModal(){
    this.modalService.dismissAll();
    this.clientesService.eliminarCliente(this.idCliente).subscribe(()=>{
      this.obtenerListaClientes();
    });
  }
}
