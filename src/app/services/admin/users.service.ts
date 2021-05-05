import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../.././../environments/environment';
const { apiUrl } = environment;


export interface nuevoUsuario{
    nombre:string,
    apellido:string,
    nombreUsuario:string,
    email:string,
    compania:string,
    pais:string,
    telefono:string,
    wpp:string,
    rol:number,
    estado
}
export interface Usuario{
  id:number,
  nombre:string,
  apellido:string,
  nombreUsuario:string,
  email:string,
  compania:string,
  pais:string,
  telefono:string,
  wpp:string,
  rol:number,
  estado:number,
  twitter:string,
  instagram:string
}
@Injectable()
export class UsersService {
  
  constructor(private http: HttpClient) { }

  obtenerListaRoles() {
    
   return  this.http.get<any>(`${apiUrl}/adm/roles/list/filtro/`, {
    });
  }
  obtenerListaEstados() {
    return new Promise((resolve, reject) => {
      resolve([
        {id:1,estado:'ACTIVO'}, {id:2,estado:'INACTIVO'}, {id:3,estado:'PENDIENTE'}])
    });
  }
  obtenerListaUsuarios(page,pageSize,idRol,estado) {
    return  this.http.post<any>(`${apiUrl}/adm/usuarios/list/`, {
        'page':page, 'page_size':pageSize, 'estado':estado, 'idRol':Number(idRol)
    });
    
    
  }
  getDataCount(){
      return new Promise((resolve, reject) => {
        resolve({'count':11}
        );
      });
  }
  insertarUsuario(user: nuevoUsuario){
    console.log(user);
  }
  obtenerUsuario(id){
    return new Promise((resolve, reject)=>{
      resolve({
        id:24,
        nombre:'Alvaro',
        apellido:'Cedeño',
        nombreUsuario:'acedeno',
        email:'alv_saul@hotmail.com',
        compania:'Papagayo',
        pais:'Ecuador',
        telefono:'0996927780',
        wpp:'0996927780',
        rol:1,
        estado:1,
        twitter:'@acedeno',
        instagram:'@acedeno'
      }
      );
    });
  }

}
