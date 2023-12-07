import {Component, Input, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import {Rol, RolesService} from 'src/app/services/admin/roles.service';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-roles-add',
  templateUrl: './roles-add.component.html'
})
export class RolesAddComponent implements OnInit {
  @Output() volver = new EventEmitter<string>();
  @ViewChild('mensajeModal') mensajeModal;

  @Input() idRol;
  @Input() funcion;
  rolesForm: FormGroup;
  submitted = false;
  menu;
  permisosRol;
  roles: Rol;
  mensaje;

  constructor(
    private servicioRoles: RolesService,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal
  ) {
    this.roles = this.servicioRoles.obtenerNuevoRol();
  }

  get f() {
    return this.rolesForm.controls;
  }

  async ngOnInit() {
    this.menu = 'roles';
    await this.servicioRoles.obtenerListaPermisos().subscribe(async (result) => {
      this.permisosRol = result;
    });
    if (this.funcion === 'editar') {
      await this.servicioRoles.obtenerRol(this.idRol).subscribe(async (result: Rol) => {
          this.roles = result;
        },
      );
    } else {
      this.roles = this.servicioRoles.obtenerNuevoRol();
    }
    this.rolesForm = this._formBuilder.group({
      nombre: ['', [Validators.required]]
    });
  }

  async ngAfterViewInit() {

  }

  regresar(): void {
    this.volver.emit();
  }

  guardarRol() {
    this.submitted = true;
    if (this.rolesForm.invalid) {
      return;
    }
    if (this.funcion === 'editar') {
      this.servicioRoles.editarRol(this.roles).subscribe((result) => {
          this.mensaje = 'Rol editado con éxito';
          this.abrirModal(this.mensajeModal);
          this.regresar();
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.mensajeModal);
        });
    } else if (this.funcion === 'insertar') {
      this.servicioRoles.insertarRol(this.roles).subscribe((result) => {
          this.mensaje = 'Rol creado con éxito';
          this.abrirModal(this.mensajeModal);
          this.regresar();
        },
        (error) => {
          let errores = Object.values(error);
          let llaves = Object.keys(error);
          this.mensaje = '';
          errores.map((infoErrores, index) => {
            this.mensaje += llaves[index] + ': ' + infoErrores + '<br>';
          });
          this.abrirModal(this.mensajeModal);
        });
    }
  }

  abrirModal(modal): void {
    this.modalService.open(modal);
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }
}
