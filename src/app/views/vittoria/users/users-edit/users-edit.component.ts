import {Component, Input, OnInit, ViewChild, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {Usuario, UsersService} from 'src/app/services/admin/users.service';
import {
  ParamService as AdmParamService,
  ParamService,
  ParamService as ParamServiceADM
} from 'src/app/services/admin/param.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html'
})
export class UsersEditComponent implements OnInit, AfterViewInit {
  @Output() volver = new EventEmitter<string>();
  @Input() idUsuario;
  @Input() roles;
  @Input() paises;
  @Input() estados;
  @ViewChild('mensajeModal') mensajeModal;
  page = 1;
  pageSize = 3;
  submitted = false;
  usuarioForm: FormGroup;
  redesForm: FormGroup;
  mensaje;
  imagen;
  imagenTemp;
  nombreBuscar
  canalOpciones
  usuario: Usuario = {
    id: 0,
    nombres: '',
    apellidos: '',
    compania: '',
    email: '',
    estado: '',
    instagram: '',
    username: '',
    canal: '',
    pais: '',
    provincia: '',
    ciudad: '',
    idRol: 0,
    telefono: '',
    twitter: '',
    whatsapp: '',
    facebook: '',
    tipoEnvio: '',
    password: '',
    imagen: new FormData()
  };
  empresas = [];
  provinciasOpciones;
  ciudadesOpciones;
  mostrarSpinner = false;
  mostrarTipoEnvio = false;
  listaMetodoPago;
  constructor(
    private usersService: UsersService,
    private globalParam: ParamServiceADM,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private paramService: ParamService,
    private paramServiceAdm: AdmParamService,
  ) {
    this.obtenerListaParametros();

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'METODO PAGO', '').subscribe((result) => {
      this.listaMetodoPago = result.data;
    });
  }

  get f() {
    return this.usuarioForm.controls;
  }

  get fRedes() {
    return this.redesForm.controls;
  }

  ngOnInit(): void {
    this.usuarioForm = this._formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      username: ['', [Validators.required]],
      canal: ['', [Validators.required]],
      email: ['', [Validators.required]],
      compania: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      whatsapp: ['', [Validators.required]],
      tipoEnvio: [''],
      idRol: [0, [Validators.min(1)]]
    });
    this.redesForm = this._formBuilder.group({
      twitter: ['', [Validators.required]],
      facebook: ['', [Validators.required]],
      instagram: ['', [Validators.required]]
    });
    this.obtenerEmpresas();
  }

  ngAfterViewInit(): void {
    this.usersService.obtenerUsuario(this.idUsuario).subscribe((result) => {
      this.usuario = result;
      this.usuarioForm.patchValue({...result});

      if (this.usuario.idRol === 50){
        this.mostrarTipoEnvio = true;
      }

      this.imagen = this.usuario.imagen;
      this.obtenerProvincias();
      this.obtenerCiudad();
    });
  }

  regresar(): void {
    this.volver.emit();
  }

  actualizarUsuario(): void {
    this.submitted = true;

    if (this.usuarioForm.invalid) {
      return;
    }
    if (this.redesForm.invalid) {
      this.mensaje = 'Faltan llenar campos en la sección de redes sociales';
      this.abrirModal(this.mensajeModal);
      return;
    }
    delete this.usuario.imagen;
    this.mostrarSpinner = true;
    this.usersService.actualizarUsuario(this.usuario).subscribe(() => {
        this.mensaje = 'Se actualizo correctamente';
        this.abrirModal(this.mensajeModal);
        this.router.navigate(['/admin/user']);
        this.regresar();
        this.mostrarSpinner = false;
      },
      (error) => {
        let errores = Object.values(error);
        let llaves = Object.keys(error);
        this.mensaje = '';
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
        });
        this.abrirModal(this.mensajeModal);
        this.mostrarSpinner = false;
      });
  }

  obtenerURLImagen(url): string {
    return this.globalParam.obtenerURL(url);
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
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

  obtenerEmpresas(): void {
    this.paramService.obtenerListaPadres('LISTA_EMPRESAS').subscribe((info) => {
        this.empresas = info;
      },
      (error) => {
      }
    );
  }

  obtenerProvincias(): void {
    this.paramService.obtenerListaHijos(this.usuarioForm.value.pais, 'PAIS').subscribe((info) => {
      this.provinciasOpciones = info;
    });
  }

  obtenerCiudad(): void {
    this.paramService.obtenerListaHijos(this.usuarioForm.value.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadesOpciones = info;
    });
  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar).subscribe((result) => {
      this.canalOpciones = result.data;
    });
  }

  rolSeleccionado(e: any) {
    if (e.target.value === '50') {
      this.usuarioForm.get('tipoEnvio').setValidators([Validators.required]);
      this.usuarioForm.get('tipoEnvio').updateValueAndValidity();
      this.mostrarTipoEnvio = true;
    } else {
      this.usuarioForm.get('tipoEnvio').setValidators([]);
      this.usuarioForm.get('tipoEnvio').updateValueAndValidity();
      this.mostrarTipoEnvio = false;
    }
  }
}
