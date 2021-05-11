import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../.././../environments/environment';
const  apiUrl:string = environment.apiUrl 


export interface nuevoUsuario{
  nombres:string,
  apellidos:string,
  username:string,
    email:string,
    compania:string,
    pais:string,
    telefono:string,
    whatsapp:string,
    idRol:number,
    estado:string
}
export interface Usuario{
  id:number,
  nombres:string,
  apellidos:string,
  username:string,
  email:string,
  compania:string,
  pais:string,
  telefono:string,
  idRol:number,
  estado:string,
  twitter:string,
  instagram:string,
  whatsapp:string,
  facebook:string
}
@Injectable()
export class UsersService {
  
  constructor(private http: HttpClient) { }

  obtenerListaRoles() {
    
   return  this.http.get<any>(`${apiUrl}/adm/roles/list/filtro/`, {
    });
  }
  obtenerListaPaises() {
   return  this.http.get<any>(`${apiUrl}/adm/param/list/pais/`, {
    });
  }
  obtenerListaEstados() {
    return  this.http.get<any>(`${apiUrl}/adm/param/list/estado/`, {
    });
  }
  obtenerListaUsuarios(page,pageSize,idRol,estado) {
    return  this.http.post<any>(`${apiUrl}/adm/usuarios/list/`, {
        'page':page-1, 'page_size':pageSize, 'estado':estado, 'idRol':Number(idRol)
    });
  }

  insertarUsuario(usuario: nuevoUsuario){
  
    return this.http.post<any>(`${apiUrl}/adm/usuarios/create/`, usuario);
  }
  obtenerUsuario(id){ 
    return this.http.get<any>(`${apiUrl}/adm/usuarios/listOne/${id}`);
  }
  actualizarUsuario(usuario: Usuario){
    let usuarioActualizado:nuevoUsuario = usuario;
    return this.http.post<any>(`${apiUrl}/adm/usuarios/update/${usuario.id}`,usuarioActualizado);
  } 
  eliminarUsuario(id){
    return  this.http.delete<any>(`${apiUrl}/adm/usuarios/delete/${id}`);
  }

}
