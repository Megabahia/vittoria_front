import { Component, Input, OnInit } from '@angular/core';
import { Usuario, UsersService } from 'src/app/services/admin/users.service';
import { ParamService as ParamServiceADM } from 'src/app/services/admin/param.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html'
})
export class UsersEditComponent implements OnInit {
  @Input() idUsuario;
  @Input() roles;
  @Input() paises;
  @Input() estados;
  imagen;
  imagenTemp;
  usuario: Usuario = {
    id: 0,
    nombres: '',
    apellidos: '',
    compania: '',
    email: '',
    estado: '',
    instagram: '',
    username: '',
    pais: '',
    idRol: 0,
    telefono: '',
    twitter: '',
    whatsapp: '',
    facebook: '',
    imagen: new FormData()
  };
  constructor(
    private usersService: UsersService,
    private globalParam: ParamServiceADM

  ) {

  }

  async ngOnInit() {

  }
  async ngAfterViewInit() {
    await this.usersService.obtenerUsuario(this.idUsuario).subscribe((result) => {
      this.usuario = result;
      this.imagen = this.usuario.imagen;
    });
  }
  async actualizarUsuario() {
    await this.usersService.actualizarUsuario(this.usuario).subscribe(() => {
      window.location.href = '/admin/user';
    });
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  async subirImagen(event) {

    if (event.target.files && event.target.files[0]) {
      let imagen = event.target.files[0];
      this.usuario.imagen = new FormData();
      this.usuario.imagen.append('imagen', imagen, imagen.name);

      let reader = new FileReader();

      reader.onload = (event: any) => {
        this.imagenTemp = event.target.result;
      };

      reader.readAsDataURL(event.target.files[0]);
      this.usersService.insertarImagen(this.usuario.id, this.usuario.imagen).subscribe((data) => {
        
      });
    }
  }

}
