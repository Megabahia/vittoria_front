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

  obtenerListaParametros(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/list/`, datos);
  }

  obtenerListaTipos(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/mp/param/list/tipo/`);
  }

  insertarParametro(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/create/`, datos);
  }

  editarParametro(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/update/${datos.id}`, datos);
  }

  eliminarParametro(id): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/mp/param/delete/${id}`,);
  }

  obtenerParametro(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/mp/param/listOne/${id}`,);
  }

  obtenerListaPadres(tipo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/list/tipo/todos/`, {tipo});
  }

  obtenerListaHijos(nombre, tipo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/list/filtro/nombre`, {tipo, nombre});
  }

  obtenerParametroNombreTipo(nombre, tipo): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/list/listOne`, {nombre, tipo});
  }

  obtenerListaEstado(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/mp/param/list/estado/`);
  }

  obtenerListaValor(valor): Observable<any>{
    return this.http.post<any>(`${apiUrl}/mp/param/list/valor/`, valor);
  }

  exportar(): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<any>(
      `${environment.apiUrl}/mp/param/exportar/`, httpOptions);
  }

  actualizarArchivo(id, data): Observable<any> {
    return this.http.post<any>(`${apiUrl}/mp/param/update/${id}`, data);
  }
}
