import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../.././../environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ParamService {

  constructor(private http: HttpClient) {
  }

  obtenerListaParametros(page, page_size, tipo, nombre, canal= '') {
    return this.http.post<any>(`${apiUrl}/adm/param/list/`, {
      page, page_size, tipo, nombre, canal
    });

  }

  obtenerListaTipos() {
    return this.http.get<any>(`${apiUrl}/adm/param/list/tipo/`);
  }

  insertarParametro(
    nombre,
    tipo,
    descripcion,
    tipoVariable,
    valor,
    idPadre, canal
  ) {
    return this.http.post<any>(`${apiUrl}/adm/param/create/`, {
      nombre,
      tipo,
      descripcion,
      tipoVariable,
      valor,
      idPadre,
      canal
    });
  }

  editarParametro(
    id,
    nombre,
    tipo,
    descripcion,
    tipoVariable,
    valor,
    idPadre, canal) {
    return this.http.post<any>(`${apiUrl}/adm/param/update/${id}`, {
      nombre,
      tipo,
      descripcion,
      tipoVariable,
      valor,
      idPadre, canal
    });
  }

  eliminarParametro(id) {
    return this.http.delete<any>(`${apiUrl}/adm/param/delete/${id}`);
  }

  obtenerParametro(id) {
    return this.http.get<any>(`${apiUrl}/adm/param/listOne/${id}`);
  }

  obtenerListaPadres(tipo) {
    return this.http.post<any>(`${apiUrl}/adm/param/list/tipo/todos/`, {tipo});
  }

  obtenerListaHijos(nombre, tipo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/param/list/filtro/nombre`, {tipo, nombre});
  }

  obtenerListaHijosEnvio(nombre): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/param/list/tipo/hijo/nombre/`, {nombre});
  }

  obtenerURL(url): string {
    return `${apiUrl}${url}`;
  }

  exportarUsuarios(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/adm/param/exportar/`, httpOptions);
  }
}
