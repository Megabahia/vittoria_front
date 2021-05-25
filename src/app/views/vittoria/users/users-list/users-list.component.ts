import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination,NgbModal  } from '@ng-bootstrap/ng-bootstrap';
import { nuevoUsuario, UsersService } from 'src/app/services/admin/users.service';
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  providers: [UsersService]

})
export class UsersListComponent implements OnInit {
  @ViewChild(NgbPagination)paginator:NgbPagination;
  menu;
  paises;
  paisesOpciones;
  rolesOpciones: number = 0;
  roles;
  estadosOpciones:string  = '';
  estados;
  usuarios;
  idUsuario;
  // name = 'Angular';
  page = 1;
  pageSize:any;
  maxSize;
  collectionSize;
  vista;
  nuevoUsuario: nuevoUsuario= {
    nombres:'',
    apellidos:'',
    username:'',
    email:'',
    compania:'',
    pais:'',
    telefono:'',
    whatsapp:'',
    idRol:0,
    estado:'ACTIVO'
  };
  constructor( 
    private servicioUsuarios: UsersService,
    private modalService: NgbModal
  ) {
   }

  ngOnInit(): void {
    this.menu={
      modulo:"adm",
      seccion: "user"
    };
    this.pageSize=10;
    this.vista='lista';
  }
 async ngAfterViewInit(){
     await this.servicioUsuarios.obtenerListaRoles().subscribe((result)=>{
      this.roles = result;

    });
    await this.servicioUsuarios.obtenerListaEstados().subscribe((result)=>{
      this.estados = result;
    });
    await this.servicioUsuarios.obtenerListaPaises().subscribe((result)=>{
      this.paises = result;
    });
    this.iniciarPaginador();
    this.obtenerListaUsuarios();
  }
  async iniciarPaginador(){
    this.paginator.pageChange.subscribe(()=>{
    this.obtenerListaUsuarios();
    });
  }
  async obtenerListaUsuarios()
  { 
    
     await this.servicioUsuarios.obtenerListaUsuarios(this.page,this.pageSize,this.rolesOpciones,this.estadosOpciones)
    .subscribe((result)=>{
      this.collectionSize = result.cont;
      this.usuarios = result.info;
    });
  }
  primeraLetra(nombre,apellido){
    let iniciales = nombre.charAt(0) + apellido.charAt(0);
    return iniciales;
  }
 async guardarUsuario(){
    await this.servicioUsuarios.insertarUsuario(this.nuevoUsuario).subscribe(()=>{
      this.obtenerListaUsuarios();
    });
  }
  editarUsuario(id){
    this.vista='editar';
    this.idUsuario= id;
  }
  abrirModal(modal,id){
    this.idUsuario=id;
    this.modalService.open(modal)
  }
  cerrarModal(){
    this.modalService.dismissAll();
    this.servicioUsuarios.eliminarUsuario(this.idUsuario);
    this.obtenerListaUsuarios();
  }
} 
