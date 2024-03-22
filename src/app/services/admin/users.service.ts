import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../.././../environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;


export interface NuevoUsuario {
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  compania: string;
  pais: string;
  provincia: string;
  ciudad: string;
  telefono: string;
  whatsapp: string;
  idRol: number;
  estado: string;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  compania: string;
  pais: string;
  provincia: string;
  ciudad: string;
  telefono: string;
  idRol: number;
  estado: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
  facebook: string;
  imagen: FormData;
}

@Injectable()
export class UsersService {

  constructor(private http: HttpClient) {
  }

  obtenerListaRoles(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/roles/list/filtro/`, {});
  }

  obtenerListaPaises(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/param/list/pais/`, {});
  }

  obtenerListaEstados(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/param/list/estado/`, {});
  }

  obtenerListaUsuarios(data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/usuarios/list/`, data);
  }

  insertarUsuario(usuario: NuevoUsuario): Observable<any> {

    return this.http.post<any>(`${apiUrl}/adm/usuarios/create/`, usuario);
  }

  insertarImagen(id, imagen): Observable<any> {

    return this.http.post<any>(`${apiUrl}/adm/usuarios/update/imagen/${id}`, imagen);
  }

  obtenerUsuario(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/usuarios/listOne/${id}`);
  }

  actualizarUsuario(usuario: Usuario): Observable<any> {
    const usuarioActualizado: NuevoUsuario = usuario;
    return this.http.post<any>(`${apiUrl}/adm/usuarios/update/${usuario.id}`, usuarioActualizado);
  }

  eliminarUsuario(id, estado): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/usuarios/delete/${id}`, {estado});
  }

  exportarUsuarios(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/adm/usuarios/exportar/`, httpOptions);
  }
}
