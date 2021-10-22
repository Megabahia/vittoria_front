import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { nuevoUsuario, UsersService } from 'src/app/services/admin/users.service';
import { map } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { stringify } from 'querystring';
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  providers: [UsersService]
})
export class UsersListComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;
  public mensaje = "";
  submitted = false;
  usuarioForm: FormGroup;

  cargando = false;

  menu;
  paises;
  paisesOpciones;
  rolesOpciones: number = 0;
  roles;
  estadosOpciones: string = '';
  estados;
  usuarios;
  idUsuario;
  page = 1;
  pageSize: any;
  maxSize;
  collectionSize;
  vista;
  nuevoUsuario: nuevoUsuario = {
    nombres: '',
    apellidos: '',
    username: '',
    email: '',
    compania: '',
    pais: '',
    telefono: '',
    whatsapp: '',
    idRol: 0,
    estado: 'Activo'
  };
  constructor(
    private servicioUsuarios: UsersService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,

  ) {
  }

  ngOnInit(): void {
    this.usuarioForm = this._formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required]],
      compania: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      whatsapp: ['', [Validators.required]],
      idRol: [0, [Validators.min(1)]],
    });
    this.menu = {
      modulo: "adm",
      seccion: "user"
    };
    this.pageSize = 10;
    this.vista = 'lista';
  }

  get f() {
    return this.usuarioForm.controls;
  }

  async ngAfterViewInit() {
    await this.servicioUsuarios.obtenerListaRoles().subscribe((result) => {
      this.roles = result;

    });
    await this.servicioUsuarios.obtenerListaEstados().subscribe((result) => {
      this.estados = result;
    });
    await this.servicioUsuarios.obtenerListaPaises().subscribe((result) => {
      this.paises = result;
    });
    this.iniciarPaginador();
    this.obtenerListaUsuarios();
  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaUsuarios();
    });
  }
  async obtenerListaUsuarios() {

    await this.servicioUsuarios.obtenerListaUsuarios(this.page, this.pageSize, this.rolesOpciones, this.estadosOpciones)
      .subscribe((result) => {
        this.collectionSize = result.cont;
        this.usuarios = result.info;
      });
  }
  volver(){
    this.vista = 'lista';
  }
  primeraLetra(nombre, apellido) {
    let iniciales = nombre.charAt(0) + apellido.charAt(0);
    return iniciales;
  }
  async guardarUsuario() {

    this.submitted = true;

    if (this.usuarioForm.invalid) {
      return;
    }
    this.cargando = true;
    await this.servicioUsuarios.insertarUsuario(this.nuevoUsuario).subscribe(() => {
      this.cargando = false;
      this.obtenerListaUsuarios();
      this.mensaje = "Usuario creado exitosamente"
      this.abrirModal(this.mensajeModal);
      this.dismissModal.nativeElement.click();
    },
      (error) => {
        this.cargando = false;
        let errores = Object.values(error);
        this.mensaje = "";
        errores.map(infoErrores => {
          this.mensaje += infoErrores + "<br>";
        });
        this.abrirModal(this.mensajeModal);

      });

  }
  editarUsuario(id) {
    this.vista = 'editar';
    this.idUsuario = id;
  }
  comprobarEliminar(modal, id) {
    this.idUsuario = id;
    this.modalService.open(modal)
  }
  abrirModal(modal) {
    this.modalService.open(modal)
  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  eliminar() {
    this.modalService.dismissAll();
    this.servicioUsuarios.eliminarUsuario(this.idUsuario).subscribe(info => {
      this.obtenerListaUsuarios();
    });
  }
}
