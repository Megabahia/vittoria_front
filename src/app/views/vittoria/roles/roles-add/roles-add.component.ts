import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Rol, RolesService } from 'src/app/services/admin/roles.service';
import { transform } from 'typescript';

@Component({
  selector: 'app-roles-add',
  templateUrl: './roles-add.component.html'
})
export class RolesAddComponent implements OnInit {
  @Input() idRol;
  @Input() funcion;
  menu;
  permisosRol;
  accionesRol;
  roles:Rol;
  constructor(
    private servicioRoles:RolesService
  ) {
    this.roles =  this.servicioRoles.obtenerNuevoRol();
   }

  async ngOnInit() {
    this.menu='roles';
    await this.servicioRoles.obtenerListaPermisos().subscribe(async (result)=>{
      this.permisosRol = result;
    })
    if(this.funcion=='editar'){
      await this.servicioRoles.obtenerRol(this.idRol).subscribe(async (result:Rol)=>{
        this.roles=result;
      });
    }else{
     this.roles =  this.servicioRoles.obtenerNuevoRol();  
    }
  }
  async ngAfterViewInit(){
    
  }
  async guardarRol(){
    if(this.funcion=='editar'){
      await this.servicioRoles.editarRol(this.roles).subscribe((result)=>{
      });
    }else if(this.funcion=='insertar'){
      await this.servicioRoles.insertarRol(this.roles).subscribe((result)=>{
      });
    }
  }
}
