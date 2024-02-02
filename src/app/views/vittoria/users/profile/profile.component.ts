import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UsersService, Usuario} from '../../../../services/admin/users.service';
import {ParamService as ParamServiceADM} from '../../../../services/admin/param.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {AuthService, User} from '../../../../services/admin/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [UsersService]
})
export class ProfileComponent implements OnInit {
  idUsuario;
  roles;
  paises;
  estados;
  @ViewChild('mensajeModal') mensajeModal;

  submitted = false;
  usuarioForm: FormGroup;
  redesForm: FormGroup;
  mensaje;
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
  mostrar = true;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private globalParam: ParamServiceADM,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
  ) {
    const usuario = this.authService.currentUserValue;
    console.log(usuario);
    this.mostrar = !!usuario.acciones.ADM.CREAR;
    console.log('this.mostrAR', this.mostrar);
    this.idUsuario = usuario.id;
    this.usersService.obtenerListaPaises().subscribe((result) => {
      this.paises = result;
    });
    this.usersService.obtenerListaRoles().subscribe((result) => {
      this.roles = result;
    });
    this.usersService.obtenerListaEstados().subscribe((result) => {
      this.estados = result;
    });
  }

  get f() {
    return this.usuarioForm.controls;
  }

  get fRedes() {
    return this.redesForm.controls;
  }

  async ngOnInit() {
    this.usuarioForm = this._formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required]],
      compania: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      whatsapp: ['', [Validators.required]],
      idRol: [0, [Validators.min(1)]]
    });
    this.redesForm = this._formBuilder.group({
      twitter: ['', [Validators.required]],
      facebook: ['', [Validators.required]],
      instagram: ['', [Validators.required]]
    });
  }

  async ngAfterViewInit() {
    await this.usersService.obtenerUsuario(this.idUsuario).subscribe((result) => {
      this.usuario = result;
      this.usuarioForm.patchValue(result);
      this.redesForm.patchValue(result);
      this.imagen = this.usuario.imagen;
    });
  }

  async actualizarUsuario() {
    this.submitted = true;

    if (this.usuarioForm.invalid) {
      console.log('form', this.usuarioForm);
      return;
    }
    if (this.redesForm.invalid) {
      this.mensaje = 'Faltan llenar campos en la sección de redes sociales';
      this.abrirModal(this.mensajeModal);
      return;
    }
    delete this.usuario.imagen;
    await this.usersService.actualizarUsuario(this.usuario).subscribe(() => {
        this.mensaje = 'Se actualizo correctamente';
        this.abrirModal(this.mensajeModal);
        this.router.navigate(['/admin/management']);
      },
      (error) => {
        const errores = Object.values(error);
        const llaves = Object.keys(error);
        this.mensaje = '';
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
        });
        this.abrirModal(this.mensajeModal);
      });
  }

  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }

  abrirModal(modal) {
    this.modalService.open(modal);
  }

  cerrarModal() {
    this.modalService.dismissAll();
  }

  async subirImagen(event) {

    if (event.target.files && event.target.files[0]) {
      const imagen = event.target.files[0];
      this.usuario.imagen = new FormData();
      this.usuario.imagen.append('imagen', imagen, imagen.name);

      const reader = new FileReader();

      reader.onload = (event: any) => {
        this.imagenTemp = event.target.result;
      };

      reader.readAsDataURL(event.target.files[0]);
      this.usersService.insertarImagen(this.usuario.id, this.usuario.imagen).subscribe((data) => {

      });
    }
  }

}
