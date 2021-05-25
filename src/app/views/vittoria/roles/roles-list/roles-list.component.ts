import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal,NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { RolesService,Rol } from 'src/app/services/admin/roles.service';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html'
})
export class RolesListComponent implements OnInit {
  @ViewChild(NgbPagination)paginator:NgbPagination;
  menu;
  roles:Rol;
  collectionSize;
  page=1;
  pageSize:any;
  vista;
  idRol;
  funcion;
  constructor(
    private servicioRoles:RolesService,
    private modalService: NgbModal

  ) {
   }

  ngOnInit(): void {
    this.menu={
      modulo:"adm",
      seccion: "roles"
    }
    this.pageSize=10;
    this.vista = 'lista'; 
  }
  async ngAfterViewInit(){
    this.iniciarPaginador();
    this.obtenerListaRoles();
  }
  async iniciarPaginador(){
    this.paginator.pageChange.subscribe(()=>{
    this.obtenerListaRoles();
    });
  }
  async obtenerListaRoles(){
    await this.servicioRoles.obtenerListaRoles(this.page-1,this.pageSize)
    .subscribe((result)=>{
      this.roles = result.info;
      this.collectionSize= result.cont;
    });
  }
  async insertarRol(){
    this.vista = 'editar';
    this.funcion = 'insertar';
  }
  async editarRol(id){
    this.vista = 'editar';
    this.funcion = 'editar';
    this.idRol= id;
  }
  abrirModal(modal,id){
    this.idRol=id;
    this.modalService.open(modal)
  }
  cerrarModal(){
    this.modalService.dismissAll();
    this.servicioRoles.eliminarRol(this.idRol).subscribe(()=>{
      this.obtenerListaRoles();
    });
  }

}
