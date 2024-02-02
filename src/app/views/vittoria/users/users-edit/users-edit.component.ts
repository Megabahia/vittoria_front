import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Usuario, UsersService } from 'src/app/services/admin/users.service';
import { ParamService as ParamServiceADM } from 'src/app/services/admin/param.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html'
})
export class UsersEditComponent implements OnInit {
  @Output() volver = new EventEmitter<string>();
  @Input() idUsuario;
  @Input() roles;
  @Input() paises;
  @Input() estados;
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
  constructor(
    private usersService: UsersService,
    private globalParam: ParamServiceADM,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
  ) {

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
      this.imagen = this.usuario.imagen;
    });
  }
  regresar() {
    this.volver.emit();
  }
  async actualizarUsuario() {
    this.submitted = true;

    if (this.usuarioForm.invalid) {
      return;
    }
    if (this.redesForm.invalid) {
      this.mensaje = "Faltan llenar campos en la sección de redes sociales";
      this.abrirModal(this.mensajeModal);
      return;
    }
    delete this.usuario.imagen;
    await this.usersService.actualizarUsuario(this.usuario).subscribe(() => {
      this.mensaje = 'Se actualizo correctamente';
      this.abrirModal(this.mensajeModal);
      this.router.navigate(['/admin/user']);
    },
      (error) => {
        let errores = Object.values(error);
        let llaves = Object.keys(error);
        this.mensaje = "";
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ": " + infoErrores + "<br>";
        });
        this.abrirModal(this.mensajeModal);
      });
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  abrirModal(modal) {
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
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
