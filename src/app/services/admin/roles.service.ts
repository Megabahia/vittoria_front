import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../.././../environments/environment';
const  apiUrl:string = environment.apiUrl 
const  roles:Rol  = environment.roles;
export interface Rol {

  rol: {
    id:number,
    codigo: string,
    nombre: string
  },
  acciones: {
    ADM: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    MDM: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    MDP: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    MDO: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    GDO: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    GDE: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    SERVI: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    TODOMEGA: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
    FACTURACION: {
      LEER: number,
      ESCRIBIR: number,
      CREAR: number,
      BORRAR: number
    },
  };

}
@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    private http: HttpClient
  ) { }
  obtenerListaRoles(page, page_size) {
    return this.http.post<any>(`${apiUrl}/adm/roles/list/`, {
      page, page_size
    });
  }
  obtenerRol(id) {
    return this.http.get<Rol>(`${apiUrl}/adm/roles/listOne/${id}`);
  }

  obtenerListaPermisos() {
    return this.http.get<any>(`${apiUrl}/adm/roles/list/padres/`
    );
  }
  obtenerNuevoRol() {
    return roles;
  }
  editarRol(rol:Rol){
    return this.http.post<Rol>(`${apiUrl}/adm/roles/update/${rol.rol.id}`,rol
    );
  }
  insertarRol(rol:Rol){
    return this.http.post<Rol>(`${apiUrl}/adm/roles/create/`,rol
    );
  }
  eliminarRol(id){
    return this.http.delete<Rol>(`${apiUrl}/adm/roles/delete/${id}`
    );
  }
}
