import { Component, Input, OnInit } from '@angular/core';
import { Usuario, UsersService } from 'src/app/services/admin/users.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html'
})
export class UsersEditComponent implements OnInit {
  @Input() idUsuario;
  @Input() roles;
  @Input() paises;
  @Input() estados;
  usuario:Usuario ={
    id:0,
    nombres:'',
    apellidos:'',
    compania:'',
    email:'',
    estado:'',
    instagram:'',
    username:'',
    pais:'',
    idRol:0,
    telefono:'',
    twitter:'',
    whatsapp:'',
    facebook:'',
    imagen : new FormData()
  };
  constructor(
    private usersService:UsersService
  ) { 
    
  }

  async ngOnInit() {
    
  }
  async ngAfterViewInit(){
    await this.usersService.obtenerUsuario(this.idUsuario).subscribe((result)=>{
      this.usuario = result;
    });
  }
  async actualizarUsuario()
  {
    await this.usersService.actualizarUsuario(this.usuario).subscribe(()=>{
      window.location.href = '/admin/user';
    });
  }
  async subirImagen(event){
    let imagen = event.target.files[0];
    this.usuario.imagen = new FormData();
    this.usuario.imagen.append('imagen',imagen,imagen.name);
    this.usersService.insertarImagen(this.usuario.id,this.usuario.imagen).subscribe((data)=>{
      console.log(data);
    });
  } 
}
