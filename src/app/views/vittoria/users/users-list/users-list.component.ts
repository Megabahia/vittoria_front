import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbPagination, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NuevoUsuario, UsersService} from 'src/app/services/admin/users.service';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {ParamService as AdmParamService, ParamService} from '../../../../services/admin/param.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  providers: [UsersService]
})
export class UsersListComponent implements OnInit, AfterViewInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  @ViewChild('dismissModal') dismissModal;
  @ViewChild('mensajeModal') mensajeModal;
  public mensaje = '';
  submitted = false;
  usuarioForm: FormGroup;

  cargando = false;
  canalOpciones;
  nombreBuscar;
  menu;
  paises;
  rolesOpciones: number = 0;
  roles;
  estadosOpciones: string = '';
  estados;
  usuarios;
  idUsuario;
  page = 1;
  pageSize = 3;
  maxSize;
  collectionSize;
  vista;
  email: string = '';
  companiaBuscar: string = ''
  mostrarInputContrasenia = false;
  nuevoUsuario: NuevoUsuario = {
    nombres: '',
    apellidos: '',
    username: '',
    email: '',
    compania: '',
    pais: '',
    provincia: '',
    ciudad: '',
    telefono: '',
    whatsapp: '',
    idRol: 0,
    estado: 'Activo',
    canal: '',
    tipoEnvio: '',
    password: ''
  };
  empresas = [];
  provinciasOpciones;
  ciudadesOpciones;
  listaMetodoPago

  constructor(
    private servicioUsuarios: UsersService,
    private modalService: NgbModal,
    private _formBuilder: FormBuilder,
    private paramService: ParamService,
    private paramServiceAdm: AdmParamService,
  ) {
    this.obtenerListaParametros();

    this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'METODO PAGO', '').subscribe((result) => {
      this.listaMetodoPago = result.data;
    });
  }

  ngOnInit(): void {
    this.usuarioForm = this._formBuilder.group({
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      username: ['', [Validators.required]],
      canal: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      compania: ['', [Validators.required]],
      pais: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      tipoEnvio: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.maxLength(10),
        Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      whatsapp: ['', [Validators.required, Validators.maxLength(10),
        Validators.minLength(10), Validators.pattern('^[0-9]*$')]],
      idRol: [0, [Validators.min(1)]],
    });
    this.menu = {
      modulo: 'adm',
      seccion: 'user'
    };
    this.vista = 'lista';
    this.obtenerEmpresas();
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

    await this.servicioUsuarios.obtenerListaUsuarios({
      page: this.page - 1, page_size: this.pageSize, idRol: Number(this.rolesOpciones), estado: this.estadosOpciones,
      state: 1, email: this.email, compania: this.companiaBuscar
    })
      .subscribe((result) => {
        this.collectionSize = result.cont;
        this.usuarios = result.info;
      });
  }

  volver(): void {
    this.obtenerListaUsuarios();
    this.vista = 'lista';
  }

  primeraLetra(nombre, apellido): string {
    return nombre.charAt(0) + apellido.charAt(0);
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
        this.mensaje = 'Usuario creado exitosamente';
        this.abrirModal(this.mensajeModal);
        this.dismissModal.nativeElement.click();
      },
      (error) => {
        this.cargando = false;
        let errores = Object.values(error);
        this.mensaje = '';
        errores.map(infoErrores => {
          this.mensaje += infoErrores + '<br>';
        });
        this.abrirModal(this.mensajeModal);

      });

  }

  async obtenerListaParametros(): Promise<void> {
    await this.paramServiceAdm.obtenerListaParametros(this.page - 1, this.pageSize, 'INTEGRACION_WOOCOMMERCE', this.nombreBuscar).subscribe((result) => {
      this.canalOpciones = result.data;
    });
  }

  editarUsuario(id): void {
    this.vista = 'editar';
    this.idUsuario = id;
  }

  comprobarEliminar(modal, id): void {
    this.idUsuario = id;
    this.modalService.open(modal);
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  eliminar(): void {
    this.modalService.dismissAll();
    this.servicioUsuarios.eliminarUsuario(this.idUsuario, 'Inactivo').subscribe(info => {
      this.obtenerListaUsuarios();
    });
  }

  obtenerEmpresas(): void {
    this.paramService.obtenerListaPadres('LISTA_EMPRESAS').subscribe((info) => {
        console.log('empresas', info);
        this.empresas = info;
      },
      (error) => {
      }
    );
  }

  export(): void {
    this.servicioUsuarios.exportarUsuarios().subscribe((data) => {
      const downloadURL = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'parametrizaciones.xls';
      link.click();
    });
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

  onChangeCheckContrasenia(e: any): void {
    const isCheck = e.target.checked;
    if (isCheck) {
      this.mostrarInputContrasenia = true;
      this.usuarioForm.get('password').setValidators([Validators.required, Validators.minLength(8)]);
      this.usuarioForm.get('password').updateValueAndValidity();
    } else {
      this.mostrarInputContrasenia = false;
      this.usuarioForm.get('password').setValidators([]);
      this.usuarioForm.get('password').updateValueAndValidity();
    }
  }

}
