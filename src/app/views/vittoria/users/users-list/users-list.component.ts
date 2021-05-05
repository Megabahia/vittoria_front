import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { nuevoUsuario, UsersService } from 'src/app/services/admin/users.service';
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  providers: [UsersService]

})
export class UsersListComponent implements OnInit {
  @ViewChild(NgbPagination)paginator:NgbPagination;
  menu;
  rolesOpciones: number = 0;
  roles;
  estadosOpciones:string  = '';
  estados;
  usuarios;
  idUsuario;
  // name = 'Angular';
  page = 0;
  pageSize:any;
  maxSize;
  collectionSize;
  vista;
  nuevoUsuario: nuevoUsuario= {
    nombre:'',
    apellido:'',
    nombreUsuario:'',
    email:'',
    compania:'',
    pais:'',
    telefono:'',
    wpp:'',
    rol:0,
    estado:0
  };
  constructor( 
    private servicioUsuarios: UsersService,
  ) {
   }

  ngOnInit(): void {
    this.menu='user';
    this.pageSize=10;
    this.vista='lista';
  }
 async ngAfterViewInit(){
     await this.servicioUsuarios.obtenerListaRoles().subscribe((result)=>{
      this.roles = result;
      console.log(this.roles);
    });
    this.estados = await this.servicioUsuarios.obtenerListaEstados();
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
  guardarUsuario(){
    this.servicioUsuarios.insertarUsuario(this.nuevoUsuario);
  }
  editarUsuario(id){
    this.vista='editar';
    this.idUsuario= id;
  }
} 
