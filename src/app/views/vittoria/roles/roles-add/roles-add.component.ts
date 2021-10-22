import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { map } from 'rxjs/operators';
import { Rol, RolesService } from 'src/app/services/admin/roles.service';
import { transform } from 'typescript';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

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
  accionesRol;
  roles: Rol;
  constructor(
    private servicioRoles: RolesService,
    private _formBuilder: FormBuilder

  ) {
    this.roles = this.servicioRoles.obtenerNuevoRol();
  }
  get f() {
    return this.rolesForm.controls;
  }

  async ngOnInit() {
    this.rolesForm = this._formBuilder.group({
      nombre: ['', [Validators.required]]
    });
    this.menu = 'roles';
    await this.servicioRoles.obtenerListaPermisos().subscribe(async (result) => {
      this.permisosRol = result;
    })
    if (this.funcion == 'editar') {
      await this.servicioRoles.obtenerRol(this.idRol).subscribe(async (result: Rol) => {
        this.roles = result;
      });
    } else {
      this.roles = this.servicioRoles.obtenerNuevoRol();
    }
  }
  async ngAfterViewInit() {

  }
  regresar() {
    this.volver.emit();
  }
  async guardarRol() {
    this.submitted = true;
    if (this.rolesForm.invalid) {
      return;
    }
    if (this.funcion == 'editar') {
      await this.servicioRoles.editarRol(this.roles).subscribe((result) => {
      });
    } else if (this.funcion == 'insertar') {
      await this.servicioRoles.insertarRol(this.roles).subscribe((result) => {
      });
    }
  }
}
