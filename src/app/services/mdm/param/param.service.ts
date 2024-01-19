import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ParamService {

  constructor(private http: HttpClient) {
  }

  obtenerListaParametros(page, page_size, tipo, nombre) {

    return this.http.post<any>(`${apiUrl}/mdm/param/list/`, {
      page, page_size, tipo, nombre
    });

  }

  obtenerListaTipos() {
    return this.http.get<any>(`${apiUrl}/mdm/param/list/tipo/`);
  }

  insertarParametro(
    nombre,
    tipo,
    descripcion,
    tipoVariable,
    valor,
    idPadre
  ) {
    return this.http.post<any>(`${apiUrl}/mdm/param/create/`, {
      nombre,
      tipo,
      descripcion,
      tipoVariable,
      valor,
      idPadre
    });
  }

  editarParametro(
    id,
    nombre,
    tipo,
    descripcion,
    tipoVariable,
    valor,
    idPadre) {
    return this.http.post<any>(`${apiUrl}/mdm/param/update/${id}`, {
      nombre,
      tipo,
      descripcion,
      tipoVariable,
      valor,
      idPadre
    });
  }

  eliminarParametro(id) {
    return this.http.delete<any>(`${apiUrl}/mdm/param/delete/${id}`,);
  }

  obtenerParametro(id) {
    return this.http.get<any>(`${apiUrl}/mdm/param/listOne/${id}`,);
  }

  obtenerListaPadres(tipo) {
    return this.http.post<any>(`${apiUrl}/mdm/param/list/tipo/todos/`, {tipo});
  }

  obtenerListaHijos(nombre, tipo) {
    return this.http.post<any>(`${apiUrl}/mdm/param/list/filtro/nombre`, {tipo, nombre});
  }

  obtenerParametroNombreTipo(nombre, tipo) {
    return this.http.post<any>(`${apiUrl}/mdm/param/list/listOne`, {nombre, tipo});
  }

  exportarUsuarios(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/adm/param/exportar/`, httpOptions);
  }

  actualizarArchivo(id, data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mdm/param/update/${id}`, data);
  }
}
