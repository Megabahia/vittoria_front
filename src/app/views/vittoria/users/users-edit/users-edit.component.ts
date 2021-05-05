import { Component, Input, OnInit } from '@angular/core';
import { Usuario, UsersService } from 'src/app/services/admin/users.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html'
})
export class UsersEditComponent implements OnInit {
  @Input() idUsuario;
  usuario:Usuario ={
    id:0,
    nombre:'',
    apellido:'',
    compania:'',
    email:'',
    estado:0,
    instagram:'',
    nombreUsuario:'',
    pais:'',
    rol:0,
    telefono:'',
    twitter:'',
    wpp:''
  };
  constructor(
    private usersService:UsersService
  ) { }

  ngOnInit() {
    
  }
  async ngAfterViewInit(){
    this.usuario = await this.usersService.obtenerUsuario(this.idUsuario).then();
    console.log(this.usuario);
  }
}
