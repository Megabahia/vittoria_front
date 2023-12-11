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

    return this.http.post<any>(`${apiUrl}/mdo/param/list/`, {
      page, page_size, tipo, nombre
    });

  }

  obtenerListaTipos() {
    return this.http.get<any>(`${apiUrl}/mdo/param/list/tipo/`);
  }

  insertarParametro(
    nombre,
    tipo,
    descripcion,
    tipoVariable,
    valor,
    idPadre
  ) {
    return this.http.post<any>(`${apiUrl}/mdo/param/create/`, {
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
    return this.http.post<any>(`${apiUrl}/mdo/param/update/${id}`, {
      nombre,
      tipo,
      descripcion,
      tipoVariable,
      valor,
      idPadre
    });
  }

  eliminarParametro(id) {
    return this.http.delete<any>(`${apiUrl}/mdo/param/delete/${id}`,);
  }

  obtenerParametro(id) {
    return this.http.get<any>(`${apiUrl}/mdo/param/listOne/${id}`,);
  }

  obtenerListaPadres(tipo) {
    return this.http.post<any>(`${apiUrl}/mdo/param/list/tipo/todos/`, {tipo});
  }

  obtenerListaHijos(nombre, tipo) {
    return this.http.post<any>(`${apiUrl}/mdo/param/list/filtro/nombre`, {tipo, nombre});
  }

  obtenerParametroNombreTipo(nombre, tipo) {
    return this.http.post<any>(`${apiUrl}/mdo/param/list/listOne`, {nombre, tipo});
  }

  exportar(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/mdo/param/exportar/`, httpOptions);
  }
}
